import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { WalletsModule } from 'src/wallets/wallets.module';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from '../auth/jwt-strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    WalletsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // ✅ Use ConfigService to load JWT secret
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available everywhere
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],

  providers: [AuthService, GoogleStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { UsersModule } from 'src/users/users.module';
// import { WalletsModule } from 'src/wallets/wallets.module';
// import { PassportModule } from '@nestjs/passport';
// import { GoogleStrategy } from './google.strategy';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// @Module({

//     imports:[
//         UsersModule,
//         WalletsModule,
//         PassportModule.register({ defaultStrategy: 'jwt' }),

//       JwtModule.register({
//       secret: process.env.JWT_SECRET,
//       signOptions: { expiresIn: '7d' },
//     }),
//     ],

//     providers: [AuthService, GoogleStrategy],
//     controllers:[AuthController],
//     exports: [AuthService, JwtModule],

// })
// export class AuthModule {}
