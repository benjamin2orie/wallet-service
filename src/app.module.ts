import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { KeysModule } from './keys/keys.module';
import configuration from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DB_STRING'),
        ssl: {
          rejectUnauthorized: false,
        },
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    AuthModule,
    UsersModule,
    WalletsModule,
    KeysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
