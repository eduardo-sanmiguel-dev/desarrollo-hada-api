import { resolve } from 'node:path';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Workbook as ExcelJsWorkbook } from 'exceljs';
import xlsxPopulate from 'xlsx-populate';

import { Brackets, In, Repository } from 'typeorm';

import {
  CreateNonconformanceReportDto,
  FindAllNonconformanceReportsDto,
} from './dto';
import { MailService } from '../mail/mail.service';
import { Employee } from '../employees/entities/employee.entity';
import { User } from '../users/entities/user.entity';
import { NonconformanceReport } from './entities/nonconformance-report.entity';

type XlsxPopulateCell = {
  value(): unknown;
  value(newValue: unknown): XlsxPopulateCell;
};

type XlsxPopulateSheet = {
  cell(row: number, column: number): XlsxPopulateCell;
};

type XlsxPopulateWorkbook = {
  sheet(index: number): XlsxPopulateSheet;
  toFileAsync(path: string): Promise<void>;
  outputAsync(): Promise<Uint8Array | ArrayBuffer>;
};

const XlsxPopulate = xlsxPopulate as unknown as {
  fromFileAsync(path: string): Promise<XlsxPopulateWorkbook>;
};

@Injectable()
export class NonconformanceReportsService {
  constructor(
    @InjectRepository(NonconformanceReport)
    private readonly nonconformanceReportsRepository: Repository<NonconformanceReport>,
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly mailService: MailService,
  ) {}

  private readonly templatePath = resolve(
    process.cwd(),
    'src',
    'formats',
    'FORMATO_RECORRIDO.xlsx',
  );

  private readonly filePathNewFile = resolve(
    process.cwd(),
    'src',
    'formats',
    'FORMATO_RECORRIDO_NEW.xlsx',
  );

  private readonly imageBannerPath = resolve(
    process.cwd(),
    'src',
    'formats',
    'banner.png',
  );

  private normalizeHeader(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .toUpperCase();
  }

