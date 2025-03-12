import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { User } from 'src/api/user/entities/user.entity';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private i18n: I18nService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find all users
   * @param search string
   * @param page number
   * @param limit number
   * @returns
   */
  async findAllUsers(search: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    search = String(search).trim().toLowerCase();

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .orderBy('u.createdAt', 'DESC');

    if (search && search !== 'undefined') {
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where('LOWER(u.fullName) LIKE :search', {
            search: `%${search}%`,
          }).orWhere('LOWER(u.email) LIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    const total = await queryBuilder.getCount();

    const data = limit
      ? await queryBuilder.take(limit).skip(skip).getMany()
      : await queryBuilder.getMany();

    return [data, total];
  }

  /**
   * Block/Unblock user
   * @param uid string
   * @returns
   */
  async blockUnblockUser(uid: string) {
    if (!uid)
      throw new BadRequestException(
        this.i18n.t('exception.REQUIRED_PARAMETERS_MISSING'),
      );

    const user = await this.userRepository.findOne({ where: { uid } });
    if (!user)
      throw new NotFoundException(
        this.i18n.t('exception.NOT_FOUND', { args: { property: 'Users' } }),
      );

    await this.userRepository.update(user.id, {
      isBlocked: user.isBlocked ? false : true,
    });

    return await this.userRepository.findOne({ where: { uid } });
  }
}
