import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { encodePassword } from 'src/helpers/bcrypt.helper';
import { User } from 'src/api/user/entities/user.entity';
import { AdminRoles, UserRoles } from 'src/constants/user.constant';
import { generateUniqueId } from 'src/helpers/utils.helper';

export default class CreateAdminSeeder implements Seeder {
  /**
   * Track seeder execution.
   *
   * Default: false
   */
  track = false;

  public async run(dataSource: DataSource): Promise<any> {
    const repository = dataSource.getRepository(User);
    await repository.insert([
      {
        uid: generateUniqueId('U'),
        role: UserRoles.ADMIN,
        adminRole: AdminRoles.ADMIN,
        email: 'admin@nestjs.com',
        password: encodePassword('Y7gEc7{VEp8y"74T'),
      },
      {
        uid: generateUniqueId('U'),
        role: UserRoles.ADMIN,
        adminRole: AdminRoles.SUPER_ADMIN,
        email: 'superadmin@nestjs.com',
        password: encodePassword('45]DJ4O_8c.$%"<f'),
      },
    ]);

    console.log('Seeding completed for TABLE: admins');
  }
}
