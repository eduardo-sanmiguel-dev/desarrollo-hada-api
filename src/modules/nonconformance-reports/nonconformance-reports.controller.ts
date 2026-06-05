import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  StreamableFile,
} from '@nestjs/common';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import {
  CreateNonconformanceReportDto,
  ExportNonconformanceReportsExcelDto,
} from './dto';
import { NonconformanceReportsService } from './nonconformance-reports.service';

@Controller('nonconformance-reports')
export class NonconformanceReportsController {
  constructor(
    private readonly nonconformanceReportsService: NonconformanceReportsService,
  ) {}

  @Post()
  create(
    @Body() createNonconformanceReportDto: CreateNonconformanceReportDto,
    @CurrentUser() userId: number,
  ) {
    return this.nonconformanceReportsService.create(
      createNonconformanceReportDto,
      userId,
    );
  }

  @Get()
  findAll() {
    return this.nonconformanceReportsService.findAll();
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
