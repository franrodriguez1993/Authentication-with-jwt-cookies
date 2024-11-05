import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { ConfigModule } from '@nestjs/config';
import { MongoConfigModule } from './database/mongo.module';
import { SharedModule } from './modules/shared/shared.module';
import morganConfig from './config/morgan';
import { TokenHistoryModule } from './modules/token-history/token-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    MongoConfigModule,
    SharedModule,
    TokenHistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(morganConfig).forRoutes('*');
  }
}
