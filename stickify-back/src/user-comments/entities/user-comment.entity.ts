import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user_comments')
export class UserComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  songName: string;

  @Column()
  text: string;

  @Column('bigint')
  date: number;
}