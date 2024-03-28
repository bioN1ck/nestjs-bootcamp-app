import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

class UpdatePostDto {
  @IsString({ each: true })
  @IsNotEmpty()
  @IsOptional()
  public paragraphs?: string[];

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public title?: string;

  @IsArray()
  @IsOptional()
  public categoryIds?: string[];
}

export default UpdatePostDto;
