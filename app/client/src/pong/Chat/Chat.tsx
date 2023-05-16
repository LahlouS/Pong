import { useContext, useState, useEffect, createContext } from 'react'
import { Box, Divider, Grid } from '@mui/material'
import { Api, FetchApi } from '../component/FetchApi'
import { useFetchAuth } from '../context/useAuth'
import { DirectMessage, Friend, FriendRequest, Message, Room, User } from './Chat.types'
import { RoomBar } from './RoomBar'
import { socket, UpdatesContext } from './Socket'
import { MessagesBox } from './MessagesBox'
import { FriendBar } from './FriendBar'
import { borderLeft } from '@mui/system'
import { styled } from '@mui/system'

type ChatContextType = {
	rooms: Room[];
	setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
	directMessages: DirectMessage[];
	setDirectMessages: React.Dispatch<React.SetStateAction<DirectMessage[]>>;
	friends: User[];
	setFriends: React.Dispatch<React.SetStateAction<User[]>>;
	friendRequests: FriendRequest[];
	setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>;
	current: {
		name: string;
		id: number;
		ownerId: number;
		isPublic: boolean;
	};
	setCurrent: React.Dispatch<React.SetStateAction<{ name: string; id: number; ownerId: number; isPublic: boolean }>>;
	target: User;
	setTarget: React.Dispatch<React.SetStateAction<User>>;
	isJoining: boolean;
	setIsJoining: React.Dispatch<React.SetStateAction<boolean>>;
	isCreating: boolean;
	setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
	isInDirect: boolean;
	setIsInDirect: React.Dispatch<React.SetStateAction<boolean>>;
	isSearching: boolean;
	setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
	blockedUserIds: number[];
	setBlockedUserIds: React.Dispatch<React.SetStateAction<number[]>>;
};

const initialChatContext: ChatContextType = {
	rooms: [],
	setRooms: () => null,
	directMessages: [],
	setDirectMessages: () => null,
	friends: [],
	setFriends: () => null,
	friendRequests: [],
	setFriendRequests: () => null,
	current: {
		name: '',
		id: 0,
		ownerId: 0,
		isPublic: true,
	},
	setCurrent: () => null,
	target: {
		login: '',
		id: 0,
		avatar: ''
	},
	setTarget: () => null,
	isJoining: false,
	setIsJoining: () => null,
	isCreating: false,
	setIsCreating: () => null,
	isInDirect: false,
	setIsInDirect: () => null,
	isSearching: false,
	setIsSearching: () => null,
	blockedUserIds: [],
	setBlockedUserIds: () => null,
};

export const ChatContext = createContext<ChatContextType>(initialChatContext);

