import {
	Box,
	List,
	ListItem,
	ListItemText,
	Dialog,
	DialogTitle,
	DialogContent,
	Typography,
	Divider,
	Grid,
	Switch,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	TextField,
	FormControl,
	FormControlLabel,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import useAuth, { useFetchAuth } from '../context/useAuth'
import { useState, useEffect } from 'react'
import { FetchApi, refreshRequest } from '../component/FetchApi'
import * as React from 'react';
import axios from 'axios';


function isNumber(str: string) {
	return /^\d+$/.test(str);
}

const AuthInstruction = () => {

	return <>
		<Box display='flex'
			justifyContent='center'
			sx={{pt: 1}}
		>
			<List>
				<ListItem
					sx={{
						listStyleType: "number",
						display: 'list-item',
					}}
				>
					<ListItemText
						primary="Install Google Authenticator (IOS - Android)
							or Authy (IOS - Android).'"
						disableTypography
						style={{color: '#213547'}}
						sx={{
							fontFamily: '"system-ui", sans-serif',
							fontSize: 12
						}}
					/>
				</ListItem>
				<ListItem
					sx={{
						listStyleType: "number",
						display: 'list-item',
					}}
				>
					<ListItemText
						primary="In the authenticator app, select '+' icon"
						disableTypography
						style={{color: '#213547'}}
						sx={{
							fontFamily: '"system-ui", sans-serif',
							fontSize: 12
						}}
					/>
				</ListItem>
				<ListItem
					sx={{
						listStyleType: "number",
						display: 'list-item',
					}}
				>
					<ListItemText
						primary="Select 'Scan a barcode (or QR code)' and use the phone's camera
								to scan this barcode."
						disableTypography
						style={{color: '#213547'}}
						sx={{
							fontFamily: '"system-ui", sans-serif',
							fontSize: 12
						}}
					/>
				</ListItem>
			</List>
		</Box>
	</>

}

type QRProps = {
	open: boolean,
	setOpen: React.Dispatch<React.SetStateAction<boolean>>,
	setCheck: React.Dispatch<React.SetStateAction<boolean>>,
	setIsActivate: React.Dispatch<React.SetStateAction<string>>,
}

export const QRCodeComponent = (props: QRProps) => {

	//	const {user, token, twoFA} = useAuth();
	const {twoFA, token, error, setError} = useAuth();
	const authFetching = useFetchAuth()


	const [fetched, setFetched] = useState(false);
	const [qrcode, setQrcode] = useState<string>('');
	const [code, setCode] = useState<string>('');

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		setError(null)
		if( e.target.value.length === 6 ) {

			if (!isNumber(e.target.value)) {
				setError('Error Authentification Code')
			} else {

				try {
					const response = await FetchApi({
						api: {
							input: `http://${import.meta.env.VITE_SITE}/api/2fa/authenticate-first?twoFA=${e.target.value}`,
							option: {
								method: 'POST'
							},
						},
						auth: authFetching
					})
					if (response?.response.status === 200) {
						props.setCheck(true)
						props.setOpen(false)
						props.setIsActivate('Enable')
					} else {
						setError('Error Authentification Code')
					}
				} catch(err) {
					console.log(err)
				}

			}

		}
	}


	const handleClose = () => {
		props.setOpen(false);
		setError(null);
	}




	useEffect( () => {


		async function fetching() {

			try {

				setError(null)

				const result = await axios.post(

					`http://${import.meta.env.VITE_SITE}/api/2fa/generate`,
					{},
					{
						withCredentials: true,
						responseType: 'blob',
						headers: {
							Authorization: `Bearer ${token}`,
						}
					}
				)
				await setQrcode(await URL.createObjectURL(result.data))

			} catch(err) {
				try {
					const refresh = await refreshRequest()

					if (refresh.response.status !== 200 && refresh.response.status !== 304) {
						authFetching.setToken('');
						authFetching.setUser('');
						authFetching.setId(0);
						authFetching.setIntraLogin('');
						authFetching.navigate('/login');
						return
					}

					authFetching.setToken(refresh.data['aT']);

					const result2 = await axios.post(

						`http://${import.meta.env.VITE_SITE}/api/2fa/generate`,
						{},
						{
							withCredentials: true,
							responseType: 'blob',
							headers: {
								Authorization: `Bearer ${refresh.data['aT']}`,
							}
						}
					)

					await setQrcode(await URL.createObjectURL(result2.data))

				} catch(err) {
					console.log(err)
				}
			} finally {
				setFetched(true);
			}
		}
		if(props.open) {
			fetching();
		}
		return undefined
	}, [props.open])


	return (
		<>
		{!fetched ?
				null
			: (
				<>
					<Dialog open={props.open} onClose={handleClose}
						 PaperProps={{
							style: {
								borderRadius: '32px',
								height: '28rem',
							}
						}}
					>
						<DialogTitle>
							<Box
								display="flex"
								justifyContent="center"
								alignItems="center"
								sx={{mt: 4}}
							>
								<Typography
									component={'span'}
									variant='subtitle2'
									align="center"
									style={{color: '#213547'}}
								>
									Two-Factor Authentication
								</Typography>
							</Box>
							<Divider variant='middle'/>
						</DialogTitle>
						<DialogContent>
							<Grid container
								sx={{
									all: 'initial',
									ml: '3rem',
									mt: '0.5rem',
									mb: '3rem',
									mr: '3rem',
									height: '10.5rem',
									widht:  '30rem',
									display: 'flex',
									'@media (max-width: 950px)': {
										display: 'block',
										height: '19.5rem',
									}
								}}
							>
								<Grid item md={6} xs={12}>
									<AuthInstruction />
								</Grid>
								<Grid justifyContent='center' item md={6} xs={12}>
									<Box display='flex' justifyContent='center'>
										<img src={qrcode} />
									</Box>
								</Grid>
							</Grid>
							<Grid justifyContent='center' container>
								<Box
									display='flex'
									justifyContent='center'
									sx={{
										p: '1rem',
									}}
								>
									<FormControl>
										<TextField
											type='text'
											label="Authentication Code"
											onChange={handleChange}
											inputProps={{
												inputMode: 'numeric',
												pattern: '[0-9]*',
												maxLength: 6,
												style: {
													textAlign: 'center',
												},
												sx: {
													py: 1,
													mx: 0,
													px: 0,
													fontSize:22,
												},
											}}
											sx={{
												p: 0,
												pt: 0.5,
												mx: 1,
												mt: 1
											}}
											helperText={
												error === '' ? null :
												<Typography variant='caption' align="center" color="tomato"
													sx={{
														//				fontFamily: '"system-ui", sans-serif',
														fontSize: [9, '!important']
													}}
												>
													{error}
												</Typography>
											}
										></TextField>
									</FormControl>
								</Box>
							</Grid>


						</DialogContent>
					</Dialog>
				</>
			)}
			</>
	);




}

