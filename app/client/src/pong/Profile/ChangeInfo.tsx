import {
	Box,
	Grid,
	Typography,
	FormControl,
	TextField,
	Button,
} from '@mui/material'
import useMediaQuery from "../hooks/useMediaQuery"
import { useState, useRef } from 'react'
import * as React from 'react';
import { FetchApi} from '../component/FetchApi'
import useAuth, { useFetchAuth } from '../context/useAuth'

function isNumberOrString(str: string) {
	return /^([0-9a-zA-Z_]){3,20}$/.test(str);
}

function isPassword(str: string) {
	return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(str);
}

type InfoProps = {
	isAccordion: boolean,
	setIsAccordion: React.Dispatch<React.SetStateAction<boolean>>,
}

const ChangeInfo = (props: InfoProps) => {

	const fetchAuth = useFetchAuth()
	const {user, intraLogin} = useAuth()

	const [error, setError] = useState('');
	const [loginError, setLoginError] = useState('');
	const isQuery950 = useMediaQuery('(max-width: 950px)')

	const login = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;
	const password = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;
	const passwordConfirm = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		e.preventDefault()
		setLoginError('')
		setError('')
	}

	const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (login.current.value === ''
			|| login.current.value.toLowerCase() === user) {
			setLoginError('')
		} else if (login.current.value.length < 3 || login.current.value.length > 20) {
			setLoginError('Login must contain at least between 3 and 20 characters')
		} else if (!isNumberOrString(login.current.value)) {
			setLoginError('Login must contain just letters, numbers or underscores')
		} else {
			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/auth/profile/login`,
					option: {
						method: 'POST',
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							login: login.current.value.toLowerCase(),
						}),
					}
				},
				auth: fetchAuth,
			})
			if (response?.response.status === 201) {
				fetchAuth.setUser(login.current.value.toLowerCase())
				fetchAuth.setToken(response?.data['aT'])
				login.current.value = '';
				setLoginError('Login Modified')
			} else {
				setLoginError('Login Unvailable')
			}
		}
	}

	const handlePassword = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()
		if (password.current.value === '' || passwordConfirm.current.value === '') {
			setError('')
		} else if ( password.current.value !== passwordConfirm.current.value ) {
			setError('Passwords are different')
		} else if ( password.current.value.length < 8
			|| password.current.value.length > 72 ) {
			setError('Password must contain at least between 8 and 72 characters')
		} else if (!isPassword(password.current.value)) {
			setError('Password must contain at least one uppercase, one lowercase, one number and one special character')
		} else {
			const response = await FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/users/profile/pass`,
					option: {
						method: 'POST',
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							password: password.current.value,
						}),
					}
				},
				auth: fetchAuth,
			})
			if (response?.response.status === 201) {
				password.current.value = '';
				passwordConfirm.current.value = '';
				setError('Password Modified');
			}
		}
	}

	return <>
			<Grid container>
			<Grid item md={6} xs={12} display='grid' justifyContent="center">
			<FormControl>
			<Box display={props.isAccordion && isQuery950 ? 'flex' : 'grid'}
				justifyContent='center'
				sx={ isQuery950 && props.isAccordion ?
					{ '@media (max-width: 950px)': { pt: 0.5 }, justifyContent:'center' } :
					{ '@media (max-width: 950px)': { pt: 0.5 }, justifyContent:'center' }
				}
			>
					<TextField
						type="text"
						id="outlined-login-input"
						inputRef={login}
						variant="outlined"
						label="New Login"
						size={ isQuery950 && props.isAccordion ? "small" : "medium" }
						onChange={handleChange}
/*						inputProps={{
							style: {
								fontFamily: '"system-ui", sans-serif'
							}
						}}*/
						sx={{m: 1 }}
						helperText={
							<Typography variant='caption' align="center"
								sx={ props.isAccordion ? {
									fontFamily: '"system-ui", sans-serif',
									fontSize: [9, '!important'],
									'@media (max-width: 700px)': {
										display: 'none'
									}} : {
										fontFamily: '"system-ui", sans-serif',
										fontSize: [9, '!important'],
									}
								}
							>
								{ isQuery950 && props.isAccordion ?
									"It will be use as login and username" :
									"It will be use as login and username"
								}
							</Typography>
						}
					></TextField>
					<Button 
					variant='text'
						size={ isQuery950 && props.isAccordion ? "small" : "medium" }
						sx={{ color: 'primary.main',
							mt: -0.4,
							'@media (max-width: 950px)': {
								mt: 0,
								pt: 0,
								p: 0
							},
						 }}
						onClick={handleLogin}
					>
						change login
					</Button>
				</Box>
			</FormControl>
					{ loginError === '' ?
						null :
						<>
						{ loginError === 'Login Modified' ?
							<Typography variant='caption' align="center" style={{color:"#229954"}}
								sx={{
									//				fontFamily: '"system-ui", sans-serif',
									fontSize: [9, '!important']
								}}
							>
								{loginError}
							</Typography> :
							<Typography variant='caption' align="center" color="tomato"
								sx={{
									//				fontFamily: '"system-ui", sans-serif',
									fontSize: [9, '!important']
								}}
							>
								{loginError}
							</Typography>
						}
						</>
					}
			</Grid>
			<Grid item md={6} xs={0}
				sx={
					{ '@media (max-width: 950px)': { display: 'none' }, justifyContent:'center' }
				}
			>
				<FormControl>
					<TextField
						type='text'
						id="outlined-password-input"
						inputRef={password}
						disabled={intraLogin ? true : false}
						variant="outlined" 
						label="New Password"
						size="small"
						onChange={handleChange}
						inputProps={{
							style: {
								fontFamily: '"system-ui", sans-serif'
							}
						}}
						sx={{m: 1 }}
					></TextField>
					<TextField
						type='text'
						id="outlined-password-input"
						inputRef={passwordConfirm}
						disabled={intraLogin ? true : false}
						variant="outlined"
						label="Confirm Password"
						size="small"
						onChange={handleChange}
						inputProps={{
							style: {
								fontFamily: '"system-ui", sans-serif'
							}
						}}
						sx={{m: 1 }}
					></TextField>
					<Button size="small"
						disabled={intraLogin ? true : false}
						sx={{ color: 'primary.main',
							'@media (max-width: 950px)': {
								p: 0
							},
						 }}
						onClick={handlePassword}>change password
					</Button>
				{ error === '' ?
					null :
					<>
					{ error === 'Password Modified' ?
						<Typography variant='caption' align="center" style={{color:"#229954"}}
							sx={{
								//				fontFamily: '"system-ui", sans-serif',
								fontSize: [9, '!important']
							}}
						>
							{error}
						</Typography> :
						<Typography variant='caption' align="center" color="tomato"
							sx={{
								//				fontFamily: '"system-ui", sans-serif',
								fontSize: [9, '!important']
							}}
						>
							{error}
						</Typography>
					}
					</>
				}
				</FormControl>
			</Grid>
		</Grid>
	</>
}

export default ChangeInfo;
