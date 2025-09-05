import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './post.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class PostsService {
  constructor(private readonly users: UsersService) {}

  private posts: Post[] = [
    { id: 1, userId: 1, title: 'Hello from user 1', body: 'First post' },
    { id: 2, userId: 2, title: 'Hi there', body: 'Welcome!' },
    { id: 3, userId: 1, title: 'Another one', body: 'More content' },
    { id: 4, userId: 3, title: 'Post 3', body: 'lorem' },
  ];
  private nextId = this.posts.length + 1;

  findAll(userId?: number): Post[] {
    return userId ? this.posts.filter(p => p.userId === userId) : this.posts;
  }

  findOne(id: number): Post {
    const p = this.posts.find(x => x.id === id);
    if (!p) throw new NotFoundException('Post not found');
    return p;
  }

  create(dto: CreatePostDto): Post {
    // userId doğrula
    try { this.users.findOne(dto.userId); } catch {
      throw new BadRequestException('Invalid userId');
    }
    const created: Post = { id: this.nextId++, ...dto };
    this.posts.unshift(created);
    return created;
  }

  update(id: number, dto: UpdatePostDto): Post {
    const idx = this.posts.findIndex(x => x.id === id);
    if (idx === -1) throw new NotFoundException('Post not found');

    // userId değiştiriliyorsa doğrula
    if (dto.userId !== undefined) {
      try { this.users.findOne(dto.userId); } catch {
        throw new BadRequestException('Invalid userId');
      }
    }

    this.posts[idx] = { ...this.posts[idx], ...dto };
    return this.posts[idx];
  }

  remove(id: number): void {
    const idx = this.posts.findIndex(x => x.id === id);
    if (idx === -1) throw new NotFoundException('Post not found');
    this.posts.splice(idx, 1);
  }
}
