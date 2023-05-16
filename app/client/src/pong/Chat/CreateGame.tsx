import * as React from 'react'
import { Typography, Box, Divider } from '@mui/material'
import Grid from '@mui/material/Grid'
import useAuth from '../context/useAuth'
// import './game.css'
import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Radio, FormControlLabel, FormGroup } from '@mui/material';
import { InviteGameDataPaylaod } from '../component/gameType'
import { useFetchAuth } from '../context/useAuth'
import { FetchApi, Api, responseApi } from '../component/FetchApi'

type CreateMatchProps = {
	player2: string,
	player2Id: number,
	openDialog: boolean,
	setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>,
}

export function JoinQueuButtonChat({player2, player2Id, openDialog, setOpenDialog}: CreateMatchProps) {
	const auth = useFetchAuth();
	/**
	 * Sur le Onclick du bouton JOIN, il faut faire un POST de playerPayload sur la route:
	 * 			'/api/game/newInvite'
	 */
	const {user, id} = useAuth();
	const [playerPayload, setPlayerPayload] = useState<InviteGameDataPaylaod>({
		sender_id: id,
		sender_login: user,
		receiver_id: player2Id,
		receiver_login: player2,
		ballSpeed: '7',
		paddleSize: '100',
		duration: '3750',
		funnyPong: false
	})

  const handlePaddleSizeLevel = (event: any) => {
	if (playerPayload) {
		if (event.target.value === "easy"){
			setPlayerPayload({...playerPayload,
					paddleSize: '50'
			})
		}
		else if (event.target.value === 'medium'){
			setPlayerPayload({...playerPayload,
				paddleSize: '70'
			})
		}
		else if (event.target.value === 'hard'){
			setPlayerPayload({...playerPayload,
				paddleSize: '50'
			})
		}
	}
  };


	const handleBallSpeedLevel = (event: any) => {

		if (playerPayload) {
			if (event.target.value === "easy"){
				setPlayerPayload({...playerPayload,
					ballSpeed: '7'
				})
			}
			else if (event.target.value === 'medium'){
				setPlayerPayload({...playerPayload,
					ballSpeed: '10'
				})
			}
			else if (event.target.value === 'hard'){
				setPlayerPayload({...playerPayload,
					ballSpeed: '12'
				})
			}
		}
	};

	const handleDuration = (event: any) => {
		if (playerPayload) {
			if (event.target.value === "easy"){
				setPlayerPayload({...playerPayload,
					duration: '1875'
				})
			}
			else if (event.target.value === 'medium'){
				setPlayerPayload({...playerPayload,
					duration: '3750'
				})
			}
			else if (event.target.value === 'hard'){
				setPlayerPayload({...playerPayload,
					duration: '7500'
				})
			}
		}
	};

	const handleFunnyPong = (event: any) => {
		if (playerPayload) {
			setPlayerPayload({...playerPayload,
				funnyPong: (event.target.value === 'true')
			})
		}
	}

	const handleClose = () => {
		setOpenDialog(false);
	}

	const handleJoinClick = () => {
		handlePostData();
		handleClose();
	}

	function handlePostData() {
		// Implémentez cette fonction selon ce que vous voulez faire lorsque l'utilisateur clique sur un bouton.
			FetchApi({
				api: {
						input: `http://${import.meta.env.VITE_SITE}/api/game/newInvite`,
						option: {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(playerPayload),
						},
				 },
					auth: auth,
			})
	}

	return (
		<>
			<Dialog
				open={openDialog}
				onClose={handleClose}
				fullWidth
				maxWidth="md"
				PaperProps={{
					style: {
						borderRadius: '32px',
						height: '31rem',
						width: '50rem',
						minHeight: '10rem',
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
							Configure your game
						</Typography>
					</Box>
				</DialogTitle>
				<DialogContent>
				<Divider variant="middle"/>
				<Grid container
					sx={{
						height: '95%',
						minHeight: '10rem',
						pl: 7,
						'@media (max-width: 650px)': {
							pl: 0,
						}
					}}
				>

					<Grid item xs={4} sx={{height: '100%'}}>
						<Grid
							sx={{height: '25%'}}
							display="flex"
							alignItems="center"
						>
							<Typography fontSize="1.3rem">ball speed</Typography>
						</Grid>
						<Grid
							sx={{height: '25%'}}
							display="flex"
							alignItems="center"
						>
							<Typography fontSize="1.3rem">paddle size</Typography>
						</Grid>
						<Grid
							sx={{height: '25%'}}
							display="flex"
							alignItems="center"
						>
							<Typography fontSize="1.3rem">duration</Typography>
						</Grid>
						<Grid
							sx={{height: '25%'}}
							display="flex"
							alignItems="center"
						>
							<Typography fontSize="1.3rem">funnyPOng</Typography>
						</Grid>
					</Grid>

					<Grid item xs={7} sx={{height: '100%'}}>
						<FormGroup style={{ display: 'flex', height: '100%'}}>
							<Grid
								sx={{height: '25%'}}
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<FormControlLabel
									control={
										<Radio
											checked={playerPayload.ballSpeed === '7'}
											onClick={handleBallSpeedLevel}
											value="easy"
										/>
									}
									label="Easy"
										style={{ marginRight: '16px' }}
								/>
								<FormControlLabel
								control={
										<Radio
											checked={playerPayload.ballSpeed === '10'}
											onClick={handleBallSpeedLevel}
											value="medium"
										/>
									}
									label="Medium"
									style={{ marginRight: '16px' }}
								/>
								<FormControlLabel
									control={
										<Radio
											checked={playerPayload.ballSpeed === '12'}
											onClick={handleBallSpeedLevel}
											value="hard"
										/>
									}
									label="Hard"
								/>
							</Grid>
							<Grid
								sx={{height: '25%'}}
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<FormControlLabel
									control={
										<Radio
											checked={playerPayload.paddleSize === '100'}
											onClick={handlePaddleSizeLevel}
											value="easy"
										/>
									}
									label="Easy"
									style={{ marginRight: '16px' }}
								/>
								<FormControlLabel
									control={
										<Radio
											checked={playerPayload.paddleSize === '70'}
											onClick={handlePaddleSizeLevel}
											value="medium"
										/>
									}
									label="Medium"
									style={{ marginRight: '16px' }}
								/>
								<FormControlLabel
									control={
										<Radio
											checked={playerPayload.paddleSize === '50'}
											onClick={handlePaddleSizeLevel}
											value="hard"
										/>
									}
									label="Hard"
								/>
							</Grid>
							<Grid
								sx={{height: '25%'}}
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<FormControlLabel
									control={
										<Radio
											checked={playerPayload.duration === '1875'}
											onClick={handleDuration}
											value="easy"
										/>
									}
									label="0:30m"
									style={{ marginRight: '16px' }}
								/>
								<FormControlLabel
									control={
										<Radio
											checked={playerPayload.duration === '3750'}
											onClick={handleDuration}
											value="medium"
										/>
									}
									label="1:00m"
									style={{ marginRight: '16px' }}
								/>
								<FormControlLabel
									control={
										<Radio
											checked={playerPayload.duration === '7500'}
											onClick={handleDuration}
											value="hard"
										/>
									}
									label="2:00m"
								/>
							</Grid>
							<Grid
								sx={{height: '25%'}}
								display="flex"
								alignItems="center"
								justifyContent="center"
							>

							<FormControlLabel
									control={
										<Radio
											checked={playerPayload.funnyPong === true}
											onClick={handleFunnyPong}
											value={true}
										/>
									}
									label="true"
										style={{ marginRight: '16px' }}
							/>
							<FormControlLabel
								control={
										<Radio
											checked={playerPayload.funnyPong === false}
											onClick={handleFunnyPong}
											value={false}
										/>
									}
									label="false"
									style={{ marginRight: '16px' }}
							/>
							</Grid>
						</FormGroup>
					</Grid>
				</Grid>
				<Divider variant="middle"/>
				</DialogContent>
				<DialogActions sx={{pr: 3, pb: 2}}>
					<Button
						variant="contained"
						onClick={handleClose}
						sx={{
							backgroundColor: 'tomato',
							'&:hover': {
								backgroundColor: '#ff9070',
							}
						}}
					>
						Cancel
					</Button>
					<Button
						variant="contained"
						onClick={handleJoinClick}
						sx={{
							'&:hover': {
								backgroundColor: '#427094',
							}
						}}
					>
						Join
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
