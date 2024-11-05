import { Module } from '@nestjs/common';
import { UtilService } from './services/util.service';
import JWTService from './services/jwt.service';

@Module({
  imports: [],
  providers: [UtilService, JWTService],
  exports: [UtilService, JWTService],
})
export class SharedModule {}
