import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as xml2js from 'xml2js';
import * as AdmZip from 'adm-zip';
import { randomUUID } from 'crypto';
import { PrismaService } from 'prisma/prisma.service';
import { GetUnilateralRefusalsDto } from './dto/get-refusals.dto';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

export type AttachmentData = {
  fileName: string;
  url: string;
};

interface UnilateralRefusalData {
  regNumber: string;
  inn: string;
  fullName: string;
  region: string;
  signDate: string | null;
  publishDate: string | null;
  dataParsing: string;
  attachments: AttachmentData[];
}

const REGIONS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
  '49',
  '50',
  '51',
  '52',
  '53',
  '54',
  '55',
  '56',
  '57',
  '58',
  '59',
  '60',
  '61',
  '62',
  '63',
  '64',
  '65',
  '66',
  '67',
  '68',
  '69',
  '70',
  '71',
  '72',
  '73',
  '74',
  '75',
  '76',
  '77',
  '78',
  '79',
  '83',
  '86',
  '87',
  '89',
  '90',
  '91',
  '92',
  '93',
  '94',
  '95',
  '99',
];

const REGION_TIMEZONES: { [key: string]: string } = {
  '01': '+3', // Adygea
  '02': '+5', // Bashkortostan
  '03': '+8', // Buryatia
  '04': '+7', // Altai Republic
  '05': '+3', // Dagestan
  '06': '+3', // Ingushetia
  '07': '+3', // Kabardino-Balkaria
  '08': '+3', // Kalmykia
  '09': '+3', // Karachay-Cherkessia
  '10': '+3', // Karelia
  '11': '+3', // Komi
  '12': '+3', // Mari El
  '13': '+3', // Mordovia
  '14': '+9', // Sakha (Yakutia) - main timezone, though spans multiple
  '15': '+3', // North Ossetia–Alania
  '16': '+3', // Tatarstan
  '17': '+7', // Tuva
  '18': '+4', // Udmurtia
  '19': '+7', // Khakassia
  '20': '+3', // Chechnya
  '21': '+3', // Chuvashia
  '22': '+7', // Altai Krai
  '23': '+3', // Krasnodar Krai
  '24': '+7', // Krasnoyarsk Krai
  '25': '+10', // Primorsky Krai
  '26': '+3', // Stavropol Krai
  '27': '+10', // Khabarovsk Krai
  '28': '+9', // Amur Oblast
  '29': '+3', // Arkhangelsk Oblast
  '30': '+4', // Astrakhan Oblast
  '31': '+3', // Belgorod Oblast
  '32': '+3', // Bryansk Oblast
  '33': '+3', // Vladimir Oblast
  '34': '+3', // Volgograd Oblast
  '35': '+3', // Vologda Oblast
  '36': '+3', // Voronezh Oblast
  '37': '+3', // Ivanovo Oblast
  '38': '+8', // Irkutsk Oblast
  '39': '+2', // Kaliningrad Oblast
  '40': '+3', // Kaluga Oblast
  '41': '+12', // Kamchatka Krai
  '42': '+7', // Kemerovo Oblast
  '43': '+3', // Kirov Oblast
  '44': '+3', // Kostroma Oblast
  '45': '+5', // Kurgan Oblast
  '46': '+3', // Kursk Oblast
  '47': '+3', // Leningrad Oblast
  '48': '+3', // Lipetsk Oblast
  '49': '+11', // Magadan Oblast
  '50': '+3', // Moscow Oblast
  '51': '+3', // Murmansk Oblast
  '52': '+3', // Nizhny Novgorod Oblast
  '53': '+3', // Novgorod Oblast
  '54': '+7', // Novosibirsk Oblast
  '55': '+6', // Omsk Oblast
  '56': '+5', // Orenburg Oblast
  '57': '+3', // Oryol Oblast
  '58': '+3', // Penza Oblast
  '59': '+5', // Perm Krai
  '60': '+3', // Pskov Oblast
  '61': '+3', // Rostov Oblast
  '62': '+3', // Ryazan Oblast
  '63': '+4', // Samara Oblast
  '64': '+4', // Saratov Oblast
  '65': '+11', // Sakhalin Oblast
  '66': '+5', // Sverdlovsk Oblast
  '67': '+3', // Smolensk Oblast
  '68': '+3', // Tambov Oblast
  '69': '+3', // Tver Oblast
  '70': '+7', // Tomsk Oblast
  '71': '+3', // Tula Oblast
  '72': '+5', // Tyumen Oblast
  '73': '+4', // Ulyanovsk Oblast
  '74': '+5', // Chelyabinsk Oblast
  '75': '+9', // Zabaykalsky Krai
  '76': '+3', // Yaroslavl Oblast
  '77': '+3', // Moscow
  '78': '+3', // Saint Petersburg
  '79': '+10', // Jewish Autonomous Oblast
  '83': '+3', // Nenets Autonomous Okrug
  '86': '+5', // Khanty-Mansi Autonomous Okrug
  '87': '+12', // Chukotka Autonomous Okrug
  '89': '+5', // Yamalo-Nenets Autonomous Okrug
  '90': '+3', // Default for unknown/special
  '91': '+3', // Crimea
  '92': '+3', // Sevastopol
  '93': '+3', // Default
  '94': '+3', // Default
  '95': '+3', // Default
  '99': '+3', // Baikonur
};

