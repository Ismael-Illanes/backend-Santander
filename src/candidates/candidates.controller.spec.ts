/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { FormData } from '../dto/form-data.dto';
import { Candidate } from './candidate.entity';

jest.mock('xlsx', () => ({
  read: jest.fn().mockReturnValue({
    Sheets: {
      Sheet1: {},
    },
    SheetNames: ['Sheet1'],
  }),
  utils: {
    sheet_to_json: jest
      .fn()
      .mockReturnValue([
        { seniority: 'Senior', years: 5, availability: 'true' },
      ]),
  },
}));

describe('CandidatesController', () => {
  let controller: CandidatesController;
  let service: CandidatesService;
  let mockFile: Express.Multer.File;

  const candidateExample: Candidate = {
    id: 1,
    name: 'John',
    surname: 'Doe',
    seniority: 'Senior',
    years: 5,
    availability: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const formDataExample: FormData = { name: 'John', surname: 'Doe' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [CandidatesService],
    })
      .overrideProvider(CandidatesService)
      .useValue({
        create: jest.fn().mockResolvedValue(candidateExample),
        findAll: jest.fn().mockResolvedValue([candidateExample]),
        findOne: jest.fn().mockResolvedValue(candidateExample),
        update: jest.fn().mockResolvedValue(candidateExample),
        remove: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    controller = module.get<CandidatesController>(CandidatesController);
    service = module.get<CandidatesService>(CandidatesService);
    mockFile = {
      buffer: Buffer.from('mock excel data'),
      originalname: 'test.xlsx',
    } as Express.Multer.File;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload file and create candidate successfully', async () => {
      const result = await controller.uploadFile(mockFile, formDataExample);
      expect(service.create).toHaveBeenCalled();
      expect(result).toEqual(candidateExample);
    });

    it('should return 400 if file is missing', async () => {
      await expect(
        controller.uploadFile(
          null as any as Express.Multer.File,
          formDataExample,
        ),
      ).rejects.toThrowError(HttpException);
    });

    it('should return 400 if excel data is invalid', async () => {
      (xlsx.utils.sheet_to_json as jest.Mock).mockReturnValueOnce([]);
      try {
        await controller.uploadFile(mockFile, formDataExample);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should handle service create error and return 400', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new Error('Service error'));
      const uploadPromise = controller.uploadFile(mockFile, formDataExample);
      await expect(uploadPromise).rejects.toThrowError(HttpException);
      await expect(uploadPromise).rejects.toMatchObject({
        message: 'Service error',
        status: HttpStatus.BAD_REQUEST,
      });
    });
  });

  describe('findAll', () => {
    it('should find all candidates successfully', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([candidateExample]);
    });

    it('should handle service findAll error and re-throw', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValueOnce(new Error('findAll error'));
      await expect(controller.findAll()).rejects.toThrowError();
    });
  });

  describe('remove', () => {
    it('should remove a candidate successfully', async () => {
      const result = await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should handle service remove error and re-throw', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new Error('remove error'));
      await expect(controller.remove('1')).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should update a candidate successfully', async () => {
      const result = await controller.update('1', mockFile, formDataExample);
      expect(service.update).toHaveBeenCalled();
      expect(result).toEqual(candidateExample);
    });

    it('should handle service update error and re-throw', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new Error('update error'));
      await expect(
        controller.update('1', mockFile, formDataExample),
      ).rejects.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should find a candidate by id successfully', async () => {
      const result = await controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(candidateExample);
    });

    it('should return Not Found exception if candidate not found', async () => {
      (service.findOne as jest.Mock).mockResolvedValueOnce(undefined);
      try {
        await controller.findOne('1');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
