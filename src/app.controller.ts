import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller()
@ApiExcludeController()
export class AppController {
  /**
   * Index page
   * @returns
   */
  @Get()
  @Render('pages/index')
  index() {
    return null;
  }

  /**
   * Privacy policy
   * @returns
   */
  @Get('privacy-policy')
  @Render('pages/privacy-policy')
  privacyPolicy() {
    return null;
  }

  /**
   * Terms & Conditions
   * @returns
   */
  @Get('terms-and-conditions')
  @Render('pages/terms-and-conditions')
  termsAndConditions() {
    return null;
  }

  /**
   * Terms & Conditions
   * @returns
   */
  @Get('support')
  @Render('pages/support')
  support() {
    return null;
  }

  /**
   * Terms & Conditions
   * @returns
   */
  @Get('delete-account')
  @Render('pages/delete-account')
  deleteAccount() {
    return null;
  }
}
