import { Button, IconButton, Box, TextField, Grid, Snackbar } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import CopyrightIcon from '@mui/icons-material/Copyright';
import { styled } from '@mui/system'
import { ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { User } from './Chat.types';
import useAuth, { useFetchAuth } from '../context/useAuth';
import { FetchApi } from '../component/FetchApi';
import FetchAvatar from '../component/FetchAvatar';
import { socket } from './Socket';
import { CurrencyExchangeTwoTone } from '@mui/icons-material';
import { ChatContext } from './Chat';

export enum UserListType {
	MEMBERS = 'members',
	BANNED = 'banned',
	CONTROL = 'control',
}

export const SettingsButtonWrapper = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '40px',
	width: '40px',
	borderRadius: '50%',
	marginRight: '2rem',
	backgroundColor: '#ffffff',
	flexShrink: 0,
	'&:hover': {
		backgroundColor: '#EDEDED',
	},
});

//--------------------members

export const UserListWrapper = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	width: '100%',
	backgroundColor: '#f2f2f2',
	boxSizing: 'border-box',
	height: '400px',
	overflowY: 'auto',
});

const UserListItemWrapper = styled('div')({
	padding: '8px 1rem',
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	height: '56px',
	borderRadius: '8px',
	cursor: 'pointer',

	'&:hover': {
		backgroundColor: '#EDEDED',
	},
});

const UserListItemAvatar = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '40px',
	width: '40px',
	borderRadius: '50%',
	marginRight: '1rem',
	backgroundColor: '#ffffff',
	flexShrink: 0
});

const UserListItemText = styled('div')({
	flexGrow: 1,
	width: '100%',
});

const IconButtonWrapper = styled(IconButton)({
	marginLeft: '1rem'
})

