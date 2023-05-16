import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Room, User, User_Room } from "@prisma/client"
import { CreateRoomData } from "../Chat.types";
import { UsersService } from "src/users/users.service";
import { transformDocument } from "@prisma/client/runtime";
import * as bcrypt from 'bcrypt';

@Injectable()
export class RoomsService {

	constructor(private prisma: PrismaService,
		private userService: UsersService) { }

	async createRoom(roomDetails: CreateRoomData): Promise<Room | null> {

		let newRoomData: { name: string, isPublic: boolean, ownerId: number, password?: string } = {
			name: roomDetails.name,
			isPublic: roomDetails.password?.length === 0 ? true : false,
			ownerId: roomDetails.owner_id,
		}

		if (roomDetails.password) {
			newRoomData.password = await bcrypt.hash(roomDetails.password, 12)
		}

		const newRoom = await this.prisma.room.create({
			data: { ...newRoomData }
		}).catch((e: any) => { throw e });

		/* const memberRoom =  */await this.prisma.user_Room.create({
			data: {
				member_id: roomDetails.owner_id,
				room_id: newRoom.room_id
			}
		}).catch((e) => { throw new BadRequestException(e) })

		return newRoom
	}

	async findAll() {
		return this.prisma.room.findMany({
			include: {
				members: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async getRoomById(roomId: number) {
		const id = +roomId;
		return this.prisma.room.findUnique(
			{
				where: {
					room_id: id
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
				},
			}
		).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async getRoomOwner(roomId: number) {
		const room = await this.getRoomById(roomId)

		if (room === null)
			throw new BadRequestException('Invalid content', { cause: new Error(), description: 'invalid room id' })
		if (room.ownerId === null)
			throw new BadRequestException('Invalid content', { cause: new Error(), description: 'room dont have owner' })

		const user = await this.userService.findUserById(room.ownerId as number)
			.catch((e) => {
				throw new BadRequestException(e);
			})

		return user
	}

	async findManyRooms(name: string) {
		const rooms = await this.prisma.room.findMany({
			where: {
				name: name
			},
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return rooms
	}

	async findMatchingRooms(name: string) {
		const rooms = await this.prisma.room.findMany({
			where: {
				name: {
					contains: name
				}
			},
			select: {
				room_id: true,
				name: true,
				messages: true,
				ownerId: true,
				isPublic: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return rooms
	}

	async deleteRelation(userId: number, roomId: number) {
		return this.prisma.user_Room.delete({
			where: {
				member_id_room_id: {
					member_id: userId,
					room_id: roomId
				}
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})
	}

	async checkRoomPassword(roomId: number, password: string) {
		const room = await this.prisma.room.findUnique({
			where: {
				room_id: roomId
			},
			select: {
				password: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		if (!room || (await bcrypt.compare(password, room.password as string)) === false) {
			return false
		}
		return true
	}

	async getRoomMembers(roomId: number) {
		const room = await this.prisma.room.findUnique({
			where: {
				room_id: roomId
			},
			select: {
				members: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		const membersIdTab = room?.members.map((elem) => elem.member_id)

		const members = this.prisma.user.findMany({
			where: {
				id: { in: membersIdTab }
			},
			select: {
				id: true,
				login: true,
				avatar: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return members
	}

	async getRoomBans(roomId: number) {
		const bans = await this.prisma.ban.findMany({
			where: {
				RoomId: roomId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		const bannedUsersIdTab = bans.map(elem => elem.bannedUserId)

		const bannedUsersTab = this.prisma.user.findMany({
			where: {
				id: { in: bannedUsersIdTab }
			},
			select: {
				id: true,
				login: true,
				avatar: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return bannedUsersTab
	}

	async banMember(roomId: number, userId: number) {

		await this.deleteRelation(userId, roomId)

		return await this.prisma.ban.create({
			data: {
				RoomId: roomId,
				bannedUserId: userId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})
	}

	async isBanned(userId: number, roomId: number) {
		const banRelation = await this.prisma.ban.findUnique({
			where: {
				bannedUserId_RoomId: {
					RoomId: roomId,
					bannedUserId: userId
				}
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return !!banRelation
	}

	async unbanUser(roomId: number, userId: number) {

		return await this.prisma.ban.delete({
			where: {
				bannedUserId_RoomId: {
					RoomId: roomId,
					bannedUserId: userId
				}
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async upgradeUser(roomId: number, userId: number) {
		return await this.prisma.admin.create({
			data: {
				RoomId: roomId,
				AdminUserId: userId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async downgradeUser(roomId: number, userId: number) {
		return await this.prisma.admin.delete({
			where: {
				AdminUserId_RoomId: {
					RoomId: roomId,
					AdminUserId: userId
				}
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})
	}

	async isRoomOwner(userId: number, roomId: number) {
		const room = await this.prisma.room.findUnique({
			where: {
				room_id: roomId
			},
			select: {
				ownerId: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		if (room && room.ownerId === userId)
			return true
		return false

	}

	async isAdmin(userId: number, roomId: number) {
		const adminRelation = await this.prisma.admin.findUnique({
			where: {
				AdminUserId_RoomId: {
					AdminUserId: userId,
					RoomId: roomId
				}
			},
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		if (adminRelation)
			return true
		return false
	}

	async getRoomAdmins(roomId: number) {
		const adminRelation = await this.prisma.admin.findMany({
			where: {
				RoomId: roomId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		const adminsIdTab = adminRelation.map(elem => elem.AdminUserId)

		const adminsTab = this.prisma.user.findMany({
			where: {
				id: { in: adminsIdTab }
			},
			select: {
				id: true,
				login: true,
				avatar: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return adminsTab
	}

	async muteUser(userId: number, roomId: number) {
		return await this.prisma.mute.create({
			data: {
				RoomId: roomId,
				MutedUserId: userId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})
	}

	async getRoomMuteds(roomId: number) {
		const lifetime = 60 * 2 * 1000 //2 minutes en ms

		const now = Date.now()

		const cutoff = now - lifetime

		return (await this.prisma.mute.findMany({
			where: {
				RoomId: roomId
			},
			select: {
				createdAt: true,
				MutedUser: {
					select: {
						id: true,
						login: true,
						avatar: true
					}
				}
			}
		})
			.catch((e) => {
				throw new BadRequestException(e);
			})).filter(mutedUser => mutedUser.createdAt > new Date(cutoff))
			.map(mutedUser => ({ id: mutedUser.MutedUser.id, login: mutedUser.MutedUser.login, avatar: mutedUser.MutedUser.avatar }))

	}

	async isMuted(userId: number, roomId: number) {
		const lifetime = 60 * 2 * 1000 //2 minutes en ms

		const now = Date.now()

		const cutoff = now - lifetime

		const relation = await this.prisma.mute.findUnique({
			where: {
				MutedUserId_RoomId: {
					MutedUserId: userId,
					RoomId: roomId
				},
			},
			select: {
				createdAt: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		if (relation && relation.createdAt > new Date(cutoff))
			return true
		return false
	}

	async addPassword(roomId: number, password: string) {
		return await this.prisma.room.update({
			where: {
				room_id: roomId
			},
			data: {
				isPublic: false,
				password: await bcrypt.hash(password, 12)
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async goPublic(roomId: number) {
		return await this.prisma.room.update({
			where: {
				room_id: roomId
			},
			data: {
				isPublic: true,
				password: null
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async changeRoomPassword(roomId: number, currentPassword: string, newPassword: string) {

		if (await this.checkRoomPassword(roomId, currentPassword) == false) {
			return { error: 'invalid password' }
		}
		return await this.prisma.room.update({
			where: {
				room_id: roomId
			},
			data: {
				password: await bcrypt.hash(newPassword, 12)
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})
	}

}