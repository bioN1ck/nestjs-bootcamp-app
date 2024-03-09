import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

class UpdatePostDto {
  // Is this certainly need?
  // @IsNumber()
  // public id: number;

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
