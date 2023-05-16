import { Injectable } from "@nestjs/common";
import { Room, User } from "@prisma/client";
import { ServerStreamFileResponseOptions } from "http2";
import { Server, Socket } from "socket.io";
import { UsersService } from "src/users/users.service";
import { CreateRoomData, MessageData, LeaveRoomData, JoinRoomData, AddFriendData, FriendRequestData, BanMemberData, UpgradeMemberData, KickMemberData, MuteMemberData, BlockUserData } from "./Chat.types";
import { MessageService } from "./messages/messages.service";
import { RoomsService } from "./rooms/rooms.service";
import { FriendsService } from "./friends/friends.service";

@Injectable()
export class ChatService {
	constructor(private readonly roomService: RoomsService,
		private readonly userService: UsersService,
		private readonly messageService: MessageService,
		private readonly friendService: FriendsService) { }

	async createRoom(server: Server, client: Socket, payload: CreateRoomData) {

		const newRoom = await this.roomService.createRoom(payload);

		client.join((newRoom as Room).room_id.toString() + payload.name)

		server.to(client.id).emit('roomCreated', { name: payload.name, room_id: newRoom?.room_id, messages: [], ownerId: payload.owner_id, isPublic: newRoom?.isPublic })

		return newRoom
	}

	async manageDirectMessage(server: Server, client: Socket, payload: MessageData) {

		if (payload.recipient_id !== undefined) {
			const newDirectMessage = await this.messageService.createDirectMessage(payload.sender_id, payload.recipient_id, payload.content)
			server.to(payload.recipient_id.toString()).emit('directMessage', newDirectMessage)
			server.to(client.id).emit('directMessage', newDirectMessage)
		}
	}

	async manageRoomMessage(server: Server, client: Socket, payload: MessageData) {

		if (payload.room !== undefined) {

			if (await this.roomService.isMuted(payload.sender_id, payload.room.id)) {
				return {
					error: 'you are muted in this channel'
				}
			}
			const newMessage = await this.messageService.createMessage(payload.sender_id, payload.room.id, payload.content)
			server.to(payload.room.id.toString() + payload.room.name).emit('roomMessage', newMessage)
		}

		return payload
	}

	async leaveRoom(server: Server, client: Socket, payload: LeaveRoomData) {

		const message: MessageData = {
			content: `${payload.user_login} leaved the room`,
			sender_id: payload.user_id,
			room: {
				name: payload.room_name,
				id: payload.room_id,
			}
		}

		const newMessage = await this.messageService.createMessage(payload.user_id, payload.room_id, `${payload.user_login} leaved the room`)

		server.to(payload.room_id.toString() + payload.room_name).emit('roomMessage', newMessage)
		server.to(client.id).emit('roomLeaved', payload.room_id)

		return this.roomService.deleteRelation(payload.user_id, payload.room_id)
	}

	async join(client: Socket, userId: number) {

		const rooms = await this.userService.findAllUserRooms(userId)

		//join his direct message room
		client.join(userId.toString())

		for (let room of rooms) {
			client.join(room.room_id.toString() + room.name)
		}

	}

	async joinRoom(server: Server, client: Socket, payload: JoinRoomData) {

		if (await this.roomService.isBanned(payload.user_id, payload.room_id)) {
			return {
				error: 'You are banned from this channel'
			}
		}

		const room = await this.roomService.getRoomById(payload.room_id)

		if (payload.password) {
			if ((await this.roomService.checkRoomPassword(payload.room_id, payload.password)) === false)
				return {
					error: 'Invalid password'
				}
		}

		client.join(payload.room_id.toString() + payload.room_name)

		server.to(client.id).emit('roomJoined', room)

		return await this.userService.joinRoom(payload.user_id, payload.room_id)

	}

	async sendFriendRequest(server: Server, client: Socket, payload: FriendRequestData) {

		if (await this.userService.isBlocked(payload.user1_id, payload.user2_id)) {
			return {
				error: 'invalid permissions'
			}
		}

		const existingRequest = await this.friendService.isExisting({ user1_id: payload.user2_id, user2_id: payload.user1_id })

		if (existingRequest === true)
			return 'the receiver already send you a friend request'

		const newFriendRequest = await this.friendService.createFriendRequest(payload)

		server.to(payload.user2_id.toString()).to(client.id).emit('friendRequest', newFriendRequest)

		return newFriendRequest
	}

