import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'RegNumber не может быть пустым' })
  RegNumber?: string;
  @IsNotEmpty({ message: 'Status не может быть пустым' })
  @IsString()
  status?: string;
}
