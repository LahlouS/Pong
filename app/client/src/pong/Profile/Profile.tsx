import { Grid } from '@mui/material'
import { useEffect, useState } from 'react'
import '../page/LeadPage.css'
import AvatarGrid from '../Profile/Avatar'
import UserPanelGrid from '../Profile/UserPanel'
import useAuth, { useFetchAuth } from '../context/useAuth'
import { FetchApi, Api } from '../component/FetchApi'
import {
	ThemeProvider,
	createTheme,
	CircularProgress,
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import GameInfo, {Level} from '../Profile/GameInfo'


const theme = createTheme({
	typography: {
		fontFamily: 'pong-policy'
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 550,
			md: 951,
			lg: 1200,
			xl: 1536,
		},
	},
	palette: {
		primary: {
			main: 'rgba(21, 35, 47, 0.87)'
		}
	}
})

export function findLevel(xpMax: number) {

	let level = 0;
	let xp = 0;

	while (xp < xpMax) {
		xp += level * 50;
		level++;
	}

	if (xp == xpMax) {
		xp = 0;
	} else {
		level--;
		xp = ((xpMax - xp) / level) + 100
	}

	return {
		level: level,
		xp: xp,
	}

}

const Profile = () => {

	const navigate = useNavigate();
	const {token} = useAuth();
	const [image, setImage] = useState<string>('');
	const [fetched, setFetched] = useState(false);
	const [victory, setVictory] = useState(0);
	const [defeat, setDefeat] = useState(0);
	const [level, setLevel] = useState<Level>({} as Level)


	const fetchType: Api = {
		api: {
			input: `http://${import.meta.env.VITE_SITE}/api/users/profile/info`,
			option: {
				method: "GET",
			},
		},
		auth: useFetchAuth(),
	}




	useEffect(() => {
		async function fetching() {

			try {

				const response = await FetchApi(fetchType);
				if (response?.response.status === 200 || response?.response.status === 304) {

					if (response?.data['avatar'] !== null) {

						const result = await axios.get(

							`http://${import.meta.env.VITE_SITE}/api/users/profile/avatar`,
								{
								withCredentials: true,
								responseType: 'blob',
								headers: {
									Authorization: `Bearer ${response?.token}`,
								}
							}
						)

						if (result.status !== 204) {
							await setImage(await URL.createObjectURL(result.data))
						}
					}




					setLevel(findLevel(response.data['nbWin'] * 100 + response.data['nbLoss'] * 25))
					setVictory(response.data['nbWin'])
					setDefeat(response.data['nbLoss'])

				} else {
					navigate('/login')
				}
			} catch(err) {
				console.log(err)
			} finally {
				setFetched(true);
			}

		}
		fetching()
		return undefined
	}, [])



	return <>
	{ !fetched ? <CircularProgress/> :
		<ThemeProvider theme={theme}>
			<Grid item sm={5} xs={12}
				sx={{
					position: 'relative',
					top: '1rem',
					height: '12rem',
					p: '1vw;',
//					border: 1,
					display: 'flex',
					'@media (max-width: 950px)': {
						p: 0,
						display: 'grid',
						height: '15rem',
						alignItems: 'center',
						justifyContent: 'center',
						width: '100%'
					},
				}
			}>
				<AvatarGrid image={image} setImage={setImage} />
			</Grid>
			<Grid item sm={5} xs={0}
				sx={{
					position: 'relative',
					top: '1rem',
					height: '12rem',
					py: '1vw;',
//					px: '2vw;',
//					border: 1,
					display: 'flex',
					'@media (max-width: 950px)': {
						py: '0.5vw;',
						display: 'block',
						height: '15rem',
						alignItems: 'center',
						justifyContent: 'center',
						width: '100%'
					},
					'@media (max-width: 549px)': {
						display: 'none',
					}
				}
			}>
				<UserPanelGrid />
			</Grid>
			<GameInfo defeat={defeat} victory={victory} level={level}/>
		</ThemeProvider>
		}
	</>
}
export default Profile;
