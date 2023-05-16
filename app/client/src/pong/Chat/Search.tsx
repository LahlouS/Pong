import { Box, TextField, InputAdornment, List, ListItem, Button, FormControl } from '@mui/material'
import Search from '@mui/icons-material/Search'
import React, { useCallback, useState, useEffect, useContext, ReactText } from 'react'
import { ChatContext } from './Chat'
import useAuth, { useFetchAuth } from '../context/useAuth'
import { Api, FetchApi } from '../component/FetchApi'
import { JoinRoomData, Room } from './Chat.types'
import { socket } from './Socket'

export function SearchRoom() {

	const {
		rooms,
		isJoining, setIsJoining
	} = useContext(ChatContext)

	const { user, id } = useAuth()

	const [searchTerm, setSearchTerm] = useState('')

	const [matchingRooms, setMatchingRooms] = useState<any[]>([])

	const useContextAuth = useFetchAuth()

	useEffect(() => {

		const delayDebounce = setTimeout(async () => {
			if (searchTerm === '')
				return setMatchingRooms([])

			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/rooms/${searchTerm}`,
					option: {}
				},
				auth: useContextAuth
			})

			setMatchingRooms(response?.data.map((value: Room) => ({
				room_id: value.room_id,
				name: value.name
			})))

		}, 800)
		return () => clearTimeout(delayDebounce)
	}, [searchTerm])

	const handleJoin = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {

		const value = JSON.parse((e.target as HTMLButtonElement).value)

		const payload: JoinRoomData = {
			user_id: id,
			room_id: value.id,
			room_name: value.name
		}

		socket.emit('joinRoom', payload)

		setIsJoining(false)
	}, [socket])

	const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
		setSearchTerm(event.target.value)
	}

	const [roomList, setRoomList] = useState<(React.ReactNode)[]>([])

	useEffect(() => {
		setRoomList(
			matchingRooms
				.map((tmpRoom) => {
					let isIn = false

					for (const room of rooms) {
						if (room.room_id === tmpRoom.id) {
							isIn = true
						}
					}
					if (!isIn) {
						return (<ListItem
							key={tmpRoom.id}
							secondaryAction={
								<Button value={JSON.stringify(tmpRoom)} onClick={handleJoin}>JOIN</Button>
							}
						>{tmpRoom.name}</ListItem>)
					}
					return null
				})
				.filter((tmpRoom) => tmpRoom !== null)
		)

	}, [matchingRooms, rooms])

	return (
		<FormControl>
			<Button onClick={() => (setIsJoining(false))}>x</Button>
			<TextField
				size="small"
				variant="outlined"
				onChange={handleChange}
				InputProps={{
					startAdornment: (
						<Search />
					)
				}} />
			<List>
				<>
					{roomList}
				</>
			</List>
		</FormControl>
	)
}