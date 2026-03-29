import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @IsString({ message: 'Senha é obrigatória' })
  @MinLength(6, { message: 'Seha deve ter no mínimo 6 caracterers' })
  @MaxLength(100, { message: 'Senha muito longa' })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nome muito longo' })
  @Transform(({ value }) => value?.trim())
  fullName?: string;
}
