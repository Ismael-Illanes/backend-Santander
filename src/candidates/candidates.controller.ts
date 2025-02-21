import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as xlsx from 'xlsx';
import { CandidatesService } from './candidates.service';
import { FormData } from '../dto/form-data.dto';
import { ExcelData } from '../dto/excel-data.dto';
import { Candidate } from './candidate.entity';

@Controller('candidates')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body(new ValidationPipe()) formData: FormData,
  ): Promise<Candidate> {
    try {
      console.log('File received:', file);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!file || !file.buffer) {
        throw new HttpException(
          'Archivo inválido o faltante',
          HttpStatus.BAD_REQUEST,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log('File buffer:', file.buffer);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const workbook = xlsx.read(file.buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = xlsx.utils.sheet_to_json(sheet)[0] as ExcelData;

      console.log('Form data:', formData);
      console.log('Excel data:', excelData);

      return this.candidatesService.create(formData, excelData);
    } catch (e) {
      console.error('Error in controller:', e);
      throw new HttpException(
        'Error al procesar el archivo o los datos',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async findAll(): Promise<Candidate[]> {
    return this.candidatesService.findAll();
  }
}
