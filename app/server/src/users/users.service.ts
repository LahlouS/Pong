import { BadGatewayException, BadRequestException, Injectable, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User, User_Game, Games, Room } from '@prisma/client';
import { GameService } from 'src/game/game.service';
import { CreateUserParams, UpdateUserParams, UpdateUserPass, profile } from './User.types'
import { FileInterceptor } from '@nestjs/platform-express'
import { ok } from 'assert';
import * as bcrypt from 'bcrypt';
import { AddFriendData } from 'src/chat/Chat.types';
import e from 'express';
import { FriendsService } from 'src/chat/friends/friends.service';

@Injectable()
export class UsersService {

	constructor(private prisma: PrismaService,
		private readonly gameService: GameService,
		private readonly friendService: FriendsService) { }

	async findUsers(): Promise<User[]> {
		return this.prisma.user.findMany()
	}

	async searchManyUsers(login: string) {
		return await this.prisma.user.findMany({
			where: {
				login: {
					startsWith: login
				},
			},
			select: {
				id: true,
				login: true,
				avatar: true,
				password: false,
				isTwoFA: false,
				twoFA: false,
				refreshToken: false,
				intraLogin: false,
				updatedAt: false,
				createdAt: false,
			}
		}).catch((e) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		})

	}

	async findIfExistUser(login: string): Promise<number> {
		return await this.prisma.user.count({
			where: { login: login }
		})
	}

	async findOneUser(login: string): Promise<User | null> {
		return await this.prisma.user.findUnique({
			where: { login: login }
		}).catch((e) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		})
	}

	async findUserById(id: number): Promise<User | null> {
		return await this.prisma.user.findUnique({
			where: {
				id: id
			},
			include: {
				ownedRooms: true,
				member: true
			}
		}).catch((e) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		});
	}

	async findOneIntraUser(intraLogin: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: { intraLogin: intraLogin }
		}).catch((e) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		});
	}

	async updateUser(login: string, updateUserDetails: UpdateUserParams): Promise<User> {
		return await this.prisma.user.update(
			{
				where: { login: login },
				data: { ...updateUserDetails }
			}
		).catch((e) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		});
	}

	async updateRefreshToken(login: string, refreshToken: string) {
		return await this.prisma.user.update({
			where: { login: login },
			data: { refreshToken: refreshToken }
		}).catch((e) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		});
	}


	async updateAvatar(login: string, avatar: string) {
		return await this.prisma.user.update({
			where: { login: login },
			data: { avatar: avatar }
		}).catch((e) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		});
	}

	async deleteUser(login: string): Promise<User> {
		return this.prisma.user.delete({
			where: { login: login }
		}).catch((e) => {
			throw new BadRequestException(); // maybe we will have to specifie the error later
		})
	}

	async createUser(userDetails: CreateUserParams): Promise<User> {

		const newUser = {
			...userDetails,
			createdAt: new Date(),
			password: await bcrypt.hash(userDetails.password, 12),
		};
		return this.prisma.user.create({
			data: { ...newUser }
		}).catch((e) => {
			if (e instanceof Prisma.PrismaClientKnownRequestError) {
				if (e.code === 'P2002') {
					throw new BadRequestException('login unavailable');
				}
			}
			throw new BadRequestException('');
		});
	}

	/* =========================== 2FA ====================================*/

	async setTwoFASecret(secret: string, login: string) {
		return await this.updateUser(login, {
			twoFA: secret
		}
		);
	}

	async turnOnTwoFA(login: string) {
		return await this.updateUser(login, {
			isTwoFA: true,
		});
	}

	async turnOffTwoFA(login: string) {
		return await this.updateUser(login, {
			isTwoFA: false,
			twoFA: ''
		});
	}

	/* ============^^^^^^^^^^^^^^^^^^^^^^^^^^^^^========================*/

	/* ============================ Profile ========================*/

	async updatePass(login: string, updateUserPass: UpdateUserPass) {
		return await this.updateUser(
			login,
			{ password: await bcrypt.hash(updateUserPass.password, 12) }
		)
	}

	async getProfileAuth(user_id: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: user_id
			},
			select: {
				login: true
			}
		})
		return {
			login: user?.login,
			id: user_id
		};
	}

	async getProfileInfo(user_id: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: user_id
			},
			select: {
				login: true,
				avatar: true
			}
		})
		return {
			login: user?.login,
			avatar: user?.avatar,
			nbGames: (await this.gameService.getNbGames(user_id)),
			nbWin: (await this.gameService.getVictoryLossCountForUser(user_id, true)),
			nbLoss: (await this.gameService.getVictoryLossCountForUser(user_id, false)),
		};
	}

	//============================ ROOMS =======================

	async findAllUserRooms(id: number) /* : Promise<Room> */ {
		const userRooms = await this.prisma.user_Room.findMany({
			where: {
				member_id: id
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		const userRoomsId = userRooms.map((value) => (value.room_id))

		const rooms = await this.prisma.room.findMany({
			where: {
				room_id: { in: userRoomsId }
			},
			select: {
				room_id: true,
				name: true,
				messages: {

					select: {
						id: true,
						createdAt: true,
						sender_id: true,
						sender: {
							select: {
								login: true,
							},
						},
						room_id: true,
						content: true,
					},
				},
				ownerId: true,
				isPublic: true

			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})


		return rooms
	}

	async joinRoom(userId: number, roomId: number) {

		const room_id = +roomId

		return this.prisma.user_Room.create({
			data: {
				member_id: userId,
				room_id: room_id
			},
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async blockUser(senderId: number, userId: number) {

		await this.friendService.removeFromFriend(senderId, userId)

		return await this.prisma.blocked.create({
			data: {
				userId: senderId,
				blockedUserId: userId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async unblockUser(senderId: number, userId: number) {
		return await this.prisma.blocked.delete({
			where: {
				userId_blockedUserId: {
					userId: senderId,
					blockedUserId: userId
				}
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async getBlockedUsers(userId: number) {
		return (await this.prisma.blocked.findMany({
			where: {
				userId: userId
			},
			select: {
				blockedUserId: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})).map(blockedUser => blockedUser.blockedUserId)

	}

	async isBlocked(subjectId: number, userId: number) {
		const relation = await this.prisma.blocked.findUnique({
			where: {
				userId_blockedUserId: {
					userId: userId,
					blockedUserId: subjectId
				}
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		if (relation)
			return true
		return false
	}

	async removeFriend(senderId: number, userId: number) {
		return this.prisma.friend.deleteMany({
			where: {
				OR: [
					{
						user1Id: senderId,
						user2Id: userId,
					},
					{
						user1Id: userId,
						user2Id: senderId,
					},
				]
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async connect(userId: number) {

		return await this.prisma.user.update({
			where: {
				id: userId
			},
			data: {
				status: 'online'
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async disconnect(userId: number) {


		return await this.prisma.user.update({
			where: {
				id: userId
			},
			data: {
				status: 'offline'
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async inGame(userId: number) {

		return await this.prisma.user.update({
			where: {
				id: userId
			},
			data: {
				status: 'inGame'
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})
	}

	async getStatus(userId: number) {

		const user = await this.prisma.user.findUnique({
			 where: {
				id: userId
			 },
			 select: {
				status: true
			 }
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		//return user?.status
		return user
	}

	//async getFriendsStatus(userId: number) {
	//	const friendsStatus = await this.prisma.friend
	//}

	async getAvatarName(userId: number) {
		const user = await this.prisma.user.findUnique({
			where: {
				id: userId
			},
			select: {
				avatar: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return user

	}
}

/* ============================ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ========================*/

