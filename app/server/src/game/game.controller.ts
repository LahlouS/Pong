import { Controller,
	Get,
	Post,
	Body,
	Request,
	Put,
	Delete,
	Patch,
	Param,
	Res,
	UseInterceptors,
	NestInterceptor,
	UploadedFile,
	Query,
	HttpException,
	StreamableFile,
	BadGatewayException,
	BadRequestException,
	Inject,
	Injectable,
	UseGuards,
	ConsoleLogger,
	Req,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { IsNumberString } from 'class-validator';
import { diskStorage } from  'multer';
import { join } from  'path';
import { createReadStream } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express'
import { CreateUserDto, UpdateUserDto,numberFormat } from 'src/users/User.dto'
import { UsersService } from 'src/users/users.service'
import { Response } from "express";
import { Request as ExpressRequest } from 'express'
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service'
import { LocalAuthGuard } from 'src/auth/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RefreshJwtAuthGuard } from 'src/auth/refresh-jwt-auth.guard'
import { Intra42AuthGuard } from 'src/auth/intra42.guard';
import { GameService } from './game.service';
import { InviteGameData } from './game.types';


@Controller('game')
export class GameController {
	constructor(private readonly gameService: GameService) {}

//	======================== Registering new Game routes ==================
	@UseGuards(JwtAuthGuard)
	@Post('newGame')
	async registerNewGame() {
		return (this.gameService.registerNewGame('--'));
	}

	@UseGuards(JwtAuthGuard)
	@Post('userInGame/:gameId')
	async registerNewPlayer(@Param('gameId') game_id: number, @Body() user: any) {
		return (this.gameService.registerNewPlayer(game_id, parseInt(user.id), parseInt(user.score)));
	}

//	======================== ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ================
//	======================== Getting Game information ==================
	@UseGuards(JwtAuthGuard)
	@Get('gamewatinglist')
	async getGameWaitingList() {
		return (
			this.gameService.gamesbyStatus('WAIT')
		);
	}

	@UseGuards(JwtAuthGuard)
	@Get('gamehistory')
	async getGameHistory(
		@Request() req: any,
	) {
		if (!req.user.sub)
			throw BadRequestException;
		const raw = await this.gameService.gameHistory(req.user.sub);
		return this.gameService.parseGameHistory(raw);
	}

	@UseGuards(JwtAuthGuard)
	@Post('newInvite')
	async registerNewGameInvite(@Body() inviteGameData: InviteGameData) {
		const test = await this.gameService.registerNewGameInvite(inviteGameData);
		return test;
	}

	@UseGuards(JwtAuthGuard)
	@Get('gamesInvites')
	async getGamesInvites(
		@Request() req: any,
	) {
		if (!req.user.sub)
			throw BadRequestException;
		const test = await this.gameService.getGamesInvites(req.user.sub);
		const cradoFunction = async (): Promise<InviteGameData[]> => {
			for (let i: number = 0;i < test.length;i++)
			{
				test[i] = {...test[i],
							sender_avatar: (await this.gameService.getAvatarPath(test[i].sender_id)).avatar,
							receiver_avatar: (await this.gameService.getAvatarPath(test[i].receiver_id)).avatar
				}
			}
			return test;
		}
		const test2 = await cradoFunction()
		return test2;
	}

	@UseGuards(JwtAuthGuard)
	@Get('gamesInvites/isavailable/:inviteid')
	async invitesIsAvailable(@Param('inviteid') inviteid: string) {
		return this.gameService.checkInvitesIsAvailable(parseInt(inviteid));
	}

//	======================== Getting raw stats about a player game ================

	@UseGuards(JwtAuthGuard)
	@Get('stats/nbGames/:id')
	async getnbGames(@Param('id') user_id: number) {
		return (this.gameService.getNbGames(user_id));
	}

	@UseGuards(JwtAuthGuard)
	@Get('stats/nbVictory/:id')
	async getnbVictory(@Param('id') user_id: number) {
		return (this.gameService.getVictoryLossCountForUser(user_id, true));
	}

	@UseGuards(JwtAuthGuard)
	@Get('stats/nbLoss/:id')
	async getnbLoss(@Param('id') user_id: number) {
		return (this.gameService.getVictoryLossCountForUser(user_id, false));
	}


// ======================= tests ==========================================

	@UseGuards(JwtAuthGuard)
	@Post('test/createFullGame')
	async createNewGameFull(@Body() players: any){
		const newGame = await this.gameService.registerNewGame("--");


		await this.gameService.registerNewPlayer(parseInt(newGame.game_id.toString()), parseInt(players.player1.id), players.player1.score);

		await this.gameService.registerNewPlayer(parseInt(newGame.game_id.toString()), parseInt(players.player2.id), players.player2.score);

	}

	// the curl commande to use it :
	// curl -X POST -H "Content-Type: application/json" -d '{"player1": {"id": "3", "score": 10}, "player2": {"id": "1", "score": 15}}' http://10.11.6.6:8080/api/game/test/createFullGame
}


