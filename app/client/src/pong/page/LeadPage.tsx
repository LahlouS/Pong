import * as React from 'react'
import { useEffect, useState } from 'react'
import { Typography, Box, Paper } from '@mui/material'
import Grid from '@mui/material/Grid'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Swipeable from '../component/Swipeable'
import Profile from '../Profile/Profile'
import './LeadPage.css'
import useAuth, { useFetchAuth } from '../context/useAuth'
import { FetchApi } from '../component/FetchApi'
import GamePage from './Game';
import '../../App.css';
import { ChatSocketProvider } from '../Chat/Socket'
import { ReactNode } from "react"
import io, { Socket } from "socket.io-client";


type StatusContextType = {
	socketStatus: Socket | null,
	friendStatusTab: { id: number, status: string }[]
	setFriendStatusTab: React.Dispatch<React.SetStateAction<{ id: number, status: string }[]>>;
}

export const StatusContext = React.createContext<StatusContextType>({} as StatusContextType);


export const StatusSocketProvider = ({ children }: { children: ReactNode }) => {

	/* --- connecting to the socket.IO status server --- */

	const { token } = useFetchAuth();
	const [friendStatusTab, setFriendStatusTab] = useState<{ id: number, status: string }[]>([])
	const [onlineEvent, setOnlineEvent] = useState<number | undefined>(undefined)
	const [offlineEvent, setOfflineEvent] = useState<number | undefined>(undefined)
	const [inGameEvent, setInGameEvent] = useState<number | undefined>(undefined)
	const [socketStatus, setSocketStatus] = useState<Socket | null>(null)
	const [fetched, setFetched] = useState<boolean>(false)
	const auth = useAuth()


	useEffect(() => {

		async function getFriendsStatus() {

			const getFriendsStatusRequest = {
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/friends/status`
				},
				auth: auth
			}

			const response = await FetchApi(getFriendsStatusRequest)

			return response?.data

		}

		setSocketStatus(io(`http://${import.meta.env.VITE_SITE}/status`, {
			auth: {
				token: token
			},
		}))

		getFriendsStatus().then(data => setFriendStatusTab(data))
		setFetched(true)

	}, [])


	useEffect(() => {

		async function handleFriendOnlineEvent(id: number) {
			setOnlineEvent(id)

		}

		function handleFriendOfflineEvent(id: number) {
			setOfflineEvent(id)
		}

		function handleFriendInGameEvent(id: number) {
			setInGameEvent(id)
		}

		//if (socketStatus) {
		if (fetched && socketStatus) {

			//socketStatus.on("connect", () => {
			//	console.log("connected to status server" + new Date());
			//})

			socketStatus.on('friendOnline', handleFriendOnlineEvent)

			socketStatus.on('friendOffline', handleFriendOfflineEvent)

			socketStatus.on('friendInGame', handleFriendInGameEvent)

		}
		else {

			/* 			setSocketStatus(io(`http://${import.meta.env.VITE_SITE}/status`, {
							auth: {
								token: token
							},
						})) */
		}


		return () => {

			if (socketStatus) {

				socketStatus.off('friendOnline', handleFriendOnlineEvent)
				socketStatus.off('friendOnffline', handleFriendOfflineEvent)
				socketStatus.off('friendInGame', handleFriendInGameEvent)
				socketStatus.disconnect()

			}
		}

	}, [socketStatus, fetched])

	useEffect(() => {

		async function getFriendsStatus() {

			const getFriendsStatusRequest = {
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/friends/status`
				},
				auth: auth
			}

			const response = await FetchApi(getFriendsStatusRequest)

			return response?.data

		}

		if (onlineEvent !== undefined) {
			//setFriendStatusTab(friendStatusTab.map(item => item.id === onlineEvent ? { ...item, status: 'online' } : item))
			getFriendsStatus().then(data => setFriendStatusTab(data))
			setOnlineEvent(undefined)
		}
		if (offlineEvent !== undefined) {
			//setFriendStatusTab(friendStatusTab.map(item => item.id === offlineEvent ? { ...item, status: 'offline' } : item))
			getFriendsStatus().then(data => setFriendStatusTab(data))
			setOfflineEvent(undefined)
		}
		if (inGameEvent !== undefined) {
			getFriendsStatus().then(data => setFriendStatusTab(data))
			//setFriendStatusTab(friendStatusTab.map(item => item.id === inGameEvent ? { ...item, status: 'inGame' } : item))
			setInGameEvent(undefined)
		}

	}, [onlineEvent, inGameEvent, offlineEvent])

	return (
		<>
			<StatusContext.Provider value={{ socketStatus, friendStatusTab, setFriendStatusTab }}>
				{children}
			</StatusContext.Provider>
		</>
	)
}


const header = {
	height: '4vw;',
}

const pongTitle = {
	fontSize: '3vw;',
}

const tabStyle = {
}

const centralBoxStyle = {
	height: '45rem',
	p: 1,
	borderRadius: '32px',
	'&.MuiPaper-root': {
		backgroundColor: 'primary'
	}
}

const centralProfileBoxReduce550 = {
	height: '45rem',
	p: 1,
	borderRadius: '32px',
	'&.MuiPaper-root': {
		backgroundColor: 'primary'
	},
	'@media (max-width: 550px)': {
		height: '60rem',
	}
}

type TabPanelProps = {
	value: number,
	index: number,
	children: React.ReactNode
}

function TabPanel(props: TabPanelProps) {


	return <>
		{props.value === props.index &&
			(<Paper elevation={24}
				style={{ background: "rgb(240,240,240, 0.80)" }}
				sx={
					props.index === 0 ?
						centralProfileBoxReduce550 :
						centralBoxStyle
				}
			>
				<Grid container
					className='test'
					sx={props.index === 0 ?
						{
							all: 'initial',
							ml: '3rem',
							mr: '3rem',
							mt: '1rem',
							mb: '1rem',
							height: '43rem',
							widht: '30rem',
							display: 'flex',
							flexDirection: 'row',
							flexWrap: 'wrap',
							alignItems: 'center',
							justifyContent: 'center',
							'@media (max-width: 550px)': {
								height: '58rem',
							}
						} :
						{
							all: 'initial',
							ml: '3rem',
							mr: '3rem',
							mt: '1rem',
							mb: '1rem',
							height: '43rem',
							widht: '30rem',
							display: 'flex',
							flexDirection: 'row',
							flexWrap: 'wrap',
							alignItems: 'center',
							justifyContent: 'center'
						}
					}>
					{props.children}
				</Grid>
			</Paper>)
		}
	</>;
}

const LeadPageChild = () => {

	const [value, setValue] = React.useState(1);
	const { user, id, navigate } = useAuth();
	const auth = useFetchAuth()

	useEffect(() => {
		FetchApi({
			api: {
				input: `http://${import.meta.env.VITE_SITE}/api/users/profile/pong`,
				dataType: 'null'
			},
			auth: auth,
		})
	}, [])

	const handleHome = (event: React.SyntheticEvent) => {
		event.preventDefault()
		navigate('/')
	};

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		event.preventDefault()
		setValue(newValue);
	};

	return <>
		<Box sx={{ height: '7rem' }}>
			<Grid container display='flex' sx={header} columns={17}>
				<Grid item xs={4} sx={{ my: 'auto' }}>
					<Grid item md={7} xs={8}>
						<Typography
							variant='h1'
							sx={pongTitle}
							onClick={handleHome}
							className="homeButton"
						>
							Pong
						</Typography>
					</Grid>
				</Grid>
				<Grid item xs={9} sx={{ my: 'auto' }}>
					<Tabs
						value={value}
						onChange={handleChange}
						aria-label="nav tabs example"
						variant='fullWidth'
					>
						<Tab label="Profile" sx={tabStyle} />
						<Tab label="Play" sx={tabStyle} />
						<Tab label="Chat" sx={tabStyle} />
					</Tabs>
				</Grid>
				<Grid item xs={3}>
					<Swipeable
						login={true}
						sx={{
							position: 'absolute',
							right: '3rem',
						}}
					/>
				</Grid>
			</Grid>
		</Box>
		<Box>
			<TabPanel value={value} index={0}>
				<Profile />
			</TabPanel>
			<TabPanel value={value} index={1}>
				{/* <Typography variant='h1'>{user}</Typography>
				<br/>
				<Typography variant='h1'>{id}</Typography> */}
				<GamePage />
			</TabPanel>
			<TabPanel value={value} index={2}>
				{

				}
				<ChatSocketProvider />
			</TabPanel>
		</Box>
	</>
}

const LeadPage = () => {

	return <StatusSocketProvider>
		<LeadPageChild />
	</StatusSocketProvider>
}

export default LeadPage;
