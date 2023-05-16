import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BlockService {
	constructor(private readonly prisma: PrismaService) {}

	async getBlockedUsers(userId: number) {
		return await this.prisma.blocked.findMany({
			where: {
				userId: userId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async createBlockRelation(blockData: {userId: number, blockedUserId: number}) {
		return await this.prisma.blocked.create({
			data: blockData
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}
}