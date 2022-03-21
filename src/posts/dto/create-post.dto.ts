import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  public content: string;

  @IsString()
  @IsNotEmpty()
  public title: string;

  @IsString()
  @IsOptional()
  public category: string;
}

export default CreatePostDto;
