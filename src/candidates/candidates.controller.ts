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
  Delete,
  Param,
  Put,
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

      if (!file || !file.buffer) {
        throw new HttpException(
          'Archivo inválido o faltante',
          HttpStatus.BAD_REQUEST,
        );
      }

      console.log('File buffer:', file.buffer);

      const workbook = xlsx.read(file.buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData = xlsx.utils.sheet_to_json(sheet)[0] as ExcelData;

      console.log('Form data:', formData);
      console.log('Excel data:', excelData);

      // Asegúrate de que los datos del Excel sean válidos
      if (
        !excelData ||
        !excelData.seniority ||
        !excelData.years ||
        excelData.availability === undefined
      ) {
        throw new HttpException(
          'Datos del Excel inválidos o faltantes',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Llamar al método create del servicio con los dos parámetros
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

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.candidatesService.remove(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() candidateData: Partial<Candidate>,
  ): Promise<Candidate> {
    return this.candidatesService.update(id, candidateData);
  }
}
