import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsArray()
  @IsOptional()
  public categoryIds?: string[];
}

export default CreatePostDto;
