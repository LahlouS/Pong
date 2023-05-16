import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy'
import { RefreshTokenStrategy } from './refresh-jwt.strategy'
import { TwoFATokenStrategy } from './2fa-jwt.strategy'
import { AuthController } from './auth.controller'



@Module({
	imports: [
		forwardRef(() => UsersModule),
		PassportModule,
		JwtModule.register({})
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		RefreshTokenStrategy,
		TwoFATokenStrategy,

	],
	exports: [AuthService],
})
export class AuthModule {
}

