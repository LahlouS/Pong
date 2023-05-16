import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddFriendData, FriendRequestData } from "../Chat.types";

@Injectable()
export class FriendsService {

	constructor(private readonly prisma: PrismaService) { }

	async acceptFriendRequest(friendRequestId: number) {
		await this.prisma.friend.update({
			where: {
				id: friendRequestId
			},
			data: {
				status: 'accepted'
			},
		}).catch((e) => {
			throw new BadRequestException(e);
		})
		return await this, this.prisma.friend.findUnique({
			where: {
				id: friendRequestId
			},
			select: {
				id: true,
				user1: {
					select: {
						id: true,
						login: true,
						avatar: true
					}
				},
				user2: {
					select: {
						id: true,
						login: true,
						avatar: true
					}
				},
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})
	}

	async declineFriendRequest(friendRequestId: number) {
		await this.prisma.friend.delete({
			where: {
				id: friendRequestId
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})
	}

	async getFriends(userId: number) {
		const friendTab = await this.prisma.friend.findMany({
			where: {
				OR: [
					{
						user1Id: userId,
						status: 'accepted'

					},
					{
						user2Id: userId,
						status: 'accepted'
					}
				]
			},
			include: {
				user1: {
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
				},
				user2: {
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
				},
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		const relationFriendTab = friendTab.map((elem) => {
			if (userId === elem.user1Id) {
				return {
					id: elem.user2Id,
					login: elem.user2.login,
					avatar: elem.user2.avatar
				}
			}
			else {
				return {
					id: elem.user1Id,
					login: elem.user1.login,
					avatar: elem.user1.avatar
				}
			}
		})

		return relationFriendTab
	}

	async getMatchingFriends(userId: number, loginPrefix: string) {
		const friendTab = await this.prisma.friend.findMany({
			where: {
				OR: [
					{
						user1Id: userId,
						status: 'accepted',
						user2: {
							login: { startsWith: loginPrefix }
						}
					},
					{
						user2Id: userId,
						status: 'accepted',
						user1: {
							login: { startsWith: loginPrefix }
						}
					}
				]
			},
			include: {
				user1: {
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
				},
				user2: {
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
				},
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		});

		const relationFriendTab = friendTab.map((elem) => {
			if (userId === elem.user1Id) {
				return {
					id: elem.user2Id,
					login: elem.user2.login,
					avatar: elem.user2.avatar
				};
			} else {
				return {
					id: elem.user1Id,
					login: elem.user1.login,
					avatar: elem.user1.avatar
				};
			}
		});

		return relationFriendTab;
	}

	async getFriendRequests(userId: number) {

		const friendRequestsTab = await this.prisma.friend.findMany({
			where: {
				//user2Id: userId,
				//status: 'pending'
				OR: [
					{
						user1Id: userId,
						status: 'pending'
					},
					{
						user2Id: userId,
						status: 'pending'
					}
				]
			},
			include: {
				user1: true,
				user2: true
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})


		const relationFriendRequestsTab = friendRequestsTab.map((elem) => {
			return {
				id: elem.id,
				user1Login: elem.user1.login,
				user1Id: elem.user1Id,
				user2Login: elem.user2.login,
				user2Id: elem.user2Id,
				status: elem.status,
				createdAt: elem.createdAt,
			}
		})

		return relationFriendRequestsTab
	}

	async createFriendRequest(friendRequestData: FriendRequestData) {

		const isExisting = await this.isExisting({ user1_id: friendRequestData.user2_id, user2_id: friendRequestData.user1_id })
		if (isExisting)
			return isExisting

		const newFriendRequest = await this.prisma.friend.create({
			data: {
				user1Id: friendRequestData.user1_id,
				user2Id: friendRequestData.user2_id
			},
			include: {
				user1: true,
				user2: true
			}

		}).catch((e) => {
			throw new BadRequestException(e);
		})

		return {
			id: newFriendRequest.id,
			user1Login: newFriendRequest.user1.login,
			user1Id: newFriendRequest.user1Id,
			user2Login: newFriendRequest.user2.login,
			user2Id: newFriendRequest.user2Id,
			status: newFriendRequest.status,
			createdAt: newFriendRequest.createdAt,
		}
	}

	async isExisting(friendRequestData: FriendRequestData) {
		const friendRequest = await this.prisma.friend.findMany({
			where:
			{
				user1Id: friendRequestData.user1_id,
				user2Id: friendRequestData.user2_id
			}
		})

		if (friendRequest.length !== 0)
			return true
		return false
	}

	async removeFromFriend(userId: number, friendId: number) {
		return await this.prisma.friend.deleteMany({
			where: {
				OR: [

					{
						user1Id: userId,
						user2Id: friendId
					},
					{
						user1Id: friendId,
						user2Id: userId
					}
				],

			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

	}

	async getFriendsStatus(userId: number) {
		const friends = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				user1Friends: {
					select: {
						user2: {
							select: {
								id: true,
								status: true
							}
						}
					}
				},

				user2Friends: {
					select: {
						user1: {
							select: {
								id: true,
								status: true
							}
						}
					}
				},
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		if (friends) {

			const tmp1 = friends.user1Friends.map(friend => friend.user2)
			const tmp2 = friends.user2Friends.map(friend => friend.user1)
			return tmp1.concat(tmp2)
		}
		return []
	}

	async getFriendsIds(userId: number) {
		const friends = await this.prisma.user.findUnique({
			where: {
				id: userId,
			},
			select: {
				user1Friends: {
					select: {
						user2: {
							select: {
								id: true,
							}
						}
					}
				},

				user2Friends: {
					select: {
						user1: {
							select: {
								id: true,
							}
						}
					}
				},
			}
		}).catch((e) => {
			throw new BadRequestException(e);
		})

		if (friends) {

			const tmp1 = friends.user1Friends.map(friend => friend.user2.id.toString() + 'chat')
			const tmp2 = friends.user2Friends.map(friend => friend.user1.id.toString() + 'chat')
			return tmp1.concat(tmp2)
		}
		return []

	}
}