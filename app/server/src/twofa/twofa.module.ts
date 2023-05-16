import { TwoFAService } from './twofa.service';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TwofaController } from './twofa.controller';
import { GameService } from 'src/game/game.service';
import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module'
import { JwtStrategy } from 'src/auth/jwt.strategy'
import { TwoFATokenStrategy } from 'src/auth/2fa-jwt.strategy'
import { FriendsService } from 'src/chat/friends/friends.service';

@Module({
	imports: [PrismaModule, forwardRef(() => AuthModule)],
	controllers: [TwofaController],
	providers: [
		TwoFAService,
		UsersService,
		PrismaService,
		GameService,
		TwoFATokenStrategy,
		JwtStrategy,
		FriendsService
	]
})
export class TwofaModule {}
