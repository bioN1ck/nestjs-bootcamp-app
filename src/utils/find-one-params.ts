import { IsNumberString } from 'class-validator';

class FindOneParams {
  @IsNumberString()
  public id: string;
}

export default FindOneParams;
