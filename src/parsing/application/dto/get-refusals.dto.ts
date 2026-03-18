import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUnilateralRefusalsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  perPage?: number = 30;

  @IsOptional()
  @IsString()
  search?: string; // поиск по fullName или regNumber

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  inn?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  dateTo?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  sortBy?: 'regNumber' | 'fullName' | 'inn' | 'region' | 'dataParsing'; // или enum

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  filterRegNumber?: string;
  @IsOptional()
  @IsString()
  filterFullName?: string;
  @IsOptional()
  @IsString()
  filterInn?: string;
  @IsOptional()
  @IsString()
  filterRegion?: string;
}
