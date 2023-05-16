import * as React from 'react'
import {useState} from 'react'
import { Typography, Box, Paper } from '@mui/material'
import Grid from '@mui/material/Grid'
import Button from "@mui/material/Button";
import { useFetchAuth } from '../context/useAuth'
import { FetchApi } from '../component/FetchApi'
import useAuth from '../context/useAuth'
import {Socket} from "socket.io-client";
import { styled } from '@mui/system';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	Divider,
} from '@mui/material'
import {
	PlayersListWrapper,
} from '../Profile/SearchPlayers'
import FetchAvatar from './FetchAvatar'
import { InviteGameData }from './gameType'


interface PlayersListItemProps {
	isActive: boolean;
}

const PlayersListItem = styled('div')<PlayersListItemProps>(({ isActive }) => ({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '56px',
	margin: '4px',
	padding: '0 16px',
	borderRadius: '8px',
	cursor: 'pointer',
	backgroundColor: isActive ? '#EDEDED' : 'transparent',
	'&:hover': {
		backgroundColor: '#EDEDED',
	},
}));

const PlayersListItemAvatarRight = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '40px',
	width: '40px',
	borderRadius: '50%',
	marginLeft: '16px',
	backgroundColor: '#ffffff',
	flexShrink: 0
});

const PlayersListItemAvatarLeft = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '40px',
	width: '40px',
	borderRadius: '50%',
	marginRight: '16px',
	backgroundColor: '#ffffff',
	flexShrink: 0
});

const PlayersListItemText = styled('div')({
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	fontSize: '16px',
	fontWeight: '600',
	textAlign: 'center',
	'@media (max-width: 500px)': {
		display: 'none'
	}
});

type WatchProps = {
	socket: Socket,
	thereIsMatch: boolean,
	openFriends: boolean,
	setOpenFriends: React.Dispatch<React.SetStateAction<boolean>>,
	handleThereIsMatch: () => void,
}

export const GameFriends = ({socket, thereIsMatch, handleThereIsMatch, openFriends, setOpenFriends}: WatchProps) => {
	const [friendList, setFriendList] = React.useState<InviteGameData[]>([

	]);
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null)

	const auth = useFetchAuth();
	const {id, user} = useAuth();

	async function handleJoinGame(gameId: number, game: InviteGameData) {
		const response = await FetchApi({
			api: {
					input: `http://${import.meta.env.VITE_SITE}/api/game/gamesInvites/isavailable/${game.id}`,
					option: {
						method: "GET",
					},
				},
				auth: auth,
		})
		// Implémentez cette fonction selon ce que vous voulez faire lorsque l'utilisateur clique sur un bouton.
		if (response?.data)
		{
			const p1Id = game.sender_id;
			const p2Id = game.receiver_id;
			const inviteId = game.id;
			const ballSpeed = game.ballSpeed;
			const paddleSize = game.paddleSize;
			const duration = game.duration;
			const funnyPong = game.funnyPong
			socket.emit('friendMatchMaking', { inviteId, p1Id, p2Id, id, user, ballSpeed, paddleSize, duration, funnyPong })
			if (!thereIsMatch)
				handleThereIsMatch()
		}
		else {
			handleClose();
		}
	}

	const handleClose = () => {
		setOpenFriends(false)
	}

	React.useEffect(() => {
		async function fetching() {
			const response = await FetchApi({
				api: {
						input: `http://${import.meta.env.VITE_SITE}/api/game/gamesInvites`,
						option: {
							method: "GET",
						},
				 },
					auth: auth,
			})
			setFriendList(response!.data)
		}
		if (openFriends) {
			fetching();
		}
	}, [openFriends])


	return (
		<>
			<Dialog open={openFriends} onClose={handleClose}
				fullWidth
				maxWidth="md"
				PaperProps={{
					style: {
						borderRadius: '32px',
						height: '30rem',
					}
				}}
			>
				<DialogTitle>
					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						sx={{mt: 4, mb: 1}}
					>
						<Typography
							component={'span'}
							variant='h6'
							align="center"
							style={{color: '#213547'}}
						>
							Friends Game
						</Typography>
					</Box>
				</DialogTitle>
				<DialogContent>
					<Divider variant="middle"/>
					{ !friendList?.length ?
						(<>
						<Grid container
							display="flex"
							direction="column"
							justifyContent="center"
							alignItems="center"
							sx={{ width: '100%', height: '95%' }}
						>
							<Typography
								align="center"
								style={{color: '#aab7b8'}}
							>
								No Match Found
							</Typography>
						</Grid>
						</>) :
						(<>
							<Grid container sx={{height: '100%'}} >
								<PlayersListWrapper>
									{friendList.map((gameId) => (
										<PlayersListItem
											key={+gameId.id}
											isActive={+gameId.id === selectedRowId}
										>
											<Grid container
												sx={{width: '100%'}}
											>
												<Grid item display="flex" xs={4}
													sx={{
														justifyContent: 'center',
														alignItems: 'center'
													}}
												>
													<PlayersListItemAvatarLeft>
														<FetchAvatar
															avatar={gameId.sender_avatar}
															sx={{
																height: '100%',
																width: '100%'
															}}
														/>
													</PlayersListItemAvatarLeft>
													<PlayersListItemText>
														{gameId.sender_login === user ? "you" : gameId.sender_login}
													</PlayersListItemText>
												</Grid>
												<Grid item xs={5}
													sx={{
														justifyContent: 'center',
														alignItems: 'center'
													}}
												>
													<Typography variant='body1'
														textAlign="center"
														sx={{
															position: 'relative',
															top: 8,
														}}
													>
														{gameId.sender_id === id ? 'created a game' : 'invited you'}
													</Typography>
												</Grid>
												<Grid item display="flex" xs={3}
													sx={{
														justifyContent: 'center',
														alignItems: 'center'
													}}
												>
													<Button
														variant="contained"
													onClick={() => handleJoinGame(gameId.id, gameId)}
														sx={{
															'&:hover': {
																backgroundColor: '#427094',
															}
														}}
													>
														Join
													</Button>
												</Grid>
											</Grid>
										</PlayersListItem>
									))}
								</PlayersListWrapper>
							</Grid>
						</>)
					}
				</DialogContent>
			</Dialog>
		</>
	);
}
// export default Spectator;