@Injectable()
export class ZakupkiUnilateralRefusalService {
  private readonly logger = new Logger(ZakupkiUnilateralRefusalService.name);
  private readonly endpoint =
    'https://int.zakupki.gov.ru/eis-integration/services/getDocsIP';
  private token: string;

  constructor(
    private prisma: PrismaService,
    protected configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.token = configService.get('TOKEN');
  }

  @Cron('0 0 */2 * * *') // Каждые 2 часа ( каждого четного часа)
  async hourlyUpdate() {
    this.logger.log('Starting update every 2 hours');
    await this.fetchAndSaveAllRegions();
    this.logger.log('Update completed');
  }

  async fetchAndSaveAllRegions() {
    const now = new Date();
    // const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const saved: UnilateralRefusalData[] = [];

    for (const region of REGIONS) {
      const offset = REGION_TIMEZONES[region] || '+3';
      this.logger.log(`Processing region ${region} with offset ${offset}`);

      // Чтобы покрыть последние ~4 часа (с лагом >2 часа), запрашиваем несколько интервалов
      // Начнем с currentHour - 5 до currentHour - 3 (чтобы безопасно >2 часа лаг)
      for (let delta = 5; delta >= 3; delta--) {
        let fromHour = currentHour - delta;
        let queryDate = '2026-02-13';

        // Если fromHour <0, корректруем дату и час
        if (fromHour < 0) {
          fromHour += 24;
          const prevDay = new Date(now);
          prevDay.setDate(prevDay.getDate() - 1);
          queryDate = prevDay.toISOString().split('T')[0];
        }

        try {
          const items = await this.getUnilateralRefusalsByRegion({
            region,
            date: queryDate,
            fromHour,
            offsetTimeZone: offset,
          });
          for (const item of items) {
            const savedRefusal = await this.prisma.unilateralRefusal.upsert({
              where: {
                regNumber_region: {
                  regNumber: item.regNumber,
                  region: item.region,
                },
              },
              update: {
                inn: item.inn,
                fullName: item.fullName,
                signDate: item.signDate ? new Date(item.signDate) : null,
                publishDate: item.publishDate
                  ? new Date(item.publishDate)
                  : null,
                dataParsing: item.dataParsing,
                // НЕ передаём attachments сюда!
              },
              create: {
                regNumber: item.regNumber,
                region: item.region,
                inn: item.inn,
                fullName: item.fullName,
                signDate: item.signDate ? new Date(item.signDate) : null,
                publishDate: item.publishDate
                  ? new Date(item.publishDate)
                  : null,
                dataParsing: item.dataParsing,
              },
            });
            if (item.attachments && item.attachments.length > 0) {
              await this.prisma.attachment.deleteMany({
                where: { refusalId: savedRefusal.id },
              });

              await this.prisma.attachment.createMany({
                data: item.attachments.map((att) => ({
                  refusalId: savedRefusal.id,
                  fileName: att.fileName,
                  url: att.url,
                })),
                skipDuplicates: true,
              });
            }
            saved.push(item);
          }
          this.logger.log(
            `Region ${region}, hour ${fromHour}: ${items.length} records`,
          );
        } catch (err) {
          this.logger.error(
            `Error in region ${region}, hour ${fromHour}: ${err.message}`,
            err.stack,
          );
        }

        // Delay между запросами для одного региона (1 сек)
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Delay между регионами (5 сек, чтобы е перегружать API)
      await new Promise((r) => setTimeout(r, 1000));
    }

    return saved;
  }

  private async getUnilateralRefusalsByRegion(params: {
    region: string;
    date: string;
    fromHour: number;
    offsetTimeZone: string;
  }): Promise<UnilateralRefusalData[]> {
    const { region, date, fromHour, offsetTimeZone } = params;
    const uuid = randomUUID();
    const now = new Date().toISOString();

    const periodInfoXml = `
    <periodInfo>
      <oneHourInfo>
        <date>${date}</date>
        <fromHour>${fromHour}</fromHour>
        <offsetTimeZone>${offsetTimeZone}</offsetTimeZone>
      </oneHourInfo>
    </periodInfo>`;

    const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:ws="http://zakupki.gov.ru/fz44/get-docs-ip/ws">
   <soapenv:Header>
      <individualPerson_token>${this.token}</individualPerson_token>
   </soapenv:Header>
   <soapenv:Body>
      <ws:getDocsByOrgRegionRequest>
         <index>
            <id>${uuid}</id>
            <createDateTime>${now}</createDateTime>
            <mode>PROD</mode>
         </index>
         <selectionParams>
            <orgRegion>${region}</orgRegion>
            <subsystemType>UR</subsystemType>
            <documentType44>contractProcedureUnilateralRefusal</documentType44>
            ${periodInfoXml}
         </selectionParams>
      </ws:getDocsByOrgRegionRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        this.logger.debug(
          `Запрос к ЕИС: регион ${region}, час ${fromHour}, попытка ${attempt + 1}/${maxRetries}`,
        );

        const response = await axios.post(this.endpoint, envelope, {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
          },
          timeout: 30000,
        });

        // Если дошли сюда — запрос прошёл успешно
        const parsed = await xml2js.parseStringPromise(response.data, {
          explicitArray: false,
          tagNameProcessors: [xml2js.processors.stripPrefix],
          attrNameProcessors: [xml2js.processors.stripPrefix],
        });

        const resp = parsed.Envelope?.Body?.getDocsByOrgRegionResponse;
        if (!resp?.dataInfo?.archiveUrl) {
          this.logger.debug(
            `Нет архивов для региона ${region}, час ${fromHour}`,
          );
          return [];
        }

        const archiveUrls: string[] = Array.isArray(resp.dataInfo.archiveUrl)
          ? resp.dataInfo.archiveUrl
          : [resp.dataInfo.archiveUrl];

        const results: UnilateralRefusalData[] = [];

        for (const url of archiveUrls) {
          try {
            const zipBuffer = await this.downloadZip(url);
            const zip = new AdmZip(zipBuffer);

            for (const entry of zip.getEntries()) {
              if (!entry.entryName.endsWith('.xml')) continue;

              const xmlContent = zip.readAsText(entry);
              const xmlObj = await xml2js.parseStringPromise(xmlContent, {
                explicitArray: false,
                tagNameProcessors: [xml2js.processors.stripPrefix],
              });

              const doc = xmlObj.export?.contractProcedureUnilateralRefusal;
              if (!doc) continue;

              const common = doc.commonInfo || {};
              const participantInfo = common.participantInfo || {};

              const legal =
                participantInfo.legalEntityRFInfo ||
                participantInfo.legalEntityForeignInfo ||
                {};

              const person = participantInfo.individualPersonRFInfo || {};

              let fullName: string = null;
              if (legal.fullName) {
                fullName = legal.fullName.trim();
              } else if (legal.firmName) {
                fullName = legal.firmName.trim();
              } else if (person.nameInfo) {
                const ni = person.nameInfo;
                const parts = [
                  ni.lastName || '',
                  ni.firstName || '',
                  ni.middleName || '',
                ].filter(Boolean);
                fullName = parts.join(' ').trim() || null;
              }

              const attachmentsData: { fileName: string; url: string }[] = [];

              const attachmentsInfo = doc.attachmentsInfo;
              if (attachmentsInfo?.attachmentInfo) {
                let attachments = attachmentsInfo.attachmentInfo;

                if (!Array.isArray(attachments)) {
                  attachments = [attachments];
                }

                for (const attachment of attachments) {
                  if (attachment.fileName && attachment.url) {
                    attachmentsData.push({
                      fileName: attachment.fileName.trim(),
                      url: attachment.url.trim(),
                    });
                  }
                }
              }

              const printFormHTMLInfo = doc.printFormHTMLInfo;
              if (printFormHTMLInfo?.fileName && printFormHTMLInfo?.url) {
                attachmentsData.push({
                  fileName: printFormHTMLInfo.fileName.trim(),
                  url: printFormHTMLInfo.url.trim(),
                });
              }

              results.push({
                regNumber: common.regNumber || null,
                inn: legal.INN || person.INN || null,
                fullName,
                region,
                signDate: common.signDT || null,
                publishDate: common.docPublishDate || null,
                dataParsing: now,
                attachments: attachmentsData.length > 0 ? attachmentsData : [],
              });
            }
          } catch (zipErr) {
            this.logger.error(
              `Ошибка при обработке архива ${url} (регион ${region}): ${zipErr.message}`,
            );
          }
        }

        this.logger.log(
          `Успешно обработан регион ${region}, час ${fromHour}: ${results.length} записей`,
        );
        return results;
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 425) {
          attempt++;
          this.logger.warn(
            `425 Too Early | Регион ${region}, час ${fromHour} | ` +
              `Ожидание 5 сек... (попытка ${attempt}/${maxRetries})`,
          );

          if (attempt >= maxRetries) {
            this.logger.error(
              `Превышено кол-во попыток (425) для региона ${region}, час ${fromHour}. Пропускаем.`,
            );
            return [];
          }

          // Задержка перед повторной попыткой
          await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 секунд
          continue;
        }

