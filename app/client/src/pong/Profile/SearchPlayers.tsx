import {
	Box,
	Grid,
	Dialog,
	DialogTitle,
	FormControl,
	DialogContent,
	Typography,
	TextField,
	Divider,
	InputAdornment,
	Button,
} from '@mui/material'
import { styled } from '@mui/system';
import useAuth, { useFetchAuth } from '../context/useAuth'
import { FetchApi } from '../component/FetchApi'
import GppGoodIcon from '@mui/icons-material/GppGood'
import GppBadIcon from '@mui/icons-material/GppBad';
import { useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search';
import CircularProgress from '@mui/material/CircularProgress';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import BlockIcon from '@mui/icons-material/Block';
import * as React from 'react';
import { Level, BorderLinearProgress } from '../Profile/GameInfo';
import { findLevel } from '../Profile/Profile'
import useMediaQuery from "../hooks/useMediaQuery"
import FetchAvatar from '../component/FetchAvatar'


function timeout(delay: number) {
	return new Promise(res => setTimeout(res, delay));
}

function isNumberOrString(str: string) {
	return /^([0-9a-zA-Z_]){1,20}$/.test(str);
}

type Players = {
	id: number,
	login: string,
	avatar: string,
}

type OnClicks = {
	handleBlockUser: () => void,
	handleRemoveFromFriend: () => void,

}

export const GridProfile = (props: { player: Players, isChat: boolean, onClicks?: OnClicks }) => {

	const { id } = useAuth()
	const auth = useFetchAuth()
	const isQuery550 = useMediaQuery('(max-width: 550px)')
	const [win, setWin] = useState<number>(0)
	const [loss, setLoss] = useState<number>(0)
	const [fetched, setFetched] = useState(false)
	const [avatarFetched, setAvatarFetched] = useState(false)
	const [level, setLevel] = useState<Level>({} as Level)


	useEffect(() => {
		async function fetching() {

			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/users/profile/info/${props.player.id}`,
				},
				auth: auth,
			})
			setWin(response?.data['nbWin'])
			setLoss(response?.data['nbLoss'])
			setLevel(findLevel(response?.data['nbWin'] * 100 + response?.data['nbLoss'] * 25))
			setFetched(true)
		}
		fetching()

	}, [props.player])

	return <>
		{fetched ?
			<Grid sx={{ width: '100%', height: '21rem', minheight: '20rem' }}>
				<Grid sx={{ width: '100%', height: '50%' }}>
					<Grid item xs={12}
						display="flex"
						sx={{
							height: '100%',
							justifyContent: "center",
							alignItems: "center"
						}}
					>
						<Grid item xs={3}
							display="flex"
							sx={props.isChat ? {
								height: '100%',
								justifyContent: "center",
								alignItems: "center"
							}
								:
								{
									display: 'none'
								}
							}
						>
							<Button sx={{ borderRadius: '20px', margin: '0.5rem', p: '0.5rem' }} onClick={props.onClicks?.handleBlockUser}>
								<BlockIcon />
							</Button>
						</Grid>
						<Grid item xs={6}
							display="flex"
							sx={{
								height: '100%',
								justifyContent: "center",
								alignItems: "center"
							}}
						>
							<FetchAvatar
								avatar={props.player.avatar}
								sx={{
									height: '9rem',
									width: '9rem',
									boxShadow: 15,
								}}
							/>
						</Grid>
						<Grid item xs={3}
							display="flex"
							sx={props.isChat ? {
								height: '100%',
								justifyContent: "center",
								alignItems: "center"
							}
								:
								{
									display: 'none'
								}
							}
						>
							<Button sx={{ borderRadius: '20px', margin: '0.5rem', p: '0.5rem' }} onClick={props.onClicks?.handleRemoveFromFriend}>
								<PersonRemoveIcon />
							</Button>
						</Grid>
					</Grid>
				</Grid>
				<Grid sx={{ width: '100%', height: '10%' }}>
					<Grid display='flex' item xs={12} sx={{
						height: '100%',
						justifyContent: 'center',
						alignItems: 'center',
						mx: 1,
					}}>
						<Typography noWrap align="center" variant="h5">
							{props.player.login}
						</Typography>
					</Grid>
				</Grid>
				<Grid display="flex" sx={{ width: '100%', height: '40%' }}>
					<Grid item xs={4} sx={{ height: '100%' }}>

						<Grid item xs={12}
							display="flex"
							sx={{
								justifyContent: 'center',
								alignItems: 'center',
								height: '70%'
							}}
						>
							<GppGoodIcon style={{ color: '#293241' }} sx={{ height: '5rem', width: '5rem' }} />
						</Grid>

						<Grid item xs={12}
							display="flex"
							sx={{
								justifyContent: 'center',
								height: '30%'
							}}
						>
							<Typography align="center">
								{win}
							</Typography>
						</Grid>

					</Grid>
					<Grid item xs={4} sx={{ height: '100%' }}>

						<Grid item display="flex"
							justifyContent="center"
							alignItems="center"
							xs={12}
							sx={{ height: "80%" }}
						>

							<Typography align="center"
								variant='h4'
								style={{ color: '#213547' }}
							>
								{isQuery550 ? level.level : `lvl ${level.level}`}
							</Typography>
						</Grid>

						<Grid item xs={12} sx={{ mx: 1 }}>
							<BorderLinearProgress variant="determinate" value={level.xp} />
						</Grid>

					</Grid>
					<Grid item xs={4} sx={{ height: '100%' }}>

						<Grid item xs={12}
							display="flex"
							sx={{
								justifyContent: 'center',
								alignItems: 'center',
								height: '70%'
							}}
						>
							<GppBadIcon style={{ color: '#cd384a' }} sx={{ height: '5rem', width: '5rem' }} />
						</Grid>

						<Grid item xs={12}
							display="flex"
							sx={{
								justifyContent: 'center',
								height: '30%'
							}}
						>
							<Typography align="center">
								{loss}
							</Typography>
						</Grid>

					</Grid>
				</Grid>
			</Grid>
			:
			<Grid
				display="flex"
				sx={{
					height: '100%',
					width: '100%',
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<CircularProgress sx={{ mt: 3, color: "#aab7b8" }} />
			</Grid>
		}

	</>

}


export const PlayersListWrapper = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	width: '100%',
	padding: '8px',
	boxSizing: 'border-box',
	height: '100%',
	overflowY: 'auto',
});

interface PlayersListItemProps {
	isActive: boolean;
}

export const PlayersListItem = styled('div')<PlayersListItemProps>(({ isActive }) => ({
	display: 'flex',
	alignItems: 'center',
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

export const PlayersListItemAvatar = styled('div')({
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

export const PlayersListItemText = styled('div')({
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	fontSize: '16px',
	fontWeight: '600',
});


const GridPlayers = () => {

	const auth = useFetchAuth()
	const [rows, setRows] = useState<Players[]>([] as Players[])
	const [selectedRow, setSelectedRow] = useState<Players | null>(null)
	const [selectedRowId, setSelectedRowId] = useState<number | null>(null)

	useEffect(() => {
		setRows([] as Players[])
		setSelectedRow(null)
	}, [])

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		if (isNumberOrString(e.target.value)) {
			const timer = await timeout(1000)
			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/users/search/${e.target.value}`,
				},
				auth: auth,
			})
			setRows(response?.data)
		} else if (!e.target.value) {
			setRows([] as Players[])
		}
	}

	return (
		<>
			<Divider variant="middle" />
			<Grid
				display="flex"
				sx={{ height: '21rem' }}
			>
				<Grid item xs={5} sx={{ mt: 1.5, mr: 1 }}>

					<FormControl>
						<TextField
							type='text'
							size="small"
							label="search"
							InputProps={{
								startAdornment: (
									<InputAdornment position="start">
										<SearchIcon />
									</InputAdornment>
								)
							}}
							onChange={handleChange}
						></TextField>
					</FormControl>
					{rows.length ?
						<PlayersListWrapper>
							{rows.map((row) => (
								<PlayersListItem
									key={row.id}
									isActive={row.id === selectedRowId}
									onClick={() => setSelectedRow(row)}
								>
									<PlayersListItemAvatar>
										<FetchAvatar avatar={row.avatar} sx={{ height: '100%', width: '100%' }} />
									</PlayersListItemAvatar>
									<PlayersListItemText>{row.login}</PlayersListItemText>
								</PlayersListItem>
							))}
						</PlayersListWrapper>
						:
						<Box sx={{ height: "80%" }}
							display="flex"
							justifyContent="center"
							alignItems="center"
						>
							<Typography
								align="center"
								style={{ color: '#aab7b8' }}
							>
								no player listed
							</Typography>
						</Box>
					}


				</Grid>

				<Divider orientation="vertical" flexItem />

				<Grid item xs={7}
					display="flex"
					justifyContent="center"
					alignItems="center"
				>
					{selectedRow ?
						<GridProfile player={selectedRow} isChat={false} />
						:
						<Typography
							align="center"
							style={{ color: '#aab7b8' }}
						>
							no profile selected
						</Typography>
					}

				</Grid>
			</Grid>
		</>
	);
}


type MatchInfoProps = {
	open: boolean,
	setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

const SearchPlayers = (props: MatchInfoProps) => {

	const [user, setUser] = useState('')
	const auth = useFetchAuth();

	const handleClose = () => {
		props.setOpen(false);
	}

	return (
		<>
			<Dialog open={props.open} onClose={handleClose}
				fullWidth
				maxWidth="md"
				PaperProps={{
					style: {
						borderRadius: '32px',
						height: '31rem',
						width: '50rem',
						minHeight: '10rem'
					}
				}}
			>
				<DialogTitle>
					<Box
						display="flex"
						justifyContent="center"
						alignItems="center"
						sx={{ mt: 4, mb: 1 }}
					>
						<Typography
							component={'span'}
							variant='h6'
							align="center"
							style={{ color: '#213547' }}
						>
							Search Players
						</Typography>
					</Box>
				</DialogTitle>
				<DialogContent>
					<GridPlayers />
				</DialogContent>
			</Dialog>
		</>
	)

}
export default SearchPlayers;