export function Chat() {
	const {
		newDirectMessage,
		setNewDirectMessage,
		newRoomMessage,
		setNewRoomMessage,
		newRoom,
		setNewRoom,
		leavedRoom,
		setLeavedRoom,
		newFriendRequest,
		setNewFriendRequest,
		newFriend,
		setNewFriend,
		declineFriendRequestId,
		setDeclineFriendRequestId,
		newBlockedUserId,
		setNewBlockedUserId,
		removedFriendId,
		setRemovedFriendId
	} = useContext(UpdatesContext)

	const [directMessages, setDirectMessages] = useState<DirectMessage[]>([])

	const [rooms, setRooms] = useState<Room[]>([])

	const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])

	const [friends, setFriends] = useState<User[]>([])

	const [current, setCurrent] = useState<{ name: string, id: number, ownerId: number, isPublic: boolean }>({ name: '', id: 0, ownerId: 0, isPublic: true })

	const [target, setTarget] = useState<User>({ login: '', id: 0, avatar: '' })

	const [isJoining, setIsJoining] = useState<boolean>(false)

	const [isSearching, setIsSearching] = useState<boolean>(false)

	const [isCreating, setIsCreating] = useState<boolean>(false)

	const [isInDirect, setIsInDirect] = useState<boolean>(false)

	const [blockedUserIds, setBlockedUserIds] = useState<number[]>([])

	const chatContext = {
		rooms: rooms,
		setRooms: setRooms,
		directMessages: directMessages,
		setDirectMessages: setDirectMessages,
		friends: friends,
		setFriends: setFriends,
		friendRequests: friendRequests,
		setFriendRequests: setFriendRequests,
		current: current,
		setCurrent: setCurrent,
		target: target,
		setTarget: setTarget,
		isJoining: isJoining,
		setIsJoining: setIsJoining,
		isCreating: isCreating,
		setIsCreating: setIsCreating,
		isInDirect: isInDirect,
		setIsInDirect: setIsInDirect,
		isSearching: isSearching,
		setIsSearching: setIsSearching,
		blockedUserIds: blockedUserIds,
		setBlockedUserIds: setBlockedUserIds,
	}

	const auth = useFetchAuth()

	const getFriendsRequestsRequest: Api = {
		api: {
			input: `http://${import.meta.env.VITE_SITE}/api/friends/requests`,
		},
		auth: auth
	}

	useEffect(() => {
		async function getFriendRequests() {
			const response = await FetchApi(getFriendsRequestsRequest)
			return response?.data
		}
		getFriendRequests().then(data => setFriendRequests(data))
	}, [])

	const getFriendsRequest: Api = {
		api: {
			input: `http://${import.meta.env.VITE_SITE}/api/friends`,
		},
		auth: auth
	}

	useEffect(() => {
		async function getFriends() {
			const response = await FetchApi(getFriendsRequest)
			return response?.data
		}
		getFriends().then(data => setFriends(data))
	}, [])

	const findRooms: Api = {
		api: {
			input: `http://${import.meta.env.VITE_SITE}/api/users/rooms`,
			option: {
			},
		},
		auth: auth,
	}

	const getMessagesRequest: Api = {
		api: {
			input: `http://${import.meta.env.VITE_SITE}/api/messages/direct`,
			option: {
			},
		},
		auth: auth,
	}

	const getBlockedUsersRequest: Api = {
		api: {
			input: `http://${import.meta.env.VITE_SITE}/api/users/blocked`,
			option: {
			},
		},
		auth: auth,
	}

	useEffect(() => {
		async function getBlockedUsers() {
			const response = await FetchApi(getBlockedUsersRequest)
			return response?.data
		}

		getBlockedUsers().then(data => setBlockedUserIds(data))
	}, [])

	useEffect(() => {
		async function getMessages() {
			const response = await FetchApi(getMessagesRequest)
			return response?.data
		}

		getMessages().then(data => setDirectMessages(data))
	}, [])

	useEffect(() => {
		const getRooms = async () => {
			const response = await FetchApi(findRooms)

			const rooms = response?.data.map((value: Room) => ({
				room_id: value.room_id,
				name: value.name,
				isPublic: value.isPublic,
				ownerId: value.ownerId,
				messages: value.messages
			}))
			return rooms
		}

		getRooms().then(data => {
			setRooms(data)
		})

	}, [])

	useEffect(() => {
		if (newRoomMessage !== undefined) {
			if (newRoomMessage.room_id != undefined) {
				setRooms(rooms.map((room) => {
					if (room.room_id === newRoomMessage.room_id)
						room.messages = [...room.messages, newRoomMessage]
					return room
				}))
			}
			setNewRoomMessage(undefined)
		}
		if (newDirectMessage !== undefined) {
			setDirectMessages([...directMessages, newDirectMessage])
			setNewDirectMessage(undefined)
		}
		if (newRoom !== undefined) {
			setRooms([...rooms, newRoom])
			setCurrent({ name: newRoom.name, id: newRoom.room_id, ownerId: newRoom.ownerId, isPublic: newRoom.isPublic })
			setTarget({ login: '', id: 0, avatar: '' })
			setNewRoom(undefined)
		}
		if (leavedRoom !== undefined) {
			setRooms(rooms.filter((room) => {
				if (room.room_id !== leavedRoom) {
					return rooms
				}
			}))
			if (current.id === leavedRoom)
				setCurrent({ name: '', id: 0, ownerId: 0, isPublic: true })
			setLeavedRoom(undefined)
		}
		if (newFriendRequest !== undefined) {
			setFriendRequests([...friendRequests, newFriendRequest])
			setNewFriendRequest(undefined)
		}
		if (newFriend !== undefined) {
			setFriends([...friends, newFriend])
			setCurrent({ name: '', id: 0, ownerId: 0, isPublic: true })
			setTarget(newFriend)
			setNewFriend(undefined)
		}
		if (declineFriendRequestId !== undefined) {
			setFriendRequests(friendRequests.filter((friendRequest) => (friendRequest.id !== declineFriendRequestId)))
			setDeclineFriendRequestId(undefined)
		}
		if (newBlockedUserId !== undefined) {
			setFriends(friends.filter(friend => friend.id !== newBlockedUserId))
			setBlockedUserIds([...blockedUserIds, newBlockedUserId])
			setNewBlockedUserId(undefined)
		}
		if (removedFriendId !== undefined) {
			setFriends(friends.filter(friend => friend.id !== removedFriendId))
			setFriendRequests(friendRequests.filter(friendRequests => friendRequests.user1Id !== removedFriendId && friendRequests.user2Id !== removedFriendId))
			if (target.id === removedFriendId) {
				setTarget({ id: 0, login: '', avatar: '' })
			}
			setRemovedFriendId(undefined)
		}

	}, [newRoomMessage, newDirectMessage, newRoom, leavedRoom, newFriendRequest, newFriend, declineFriendRequestId, newBlockedUserId, removedFriendId, target])

	return (
		<ChatContext.Provider value={chatContext}>
			<Grid container
				sx={{ height: '100%' }}
			>
				<Grid item xs={6} md={2}
					sx={{
						p: '2px',
						height: '100%',
						'@media (max-width: 950px)': {
							height: '30%',
							p: 0
						}

					}}
				>
					<RoomBar />
				</Grid>
				<Grid item xs={6} md={2}
					sx={{
						p: '2px',
						height: '100%',
						'@media (max-width: 950px)': {
							height: '30%',
							p: 0
						}

					}}
				>
					<FriendBar />
				</Grid>

				<Grid item xs={12} md={8}
					sx={{
						p: '2px',
						height: '100%',
						'@media (max-width: 950px)': {
							height: '70%',
							p: 0
						}

					}}
				>
					<MessagesBox />
				</Grid>
			</Grid>
		</ChatContext.Provider>
	)
}