        this.logger.error(
          `Критическая ошибка в регионе ${region}, час ${fromHour}: ${err.message}`,
          err.stack,
        );
        return [];
      }
    }

    return [];
  }

  private async downloadZip(url: string): Promise<Buffer> {
    const maxRetries = 6; // увеличим до 6 — реально помогает
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        this.logger.debug(
          `Скачивание ZIP: ${url} (попытка ${attempt + 1}/${maxRetries})`,
        );

        const res = await axios.get(url, {
          headers: { individualPerson_token: this.token },
          responseType: 'arraybuffer',
          timeout: 180000, // 3 минуты — ZIP может быть большим
        });

        const buffer = Buffer.from(res.data);
        this.logger.log(
          `ZIP скачан успешно: ${url}, размер ${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
        );
        return buffer;
      } catch (err) {
        attempt++;

        const isRetryable =
          (axios.isAxiosError(err) &&
            (err.response?.status === 424 || err.response?.status === 425)) ||
          err.code === 'ECONNRESET' ||
          err.code === 'ETIMEDOUT' ||
          err.message.includes('socket hang up') ||
          err.message.includes('Network Error');

        if (isRetryable && attempt < maxRetries) {
          // Экспоненциальная задержка + случайный jitter (чтобы не синхронизироваться с другими запросами)
          const baseDelay = Math.pow(2, attempt) * 3000; // 6с → 12с → 24с → 48с → 96с → 192с
          const jitter = Math.random() * 2000; // ±2 секунды
          const delayMs = baseDelay + jitter;

          this.logger.warn(
            `Ошибка ${err.response?.status || err.code || 'unknown'} при скачивании ${url}. ` +
              `Повтор через ${(delayMs / 1000).toFixed(1)} сек... (попытка ${attempt}/${maxRetries})`,
          );

          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }

        // Если исчерпаны попытки или другая ошибка — пропускаем архив
        this.logger.error(
          `Не удалось скачать ZIP ${url} после ${attempt} попыток: ${err.message}`,
          err.stack,
        );

        // Возвращаем пустой буфер, чтобы не ломать весь час
        return Buffer.from([]);
      }
    }

    this.logger.error(`Исчерпаны все попытки скачивания ZIP: ${url}`);
    return Buffer.from([]);
  }

  async testPush() {
    const testItem = {
      regNumber: '2171602115425000009',
      region: '44',
      inn: '12343467890',
      fullName: 'Алишка Аллахвердиев',
      signDate: new Date(),
      publishDate: new Date(),
      dataParsing: '2026-01-28T20:11:00.000',
    };

    const result = await this.prisma.unilateralRefusal.upsert({
      where: {
        regNumber_region: {
          regNumber: '2171602115425000009',
          region: '44',
        },
      },
      update: testItem,
      create: testItem,
      include: {
        attachments: true,
      },
    });

    console.log('Создано с вложениями:', JSON.stringify(result, null, 2));
    return result;
  }

  async findAllPaginated(query: GetUnilateralRefusalsDto) {
    const cacheKey = this.getCacheKey(query);

    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`[CACHE HIT] ${cacheKey}`);
      return cached;
    }

    this.logger.debug(`[CACHE MISS] ${cacheKey}`);
    const {
      page = 1,
      perPage = 30,
      search,
      region,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder = 'desc',
      filterRegNumber,
      filterFullName,
      filterInn,
      filterRegion,
    } = query;

    const skip = (Number(page) - 1) * Number(perPage);

    const where: any = {};

    if (search) {
      where.OR = [
        { regNumber: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { inn: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filterRegNumber)
      where.regNumber = { contains: filterRegNumber, mode: 'insensitive' };
    if (filterFullName)
      where.fullName = { contains: filterFullName, mode: 'insensitive' };
    if (filterInn) where.inn = { contains: filterInn, mode: 'insensitive' };
    if (filterRegion)
      where.region = { contains: filterRegion, mode: 'insensitive' };

    if (region) where.region = region;

    if (dateFrom || dateTo) {
      where.signDate = {};
      if (dateFrom) where.signDate.gte = new Date(dateFrom);
      if (dateTo) where.signDate.lte = new Date(`${dateTo}T23:59:59.999Z`);
    }

    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.dataParsing = 'desc';
    }

    const [items, total] = await Promise.all([
      this.prisma.unilateralRefusal.findMany({
        where,
        skip,
        take: Number(perPage),
        orderBy,
        select: {
          regNumber: true,
          region: true,
          inn: true,
          fullName: true,
          signDate: true,
          publishDate: true,
          dataParsing: true,
          attachments: {
            select: {
              fileName: true,
              url: true,
            },
            orderBy: {
              id: 'asc',
            },
          },
        },
      }),
      this.prisma.unilateralRefusal.count({ where }),
    ]);

    const result: any = {
      data: items,
      meta: {
        total,
        page: Number(page),
        perPage: Number(perPage),
        totalPages: Math.ceil(total / perPage),
      },
    };

    try {
      await this.cacheManager.set(cacheKey, result, 300_000);
      console.log(
        '[CACHE-SET-DEBUG] set завершился БЕЗ исключения | ключ:',
        cacheKey,
      );
    } catch (err) {
      console.error('[CACHE-SET-ERROR] Исключение внутри set:', err.message);
      console.error('[CACHE-SET-ERROR] Полный стек:', err.stack);
    }

    return result;
  }

  private getCacheKey(query: GetUnilateralRefusalsDto): string {
    const q = { ...query, page: query.page ?? 1, perPage: query.perPage ?? 30 };

    return `refusals:${[
      `p:${q.page}`,
      `pp:${q.perPage}`,
      q.sortBy ? `s:${q.sortBy}:${q.sortOrder ?? 'desc'}` : '',
      q.search ? `search:${q.search.trim().toLowerCase()}` : '',
      q.dateFrom ? `from:${q.dateFrom}` : '',
      q.dateTo ? `to:${q.dateTo}` : '',
      q.filterRegNumber ? `rn:${q.filterRegNumber}` : '',
      q.filterFullName ? `fn:${q.filterFullName}` : '',
      q.filterInn ? `inn:${q.filterInn}` : '',
      q.filterRegion ? `reg:${q.filterRegion}` : '',
    ]
      .filter(Boolean)
      .join(':')}`;
  }
}
