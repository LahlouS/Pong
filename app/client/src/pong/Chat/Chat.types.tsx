export type AddFriendData = {
	user1_id: number,
	user2_id: number
}

export type JoinRoomData = {
	user_id: number,
	room_id: number,
	room_name: string,
	password?: string, 
}

export type LeaveRoomData = {
	user_id: number,
	user_login: string,
	room_id: number,
	room_name: string
}

export type CreateRoomData = {
  name: string;
  password?: string,
  owner_id: number,
}

export type MessageData = {
	content: string,
	sender_id: number,
	time?: string,
	room?: {
		name: string,
		id: number
	},
	recipient_id?: number 
}

export type State = {
	room: {
		name: string,
		id: number
	},
	messages: MessageData[]
}

export type Action = {
	type: string,
	payload: {name: string, id: number} | MessageData
}

export type User = {
	id: number,
	login: string,
	avatar: string
}

export type Message = {
	id: number,
	date: string,
	sender_id: number,
	sender: {
		login: string
	},
	room_id: number,
	content: string
}

export type Room = {
	room_id : number,
	name: string,
	isPublic: boolean,
	ownerId: number,
	messages: Message[]
}

export type DirectMessage = {
	id: number,
	date: string,
	sender_id: number,
	sender: {
		login: string
	},
	recipient_id: number,
	content: string
}

export type Friend = {
	id: number,
	createdAt: string,
	user1Login: string,
	user1Id: number,
	user2Login: string,
	user2Id: number,
	status: string
}

export type FriendRequest = {
	id: number,
	createdAt: string,
	user1Login: string,
	user1Id: number,
	user2Login: string,
	user2Id: number,
	status: string
}