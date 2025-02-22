import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn() 
  updatedAt: Date;
}