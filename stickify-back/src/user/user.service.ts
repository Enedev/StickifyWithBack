// src/users/users.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt'; // Necesario para getToken
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService 
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...user } = createUserDto;
      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = this.userRepository.create({
        password: passwordHash,
        ...user
      });
      const userDB = await this.userRepository.save(newUser);
      return {
        success: true,
        token: this.getToken(userDB)
      }
    } catch (error) {
      throw new BadRequestException({code:error.code, detail:error.detail})
    }
  }
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'premium', 'followers', 'following']
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    if (updateUserDto.password) {
      updateUserDto.password = bcrypt.hashSync(updateUserDto.password, 10); // Hashear la nueva contraseña
    }

    await this.userRepository.update(id, updateUserDto);
    // Retorna el usuario actualizado (se busca de nuevo para obtener los datos más recientes)
    return this.userRepository.findOne({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async toggleFollow(userId: string, targetEmail: string, follow: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const targetUser = await this.userRepository.findOne({ where: { email: targetEmail } });

    if (!user || !targetUser) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (follow) {
      // Agregar a seguidores/siguiendo
      if (!user.following.includes(targetUser.email)) {
        user.following.push(targetUser.email);
      }
      if (!targetUser.followers.includes(user.email)) {
        targetUser.followers.push(user.email);
      }
    } else {
      // Remover de seguidores/siguiendo
      user.following = user.following.filter(email => email !== targetUser.email);
      targetUser.followers = targetUser.followers.filter(email => email !== user.email);
    }

    await this.userRepository.save([user, targetUser]);
    return user;
  }
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'email', 'premium', 'followers', 'following']
    });
  }

  getToken(user: User): string {
    const { password: _, ...userPayload } = user;
    return this.jwtService.sign(userPayload);
  }
}