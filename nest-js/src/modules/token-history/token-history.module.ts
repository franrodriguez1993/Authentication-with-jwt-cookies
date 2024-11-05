import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from '../shared/shared.module';
import { TokenHistoryService } from './token-history.service';
import { TokenHistory, TokenHistorySchema } from './token-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TokenHistory.name,
        schema: TokenHistorySchema,
      },
    ]),
    SharedModule,
  ],
  controllers: [],
  providers: [TokenHistoryService],
  exports: [TokenHistoryService],
})
export class TokenHistoryModule {}
