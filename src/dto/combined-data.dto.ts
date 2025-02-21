/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNumber, IsBoolean } from 'class-validator';

export class CombinedDataDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsString()
  seniority: string;

  @IsNumber()
  years: number;

  @IsBoolean()
  availability: boolean;
}
