import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { User } from './entities/user.entity';
import { Improvement } from './entities/improvement.entity';
import { ProviderTypes } from 'src/constants/user.constant';
import {
  deleteFile,
  uploadFile,
  validateFileType,
} from 'src/helpers/fileupload.helper';
import { IMAGE_EXTENSIONS } from 'src/constants/app.constant';
import { comparePassword, encodePassword } from 'src/helpers/bcrypt.helper';
import { generateUniqueId } from 'src/helpers/utils.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Improvement)
    private readonly improvementRepository: Repository<Improvement>,
  ) {}

  /**
   * Get user by id without any condition
   * @param id number
   * @returns Promise<User>
   */
  async getUserById(id: number): Promise<User> {
    return await this.userRepository.findOne({ where: { id } });
  }

  /**
   * Get user by email
   * @param email
   * @returns Promise<User>
   */
  async getUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Get user by email
   * @param email
   * @returns Promise<User>
   */
  async getUserByEmailWithConditions(
    email: string,
    i18n: I18nContext<I18nTranslations>,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    /* Validate user status */
    if (!user) {
      throw new BadRequestException(i18n.t('exception.EMAIL_NOT_REGISTERED'));
    }

    if (user.isBlocked) {
      throw new BadRequestException(i18n.t('exception.USER_BLOCKED_BY_ADMIN'));
    }

    if (user.deletedAt) {
      throw new BadRequestException(i18n.t('exception.ACCOUNT_DISABLED'));
    }

    if (user.isSocialLoggedIn) {
      throw new BadRequestException(
        i18n.t('exception.EMAIL_ASSOCIATED_WITH_SOCIAL_PLATFORM', {
          args: { property: user.providerType },
        }),
      );
    }

    return user;
  }

  /**
   * Find user by provider Id and token
   * @param providerType
   * @param providerId
   */
  async getUserByProviderTypeAndId(
    providerType: ProviderTypes,
    providerId: string,
  ): Promise<User> {
    return await this.userRepository.findOne({
      where: { providerType, providerId },
    });
  }

  /**
   * Update user profile
   * @param updateProfileDto
   * @param userId
   * @returns
   */
  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    authUser: User,
    profilePic: Express.Multer.File,
    i18n: I18nContext<I18nTranslations>,
  ) {
    if (profilePic) {
      if (!validateFileType(profilePic, IMAGE_EXTENSIONS)) {
        throw new BadRequestException(i18n.t('exception.ONLY_IMAGES_ALLOWED'));
      }

      deleteFile(authUser.profilePic);
      updateProfileDto.profilePic = uploadFile('profilePics', profilePic);
    }

    Object.keys(updateProfileDto).forEach((key) => {
      if (updateProfileDto[key] === '') {
        delete updateProfileDto[key];
      }

      if (['true', 'false'].includes(String(updateProfileDto[key]))) {
        updateProfileDto[key] = String(updateProfileDto[key]) === 'true';
      }
    });

    return await this.createOrUpdate(updateProfileDto, authUser.id, i18n);
  }

  /**
   * Change user password
   * @param changePasswordDto
   * @param authUser
   * @returns
   */
  async changePassword(
    changePasswordDto: ChangePasswordDto,
    authUser: User,
    i18n: I18nContext<I18nTranslations>,
  ) {
    if (!comparePassword(changePasswordDto.oldPassword, authUser.password)) {
      throw new BadRequestException(i18n.t('exception.ENTER_VALID_PASSWORD'));
    }

    if (comparePassword(changePasswordDto.password, authUser.password)) {
      throw new BadRequestException(
        i18n.t('exception.NEW_PASSWORD_CANNOT_BE_SAME'),
      );
    }

    return await this.createOrUpdate(
      { password: encodePassword(changePasswordDto.password) },
      authUser.id,
      i18n,
    );
  }

  /**
   * Create or update user
   * @param data
   * @param userId
   * @returns
   */
  async createOrUpdate(
    data: Partial<User>,
    userId: number | null = null,
    i18n: I18nContext<I18nTranslations>,
  ) {
    if (userId) {
      await this.userRepository.update(userId, data);
    } else {
      const user = await this.userRepository.save({
        ...data,
        uid: generateUniqueId('U'),
      });
      userId = user.id;
    }

    return this.getUserById(userId);
  }

  /**
   * Delete user
   * @param authUser
   * @returns
   */
  async deleteProfile(authUser: User, deleteUserDto: DeleteUserDto) {
    // store improvements
    if (deleteUserDto.description) {
      await this.improvementRepository.save(
        this.improvementRepository.create({
          description: deleteUserDto.description,
          iid: generateUniqueId('I'),
          user: { id: authUser.id },
        }),
      );
    }

    // delete user
    await this.userRepository.softDelete({ id: authUser.id });

    return true;
  }
}
