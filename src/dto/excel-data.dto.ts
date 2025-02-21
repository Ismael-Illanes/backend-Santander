/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class ExcelData {
  @IsString()
  seniority: string;

  @IsNumber()
  years: number;

  @IsBoolean()
  availability: boolean;
}
