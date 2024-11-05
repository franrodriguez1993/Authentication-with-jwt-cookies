import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TokenHistory, TokenHistoryDocument } from './token-history.schema';
import { Model } from 'mongoose';

@Injectable()
export class TokenHistoryService {
  constructor(
    @InjectModel(TokenHistory.name)
    private tokensModel: Model<TokenHistoryDocument>,
  ) {}

  async saveHistory(userId: string, refreshToken: string) {
    const history = await this.getTokenHistory(userId);
    if (!history) {
      return await this.tokensModel.create({ userId, refreshToken });
    } else {
      return await this.updateTokenHistory(userId, refreshToken);
    }
  }

  async getTokenHistory(userId: string) {
    return await this.tokensModel.findOne({ userId });
  }

  async updateTokenHistory(userId: string, refreshToken: string) {
    return await this.tokensModel.updateOne({ userId }, { refreshToken });
  }
}
