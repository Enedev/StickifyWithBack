import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  premium: boolean;

  @Column('text', { array: true, default: [] })
  followers: string[];

  @Column('text', { array: true, default: [] })
  following: string[];
}