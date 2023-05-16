import { Injectable } from '@nestjs/common'
import { FriendsService } from 'src/chat/friends/friends.service';
import { UsersService } from 'src/users/users.service';
import { Server } from 'socket.io'

@Injectable()
export class StatusService {
	constructor(
		private readonly userService: UsersService,
		private readonly friendService: FriendsService
	) { }

	async connectUser(server: Server, userId: number) {
		const friendsIds = await this.friendService.getFriendsIds(userId)

		await this.userService.connect(userId)

		if (friendsIds.length) {
			server.to(friendsIds).emit('friendOnline', userId)
		}

	}

	async disconnectUser(server: Server, userId: number) {
		const friendsIds = await this.friendService.getFriendsIds(userId)

		await this.userService.disconnect(userId)

		if (friendsIds.length)
			server.to(friendsIds).emit('friendOffline', userId)
	}

	async inGame(server: Server, userId: number) {
		const friendsIds = await this.friendService.getFriendsIds(userId)

		await this.userService.inGame(userId)

		if (friendsIds.length) {
			server.to(friendsIds).emit('friendInGame', userId)
		}
	}
}