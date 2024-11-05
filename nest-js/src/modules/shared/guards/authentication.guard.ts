import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import JWTService from '../services/jwt.service';
import { ModuleRef } from '@nestjs/core';
import Logger from '../../../config/winston';
import { UtilService } from '../services/util.service';
import { TokenHistoryService } from '../../token-history/token-history.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private jwtService: JWTService;
  private tokenHistoryService: TokenHistoryService;
  private utilService: UtilService;

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    this.jwtService = this.moduleRef.get(JWTService, { strict: false });
    this.tokenHistoryService = this.moduleRef.get(TokenHistoryService, {
      strict: false,
    });
    this.utilService = this.moduleRef.get(UtilService, { strict: false });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const accessTokenCookie = request.cookies['accessToken'];
    const refreshTokenCookie = request.cookies['refreshToken'];

    try {
      const payload = this.jwtService.decodeJWT(accessTokenCookie, 'access');

      if (payload.invalid) {
        throw new UnauthorizedException('Unauthorized');
      } else if (payload.expired) {
        const { accessToken, refreshToken, userId } =
          await this.renewcredentials(refreshTokenCookie);

        response.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 5 * 60 * 1000, // 5 minutes
        });

        response.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        request.userId = userId;
      } else {
        request.userId = payload.info.data.id;
      }

      return true;
    } catch (error) {
      Logger.error(error);
    }
  }

  async renewcredentials(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    userId: string;
  }> {
    const payload = this.jwtService.decodeJWT(refreshToken, 'access');
    if (payload.expired) throw new BadRequestException('Session Expired');
    else if (payload.invalid) throw new UnauthorizedException('Unauthorized');

    // validate refreshToken:
    const historyToken = await this.tokenHistoryService.getTokenHistory(
      payload.info.data.id,
    );
    if (!historyToken) throw new UnauthorizedException('Unauthorized');

    const validate = await this.utilService.compare(
      refreshToken,
      historyToken.refreshToken,
    );
    if (!validate) throw new ForbiddenException('Invalid Refresh Token');

    // Create new session credentials
    const newAcessToken = this.jwtService.createJWT(payload.info.data.id);
    const newRefreshToken = this.jwtService.createRefreshJWT(
      payload.info.data.id,
    );

    await this.tokenHistoryService.saveHistory(
      payload.info.data.id,
      await this.utilService.encrypt(newRefreshToken),
    );

    return {
      accessToken: newAcessToken,
      refreshToken: newRefreshToken,
      userId: payload.info.data.id,
    };
  }
}
