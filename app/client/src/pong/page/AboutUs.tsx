import { Typography, Box, Grid, Avatar, Divider } from '@mui/material'
import useAuth from '../context/useAuth';

const avatarSx = {
	width: '17rem',
	height: '17rem',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	'@media (max-width: 1100px)': {
		width: '14rem',
		height: '14rem',
	},
	'@media (max-width: 750px)': {
		width: '10rem',
		height: '10rem',
	},
	'@media (max-width: 650px)': {
		width: '9rem',
		height: '9rem',
	},
	'&:hover': {
		zIndex: 10,
	}
}

const bodySx = {
	fontSize: 15,
	fontFamily: '"system-ui", sans-serif',
	color: "#000000",
	maxWidth: '1000px',
	px: 4,
	mb: 2,
}

const AboutUs = () => {

	const {navigate} = useAuth();

	const handleHome = (event: React.SyntheticEvent) => {
		event.preventDefault()
		navigate('/')
	};

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
		<Grid container justifyContent="center" sx={{
				height: 600,
				pt: 5,
				px: '13rem',
				'@media (max-width: 1100px)': {
					height: 500,
					px: '5rem'
				},
			}}
		>
			<Grid container display="flex" justifyContent="center" alignItems="center">
				<Typography variant="h3"
					sx={{
						'@media (max-width: 550px)': {
							fontSize: 40,
						}
					}}
				>
					About us
				</Typography>
			</Grid>
			<Grid item display="flex" xs={12}>
				<Grid item xs={4} display="flex" justifyContent="center">
					<Avatar
						alt="sacha"
					src="./slahlou.JPG"
						sx={avatarSx}
					/>
				</Grid>
				<Grid item xs={4} display="flex" justifyContent="center">
					<Avatar
						alt="augustin"
						src="./alorain.jpeg"
						sx={avatarSx}
					/>
				</Grid>
				<Grid item xs={4} display="flex" justifyContent="center">
					<Avatar
						alt="amir"
						src="./amahla.JPG"
						sx={avatarSx}
					/>
				</Grid>
			</Grid>
		</Grid>	
		<Grid display="grid" justifyContent="center">
			<Typography variant="body1"
				sx={bodySx}
			>
				&nbsp;&nbsp;&nbsp;&nbsp;Welcome to the Mighty Pong Contest website!
				Our mission, Sacha Lahlou, Augustin Lorain, and Amir Mahla,
				all students at 42 school in Paris, is to bring you
				an exciting online gaming experience with real-time
				multiplayer games and a friendly community of players.
			</Typography>
			<Typography variant="body1"
				sx={bodySx}
			>
				&nbsp;&nbsp;&nbsp;&nbsp;Our website is designed with the
				latest technology, ensuringa smooth and enjoyable user
				experience. Our frontend framework of choice is React written
				in TypeScript, while our backend is powered by NestJS.
				We utilize a PostgreSQL database to ensure the stability and
				reliability of our system. Additionally, to ensure the highest
				level of security, we have implemented a complete OAuth2.0
				authentication system.
			</Typography>
			<Typography variant="body1"
				sx={bodySx}
			>
				&nbsp;&nbsp;&nbsp;&nbsp;To create an account on our site,
				users can log in through the OAuth system of 42 intranet or
				use our signup form. Once logged in, they can choose a
				unique name, upload an avatar, and even enable two-factor
				authentication for added security.
			</Typography>
			<Typography variant="body1"
				sx={bodySx}
			>
				&nbsp;&nbsp;&nbsp;&nbsp;In addition to playing Pong with other
				players, our site features a chat system that allows users to
				create channels, send direct messages, and even invite others
				to play games through the chat interface.
			</Typography>
			<Typography variant="body1"
				sx={bodySx}
			>
				&nbsp;&nbsp;&nbsp;&nbsp;Our Pong game is designed to be faithful
				to the original 1972 version, with the option for customization
				such as power-ups and so forth... We have a matchmaking system
				in place so that users can join a queue and be automatically
				matched with another player.
			</Typography>
			<Typography variant="body1"
				sx={bodySx}
			>
				&nbsp;&nbsp;&nbsp;&nbsp;We take security very seriously on our
				website and ensure that all user input is validated on the
				server side to protect against SQL injections. We also maintain
				user stats, such as wins and losses, ladder level, and
				achievements, which are displayed on their profile for other
				users to see.
			</Typography>
			<Typography variant="body1"
				sx={bodySx}
			>
				&nbsp;&nbsp;&nbsp;&nbsp;You can contact us through the form on
				our website. We are excited to bring you the Mighty Pong Contest
				website and hope you enjoy your gaming experience with us.
				Thank you for visiting, and we look forward to seeing you
				on the leaderboards!
			</Typography>
			</Grid>
		</>
}

export default AboutUs;

