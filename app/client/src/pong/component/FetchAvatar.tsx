import Avatar from '@mui/material/Avatar';
import useAuth, { useFetchAuth } from '../context/useAuth';
import { FetchApi, refreshRequest } from '../component/FetchApi'
import { createRef, useState, useEffect } from "react";
import { Badge } from '@mui/material'
import { SxProps, styled } from '@mui/system';
import axios from 'axios';

type PropsAvatar = {
	avatar?: string,
	//displayStatus?: boolean,
	status?: string,
	sx: SxProps
}

const StyledBadgeGrey = styled(Badge)(({ theme }) => ({
	'& .MuiBadge-badge': {
		backgroundColor: 'lightgrey',
		color: 'lightgrey',
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
		'&::after': {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			borderRadius: '50%',
			content: '""',
		},
	},
	'@keyframes ripple': {
		'0%': {
			transform: 'scale(.8)',
			opacity: 1,
		},
		'100%': {
			transform: 'scale(2.4)',
			opacity: 0,
		},
	},
}));

const StyledBadgeRed = styled(Badge)(({ theme }) => ({
	'& .MuiBadge-badge': {
		backgroundColor: 'red',
		color: 'red',
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
		'&::after': {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			borderRadius: '50%',
			content: '""',
		},
	},
	'@keyframes ripple': {
		'0%': {
			transform: 'scale(.8)',
			opacity: 1,
		},
		'100%': {
			transform: 'scale(2.4)',
			opacity: 0,
		},
	},
}));

const StyledBadgeGreen = styled(Badge)(({ theme }) => ({
	'& .MuiBadge-badge': {
		backgroundColor: 'green',
		color: 'green',
		boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
		'&::after': {
			position: 'absolute',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			borderRadius: '50%',
			content: '""',
		},
	},
	'@keyframes ripple': {
		'0%': {
			transform: 'scale(.8)',
			opacity: 1,
		},
		'100%': {
			transform: 'scale(2.4)',
			opacity: 0,
		},
	},
}));

const FetchAvatar = (props: PropsAvatar) => {

	const [fetched, setFetched] = useState<boolean>(false)
	const [status, setStatus] = useState<string | undefined>(undefined)
	//const inputFileRef = createRef<HTMLInputElement>();
	const [image, setImage] = useState<string>('')
	const auth = useAuth()
	//const fetchAuth = useFetchAuth()

	useEffect(() => {
		setStatus(props.status)

	}, [props.status])


	useEffect(() => {

		async function fetching() {

			try {

				if (props.avatar) {

					const result = await axios.get(

						`http://${import.meta.env.VITE_SITE}/api/users/profile/avatar/download/${props.avatar}`,
						{
							withCredentials: true,
							responseType: 'blob',
							headers: {
								Authorization: `Bearer ${auth.token}`,
							}
						}
					)

					await setImage(await URL.createObjectURL(result.data))
				}
			} catch (err) {
				try {

					const refresh = await refreshRequest()

					if (refresh.response.status !== 200 && refresh.response.status !== 304) {
						auth.setToken('');
						auth.setUser('');
						auth.setId(0);
						auth.setIntraLogin('');
						auth.navigate('/login');
						return
					}

					auth.setToken(refresh.data['aT']);

					const result2 = await axios.get(

						`http://${import.meta.env.VITE_SITE}/api/users/profile/avatar/download/${props.avatar}`,
						{
							withCredentials: true,
							responseType: 'blob',
							headers: {
								Authorization: `Bearer ${refresh.data['aT']}`
							}
						}
					)

					await setImage(await URL.createObjectURL(result2.data))
				} catch (err) {
					console.log(err)
				}
			} finally {
				setFetched(true);
			}
		}
		fetching()

	}, [props.avatar])

	return <>
		{!fetched ?
			null
			:
			status === 'online' ?

				<StyledBadgeGreen
					overlap="circular"
					anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
					variant='dot'
				>
					<Avatar
						alt="other_avatar"
						src={image}
					/>
				</StyledBadgeGreen>
				: status === 'inGame' ?
					<StyledBadgeRed
						overlap="circular"
						anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
						variant='dot'
					>
						<Avatar
							alt="other_avatar"
							src={image}
						/>
					</StyledBadgeRed>
					: status === 'offline' ?
						<StyledBadgeGrey
							overlap="circular"
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							variant='dot'
						>
							<Avatar
								alt="other_avatar"
								src={image}
							/>
						</StyledBadgeGrey>
						:
						<Avatar
							alt="other_avatar"
							src={image}
							sx={props.sx}
						/>

		}
	</>

}
export default FetchAvatar;
