/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Candidate } from './candidate.entity';
import { FormData } from '../dto/form-data.dto';
import { ExcelData } from '../dto/excel-data.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';

const formDataExample: FormData = { name: 'John', surname: 'Doe' };
const excelDataExample: ExcelData = {
  seniority: 'Senior',
  years: 5,
  availability: true,
};

const candidateExample: Candidate = {
  id: 1,
  ...formDataExample,
  ...excelDataExample,
} as Candidate;

const candidateCreateExample = { ...formDataExample, ...excelDataExample };

const mockCandidatesRepository = () => ({
  create: jest.fn().mockImplementation((dto) => ({ ...dto })),
  save: jest.fn().mockResolvedValue(candidateExample),
  find: jest.fn().mockResolvedValue([candidateExample]),
  findOne: jest.fn().mockResolvedValue(candidateExample),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  update: jest.fn().mockResolvedValue(candidateExample),
});

describe('CandidatesService', () => {
  let service: CandidatesService;
  let repo: Repository<Candidate>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: getRepositoryToken(Candidate),
          useFactory: mockCandidatesRepository,
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    repo = module.get<Repository<Candidate>>(getRepositoryToken(Candidate));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new candidate and return it', async () => {
      const result = await service.create(formDataExample, excelDataExample);

      expect(repo.save).toHaveBeenCalledWith(candidateCreateExample);
      expect(result).toEqual(candidateExample);
    });

    it('should handle create error', async () => {
      (repo.save as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );
      await expect(
        service.create(formDataExample, excelDataExample),
      ).rejects.toThrow('Error al crear el candidato');
    });
  });

  describe('findAll', () => {
    it('should return all candidates', async () => {
      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual([candidateExample]);
    });

    it('should handle find error', async () => {
      (repo.find as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );
      await expect(service.findAll()).rejects.toThrow(
        'Error al obtener los candidatos',
      );
    });
  });

  describe('findOne', () => {
    it('should return a candidate by id', async () => {
      const result = await service.findOne(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(candidateExample);
    });

    it('should return undefined if candidate not found', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      const result = await service.findOne(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeUndefined();
    });
  });

  describe('remove', () => {
    it('should remove a candidate by id successfully', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(candidateExample);

      await service.remove(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw HttpException if candidate not found for removal', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      await expect(service.remove(1)).rejects.toThrowError(HttpException);
      try {
        await service.remove(1);
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Candidato no encontrado');
      }
    });

    it('should handle remove error', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(candidateExample);
      (repo.delete as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );
      await expect(service.remove(1)).rejects.toThrow(
        'Error al eliminar el candidato: Database error',
      );
    });
  });

  describe('update', () => {
    it('should update a candidate successfully', async () => {
      const updatedCandidateData = { surname: 'UpdatedSurname' };
      const updatedCandidateExample = {
        ...candidateExample,
        ...updatedCandidateData,
      };
      (repo.findOne as jest.Mock).mockResolvedValueOnce(candidateExample);

      (repo.findOne as jest.Mock).mockResolvedValueOnce(
        updatedCandidateExample,
      );

      const result = await service.update(1, updatedCandidateData);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.update).toHaveBeenCalledWith({ id: 1 }, updatedCandidateData);
      expect(repo.findOne).toHaveBeenCalledTimes(2);
      expect(result).toEqual(updatedCandidateExample);
    });

    it('should throw HttpException if candidate not found for update', async () => {
      (repo.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      await expect(
        service.update(1, { surname: 'UpdatedSurname' }),
      ).rejects.toThrowError(HttpException);
      try {
        await service.update(1, { surname: 'UpdatedSurname' });
      } catch (error) {
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Candidato no encontrado');
      }
    });

    it('should handle update error (database error during update)', async () => {
      const updatedCandidateData = { surname: 'UpdatedSurname' };
      (repo.findOne as jest.Mock).mockResolvedValueOnce(candidateExample);
      (repo.update as jest.Mock).mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(service.update(1, updatedCandidateData)).rejects.toThrow(
        'Error al actualizar el candidato: Database error',
      );
    });

    it('should handle update error (error fetching updated candidate)', async () => {
      const updatedCandidateData = { surname: 'UpdatedSurname' };
      (repo.findOne as jest.Mock).mockResolvedValueOnce(candidateExample);

      (repo.findOne as jest.Mock).mockRejectedValueOnce(
        new Error('Error fetching updated'),
      );

      await expect(service.update(1, updatedCandidateData)).rejects.toThrow(
        'Error al actualizar el candidato: Error fetching updated',
      );
    });
  });
});
