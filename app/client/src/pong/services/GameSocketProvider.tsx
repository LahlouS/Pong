import { ReactNode } from "react"
import React from 'react';
import { useFetchAuth } from '../context/useAuth'
import io, {Socket} from "socket.io-client";


export const UserContext = React.createContext<Socket>({} as Socket);


export const GameSocketProvider = ({children}: {children: ReactNode}) => {

	/* --- connecting to the socket.IO server --- */

	const getTok = useFetchAuth();

	const socket = io(`http://${import.meta.env.VITE_SITE}/gameTransaction`, {
		auth: {
			token: getTok.token
		}
	})

	socket.on("connect", () => {
		return;
	})

	return (
		<>
		<UserContext.Provider value={socket}>
			{children}
		</UserContext.Provider>
		</>
	)
}
