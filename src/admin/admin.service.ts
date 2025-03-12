import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import moment from 'moment';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserRoles } from 'src/constants/user.constant';
import { User } from 'src/api/user/entities/user.entity';
import { I18nService } from 'nestjs-i18n';
import { comparePassword, encodePassword } from 'src/helpers/bcrypt.helper';
import { AccessTokenService } from 'src/api/access-token/access-token.service';
import { RefreshTokenService } from 'src/api/refresh-token/refresh-token.service';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';

@Injectable()
export class AdminService {
  constructor(
    private i18n: I18nService,
    private accessTokenService: AccessTokenService,
    private refreshTokenService: RefreshTokenService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Get admin by email
   * @param email string
   * @returns
   */
  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email: email.trim().toLowerCase(), role: UserRoles.ADMIN },
    });
  }

  /**
   * Login User
   * @param loginDto object
   * @param i18n object
   */
  async login(loginDto: AdminLoginDto) {
    const { email, password } = loginDto;
    const user = await this.findByEmail(email);

    if (!user) {
      throw new NotFoundException(this.i18n.t('exception.ADMIN_NOT_FOUND'));
    }

    if (!comparePassword(password, user.password)) {
      throw new ConflictException(this.i18n.t('exception.INVALID_PASSWORD'));
    }

    const authentication = await this.generateTokens(user);

    return { ...user, authentication };
  }

  /**
   * Generate JWT tokens
   * @param user
   * @returns
   */
  async generateTokens(user: User) {
    const { decodedToken, jwtToken } =
      await this.accessTokenService.createToken(user);

    const refreshToken = await this.refreshTokenService.createToken(
      decodedToken,
    );

    return {
      accessToken: jwtToken,
      refreshToken,
      expiresAt: decodedToken['exp'],
    };
  }

  /**
   * Dashboard data
   * @param email
   * @returns
   */
  async dashboardData() {
    const users = await this.userRepository.find({
      where: { role: UserRoles.USER },
      order: { createdAt: 'DESC' },
    });

    const thisMonthUsers = await this.userRepository.count({
      where: {
        role: UserRoles.USER,
        createdAt: Between(
          moment().startOf('month').toDate(),
          moment().endOf('month').toDate(),
        ),
      },
    });

    const monthArrayList1 = [];
    let totalUsers = users.length + 1;
    users.length > 0 &&
      users.map((user: any) => {
        totalUsers -= 1;
        if (
          !monthArrayList1.includes(moment(user.createdAt).format('MMM, YYYY'))
        ) {
          monthArrayList1.push({
            date: moment(user.createdAt).format('MMM, YYYY'),
            value: 1,
            total: totalUsers,
          });
        }
      });

    const usersGraphData = [];
    monthArrayList1.length > 0 &&
      monthArrayList1.reduce((res, value) => {
        if (!res[value.date]) {
          res[value.date] = {
            date: value.date,
            value: 0,
            total: value.total,
          };
          usersGraphData.push(res[value.date]);
        }
        res[value.date].value += value.value;
        return res;
      }, {});

    return {
      totalUsers: users.length,
      registeredThisMonthUsers: thisMonthUsers,
      usersGraphData: usersGraphData.slice(0, 6).sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (
          moment(new Date(a.date)).unix() - moment(new Date(b.date)).unix()
        );
      }),
    };
  }

  /**
   * Change admin password
   * @param req
   * @param res
   * @returns
   */
  async changePassword(
    authUser: User,
    adminChangePasswordDto: AdminChangePasswordDto,
  ) {
    const { oldPassword, password } = adminChangePasswordDto;

    if (!comparePassword(oldPassword, authUser.password)) {
      throw new BadRequestException(
        this.i18n.t('exception.ENTER_VALID_PASSWORD'),
      );
    }

    if (comparePassword(password, authUser.password)) {
      throw new BadRequestException(
        this.i18n.t('exception.NEW_PASSWORD_CANNOT_BE_SAME'),
      );
    }

    await this.userRepository.update(authUser.id, {
      password: encodePassword(password),
    });

    return;
  }

  /**
   * Logout user
   * @param user
   */
  async logout(user: User) {
    await Promise.all([
      this.accessTokenService.revokeToken(user.jti),
      this.refreshTokenService.revokeTokenUsingJti(user.jti),
    ]);

    return;
  }
}
