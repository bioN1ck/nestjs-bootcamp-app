import { IsNotEmpty, IsString } from 'class-validator';

class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  public name: string;
}

export default CreateCategoryDto;
