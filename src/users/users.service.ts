import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  async upsertGoogleUser(profile: { googleId: string; email: string; name?: string }): Promise<User> {
    // Try find by googleId first, then by email
    let user = await this.repo.findOne({ where: { googleId: profile.googleId } });
    if (!user) {
      user = await this.repo.findOne({ where: { email: profile.email } });
    }

    if (user) {
      user.googleId = profile.googleId;
      user.name = profile.name ?? user.name;
      user.email = profile.email ?? user.email;
      return this.repo.save(user);
    }

    const newUser = this.repo.create({ email: profile.email, name: profile.name, googleId: profile.googleId });
    return this.repo.save(newUser);
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }
}