  private cellValueToText(value: unknown): string {
    if (value == null) {
      return '';
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    return '';
  }

  private formatExcelDate(value: Date) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  async create(
    createNonconformanceReportDto: CreateNonconformanceReportDto,
    userId: number,
    imageUrl: string,
  ) {
    const report = this.nonconformanceReportsRepository.create(
      Object.assign(createNonconformanceReportDto, {
        reportedBy: userId,
        imageUrl,
      }),
    );

    const savedReport = await this.nonconformanceReportsRepository.save(report);

    const totalReports = await this.nonconformanceReportsRepository.count({
      where: { employeeId: savedReport.employeeId },
    });

    if (totalReports > 2) {
      const [employee, reportedByUser] = await Promise.all([
        this.employeesRepository.findOne({
          where: { id: savedReport.employeeId },
          select: ['name'],
        }),
        this.usersRepository.findOne({
          where: { id: savedReport.reportedBy },
          select: ['name'],
        }),
      ]);

      const employeeName = employee?.name?.trim() || 'No especificado';
      const reportedByName = reportedByUser?.name?.trim() || 'No especificado';

      const notifier = this.mailService as {
        nonconformanceReportThresholdReached: (
          report: NonconformanceReport,
          accumulatedReports: number,
          employeeName: string,
          reportedByName: string,
        ) => Promise<void>;
      };

      void notifier.nonconformanceReportThresholdReached(
        savedReport,
        totalReports,
        employeeName,
        reportedByName,
      );
    }

    return savedReport;
  }

  async countByEmployee(employeeId: number) {
    const totalReports = await this.nonconformanceReportsRepository.count({
      where: { employeeId },
    });

    return {
      employeeId,
      totalReports,
    };
  }

  async findAll(query: FindAllNonconformanceReportsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const shouldPaginate = limit !== -1;

    const qb = this.nonconformanceReportsRepository
      .createQueryBuilder('report')
      .leftJoin(Employee, 'employee', 'employee.id = report.employeeId')
      .leftJoin(User, 'reportedByUser', 'reportedByUser.id = report.reportedBy')
      .addSelect('employee.code', 'employee_code')
      .addSelect('employee.name', 'employee_name')
      .addSelect('reportedByUser.name', 'reported_by_name');

    if (search) {
      qb.andWhere(
        new Brackets((where) => {
          where.where('CAST(report.id AS TEXT) ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('CAST(report.employeeId AS TEXT) ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('CAST(employee.code AS TEXT) ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('employee.name ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('report.deviation ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('report.nonconformance ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('CAST(report.reportedBy AS TEXT) ILIKE :search', {
            search: `%${search}%`,
          });
          where.orWhere('reportedByUser.name ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    if (query.startDate) {
      const startDate = new Date(`${query.startDate}T00:00:00.000`);
      qb.andWhere('report.createdAt >= :startDate', { startDate });
    }

    if (query.endDate) {
      const endDate = new Date(`${query.endDate}T23:59:59.999`);
      qb.andWhere('report.createdAt <= :endDate', { endDate });
    }

    qb.orderBy('report.createdAt', 'DESC');

    const total = await qb.getCount();

    if (shouldPaginate) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const { entities, raw } = await qb.getRawAndEntities();

    const items = entities.map((report, index) => {
      const rawRow = raw[index] as {
        employee_code?: string | number | null;
        employee_name?: string | null;
        reported_by_name?: string | null;
      };

      return Object.assign(report, {
        employeeCode: rawRow.employee_code ?? null,
        employeeName: rawRow.employee_name ?? null,
        reportedByName: rawRow.reported_by_name ?? null,
      });
    });

    const responseLimit = shouldPaginate ? limit : total;
    const totalPages = shouldPaginate
      ? Math.max(1, Math.ceil(total / Math.max(1, limit)))
      : 1;

    return {
      items,
      total,
      page: shouldPaginate ? page : 1,
      limit: responseLimit,
      totalPages,
    };
  }

  async exportExcel(ids: number[]): Promise<Uint8Array> {
    const reports = await this.nonconformanceReportsRepository.find({
      where: { id: In(ids) },
      order: { createdAt: 'DESC' },
    });

    if (reports.length === 0) {
      throw new NotFoundException('No hay registros para exportar.');
    }

    const reportsMap = new Map(reports.map((report) => [report.id, report]));
    const orderedReports = ids
      .map((id) => reportsMap.get(id))
      .filter((report): report is NonconformanceReport => Boolean(report));

    const employeeIds = Array.from(
      new Set(orderedReports.map((item) => item.employeeId)),
    );
    const reportedByIds = Array.from(
      new Set(orderedReports.map((item) => item.reportedBy)),
    );

    const [employees, users] = await Promise.all([
      this.employeesRepository.find({
        where: { id: In(employeeIds) },
        relations: ['position'],
      }),
      this.usersRepository.find({
        where: { id: In(reportedByIds) },
        select: ['id', 'name'],
      }),
    ]);

    const employeeMap = new Map(
      employees.map((employee) => [employee.id, employee]),
    );
    const userMap = new Map(users.map((user) => [user.id, user]));

    const workbook = await XlsxPopulate.fromFileAsync(this.templatePath);
    const worksheet = workbook.sheet(0);
    if (!worksheet) {
      throw new NotFoundException('La plantilla no contiene hojas.');
    }

    const expectedHeaders: Record<string, string> = {
      no: 'NO',
      nombre: 'NOMBRE',
      cargo: 'CARGO',
      noEmpleado: 'NOEMPLEADO',
      desviacion: 'DESVIACION',
      hallazgo: 'HALLAZGO',
      firma: 'FIRMA',
      reporta: 'REPORTA',
      fecha: 'FECHA',
    };

    let headerRowIndex = -1;
    let headerColumns: Record<string, number> = {};

    for (let rowIndex = 1; rowIndex <= 60; rowIndex += 1) {
      const currentColumns: Record<string, number> = {};

      for (let colIndex = 1; colIndex <= 40; colIndex += 1) {
        const rawText = this.cellValueToText(
          worksheet.cell(rowIndex, colIndex).value(),
        );
        const normalized = this.normalizeHeader(rawText);

        if (normalized === expectedHeaders.no) {
          currentColumns.no = colIndex;
        } else if (normalized === expectedHeaders.nombre) {
          currentColumns.nombre = colIndex;
        } else if (normalized === expectedHeaders.cargo) {
          currentColumns.cargo = colIndex;
        } else if (normalized === expectedHeaders.noEmpleado) {
          currentColumns.noEmpleado = colIndex;
        } else if (normalized === expectedHeaders.desviacion) {
          currentColumns.desviacion = colIndex;
        } else if (normalized === expectedHeaders.hallazgo) {
          currentColumns.hallazgo = colIndex;
        } else if (normalized === expectedHeaders.firma) {
          currentColumns.firma = colIndex;
        } else if (normalized === expectedHeaders.reporta) {
          currentColumns.reporta = colIndex;
        } else if (normalized === expectedHeaders.fecha) {
          currentColumns.fecha = colIndex;
        }
      }

      const foundAll = Object.keys(expectedHeaders).every(
        (key) => currentColumns[key] !== undefined,
      );

      if (foundAll) {
        headerRowIndex = rowIndex;
        headerColumns = currentColumns;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new NotFoundException(
        'No se encontraron los encabezados del formato.',
      );
    }

    const firstDataRow = headerRowIndex + 1;

    orderedReports.forEach((report, index) => {
      const excelRowIndex = firstDataRow + index;
      const employee = employeeMap.get(report.employeeId);
      const reporter = userMap.get(report.reportedBy);

      worksheet.cell(excelRowIndex, headerColumns.no).value(index + 1);
      worksheet
        .cell(excelRowIndex, headerColumns.nombre)
        .value(employee?.name ?? '');
      worksheet
        .cell(excelRowIndex, headerColumns.cargo)
        .value(employee?.position?.name ?? '');
      worksheet
        .cell(excelRowIndex, headerColumns.noEmpleado)
        .value(employee?.code ?? report.employeeId);
      worksheet
        .cell(excelRowIndex, headerColumns.desviacion)
        .value(report.deviation);
      worksheet
        .cell(excelRowIndex, headerColumns.hallazgo)
        .value(report.nonconformance);
      worksheet
        .cell(excelRowIndex, headerColumns.reporta)
        .value(reporter?.name ?? '');
      worksheet
        .cell(excelRowIndex, headerColumns.fecha)
        .value(this.formatExcelDate(report.createdAt));
    });

    await workbook.toFileAsync(this.filePathNewFile);

    const excelJsWorkbook = new ExcelJsWorkbook();
    await excelJsWorkbook.xlsx.readFile(this.filePathNewFile);

    const excelJsWorksheet = excelJsWorkbook.worksheets[0];
    if (!excelJsWorksheet) {
      throw new NotFoundException('La plantilla no contiene hojas.');
    }

    orderedReports.forEach((report, index) => {
      if (!report.signatureBase64) {
        return;
      }

      const base64Payload = report.signatureBase64.includes(',')
        ? report.signatureBase64.split(',')[1]
        : report.signatureBase64;

      const imageId = excelJsWorkbook.addImage({
        base64: base64Payload,
        extension: 'png',
      });

      const excelRowIndex = firstDataRow + index;

      excelJsWorksheet.addImage(imageId, {
        tl: {
          col: headerColumns.firma - 1 + 0.05,
          row: excelRowIndex - 1 + 0.08,
        },
        ext: { width: 110, height: 30 },
        editAs: 'oneCell',
      });
      const row = excelJsWorksheet.getRow(excelRowIndex);
      row.height = Math.max(row.height ?? 15, 28);
    });

    const bannerImageId = excelJsWorkbook.addImage({
      filename: this.imageBannerPath,
      extension: 'png',
    });

    excelJsWorksheet.addImage(bannerImageId, {
      tl: { col: 1, row: 0 },
      ext: { width: 1350, height: 160 },
    });

    const output = await excelJsWorkbook.xlsx.writeBuffer();
    return output instanceof Uint8Array
      ? output
      : new Uint8Array(output as ArrayBuffer);
  }
}
