import React , { useContext, useRef, useState, useCallback } from 'react'
import { Box, FormControl, Switch, TextField, FormControlLabel, Button } from "@mui/material"
import { ChatContext } from "./Chat"
import useAuth, { useFetchAuth } from '../context/useAuth'
import { FetchApi } from '../component/FetchApi'
import { CreateRoomData } from './Chat.types'
import { socket } from './Socket'

export function CreateRoom({setBoolean} :{setBoolean: (bool: boolean) => void}) {
	const name = useRef<HTMLInputElement>()

	const password = useRef<HTMLInputElement>()
	
	const [secured, isSecured] = useState(false)

	const {user, id} = useAuth()

	const handleSwitch = useCallback(() => {
		secured ? isSecured(false) : isSecured(true)
	}, [secured])

	const handleCreateRoom = useCallback(() => {

		if (name.current?.value === '')
			return
		else if (secured && password.current?.value === '')
			return

		const newRoomData : CreateRoomData  = {
			name: name.current?.value as string,
			password: password.current?.value ? password.current?.value : '',
			owner_id: id
		}

		socket.emit('createRoom', newRoomData)

		setBoolean(false)

	}, [socket])

	return (
		<FormControl sx={{m: '1rem'}}>
			<FormControlLabel control={<Switch onChange={handleSwitch}/>} label="Protected" />
			<TextField sx={{marginTop: '1rem'}} label="name" inputRef={name}/>
			<TextField disabled={!secured} sx={{marginTop: '1rem'}} label="password" inputRef={password}/>
				<Button sx={{m: '1rem', borderRadius: '20px'}}onClick={handleCreateRoom}>Create room</Button>
		</FormControl>
	)
}