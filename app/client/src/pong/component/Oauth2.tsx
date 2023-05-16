import {
	Divider,
	Box,
	Button,
	Grid,
	Typography,
	IconButton,
	Avatar,
	TextField,
	FormControl,
	CircularProgress,
} from '@mui/material'
import Snackbar from '@mui/material/Snackbar';
import { useLocation } from 'react-router-dom'
import React, { useCallback, useRef, createRef, useState, useEffect } from 'react'
import useAuth from '../context/useAuth'
import { TFAComponent } from '../component/Login'
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"

function isNumberOrString(str: string) {
	return /^([0-9a-zA-Z_]){3,20}$/.test(str);
}

type Props = {
	children?: string
}

export const Oauth2 = (props: Props) => {

	const handleClick = useCallback( async () => {

		let intraUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=';
		intraUrl += `${import.meta.env.VITE_API_UID}`;
		intraUrl += '&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2F';
		intraUrl += 'redirect&response_type=code'

		fetch(intraUrl, {redirect: "manual"})
		.then(response => location.replace(response.url))
	}, [])

	return (
		<Button sx={{color: 'primary.main'}} onClick={handleClick}>{props.children}</Button>
	)
}

const IntraSignup = () => {

	const {intraLogin, authSignupIntra, loading} = useAuth()
	const [error, setError] = useState('')
	const [isAlertOpen, setIsAlertOpen] = useState(false)
	const [file, setFile] = useState<any>(null);
	const [image, setImage] = useState<string>('');
	const inputFileRef = createRef<HTMLInputElement>();
	const login = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>

	const cleanup = () => {
		URL.revokeObjectURL(image);
		if (inputFileRef.current)
			inputFileRef.current.value = '';
	};

	const handleChangeInputLogin = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		setError('')
	}

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()

		await setFile(e.target?.files?.[0])

		if (e.target?.files?.[0]) {

			if (image) {
				cleanup();
			}
			await setImage(URL.createObjectURL(e.target?.files?.[0]));
		}
	}

	const handleAvatarDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (image) {
			event.preventDefault();
			setImage('');
			setFile(null)
		}
	}

	const handleIntraLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {

		e.preventDefault()
		if (login.current.value === '') {
			setError("Invalid login");
			return
		} else if (login.current.value.length < 3
			|| login.current.value.length > 20) {
			setError('Login must contain at least between 3 and 20 characters')
			return
		} else if (!isNumberOrString(login.current.value)) {
			setError('Login must contain just letters, numbers or underscores')
			return
		}
		await setError(await authSignupIntra(
			`http://${import.meta.env.VITE_SITE}/api/auth/intra42?login=${login.current.value.toLowerCase()}&intraLogin=${intraLogin}`,
			file
		))
	}

	useEffect(() => {
		if (error !== '')
			setIsAlertOpen(true)
	}, [error])



	return	<>
		<FormControl>
			<Box display="flex" justifyContent="center" alignItems="center"
				sx={{mb: 6}}
			>
			<Grid container
				sx={{
					width: '11rem',
					height: '11rem',
					alignItems: 'center',
					justifyContent: 'center'
				}}
			>
			<input
				ref={inputFileRef}
				accept="image/*"
				id="avatar-image-upload"
				type="file"
				onChange={handleAvatarChange}
				hidden
			/>
			<label htmlFor="avatar-image-upload">
				<IconButton component="span">
					<Avatar
						alt="avatar"
						src={image}
						sx={{
							display: 'flex',
							p: 0,
							border: 1,
							boxShadow: 24,
							width: '11rem',
							height: '11rem',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					/>
				</IconButton>
			</label>
			<IconButton
				size='small'
				sx={{
					position: 'relative',
					bottom: 35,
					right: 80,
					"&:hover": { boxShadow: 'none', }
				}}
				onClick={handleAvatarDelete}
			>
				{image ? <DeleteOutlineIcon/> : null}
			</IconButton>
			</Grid>
			</Box>

			<TextField type="text" inputRef={login} label="Login"
				sx={{
					width: '13rem'
				}}
				onChange={handleChangeInputLogin}
			/>
			<Button sx={{color: 'primary.main'}} onClick={handleIntraLogin}>signin</Button>
		</FormControl>
		<Snackbar
			open={isAlertOpen}
			autoHideDuration={4000}
			onClose={() => { setIsAlertOpen(false), setError('') }}
			message={error}
		/>
		</>
}

export const Redirect = () => {

	const url = useLocation()
	const {authLogIntra, setIntraLogin, error, setError, navigate} = useAuth()
	const [status, setStatus] = useState('')
	const [fetched, setFetched] = useState(false)
	const [open, setOpen] = useState(true)
	const [isSignup, setIsSignup] = useState(false)

	useEffect(() => {
		async function fetching() {
			await setStatus(await authLogIntra(`http://${import.meta.env.VITE_SITE}/api/auth/intra42/login${url.search}`))
			setFetched(true)
		}
		fetching()
		return undefined
	}, [])

	const handleHome = (event: React.SyntheticEvent) => {
		event.preventDefault()
		setIntraLogin('')
		navigate('/')
	};

	return (
		<>
		<Box sx={{ my: 'auto' }}>
			<Box sx={{width: '6.5rem'}}>
			<Typography
				className="homeButton"
				variant='h4'
				onClick={handleHome}
			>
				Pong
			</Typography>
			</Box>
		</Box>
		<Divider variant='middle'/>
		<Grid container justifyContent="center" sx={{pt: 10}}>
			{fetched && (status === '2FA' || status === 'else')
				? ( <>	
					{ status === '2FA' ? <TFAComponent open={open} setOpen={setOpen} /> : <IntraSignup /> }
					</> )
				: (
					<Box>
						<CircularProgress/> 
					</Box>
				)
			}
		</Grid>
		</>
	)
}
