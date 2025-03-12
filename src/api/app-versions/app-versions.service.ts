import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppVersionsStatus } from 'src/constants/app.constant';
import { Repository } from 'typeorm';
import { AppVersions } from './entities/app-versions.entity';
import { CheckAppVersionDto } from './dto/check-app-version.dto';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';

@Injectable()
export class AppVersionsService {
  constructor(
    @InjectRepository(AppVersions)
    private appVersionRepo: Repository<AppVersions>,
  ) {}

  /**
   * Check app version
   * @param checkAppVersionDto
   * @returns
   */
  async check(
    { platform, version }: CheckAppVersionDto,
    i18n: I18nContext<I18nTranslations>,
  ) {
    const appVersion = await this.appVersionRepo.findOne({
      where: { platform },
    });

    if (!appVersion) {
      throw new BadRequestException(i18n.t('exception.APP_DATA_NOT_STORED'));
    }

    const { minVersion, latestVersion, link } = appVersion;

    if (version < minVersion) {
      return {
        message: i18n.t('translate.OUTDATED_APP'),
        data: { status: AppVersionsStatus.OUTDATED, link },
      };
    }

    if (version < latestVersion) {
      return {
        message: i18n.t('translate.UPDATE_APP'),
        data: { status: AppVersionsStatus.OPTIONAL, link },
      };
    }

    return {
      message: i18n.t('translate.UP_TO_DATE_APP'),
      data: { status: AppVersionsStatus.UP_TO_DATE, link },
    };
  }
}
