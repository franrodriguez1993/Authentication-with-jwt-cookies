import { Injectable } from '@nestjs/common';
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import Logger from '../../../config/winston';
import {
  JWTInterface,
  JWTPayloadInterface,
} from '../interface/jwt-payload.interface';

@Injectable()
export default class JWTService {
  createJWT(userId: string) {
    return sign(
      {
        data: { id: userId },
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' },
    );
  }

  createRefreshJWT(userId: string) {
    return sign(
      {
        data: { id: userId },
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' },
    );
  }

  decodeJWT(token: string, type: 'access' | 'refresh'): JWTPayloadInterface {
    const payload: JWTPayloadInterface = {
      info: null,
      expired: false,
      invalid: false,
    };

    if (!token) {
      payload.expired = true;
      return payload;
    }

    // decode jwt:
    try {
      payload.info = verify(
        token,
        type == 'access'
          ? process.env.JWT_SECRET
          : process.env.JWT_REFRESH_SECRET,
      ) as JWTInterface;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        payload.expired = true;
      } else {
        payload.invalid = true;
      }
      Logger.error(error.message);
    }
    return payload;
  }
}
