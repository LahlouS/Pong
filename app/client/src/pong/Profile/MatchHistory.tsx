import {
	Box,
	Grid,
	Dialog,
	DialogTitle,
	DialogContent,
	Typography,
	Divider,
	Stack,
} from '@mui/material'
import useAuth, { useFetchAuth } from '../context/useAuth'
import { FetchApi } from '../component/FetchApi'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useState, useEffect } from 'react'
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import * as React from 'react';
import { styled } from '@mui/system';
import {PlayersListItemAvatar} from '../Profile/SearchPlayers'
import FetchAvatar from '../component/FetchAvatar'

type matchHistoryPayload = {
	index: number,
	l1: string;
	a1: string,
	s1 : number;
	l2 : string;
	a2: string,
	s2: number;
}

export const PlayersListItemAvatarLeft = styled(PlayersListItemAvatar)({
	marginRight: '0px',
	marginLeft: '16px',
})

const TableHistory = ({rows}: {rows: matchHistoryPayload[]}) => {


	return (
		<>
		{rows.length === 0 ?
			(<>
			<Divider variant="middle"/>
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
			<TableContainer component={Box}>
				<Table sx={{ width: '100%' }} aria-label="simple table">
					<TableBody>
						{rows.map((row) => (
							<TableRow
								key={row.index}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell align="left">
									<Stack direction="row" alignItems="center" gap={1}>
										{row.s1 === row.s2 ? <GppMaybeIcon style={{color: '#95bc4b'}}/> :
											(<>
												{row.s1 > row.s2 ?
													<GppGoodIcon style={{color: '#293241'}}/> :
													<GppBadIcon style={{color: '#cd384a'}}/>
												}
											</>)
										}

											<PlayersListItemAvatar>
											<FetchAvatar
												avatar={row.a1}
												sx={{
													height: '100%',
													width: '100%'
												}}
											/>
											</PlayersListItemAvatar>

										<Typography variant="body1">{row.l1}</Typography>
									</Stack>
								</TableCell>

								<TableCell align="center">
									{row.s1}
								</TableCell>

								<TableCell align="center">
									{row.s2}
								</TableCell>

								<TableCell align="right">
									<Stack direction="row" justifyContent="flex-end" alignItems="center" gap={1}>
										<Typography variant="body1">{row.l2}</Typography>

										<PlayersListItemAvatarLeft>
											<FetchAvatar
												avatar={row.a2}
												sx={{
													height: '100%',
													width: '100%'
												}}
											/>
										</PlayersListItemAvatarLeft>

										{row.s1 === row.s2 ? <GppMaybeIcon style={{color: '#95bc4b'}}/> :
											(<>
												{row.s1 > row.s2 ?
													<GppBadIcon style={{color: '#cd384a'}}/> :
													<GppGoodIcon style={{color: '#293241'}}/>
												}
											</>)
										}
									</Stack>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			</>)
		}
		</>
	 );
}


type MatchHistoryProps = {
	open: boolean,
	setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

const MatchHistory = (props: MatchHistoryProps) => {

	const [fetched, setFetched] = useState(false)
	const [rows, setRows] = useState<matchHistoryPayload[]>({} as matchHistoryPayload[])
	const auth = useFetchAuth();
	const {user} = useAuth()

	useEffect(()=> {

		async function fetching() {

			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/game/gamehistory`,
					option: {
						method: "GET",
					},
				},
				auth: auth,
			});

			await setRows(response?.data['history'])

			setFetched(true)

		}
		fetching()

	}, [])

	useEffect(() => {

		async function fetching() {
			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/game/gamehistory`,
					option: {
						method: "GET",
					},
				},
				auth: auth,
			});
			await setRows(response?.data['history'])
		}
		fetching()

	}, [user])

	const handleClose = () => {
		props.setOpen(false);
	}

	return (
		<>
		{!fetched ?
				null
			: (
				<>
					<Dialog open={props.open} onClose={handleClose}
						fullWidth
						maxWidth="md"
						PaperProps={{
							style: {
								borderRadius: '32px',
								height: '30rem',
								width: '50rem'
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
									History Match
								</Typography>
							</Box>
						</DialogTitle>
						<DialogContent>
							<TableHistory rows={rows} />
						</DialogContent>
					</Dialog>
				</>
			)}
		</>
	)

}
export default MatchHistory;
