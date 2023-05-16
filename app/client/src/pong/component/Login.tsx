import {
	Divider,
	Box,
	Button,
	FormControl,
	Grid,
	TextField,
	Typography,
	Dialog,
	DialogTitle,
	DialogContent,
} from '@mui/material';
import React, {
	useRef,
	useEffect,
	useState,
} from 'react'
import { useNavigate } from "react-router-dom";
import { Oauth2 } from '../component/Oauth2';
import useAuth from '../context/useAuth';
import '../../App'
import '../page/LeadPage'

function isNumber(str: string) {
	return /^\d+$/.test(str);
}

function isNumberOrString(str: string) {
	return /^([0-9a-zA-Z_]){3,20}$/.test(str);
}

function isPassword(str: string) {
	return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(str);
}

type TFAProps = {
	open: boolean,
	setOpen: React.Dispatch<React.SetStateAction<boolean>>,
}

export const TFAComponent = (props: TFAProps) => {

	const navigate = useNavigate()

	const {error, setError, setUser, setId, twoFA} = useAuth();
	const [count, setCount] = useState(3)

	const handleClose = () => {
		props.setOpen(false)
		setError('')
		navigate('/login')
	}

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		setError('')
		if( e.target.value.length === 6 ) {

			if (!isNumber(e.target.value)) {
				setError('Error Authentification Code')
			} else {

				try {
					await twoFA(`http://${import.meta.env.VITE_SITE}/api/2fa/authenticate?twoFA=${e.target.value}`)
				} catch(err) {
					console.log(err)
				}

			}

		}
	}

	useEffect(() => {
		if (!count) {
			setUser('');
			setId(0);
			setError('');
			props.setOpen(false);
			setCount(count => 3)
			navigate('/login')
		}
	}, [count])

	useEffect(() => {
		if (error === 'Error Authentification Code')
			setCount(count => count - 1)
	}, [error])

	return <>
			<Dialog open={props.open} onClose={handleClose}
				 PaperProps={{
					style: {
						borderRadius: '32px',
						height: '15rem',
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
					<Typography component={'span'} variant='subtitle2' align="center">
						Two-Factor Authentication
					</Typography>
				</Box>
				<Divider variant='middle'/>
			</DialogTitle>
			<DialogContent>
				<Box
					display="flex"
					justifyContent="center"
					alignItems="center"
				>
					<Typography variant="body1"
						sx={{
							fontFamily: '"system-ui", sans-serif',
							fontSize: [15, '!important']
						}}
					>
						Enter your code...
					</Typography>
				</Box>
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
								}}
								helperText={
									error === '' || error === '2FA' ? null :
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
}


export const Login = () => {

	const {authLogin, authSignup, error, setError, navigate} = useAuth();
	const [open, setOpen] = useState(false)
	const username = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;
	const password = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		e.preventDefault()
		setError('')
	}

	const handleHome = (event: React.SyntheticEvent, navigate: (route: string) => void) => {
		event.preventDefault()
		navigate('/')
	};

	const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (!username.current.value
			|| !password.current.value
			|| !(username.current.value.length >= 3 && username.current.value.length <= 20)
			|| !isNumberOrString(username.current.value)
			|| !(password.current.value.length > 8 || password.current.value.length < 72)
			|| !isPassword(password.current.value)
		)
			await setError('invalid login or password')
		else
			await authLogin(username.current.value.toLowerCase(), password.current.value)
	}

	const handleSignup = (e: React.MouseEvent<HTMLButtonElement>, navigate: (route: string) => void) => {
		e.preventDefault()

		navigate('/signup')
	}

	useEffect(() => {
		if (error === '2FA') {
			setOpen(true)
		}
	}, [error])

	return <>
		<Box sx={{my: 'auto'}}>
			<Box sx={{width: '6.5rem'}}>
			<Typography
				className="homeButton"
				variant='h4'
				onClick={(event) => handleHome(event, navigate)}
			>
				Pong
			</Typography>
			</Box>
		</Box>
		<Divider variant='middle'/>
		<Grid container justifyContent="center" sx={{height: 600, pt: 15}}>

			<FormControl>
				<TextField
					type='text'
					inputRef={username}
					label="Login"
					onChange={handleChange}
					sx={{p: 1, mb: 1}}
				></TextField>
				<TextField
					type="password"
					id="outlined-password-input"
					inputRef={password}
					variant="outlined"
					label="Password"
					sx={{p: 1 }}
					onChange={handleChange}
				></TextField>

				<Button sx={{color: 'primary.main'}} onClick={handleLogin}>signin</Button>
				<Divider variant='middle'/>
				<Button
					sx={{
						color: 'primary.main'
					}}
					onClick={(event) => handleSignup(event, navigate)}
				>
					signup
				</Button>
				<Oauth2>Login via intra</Oauth2>
				{!error || error === '2FA' || error === 'Error Authentification Code'
					? null
					: <Typography align="center" color="tomato">{error}</Typography>
				}
			</FormControl>
		</Grid>
		<TFAComponent open={open} setOpen={setOpen} />
	</>

}

