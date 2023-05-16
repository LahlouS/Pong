import { Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { PrismaService } from "src/prisma/prisma.service";
import { FriendsService } from "./friends.service";

@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
	constructor(private readonly friendService: FriendsService) {}

	@Get()
	async handleGetFriends(@Request() req: any) {
		return await this.friendService.getFriends(req.user.sub)
	}

	@Get('requests')
	async getFriendsRequests(
		@Request() req: any
	) {
		return await this.friendService.getFriendRequests(req.user.sub)
	}

	@Post(':id')
	async sendFriendRequest(
		@Request() req: any,
		@Param('id') friendLogin: number
	) {
		return await this.friendService.createFriendRequest({user1_id: req.user.sub, user2_id: friendLogin})
	}

	@Get('search/:prefix')
	async getMatchingFriends(
		@Request() req: any,
		@Param('prefix') prefix: string
	) {
		return await this.friendService.getMatchingFriends(req.user.sub, prefix)
	}

	@Get('status')
	async getFriendsStatus(
		@Request() req: any
	) {
		return await this.friendService.getFriendsStatus(req.user.sub) 
	}


}