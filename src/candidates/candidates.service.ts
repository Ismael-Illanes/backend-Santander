import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { FormData } from '../dto/form-data.dto';
import { ExcelData } from '../dto/excel-data.dto';
import { CombinedDataDto } from '../dto/combined-data.dto';
import { validate } from 'class-validator';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidatesRepository: Repository<Candidate>,
  ) {}

  async create(formData: FormData, excelData: ExcelData): Promise<Candidate> {
    try {
      console.log('formData:', formData);
      console.log('excelData:', excelData);

      let availabilityBoolean: boolean;

      if (typeof excelData.availability === 'string') {
        availabilityBoolean = excelData.availability === 'true';
      } else {
        availabilityBoolean = excelData.availability;
      }

      const combinedData = {
        ...formData,
        ...excelData,
        availability: availabilityBoolean,
      };

      const combinedDataDto = Object.assign(
        new CombinedDataDto(),
        combinedData,
      );

      const errors = await validate(combinedDataDto);

      if (errors.length > 0) {
        console.log('Validation errors:', errors);
        throw new HttpException(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Error de validación: ${errors}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const candidate = this.candidatesRepository.create(combinedData);
      console.log('Candidate to be saved:', candidate);
      return this.candidatesRepository.save(candidate);
    } catch (e) {
      console.error('Error in create:', e);
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al crear el candidato: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<Candidate[]> {
    try {
      return this.candidatesRepository.find();
    } catch (e) {
      console.error('Error in findAll:', e);
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al obtener los candidatos: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.candidatesRepository.delete(id);
      if (result.affected === 0) {
        throw new HttpException(
          'Candidato no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (e) {
      console.error('Error in remove:', e);
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al eliminar el candidato: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    id: number,
    candidateData: Partial<Candidate>,
  ): Promise<Candidate> {
    try {
      const candidate = await this.candidatesRepository.findOne({
        where: { id },
      });
      if (!candidate) {
        throw new HttpException(
          'Candidato no encontrado',
          HttpStatus.NOT_FOUND,
        );
      }
      await this.candidatesRepository.update(id, candidateData);
      const updatedCandidate = await this.candidatesRepository.findOne({
        where: { id },
      });
      if (!updatedCandidate) {
        throw new HttpException(
          'Error al obtener candidato actualizado',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return updatedCandidate;
    } catch (e) {
      console.error('Error in update:', e);
      throw new HttpException(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Error al actualizar el candidato: ${e.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