export const UserListItem = ({ user, id, currentRoom, setMembers, members, setBannedUsers, bannedUsers, setAdminMembers, adminMembers, setMutedMembers, mutedMembers }:
	{
		user: User,
		id: number,
		currentRoom: { id: number, name: string, ownerId: number },
		setMembers: (users: User[]) => void,
		members: User[],
		setBannedUsers: (users: User[]) => void,
		bannedUsers: User[],
		setAdminMembers: (users: User[]) => void,
		adminMembers: User[],
		setMutedMembers: (users: User[]) => void,
		mutedMembers: User[],

	}) => {

	if (id === user.id)
		return null

	const [isSendingRequest, setIsSendingRequest] = useState(false);
	const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
	const [alertMessage, setAlertMessage] = useState<string>('')

	const handleBanMemberClick = (member: User) => {
		setIsSendingRequest(true);

		const banData = {
			sender_id: id,
			room_id: currentRoom.id,
			room_name: currentRoom.name,
			user_id: member.id
		}

		socket.emit('banMember', banData, (data: any) => {
			if (data.error) {
				setIsAlertOpen(true)
				setAlertMessage(data.error)
			}
			else
				setMembers(members.filter(user => user.id !== member.id))
		})


		setIsSendingRequest(false);
	};

	const handleUpgradeMember = (member: User) => {
		setIsSendingRequest(true)

		const upgradeMemberData = {
			sender_id: id,
			room_id: currentRoom.id,
			user_id: member.id
		}

		socket.emit('upgradeMember', upgradeMemberData, (data: any) => {
			if (data.error) {
				setIsAlertOpen(true)
				setAlertMessage(data.error)
			}
			else
				setAdminMembers([...adminMembers, member])
		})


		setIsSendingRequest(false);
	}

	const handleDowngradeMember = (member: User) => {
		setIsSendingRequest(true)

		const upgradeMemberData = {
			sender_id: id,
			room_id: currentRoom.id,
			user_id: member.id
		}

		socket.emit('downgradeMember', upgradeMemberData, (data: any) => {
			if (data.error) {
				setIsAlertOpen(true)
				setAlertMessage(data.error)
			}
			else
				setAdminMembers(adminMembers.filter(admin => admin.id !== member.id))
		})


		setIsSendingRequest(false);
	}

	const handleKickMember = (member: User) => {
		const kickMemberData = {
			sender_id: id,
			room_id: currentRoom.id,
			user_id: member.id
		}

		socket.emit('kickMember', kickMemberData, (data: any) => {
			if (data.error) {
				setIsAlertOpen(true)
				setAlertMessage(data.error)
			}
			else
				setMembers(members.filter(user => user.id !== member.id))
		})

	}

	const handleMuteMember = (member: User) => {

		const muteMemberData = {
			sender_id: id,
			room_id: currentRoom.id,
			user_id: member.id
		}

		socket.emit('muteMember', muteMemberData, (data: any) => {
			if (data.error) {
				setIsAlertOpen(true)
				setAlertMessage(data.error)
			}
			else
				setMutedMembers([...mutedMembers, member])
		})

	}

	const handleUnmuteMember = (member: User) => {
		const unmuteMemberData = {
			sender_id: id,
			room_id: currentRoom.id,
			user_id: member.id
		}

	}

	return (
		<UserListItemWrapper>
			<UserListItemAvatar>
				<FetchAvatar avatar={user.avatar ? user.avatar : ''} sx={{ height: '100%', width: '100%' }} />
				{/*{user.id} {currentRoom.id}*/}
			</UserListItemAvatar>
			<UserListItemText>{user.login}</UserListItemText>

			{
				(id === currentRoom.ownerId || adminMembers.find(admin => admin.id === id)) ?

					(
						user.id !== currentRoom.ownerId ? (

							<Box sx={{ display: 'flex' }}>
								{
									id === currentRoom.ownerId ?
										(adminMembers.find(admin => admin.id === user.id) ?
											<IconButtonWrapper onClick={() => handleDowngradeMember(user)} disabled={isSendingRequest}>

												<StarIcon />
											</IconButtonWrapper>
											:
											<IconButtonWrapper onClick={() => handleUpgradeMember(user)} disabled={isSendingRequest}>

												<StarBorderIcon />
											</IconButtonWrapper>
										)
										:
										null

								}
								{
									mutedMembers.find(mutedMember => mutedMember.id === user.id) ?

										<IconButtonWrapper onClick={() => handleUnmuteMember(user)} disabled={isSendingRequest}>
											<VolumeOffIcon />
										</IconButtonWrapper>
										:
										<IconButtonWrapper onClick={() => handleMuteMember(user)} /* disabled={isSendingRequest} */>
											<VolumeUpIcon />
										</IconButtonWrapper>
								}
								<IconButtonWrapper onClick={() => handleBanMemberClick(user)} disabled={isSendingRequest}>
									<BlockIcon />
								</IconButtonWrapper>

								<IconButtonWrapper onClick={() => handleKickMember(user)} disabled={isSendingRequest}>
									<ExitToAppIcon />
								</IconButtonWrapper>
							</Box>
						)
							:
							<Box sx={{ display: 'flex' }}>
								<IconButtonWrapper>
									<CopyrightIcon />
								</IconButtonWrapper>
							</Box>


					)

					: (user.id === currentRoom.ownerId) ?
						<Box sx={{ display: 'flex' }}>
							<IconButtonWrapper>
								<CopyrightIcon />
							</IconButtonWrapper>
						</Box>
						: (adminMembers.find(admin => admin.id === user.id)) ?
							<Box sx={{ display: 'flex' }}>
								<IconButtonWrapper>
									<StarIcon />
								</IconButtonWrapper>
							</Box>
							:
							null


			}
			<Snackbar
				open={isAlertOpen}
				autoHideDuration={4000}
				onClose={() => { setIsAlertOpen(false), setAlertMessage('') }}
				message={alertMessage}
			/>
		</UserListItemWrapper>
	);
};

export const BannedUserListItem = ({ user, id, currentRoom, onClick }: { user: User, id: number, currentRoom: { id: number, name: string, ownerId: number }, onClick: (id: number) => void }) => {

	if (id === user.id)
		return null

	const [isSendingRequest, setIsSendingRequest] = useState(false);
	const handleBanMemberClick = (member: User) => {
		setIsSendingRequest(true);

		const banData = {
			sender_id: id,
			room_id: currentRoom.id,
			room_name: currentRoom.name,
			user_id: user.id
		}

		socket.emit('unbanMember', banData)

		onClick(user.id)

		setIsSendingRequest(false);
	};

	return (
		<UserListItemWrapper>
			<UserListItemAvatar>
				<FetchAvatar avatar={user.avatar ? user.avatar : ''} sx={{ height: '100%', width: '100%' }} />
			</UserListItemAvatar>
			<UserListItemText>{user.login}</UserListItemText>
			{
				<Box sx={{ display: 'flex' }}>
					<IconButtonWrapper onClick={() => handleBanMemberClick(user)} disabled={isSendingRequest}>
						<CheckCircleOutlineIcon />
					</IconButtonWrapper>
				</Box>

			}
		</UserListItemWrapper>
	);
};

