// src/contracts/contracts.controller.ts
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZakupkiUnilateralRefusalService } from './application/zakupki.service';
import { GetUnilateralRefusalsDto } from './application/dto/get-refusals.dto';
import { ChangeStatusDto } from './application/dto/change-status.dto';
import { AddCommentsDto } from './application/dto/change-status.dto copy';
import { JwtAccessAuthGuard } from 'src/auth/guards/jwt/jwt-header.strategy';

@UseGuards(JwtAccessAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly zakupkiService: ZakupkiUnilateralRefusalService,
  ) {}
  // Эндпоинт для получения списка отазов с пагинацией и фильтрами
  @Get('refusals')
  async getRefusals(@Query() query: GetUnilateralRefusalsDto) {
    console.log(query);
    try {
      const result = await this.zakupkiService.findAllPaginated(query);
      return result;
    } catch (error) {
      console.error('Ошибка в getRefusals:', error);
      throw error; // или return { error: error.message }
    }
  }
  @Get('test')
  async setTest() {
    try {
      const result = await this.zakupkiService.testPush();
      return result;
    } catch (error) {
      console.error('Ошибка в getRefusals:', error);
      throw error; // или return { error: error.message }
    }
  }

  // Опционально: отдельный эндпоинт для принудительного обновления (для админа)
  @Get('refusals/update')
  async forceUpdate() {
    await this.zakupkiService.hourlyUpdate();
    return { message: 'Обновление запущено (асинхронно)' };
  }

  @Put('status')
  async changeStatus(@Query() query: ChangeStatusDto) {
    await this.zakupkiService.changeStatus(query.RegNumber, query.status);
  }
  @Post('comment')
  async createComment(@Body() commentDto: AddCommentsDto) {
    await this.zakupkiService.createComment(
      commentDto.RegNumber,
      commentDto.text,
    );
  }
}
