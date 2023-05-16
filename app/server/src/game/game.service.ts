import { BadGatewayException, BadRequestException, Injectable, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameDataType, GameParams, UpdateGameDataType, Player, matchHistoryPayload, InviteGameData } from './game.types'

@Injectable()
export class GameService {
	constructor( private prisma: PrismaService,) {}

/* ============================ POST game related information ========================*/

	async endGameDBwrites(gameID: string, player1: Player, player2: Player, data: UpdateGameDataType) {
		this.registerNewPlayer(parseInt(gameID), player1.id, data.p1score);
		this.registerNewPlayer(parseInt(gameID), player2.id, data.p2score);
	}

	async registerNewGame(status: string) {
		return this.prisma.games.create({
			data: {
				status: status
			}
		}).catch((e) => {throw e})
	}

	async deleteGame(game_id: string) {
		return this.prisma.games.delete({
			where: {
				game_id: parseInt(game_id)
			}
		})
	}

	async registerNewPlayer(game_id: number, user_id: number, score: number) {
		const newUserGame = {
			game_id: game_id,
			user_id: user_id,
			score: score,
		};
		const newPlayer = await this.prisma.user_Game.create({
			data: newUserGame
		}).catch((e) => {throw new BadRequestException(e)})
		if (await this.checkPlayerInGame(game_id) === 2)
		{
			await this.prisma.games.update({
				where: {
					game_id: game_id
				},
				data : {
					status: 'OK'
				}}).catch((e) => {
					throw new BadRequestException(e)
				})
		}
		return newPlayer;
	}

	async checkPlayerInGame(game_id: number) {
		return await this.prisma.user_Game.count({
			where: {
				game_id: {
				  equals: game_id,
				},
			  },
		}).catch((e) => {throw e})
	}

	async gamesbyStatus(statusTofind: string) {
		return (this.prisma.games.findMany({
			where: {
				status: statusTofind
			}
		}))
	}
//	================ GET SOME STATS ABOUT GAME AND USERGAME ===========

	async gameHistory(userId: number){
		const games = await this.prisma.user_Game.findMany({
			where: {
			  user_id: userId,
			},
			include: {
			  game: {
				include: {
					players: {
						include: {
							player: true,
						},
					}
				},
			  },
			},
			orderBy: {
			  game: {
				createdAt: 'desc',
			  },
			},
		  });

		return games;
	}

	parseGameHistory(raw: any): { history: matchHistoryPayload[] } {
		let parsedData: matchHistoryPayload[] = [];
		raw.forEach((userGame: any, index: number) => {
			let temp: matchHistoryPayload = {
				index:0,
				l1: '',
				a1: '',
				s1:0,
				l2:'',
				s2:0,
				a2: '',
			}
			temp.index = userGame.game_id;
			if (userGame.user_id == userGame.game.players[0].player.id) {
				temp.l1 = userGame.game.players[0].player.login;
				temp.a1 = userGame.game.players[0].player.avatar;
				temp.s1 = userGame.game.players[0].score;
				temp.l2 = userGame.game.players[1].player.login;
				temp.a2 = userGame.game.players[1].player.avatar;
				temp.s2 = userGame.game.players[1].score;
			} else {
				temp.l1 = userGame.game.players[1].player.login;
				temp.a1 = userGame.game.players[1].player.avatar;
				temp.s1 = userGame.game.players[1].score,
				temp.l2 = userGame.game.players[0].player.login,
				temp.s2 = userGame.game.players[0].score
				temp.a2 = userGame.game.players[0].player.avatar;
			}
			parsedData.push(temp);

		})
		return {
			history: parsedData
		}
	}

	async getVictoryLossCountForUser(userId: number, InfSup: boolean) {
		const games = await this.prisma.user_Game.findMany({
		  where: {
			user_id: userId,
		  },
		  include: {
			game: {
			  include: {
				players: true,
			  },
			},
		  },
		});

		let victories = 0;
		games.forEach((game) => {
		  const otherPlayers = game.game.players.filter(
			(player) => player.user_id !== userId
		  );
		  const otherPlayerScore = otherPlayers[0]?.score || 0;
		  if (InfSup && game.score > otherPlayerScore)
			victories++;
		  else if (!InfSup && game.score < otherPlayerScore)
			victories++;
		});

		return victories;
	}

	async getNbGames(user_id: number) {
		const nbGames = await this.prisma.user_Game.count({
			where: {
				user_id: {
					equals: user_id
				}
			}
		}).catch((e) => {throw e})
		return nbGames;
	}

	async getAvatarPath(user_id: number): Promise<{avatar: string}> {
		const user = await this.prisma.user.findUnique({
			where: {
				id: user_id
			},
			select: {
				avatar: true
			}
		})
		if (user != null && user.avatar != null)
			return {
				avatar: user.avatar,
			};
		return {
			avatar:'',
		};
	}

	//	================ UPDATE GAME STATUS ===========
	async updateGamestatus(game_id: number, status: string) {
		return this.prisma.games.update({
			where: {
				game_id: game_id
			},
			data : {
				status: status
			}
		}).catch((e) => {
			throw new BadRequestException(e)
		})
	}

	configMatch(config1: GameParams, config2: GameParams): boolean {
		if (config1.ballSpeed !== config2.ballSpeed)
			return false;
		if (config1.duration !== config2.duration)
			return false;
		if (config1.paddleSize !== config2.paddleSize)
			return false;
		return (true);
	}
	/* ---------------- GameInvites DB handling ---------------------- */
	async registerNewGameInvite(inviteGameData: InviteGameData) {
		return this.prisma.gamesInvites.create({
			data: inviteGameData
		}).catch((e: any) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		})
	}

	async getGamesInvites(user_id: number){

		const inviteList: InviteGameData[] = await this.prisma.gamesInvites.findMany({
			where: {
				OR: [
					{ sender_id: user_id },
					{ receiver_id: user_id },
				],
			},
		});
		return inviteList
	}

	async eraseGameInvites(inviteID: number) {
		return (
			await this.prisma.gamesInvites.delete({
			where: {
				id: inviteID
			}
		}).catch((e: any) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		})
		);
	}
	async checkInvitesIsAvailable(inviteId: number) {
		return (
			this.prisma.gamesInvites.count({
				where: { id: inviteId }
			})
		)
	}
	/* -------------------------------------------------------- */

	convertBallSpeed(ballSpeedString: string): '7' | '10' | '12' {
		switch (ballSpeedString) {
		  case '7':
		  case '10':
		  case '12':
			return ballSpeedString;
		  default:
			return '7';
		}
	}

	convertPaddleSize(size: string): '100' | '70' | '50' {
		switch (size) {
		  case '100':
			return '100';
		  case '70':
			return '70';
		  case '50':
			return '50';
		  default:
			return '100'
		}
	}

	convertDuration(duration: string): '1875' | '3750' | '7500' {
		switch (duration) {
		  case '1875':
			return '1875';
		  case '3750':
			return '3750';
		  case '7500':
			return '7500';
		  default:
			return '3750'
		}
	}
}

//	================ ^^^^^^^^^^^^^^^^^^ ===========