type TFAProps = {
	isAccordion: boolean,
	setIsAccordion: React.Dispatch<React.SetStateAction<boolean>>,
}

const TFAComponent = (props: TFAProps) => {

	const [check, setCheck] = useState(false)
	const [open, setOpen] = useState(false)
	const [isActivate, setIsActivate] = useState('Disable')

	const auth = useFetchAuth()



	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		await setCheck(e.target.checked)
		if (e.target.checked) {
			setCheck(false)
			setOpen(true)
		} else {
			await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/2fa/turn-off`
				},
					auth: auth
			})
			setIsActivate('Disable')
		}
	}

	useEffect(() => {
		async function fetching() {
			try {
				const response = await FetchApi({
					api: {
						input: `http://${import.meta.env.VITE_SITE}/api/2fa/activate`
					},
						auth: auth
				})
				setCheck(response?.data['isTfaActivate'] ? true : false)
				setIsActivate(!response?.data['isTfaActivate'] ? 'Disable' : 'Enable')
			} catch(err) {
				console.log(err)
			}
		}
		fetching()
	}, [])


	return <>
			<Accordion elevation={0}
				style={{background: "rgb(240,240,240, 0.10)"}}
				onChange={(e,expanded) => {
					if(expanded) {
						props.setIsAccordion(true)
					} else {
						props.setIsAccordion(false)
					}
			}}>
				 <AccordionSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls="panel1a-content"
					id="panel1a-header"
				>
					<Typography
						fontSize={{
							xl: '0.9rem',
							lg: '0.7rem',
							md: '0.6rem',
							mmd: '0.7rem',
							sm: '0.7rem',
							xs: '0.7rem'
						}}
					>
						Two-Factor Authentification
					</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<FormControlLabel
						sx={{
							mr: 0,
							ml: 0,
							display:'flex',
							alignText: 'left'
						}}
						control={<Switch checked={check} onChange={handleChange}/>}
						label={
							<Typography
								fontFamily={'"system-ui", sans-serif'}
								fontSize={{
									xl: '1rem',
									lg: '0.9rem',
									md: '0.8rem',
									mmd: '0.8rem',
									sm: '0.8rem',
									xs: '0.8rem'
								}}
							>
								{isActivate}
							</Typography>
						}
					/>
				</AccordionDetails>
			</Accordion>
			<QRCodeComponent open={open} setOpen={setOpen} setCheck={setCheck} setIsActivate={setIsActivate}/>
	</>

}

export default TFAComponent;
