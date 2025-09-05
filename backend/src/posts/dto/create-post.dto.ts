import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsInt()
  userId!: number;

  @IsNotEmpty()
  title!: string;

  @IsOptional()
  body?: string;
}
