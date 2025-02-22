/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
  Body,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { FormData } from '../dto/form-data.dto';
import * as XLSX from 'xlsx';
import { Candidate } from './candidate.entity';
import { ExcelData } from 'src/dto/excel-data.dto';

@Controller('candidates')
export class CandidatesController {
  constructor(private candidatesService: CandidatesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: FormData,
  ): Promise<Candidate> {
    if (!file) {
      throw new HttpException('File is missing', HttpStatus.BAD_REQUEST);
    }

    console.log('File received:', file);
    console.log('File buffer:', file.buffer);

    const excelData: any[] = XLSX.utils.sheet_to_json(
      XLSX.read(file.buffer).Sheets[XLSX.read(file.buffer).SheetNames[0]],
    );
    console.log('Excel data:', excelData);

    // --- Debugging ---
    console.log('Excel data (raw):', excelData);
    if (excelData && excelData.length > 0) {
      console.log('First Excel data row:', excelData[0]);
    }
    // ------------------------------------------

    if (
      !excelData ||
      excelData.length === 0 ||
      !excelData[0].seniority ||
      !excelData[0].years ||
      excelData[0].availability === undefined
    ) {
      console.error(
        'Error in controller: Datos del Excel inválidos o faltantes',
      );
      throw new HttpException(
        'Datos del Excel inválidos o faltantes',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      return await this.candidatesService.create(
        formData,
        excelData[0] as ExcelData,
      );
    } catch (e) {
      console.error('Error in controller:', e);
      console.log('Type of error caught:', e.constructor.name);
      console.log('Caught error in controller catch block!');
      if (e instanceof HttpException) {
        throw e;
      } else {
        throw new HttpException('Service error', HttpStatus.BAD_REQUEST);
      }
    }
  }

  @Get()
  findAll(): Promise<Candidate[]> {
    return this.candidatesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Candidate> {
    const candidate = await this.candidatesService.findOne(+id);
    if (!candidate) {
      throw new NotFoundException(`Candidato con ID '${id}' no encontrado`);
    }
    return candidate;
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.candidatesService.remove(+id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FormData,
  ): Promise<Candidate> {
    return this.candidatesService.update(+id, body);
  }
}
