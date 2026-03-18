import { IsNotEmpty, IsString } from 'class-validator';

export class AddCommentsDto {
  @IsString()
  @IsNotEmpty({ message: 'RegNumber не может быть пустым' })
  RegNumber?: string;
  @IsNotEmpty({ message: 'Text не может быть пустым' })
  @IsString()
  text?: string;
}
