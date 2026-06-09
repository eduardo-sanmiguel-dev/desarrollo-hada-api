import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { join } from 'node:path';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  CreateNonconformanceReportDto,
  ExportNonconformanceReportsExcelDto,
  FindAllNonconformanceReportsDto,
} from './dto';
import { NonconformanceReportsService } from './nonconformance-reports.service';

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;
type UploadedImageFile = { mimetype: string; filename: string };

const EVIDENCE_UPLOAD_DIR = join(
  process.cwd(),
  'public',
  'nonconformance-evidences',
);

@Controller('nonconformance-reports')
export class NonconformanceReportsController {
  constructor(
    private readonly nonconformanceReportsService: NonconformanceReportsService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      dest: EVIDENCE_UPLOAD_DIR,
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (
        _req,
        file: UploadedImageFile,
        callback: FileFilterCallback,
      ) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(
            new BadRequestException('El archivo debe ser una imagen válida.'),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  create(
    @Body() createNonconformanceReportDto: CreateNonconformanceReportDto,
    @CurrentUser() userId: number,
    @UploadedFile() file?: UploadedImageFile,
  ) {
    if (!file) {
      throw new BadRequestException(
        'La foto es obligatoria para crear el reporte.',
      );
    }

    const imageUrl = `/nonconformance-evidences/${file.filename}`;

    return this.nonconformanceReportsService.create(
      createNonconformanceReportDto,
      userId,
      imageUrl,
    );
  }

  @Get()
  findAll(@Query() query: FindAllNonconformanceReportsDto) {
    return this.nonconformanceReportsService.findAll(query);
  }

  @Get('count-by-employee/:employeeId')
  countByEmployee(@Param('employeeId') employeeId: string) {
    return this.nonconformanceReportsService.countByEmployee(+employeeId);
  }

  @Post('export-excel')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header(
    'Content-Disposition',
    'attachment; filename="FORMATO_RECORRIDO.xlsx"',
  )
  async exportExcel(
    @Body() exportDto: ExportNonconformanceReportsExcelDto,
  ): Promise<StreamableFile> {
    const fileBytes = await this.nonconformanceReportsService.exportExcel(
      exportDto.ids,
    );

    return new StreamableFile(fileBytes);
  }
}
