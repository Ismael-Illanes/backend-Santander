import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  seniority: string;

  @Column()
  years: number;

  @Column()
  availability: boolean;
}
