import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class UpdatePostDto {
  @IsNumber()
  public id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public content: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public title: string;
}

export default UpdatePostDto;
