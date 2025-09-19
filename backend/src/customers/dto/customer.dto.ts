import { IsString, Matches, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsString()
  @Length(11, 11, { message: 'Phone number must be exactly 11 characters' })
  @Matches(/^\d{11}$/, {
    message: 'Phone number must contain exactly 11 digits'
  })
  phone: string;
}

export class SearchCustomerDto {
  @IsString()
  query: string;
}
