import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class UpdateCategoryDto {
  @IsNumber()
  @IsOptional()
  public id: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public name: string;
}

export default UpdateCategoryDto;
