/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { FormData } from '../dto/form-data.dto';
import { ExcelData } from '../dto/excel-data.dto';

@Injectable()
export class CandidatesService {
  private readonly logger = new Logger(CandidatesService.name);

  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async create(formData: FormData, excelData: ExcelData): Promise<Candidate> {
    this.logger.log(`formData: ${JSON.stringify(formData)}`);
    this.logger.log(`excelData: ${JSON.stringify(excelData)}`);
    try {
      const candidate = this.candidatesRepository.create({
        ...formData,
        ...excelData,
      });
      this.logger.log(`Candidate to be saved: ${JSON.stringify(candidate)}`);
      return await this.candidatesRepository.save(candidate);
    } catch (error) {
      this.logger.error('Error saving candidate', error);
      throw new Error('Error al crear el candidato');
    }
  }

  async findAll(): Promise<Candidate[]> {
    try {
      return await this.candidatesRepository.find();
    } catch (error) {
      this.logger.error('Error finding candidates', error);
      throw new Error('Error al obtener los candidatos');
    }
  }

  async findOne(id: number): Promise<Candidate | undefined> {
    const candidate = await this.candidatesRepository.findOne({
      where: { id },
    });
    if (!candidate) {
      return undefined;
    }
    return candidate;
  }

  async remove(id: number): Promise<void> {
    try {
      const candidate = await this.findOne(id);
      if (!candidate) {
        throw new HttpException(
          'Candidato no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.candidatesRepository.delete({ id });
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      this.logger.error('Error in remove:', e);
      throw new Error(`Error al eliminar el candidato: ${e.message}`);
    }
  }

  async update(id: number, data: Partial<Candidate>): Promise<Candidate> {
    try {
      const candidate = await this.findOne(id);
      if (!candidate) {
        throw new HttpException(
          'Candidato no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.candidatesRepository.update({ id }, data);

      const updatedCandidate = await this.findOne(id);
      if (!updatedCandidate) {
        throw new HttpException(
          'Error al obtener candidato actualizado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return updatedCandidate;
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      this.logger.error('Error in update:', e);
      throw new Error(`Error al actualizar el candidato: ${e.message}`);
    }
  }
}
