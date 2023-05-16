import { List, ListItem, ListItemButton, Button, FormControl, TextField } from '@mui/material'
import { Search, TypeSpecimen } from '@mui/icons-material'
import React, { useContext, useState, useEffect, useCallback } from "react"
import { FetchApi } from "../component/FetchApi"
import useAuth, { useFetchAuth } from "../context/useAuth"
import { ChatContext } from "./Chat"
import { AddFriendData, User} from "./Chat.types"
import { socket } from "./Socket"

export function AddFriend() {
	const {
		isJoining, setIsSearching
	} = useContext(ChatContext)

	const { id } = useAuth()

	const [searchTerm, setSearchTerm] = useState('')

	const [matchingUsers, setMatchingUsers] = useState<any[]>([])

	const useContextAuth = useFetchAuth()

	useEffect(() => {

		const delayDebounce = setTimeout(async () => {
			if (searchTerm === '')
				return setMatchingUsers([])

			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/users/search/${searchTerm}`,
					option: {}
				},
				auth: useContextAuth
			})

			setMatchingUsers(response?.data.map((value: User) => ({
				id: value.id,
				login: value.login,
				avatar: value.avatar
			})))

		}, 800)
		return () => clearTimeout(delayDebounce)
	}, [searchTerm])

	const handleAdd = useCallback((user: User) => {

		const payload: AddFriendData = {
			user1_id: id,
			user2_id: user.id
		}

		socket.emit('friendRequest',  payload)
		//const sendfriendRequest = async () => {

		//	const { data } = await FetchApi({
		//		api: {
		//			input: `http://${import.meta.env.VITE_SITE}/api/friends/${value.id}`,
		//			//input: `http://${import.meta.env.VITE_SITE}/api/admin/block/${value.id}`,
		//			option: {
		//				method: "POST"
		//			}
		//		},
		//		auth: useContextAuth
		//	})

		//	return data

		//}

		//sendfriendRequest().then(data => console.log('friend Data: ', data))

		setIsSearching(false)
	}, [socket])

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}, [])

	const [userList, setUserList] = useState<React.ReactNode[]>([])

	useEffect(() => {
		setUserList(
			matchingUsers.map((tmpUser) => {
				//let isIn = false
				const isIn = false

				if (!isIn) {
					return (<ListItem
						key={tmpUser.id}
						secondaryAction={
							<Button onClick={() => handleAdd(tmpUser)}>ADD</Button>
						}
					>{tmpUser.login}</ListItem>)
				}
				return null
			})
		)

	}, [matchingUsers])

	return (
		<FormControl>
			<Button onClick={() => (setIsSearching(false))}>x</Button>
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
				{userList}
			</List>
		</FormControl>
	)
}