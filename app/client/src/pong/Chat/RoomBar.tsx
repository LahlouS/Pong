import React, { useContext, useState } from 'react'
import { ChatContext } from './Chat'
import { JoinRoomData, Room } from './Chat.types'
import { MatchingRoomListItem, MatchingRoomListWrapper, RoomBarButton, RoomListItem, RoomListItemAvatar, RoomListItemText, RoomListWrapper } from './RoomBarUtils'
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Snackbar } from '@mui/material'
import { FetchApi } from '../component/FetchApi';
import useAuth, { useFetchAuth } from '../context/useAuth';
import { CreateRoom } from './Create';
import { socket } from './Socket';

export function RoomBar() {

	const { rooms,
		setTarget,
		setCurrent
	} = useContext(ChatContext)
	const [activeRoomId, setActiveRoomId] = useState<number>(0)
	const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState<boolean>(false)
	const [searchRoomDialogOpen, setSearchRoomDialogOpen] = useState<boolean>(false)
	const [matchingRooms, setMatchingRooms] = useState<Room[]>([])
	const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
	const [alertMessage, setAlertMessage] = useState<string>('')
	const useContextAuth = useFetchAuth()
	const { id } = useAuth()

	const handleRoomClick = (room: Room) => {
		setTarget({ login: '', id: 0, avatar: '' })
		setCurrent({ name: room.name, id: room.room_id, ownerId: room.ownerId, isPublic: room.isPublic})
		setActiveRoomId(room.room_id)
	}

	const handleSearchRoomClick = () => {
		setSearchRoomDialogOpen(true)
	}

	const handleCreateRoomClick = () => {
		setCreateRoomDialogOpen(true)
	}

	let delayDebounce: NodeJS.Timeout

	const handleSearchRoomOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {


		clearTimeout(delayDebounce)

		delayDebounce = setTimeout(async () => {
			const searchTerm = event.target.value
			if (searchTerm === '')
				return setMatchingRooms([])

			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/rooms/search/${searchTerm}`,
					option: {}
				},
				auth: useContextAuth
			})

			setMatchingRooms(response?.data.map((value: Room) => (
				value
			)))

		}, 800)
		return () => clearTimeout(delayDebounce)
	}

	const handleJoinRoom = (room: Room, password: string) => {

		const payload: JoinRoomData = {
			user_id: id,
			room_id: room.room_id,
			room_name: room.name
		}

		if (room.isPublic === false) {
			payload.password = password
		}

		socket.emit('joinRoom', payload, (data: any) => {
			if (data.error !== undefined) {
				setIsAlertOpen(true)
				setAlertMessage(data.error)
			}
		})
	}

	const handleCloseSearchRoomDialog = () => {
		setMatchingRooms([])
		setSearchRoomDialogOpen(false)
	}

	return (
		<RoomListWrapper>
			{rooms.map(
				room => <RoomListItem key={room.room_id} room={room} activeRoomId={activeRoomId} onClick={handleRoomClick} />

			)}
			<Divider />
			<RoomBarButton onClick={handleSearchRoomClick}>
				<RoomListItemAvatar>
					<SearchIcon />
				</RoomListItemAvatar>
				<RoomListItemText>
					Search room
				</RoomListItemText>

			</RoomBarButton>
			<RoomBarButton onClick={handleCreateRoomClick}>
				<RoomListItemAvatar>
					<AddIcon />
				</RoomListItemAvatar>
				<RoomListItemText>
					Create room
				</RoomListItemText>
			</RoomBarButton>
			<Dialog open={searchRoomDialogOpen} onClose={handleCloseSearchRoomDialog}
				PaperProps={{
					style: {
						borderRadius: '32px',
					}
				}}
			>
				<DialogTitle>Search Room</DialogTitle>
				<DialogContent>
					<TextField sx={{ marginTop: '1rem' }} label="Room name" fullWidth onChange={handleSearchRoomOnChange} />
				</DialogContent>
				<MatchingRoomListWrapper>
					{matchingRooms.map(
						room => <MatchingRoomListItem key={room.room_id} room={room} onClick={handleJoinRoom} rooms={rooms} />

					)}
				</MatchingRoomListWrapper>
				<DialogActions>
					<Button onClick={handleCloseSearchRoomDialog} sx={{borderRadius: '20px'}}>Cancel</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={createRoomDialogOpen} onClose={() => setCreateRoomDialogOpen(false)}
				PaperProps={{
					style: {
						borderRadius: '32px',
					}
				}}
			>
				<DialogTitle>Create Room</DialogTitle>
				<DialogContent>
					<CreateRoom setBoolean={setCreateRoomDialogOpen} />
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setCreateRoomDialogOpen(false)} sx={{borderRadius: '20px'}}>Cancel</Button>
				</DialogActions>
			</Dialog>
			<Snackbar
				open={isAlertOpen}
				autoHideDuration={4000}
				onClose={() => { setIsAlertOpen(false), setAlertMessage('') }}
				message={alertMessage}
			/>
		</RoomListWrapper>
	)
}