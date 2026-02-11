// src/contracts/contracts.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ZakupkiUnilateralRefusalService } from './application/zakupki.service';
import { GetUnilateralRefusalsDto } from './application/dto/get-refusals.dto';
// import { GetUnilateralRefusalsDto } from './application/dto/get-refusals.dto';

@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly zakupkiService: ZakupkiUnilateralRefusalService,
  ) {}
  // Эндпоинт для получения списка отазов с пагинацией и фильтрами
  @Get('refusals')
  async getRefusals(@Query() query: GetUnilateralRefusalsDto) {
    // await this.zakupkiService.hourlyUpdate();
    // await this.zakupkiService.testPush();
    try {
      const result = await this.zakupkiService.findAllPaginated(query);
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
}
