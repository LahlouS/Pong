import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import { RoomsService } from "../rooms/rooms.service";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class MessageService {
	constructor(private prisma: PrismaService,
		private userService: UsersService,
		private roomService: RoomsService) { }

	async createMessage(senderId: number, roomId: number, content: string) {

		return await this.prisma.message.create({
			data: {
				sender_id: senderId,
				room_id: roomId,
				content: content,
			},
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
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async getRoomMessages(roomId: number) {
		return await this.prisma.message.findMany({
			where: {
				room_id: roomId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async createDirectMessage(senderId: number, recipientId: number, content: string) {

		const newDirectMessage = await this.prisma.direct_Message.create({
			data: {
				sender_id: senderId,
				recipient_id: recipientId,
				content: content
			},
			select: {
				id: true,
				createdAt: true,
				sender_id: true,
				sender: {
					select: {
						login: true,
					},
				},
				recipient_id: true,
				content: true,
			},
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return newDirectMessage

	}

	async getUserDirectMessages(userId: number) {
		return await this.prisma.direct_Message.findMany({
			where: {
				OR: [
					{
						recipient_id: userId
					},
					{
						sender_id: userId
					},

				]
			},
			select: {
				id: true,
				createdAt: true,
				sender_id: true,
				sender: {
					select: {
						login: true,
					},
				},
				recipient_id: true,
				content: true,
			},
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}
}