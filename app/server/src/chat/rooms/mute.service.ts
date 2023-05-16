import { PrismaService } from "src/prisma/prisma.service";
import { BadRequestException } from "@nestjs/common";
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

@Injectable()
export class MuteService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteExpiredMutes() {
	const lifetime = 60  * 2  * 1000 //2 minutes en ms

	const now = Date.now()

	const cutoff = now - lifetime

	/*const numDelete =*/return await this.prisma.mute.deleteMany({
		where: {
			createdAt: { lte: new Date(cutoff) }
		}
	}).catch((e) => {
		throw new BadRequestException(e);
	})
  }
}