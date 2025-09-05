import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../posts/dto/create-user.dto';
import { UpdateUserDto } from '../posts/dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
    { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' },
    { id: 3, name: 'Clementine Bauch', username: 'Samantha', email: 'Nathan@yesenia.net' },
    { id: 4, name: 'Patricia Lebsack', username: 'Karianne', email: 'Julianne.OConner@kory.org' },
    { id: 5, name: 'Chelsey Dietrich', username: 'Kamren', email: 'Lucio_Hettinger@annie.ca' },
  ];
  private nextId = this.users.length + 1;

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User {
    const u = this.users.find(x => x.id === id);
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  create(dto: CreateUserDto): User {
    const created: User = { id: this.nextId++, ...dto };
    this.users.unshift(created);
    return created;
  }

  update(id: number, dto: UpdateUserDto): User {
    const idx = this.users.findIndex(x => x.id === id);
    if (idx === -1) throw new NotFoundException('User not found');
    this.users[idx] = { ...this.users[idx], ...dto };
    return this.users[idx];
  }

  remove(id: number): void {
    const idx = this.users.findIndex(x => x.id === id);
    if (idx === -1) throw new NotFoundException('User not found');
    this.users.splice(idx, 1);
  }
}
