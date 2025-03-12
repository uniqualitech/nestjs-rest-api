import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CHECK_APP_VERSION_RESPONSE } from 'src/constants/swagger.constant';
import { AppVersionsService } from './app-versions.service';
import { CheckAppVersionDto } from './dto/check-app-version.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { AppHeaders } from 'src/decorators/app-headers.decorator';

@ApiTags('App Version')
@Controller('api/v1')
@UsePipes(ValidationPipe)
@AppHeaders()
export class AppVersionsController {
  constructor(private readonly appVersionsService: AppVersionsService) {}

  /**
   * Check app version
   * @param checkAppVersionDto
   * @returns
   */
  @Post('check-app-version')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check app version',
    description: `    platform : iOS, Android
    status =
    0: Up to date, 
    1: Force Update, 
    2: Recommended Update (Optional Update)`,
  })
  @ApiResponse(CHECK_APP_VERSION_RESPONSE)
  async checkVersion(
    @Body() checkAppVersionDto: CheckAppVersionDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const data = await this.appVersionsService.check(checkAppVersionDto, i18n);
    return {
      statusCode: HttpStatus.OK,
      ...data,
    };
  }
}
