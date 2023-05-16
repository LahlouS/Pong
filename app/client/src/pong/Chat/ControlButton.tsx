import React, { useContext, useEffect, useState } from 'react'
import { BannedUserListItem, RoomPasswordControl, SettingsButtonWrapper, UserListItem, UserListType, UserListWrapper } from './ControlButtonUtils'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Grid } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { ChatContext } from './Chat';
import { FetchApi } from '../component/FetchApi';
import useAuth, { useFetchAuth } from '../context/useAuth';
import { User } from './Chat.types';
import { socket } from './Socket';
import { JoinQueuButtonChat } from './CreateGame';
import { GridProfile } from '../Profile/SearchPlayers'

export function SettingsButtton() {

	const { current, target, setTarget } = useContext(ChatContext)
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false)
	const [isInviteGameOpen, setIsInviteGameOpen] = useState<boolean>(false)
	const [members, setMembers] = useState<User[]>([])
	const [bannedUsers, setBannedUsers] = useState<User[]>([])
	const [adminMembers, setAdminMembers] = useState<User[]>([])
	const [mutedMembers, setMutedMembers] = useState<User[]>([])
	const [displayList, setDisplayList] = useState<UserListType>(UserListType.MEMBERS)
	const { user, id } = useAuth()
	const auth = useFetchAuth()

	useEffect(() => {

		if (displayList !== UserListType.BANNED)
			return

		const getBannedUsers = async () => {

			const getBannedUsersRequest = {

				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/rooms/${current.id}/bans`
				},
				auth: auth
			}

			const response = await FetchApi(getBannedUsersRequest)

			return response?.data
		}

		getBannedUsers().then(data => setBannedUsers(data))
	}, [displayList, isSettingsOpen])

	useEffect(() => {

		if (displayList === UserListType.BANNED)
			return

		const getMembers = async () => {
			const getMembersRequest = {

				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/rooms/${current.id}/members`
				},
				auth: auth
			}

			const response = await FetchApi(getMembersRequest)

			return response?.data
		}

		getMembers().then(data => setMembers(data))

	}, [displayList, isSettingsOpen])

	useEffect(() => {
		const getAdmins = async () => {
			const getAdminMembersRequest = {

				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/rooms/${current.id}/admins`
				},
				auth: auth
			}

			const response = await FetchApi(getAdminMembersRequest)

			return response?.data
		}

		getAdmins().then(data => setAdminMembers(data))
	}, [displayList, isSettingsOpen])

	useEffect(() => {
		if (displayList !== UserListType.MEMBERS) {
			return
		}

		const getMuteds = async () => {
			const getMutedMembersRequest = {

				api: {
					input: `http://${import.meta.env.VITE_SITE}/api/rooms/${current.id}/muted`
				},
				auth: auth
			}
			const response = await FetchApi(getMutedMembersRequest)

			return response?.data
		}

		getMuteds().then(data => setMutedMembers(data))
	}, [displayList, isSettingsOpen])

	const handleSettingsButtonClick = () => {
		setIsSettingsOpen(true)
	}

	const handleSettingsButtonClose = () => {
		setIsSettingsOpen(false)
	}

	const handleUnbanMember = (bannedUserId: number) => {

		setBannedUsers(bannedUsers.filter(user => user.id !== bannedUserId))
	}

	const handleLeaveRoom = () => {

		const leaveRoomData = {
			room_id: current.id,
			room_name: current.name,
			user_id: id,
			user_login: user,
		}

		socket.emit('leaveRoom', leaveRoomData)
	}

	const handleRemoveFromFriend = () => {
		const RemoveFriendData = {
			sender_id: id,
			user_id: target.id,
		}

		socket.emit('removeFriend', RemoveFriendData)

	}

	const handleBlockUser = () => {

		const BlockUserData = {
			sender_id: id,
			user_id: target.id,
		}

		socket.emit('blockUser', BlockUserData)

		setTarget({ id: 0, login: '', avatar: '' })
	}


	const handleInviteGameButtonClick = () => {
		setIsInviteGameOpen(true)
	}

	return (
		<div>
			<Box sx={{ display: 'flex' }}>
				{
					target.id !== 0 ?
						<SettingsButtonWrapper onClick={handleInviteGameButtonClick} >
							<SportsEsportsIcon />
						</SettingsButtonWrapper>
						:
						null

				}
				<SettingsButtonWrapper onClick={handleSettingsButtonClick} >
					{
						target.id !== 0 ?
							<ManageAccountsIcon />
							:
							current.id !== 0 ?
								<SettingsIcon />
								:
								null
					}
				</SettingsButtonWrapper>

			</Box>
			<Dialog open={isSettingsOpen} onClose={handleSettingsButtonClose}
				fullWidth
				maxWidth="xs"
				PaperProps={{
					style: {
						borderRadius: '32px',
						width: '50rem',
						minHeight: '10rem'
					}
				}}
			>
				{
					current.id !== 0 ?
						<div>
							<DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
								settings
								<Button sx={{ borderRadius: '20px' }} onClick={handleLeaveRoom}>Leave Room</Button>
							</DialogTitle>
							<Box width="100%" display="flex">
								<Button sx={{ backgroundColor: (displayList === UserListType.MEMBERS) ? '#f2f2f2' : 'transparent', flex: '1', borderRadius: 0 }} onClick={() => setDisplayList(UserListType.MEMBERS)}>Members</Button>
								{
									id === current.ownerId || adminMembers.find(admin => admin.id === id) ?

										<Button sx={{ backgroundColor: (displayList === UserListType.BANNED) ? '#f2f2f2' : 'transparent', flex: '1', borderRadius: 0 }} onClick={() => setDisplayList(UserListType.BANNED)}>Banned</Button>
										:
										null

								}
								{
									id === current.ownerId ?
										<Button sx={{ backgroundColor: (displayList === UserListType.CONTROL) ? '#f2f2f2' : 'transparent', flex: '1', borderRadius: 0 }} onClick={() => setDisplayList(UserListType.CONTROL)}>CONTROL</Button>
										:
										null
								}
							</Box>
							<DialogContent sx={{ p: 0 }}>
								<UserListWrapper>
									{
										displayList === UserListType.MEMBERS ?
											members.map((member) => {
												return (<UserListItem key={member.id} user={member} id={id} currentRoom={current}
													setMembers={setMembers} setBannedUsers={setBannedUsers} setAdminMembers={setAdminMembers}
													members={members} bannedUsers={bannedUsers} adminMembers={adminMembers}
													setMutedMembers={setMutedMembers} mutedMembers={mutedMembers} />)
											})
											: displayList === UserListType.BANNED ?
												bannedUsers.map((member) => {
													return (<BannedUserListItem key={member.id} user={member} id={id} currentRoom={current} onClick={handleUnbanMember} />)
												})
												:
												<RoomPasswordControl currentRoom={current} />
									}
								</UserListWrapper>
							</DialogContent>
						</div>
						:
						target.id !== 0 ?
							<div>
								<DialogContent>
									<Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
										<GridProfile player={target} isChat={true} onClicks={{ handleBlockUser, handleRemoveFromFriend }} />
									</Box>
								</DialogContent>
							</div>
							:
							null




				}
				{
					current.id !== 0 ?

						<DialogActions>
							<Button onClick={handleSettingsButtonClose} sx={{ borderRadius: '20px' }}>Cancel</Button>
						</DialogActions>
						:
						null

				}
			</Dialog>
			<JoinQueuButtonChat player2={target.login} player2Id={target.id} openDialog={isInviteGameOpen} setOpenDialog={setIsInviteGameOpen} />
		</div>
	)
}