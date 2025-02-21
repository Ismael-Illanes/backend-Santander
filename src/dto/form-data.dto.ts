/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString } from 'class-validator';

export class FormData {
  @IsString()
  name: string;

  @IsString()
  surname: string;
}
