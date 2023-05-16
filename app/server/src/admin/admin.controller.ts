import { Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { BlockService } from "./block.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
	constructor(private readonly blockService: BlockService) {}

	@Post('block/:id')
	async handleBlock(
		@Request() req: any,
		@Param('id') blockedUserId: number
	) {
		return await this.blockService.createBlockRelation({userId: req.user.sub, blockedUserId: blockedUserId})
	}

	@Get('blocked')
	async getBlockedUsers(
		@Request() req: any
	) {
		return await this.blockService.getBlockedUsers(req.user.sub)
	}
}