import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { AppVersions } from 'src/api/app-versions/entities/app-versions.entity';
import { DeviceTypes } from 'src/constants/app.constant';

export default class CreateAppVersionsSeeder implements Seeder {
  /**
   * Track seeder execution.
   *
   * Default: false
   */
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    await dataSource.query(`SET FOREIGN_KEY_CHECKS=0;`);
    await dataSource.query(`TRUNCATE app_versions;`);
    await dataSource.query(`SET FOREIGN_KEY_CHECKS=1;`);

    const repository = dataSource.getRepository(AppVersions);
    await repository.insert([
      {
        id: 1,
        minVersion: 1,
        latestVersion: 1,
        link: 'https://ios.apple.com/join/h86sugHG',
        platform: DeviceTypes.IOS,
      },
      {
        id: 2,
        minVersion: 1,
        latestVersion: 1,
        link: 'https://play.google.com/store/apps/details?id=com.app.mobile.app&pcampaignid=web_share',
        platform: DeviceTypes.ANDROID,
      },
    ]);

    console.log('Seeding completed for TABLE: app_versions');
  }
}
