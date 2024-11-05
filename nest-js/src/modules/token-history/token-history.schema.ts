import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TokenHistoryDocument = TokenHistory & Document;

@Schema({
  versionKey: false,
  timestamps: {
    createdAt: true,
    updatedAt: true,
  },
})
export class TokenHistory {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  refreshToken: string;
}

export const TokenHistorySchema = SchemaFactory.createForClass(TokenHistory);
