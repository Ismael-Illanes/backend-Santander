import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './candidate.entity';
import { FormData } from '../dto/form-data.dto';
import { ExcelData } from '../dto/excel-data.dto';

describe('CandidatesService', () => {
  let service: CandidatesService;
  let repo: Repository<Candidate>;

  const formData: FormData = { name: 'John', surname: 'Doe' };
  const excelData: ExcelData = {
    seniority: 'Senior',
    years: 5,
    availability: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: {
            create: jest.fn().mockReturnValue({ ...formData, ...excelData }),
            save: jest
              .fn()
              .mockResolvedValue({ id: 1, ...formData, ...excelData }),
            find: jest
              .fn()
              .mockResolvedValue([{ id: 1, ...formData, ...excelData }]),
          },
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    repo = module.get<Repository<Candidate>>(getRepositoryToken(Candidate));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a candidate', async () => {
    const result = await service.create(formData, excelData);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.create).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, ...formData, ...excelData });
  });

  it('should find all candidates', async () => {
    const result = await service.findAll();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.find).toHaveBeenCalled();
    expect(result).toEqual([{ id: 1, ...formData, ...excelData }]);
  });

  it('should handle create error', async () => {
    (repo.save as jest.Mock).mockRejectedValueOnce(new Error('Create error'));
    await expect(service.create(formData, excelData)).rejects.toThrow(
      'Error al crear el candidato',
    );
  });

  it('should handle find error', async () => {
    (repo.find as jest.Mock).mockRejectedValueOnce(new Error('Find error'));
    await expect(service.findAll()).rejects.toThrow(
      'Error al obtener los candidatos',
    );
  });
});
