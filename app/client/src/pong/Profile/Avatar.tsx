import Avatar from '@mui/material/Avatar';
import { Typography, Grid, IconButton } from '@mui/material';
import useAuth, {useFetchAuth} from '../context/useAuth';
import { FetchApi, refreshRequest } from '../component/FetchApi'
import React, { createRef} from "react";
import axios from 'axios';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

type AvatarProps = {
	image: string,
	setImage: React.Dispatch<React.SetStateAction<string>>,

}

const ProfileAvatar = (props: AvatarProps) => {

	const inputFileRef = createRef<HTMLInputElement>();

	const {token} = useAuth()
	const authFetching = useFetchAuth()

	const cleanup = () => {
		URL.revokeObjectURL(props.image);
		if (inputFileRef.current)
			inputFileRef.current.value = '';
	};



	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

		e.preventDefault()

		const newImage = e.target?.files?.[0];

		if (newImage) {

			if (props.image) {
				cleanup();
			}

			const file = new FormData();
			file.append("file", newImage)

			try {

				const result = await axios.post(

					`http://${import.meta.env.VITE_SITE}/api/users/profile/avatar/upload`,
					file,
					{
						withCredentials: true,
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': "multipart/form-data"
						}
					}
				)

				await props.setImage(URL.createObjectURL(newImage));

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

						`http://${import.meta.env.VITE_SITE}/api/users/profile/avatar/upload`,
						file,
						{
							withCredentials: true,
							headers: {
								Authorization: `Bearer ${refresh.data['aT']}`,
								'Content-Type': "multipart/form-data"
							}
						}
					)

					await props.setImage(URL.createObjectURL(newImage));
				} catch(err) {
					console.log(err)
				}
			}
		}
	}


	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (props.image) {
			event.preventDefault();

			FetchApi({
				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/users/profile/avatar/delete`,
					option: {
						method: "POST",
					},
					dataType: 'null',
				},
				auth: authFetching,
			})
			props.setImage('');
		}
	};

	return (
		<>
		<Grid container
			sx={{
				width: '10rem',
				height: '10rem',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
		<input
			ref={inputFileRef}
			accept="image/*"
			id="avatar-image-upload"
			type="file"
			onChange={handleChange}
			hidden
		/>
		<label htmlFor="avatar-image-upload">
			<IconButton component="span">
				<Avatar
					alt="avatar"
					src={props.image}
					sx={{
						display: 'flex',
						p: 0,
						border: 1,
						boxShadow: 24,
						width: '9rem',
						height: '9rem',
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
				right: 65,
				"&:hover": { boxShadow: 'none', }
			}}
			onClick={handleClick}
		>
			{props.image ? <DeleteOutlineIcon/> : null}
		</IconButton>
		</Grid>
		</>
	)
}

const NameAvatar = () => {

	const {user} = useAuth()

	return (
		<Typography noWrap
			fontSize={{
				xl: '2rem',
				lg: '1.5rem',
				md: '1.3rem',
				mmd: '1.2rem',
				sm: '1rem',
				xs: '1.5rem'
			}}
			style={{color: '#213547'}}
			sx={{
				maxWidth: '25vw;',
				'@media (max-width: 549px)': {
					maxWidth: '40vw;'
				}
			}}
		>
			{user}
		</Typography>
	)
}

const AvatarGrid = (props: AvatarProps) => {

	return <>
		<Grid item xl={5} md={6} xs={12}
			sx={{
				p: '1vw;',
//				border: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}
		}>
			<ProfileAvatar image={props.image} setImage={props.setImage} />
		</Grid>
		<Grid item xl={7} md={6} xs={12}
			sx={{
				p: '1vw;',
//				border: 1,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<NameAvatar />
		</Grid>
	</>

}

export default AvatarGrid;