//--------------------------roomPasswordControl

export const RoomPasswordControl = ({ currentRoom }: { currentRoom: { id: number, name: string, ownerId: number, isPublic: boolean } },) => {

	const { setCurrent } = useContext(ChatContext)
	const NewPassword = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;
	const CurrentPassword = useRef<HTMLInputElement>(null) as React.MutableRefObject<HTMLInputElement>;
	const [isPublic, setIsPublic] = useState(currentRoom.isPublic)
	const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
	const [alertMessage, setAlertMessage] = useState<string>('')

	const auth = useFetchAuth()

	const onChangePasswordClick = () => {

		const changeRoomPasswordRequest = {
			api: {
				input: `http://${import.meta.env.VITE_SITE}/api/rooms/${currentRoom.id}/changePassword/${CurrentPassword.current.value}/${NewPassword.current.value}`,
				option: {
					method: 'PATCH',
				}
			},
			auth: auth
		}

		FetchApi(changeRoomPasswordRequest).then(response => response?.data)
			.then(data => {
				if (data.error) {
					setIsAlertOpen(true)
					setAlertMessage(data.error)
				}
				else {
					setIsAlertOpen(true)
					setAlertMessage('password change successfully')
				}
				NewPassword.current.value = ''
				CurrentPassword.current.value = ''
			})
	}

	const onGoPublicClick = () => {

		const goPublicRequest = {
			api: {
				input: `http://${import.meta.env.VITE_SITE}/api/rooms/${currentRoom.id}/goPublic`,
				option: {
					method: 'PATCH'
				}
			},
			auth: auth
		}
		FetchApi(goPublicRequest).then(() => setIsPublic(true))
		setCurrent({ ...currentRoom, isPublic: true })
		NewPassword.current.value = ''
		CurrentPassword.current.value = ''

	}

	const onAddPasswordClick = () => {

		if (!NewPassword.current)
			return

		const addRoomPasswordRequest = {
			api: {
				input: `http://${import.meta.env.VITE_SITE}/api/rooms/${currentRoom.id}/addPassword/${NewPassword.current.value}`,
				option: {
					method: "PATCH"
				}
			},
			auth: auth
		}
		FetchApi(addRoomPasswordRequest).then(() => setIsPublic(false))
		setCurrent({ ...currentRoom, isPublic: false })
		NewPassword.current.value = ''
	}

	return (
		isPublic ?
			<Grid sx={{ display: 'flex', flexDirection: 'column', p: '1rem', m: '1rem' }}>
				<TextField inputRef={NewPassword} sx={{m: '1rem 0'}} label='enter a password'></TextField>
				<Button onClick={onAddPasswordClick} sx={{ borderRadius: '20px', backgroundColor: 'lightgrey', margin: '0.5rem', p: '0.5rem'}}>add password</Button>
			</Grid>
			:
			<Grid sx={{ display: 'flex', flexDirection: 'column', p: '1rem', m: '1rem' }}>
				<TextField inputRef={CurrentPassword} label='current password'></TextField>
				<TextField inputRef={NewPassword} label='new password' sx={{m: '1rem 0'}}></TextField>
				<Button onClick={onChangePasswordClick} sx={{ borderRadius: '20px', backgroundColor: 'lightgrey', margin: '0.5rem', p: '0.5rem'}}>change password</Button>
				<Button onClick={onGoPublicClick} sx={{ borderRadius: '20px', backgroundColor: 'lightgrey', margin: '0.5rem', p: '0.5rem'}}>go public</Button>
				<Snackbar
					open={isAlertOpen}
					autoHideDuration={4000}
					onClose={() => { setIsAlertOpen(false), setAlertMessage('') }}
					message={alertMessage}
				/>
			</Grid>
	)
}