	async acceptFriendRequest(server: Server, client: Socket,
		friendRequestId: number) {

		const friendAcceptedRelation = await this.friendService.acceptFriendRequest(friendRequestId)
		if (friendAcceptedRelation === null)
			return

		server.to(friendAcceptedRelation.user1.id.toString()).emit('newFriend', friendAcceptedRelation.user2)
		server.to(friendAcceptedRelation.user2.id.toString()).emit('newFriend', friendAcceptedRelation.user1)

		return friendAcceptedRelation
	}

	async declineFriendRequest(server: Server, client: Socket, payload: { senderId: number, friendRequestId: number }) {
		await this.friendService.declineFriendRequest(payload.friendRequestId)
		server.to(payload.senderId.toString()).emit('declineFriend', payload.friendRequestId)
	}

	async banMember(server: Server, client: Socket, payload: BanMemberData) {
		if (!(await this.roomService.isAdmin(payload.sender_id, payload.room_id)) && !(await this.roomService.isRoomOwner(payload.sender_id, payload.room_id))) {
			return {
				error: 'Admin access required.'
			}
		}

		server.to(payload.user_id.toString()).emit('roomLeaved', payload.room_id)
		return await this.roomService.banMember(payload.room_id, payload.user_id)
	}

	async unbanUser(server: Server, client: Socket, payload: BanMemberData) {
		if (!(await this.roomService.isAdmin(payload.sender_id, payload.room_id)) && !(await this.roomService.isRoomOwner(payload.sender_id, payload.room_id))) {
			return {
				error: 'Admin role required.'
			}
		}
		return await this.roomService.unbanUser(payload.room_id, payload.user_id)
	}

	async upgradeMember(server: Server, payload: UpgradeMemberData) {
		if (!(await this.roomService.isRoomOwner(payload.sender_id, payload.room_id))) {
			return {
				error: 'Room owner role required.'
			}
		}
		return await this.roomService.upgradeUser(payload.room_id, payload.user_id)
	}

	async downgradeMember(server: Server, payload: UpgradeMemberData) {
		if (!(await this.roomService.isRoomOwner(payload.sender_id, payload.room_id))) {
			return {
				error: 'Room owner role required.'
			}
		}
		return await this.roomService.downgradeUser(payload.room_id, payload.user_id)
	}

	async kickMember(server: Server, payload: KickMemberData) {
		if (!(await this.roomService.isAdmin(payload.sender_id, payload.room_id)) && !(await this.roomService.isRoomOwner(payload.sender_id, payload.room_id))) {
			return {
				error: 'Admin role required.'
			}
		}
		server.to(payload.user_id.toString()).emit('roomLeaved', payload.room_id)

		return await this.roomService.deleteRelation(payload.user_id, payload.room_id)
	}

	async muteMember(server: Server, payload: MuteMemberData) {
		if (!(await this.roomService.isAdmin(payload.sender_id, payload.room_id)) && !(await this.roomService.isRoomOwner(payload.sender_id, payload.room_id))) {
			return {
				error: 'Admin role required.'
			}
		}
		return await this.roomService.muteUser(payload.user_id, payload.room_id)
	}

	async blockUser(server: Server, payload: BlockUserData) {
		const blockRelation = await this.userService.blockUser(payload.sender_id, payload.user_id)

		if (blockRelation) {
			server.to(payload.sender_id.toString()).emit('newBlockedUser', payload.user_id)
			server.to(payload.user_id.toString()).emit('removeFriend', payload.sender_id)
		}

		return blockRelation
	}

	async unblockUser(server: Server, payload: BlockUserData) {
		const deleteRelation = await this.userService.unblockUser(payload.sender_id, payload.user_id)

		return deleteRelation
	}

	async removeFriend(server: Server, payload: {sender_id: number, user_id: number}) {
		const deleteRelation = await this.userService.removeFriend(payload.sender_id, payload.user_id)

		if (deleteRelation) {
			server.to(payload.sender_id.toString()).emit('removeFriend', payload.user_id)
			server.to(payload.user_id.toString()).emit('removeFriend', payload.sender_id)
		}

		return deleteRelation
	}

}