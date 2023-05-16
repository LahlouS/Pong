import {
	Typography,
	Box,
	Grid,
	Divider,
	FormControl,
	TextField,
	Button,
} from '@mui/material'
import useAuth from '../context/useAuth';
import React, {
	useRef,
	useState,
} from 'react'
import emailjs from "@emailjs/browser";

function isEmail(str: string) {
	return /^(?=.*@)(?=.*\.)/.test(str);
}

const Contact = () => {

	const [error, setError] = useState('');
	const [textError, setTextError] = useState('');
	const [subError, setSubError] = useState('');
	const [validate, setValidate] = useState(false)
	const {navigate} = useAuth();
	const form = useRef<HTMLFormElement | null>(null);

		const handleHome = (event: React.SyntheticEvent) => {
		event.preventDefault();
		navigate('/');
	};

	const handleChange = (e: React.FormEvent) => {
		e.preventDefault()
		setError('')
		setTextError('')
		setSubError('')
		setValidate(false)
	}


	const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		if (!form.current)
			return

		if (!form.current.email.value
			|| !isEmail(form.current.email.value) ) {
				setError("Invalid email");
				return;
			} else if (!form.current.subject.value) {
				setSubError('Please, enter a subject')
				return;
			} else if (!form.current.message.value) {
				setTextError('Please, complete your request')
				return;
			}
			emailjs.sendForm(
				import.meta.env.VITE_EMAILJS_ID,
				import.meta.env.VITE_EMAILJS_TEMPLATE,
				form.current,
				import.meta.env.VITE_EMAILJS_PUB_KEY
			).then(
				(result) => {
					setValidate(true)
				},
			);
			form.current.email.value = null;
			form.current.subject.value = null;
			form.current.message.value = null;
	}

	return <>
		<Box sx={{my: 'auto'}}>
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
		<Grid container justifyContent="center" sx={{height: 600, pt: 5, px: '13rem'}}>

			<Grid
				container
				display="flex"
				justifyContent="center"
				alignItems="center"
			>
				<Typography
					variant="h4"
				>
					Contact us
				</Typography>
			</Grid>

			<form ref={form}>
			<FormControl>

				<TextField
					type='text'
					label="e-mail"
					name="email"
					onChange={handleChange}
					sx={{mb: 5, width: '20rem'}}
					inputProps={{
						style: {
							fontFamily: '"system-ui", sans-serif'
						}
					}}
					helperText={ error === '' ?
						null :
						<Typography variant='caption' align="center" color="tomato"
							sx={{
								fontFamily: '"system-ui", sans-serif',
								fontSize: [10, '!important']
							}}
						>
							{error}
						</Typography>
					}
				></TextField>

				<TextField
					type='text'
					name="subject"
					label="subject"
					onChange={handleChange}
					sx={{mb: 2, width: '20rem'}}
					inputProps={{
						style: {
							fontFamily: '"system-ui", sans-serif'
						}
					}}
					helperText={ subError === '' ?
						null :
						<Typography variant='caption' align="center" color="tomato"
							sx={{
								fontFamily: '"system-ui", sans-serif',
								fontSize: [10, '!important']
							}}
						>
							{subError}
						</Typography>
					}
				></TextField>

				<TextField
					type='text'
					name="message"
					label="your request"
					onChange={handleChange}
					sx={{mb: 3, width: '20rem'}}
					multiline
					rows={4}
					inputProps={{
						style: {
							fontFamily: '"system-ui", sans-serif'
						}
					}}
					helperText={ textError === '' ?
						null :
						<Typography variant='caption' align="center" color="tomato"
							sx={{
								fontFamily: '"system-ui", sans-serif',
								fontSize: [10, '!important']
							}}
						>
							{textError}
						</Typography>
					}
				></TextField>


				<Button sx={{color: 'primary.main'}} onClick={handleSubmit}>
					submit
				</Button>

				{validate ?
					<Typography variant='caption' align="center" style={{color:"#229954"}}
						sx={{
							//				fontFamily: '"system-ui", sans-serif',
							fontSize: [10, '!important']
						}}
					>
						Request sent !
					</Typography>
					: null
				}
			</FormControl>
			</form>
		</Grid>
	</>

}
export default Contact;
