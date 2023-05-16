import { List, ListItem, ListItemText, ListItemAvatar, Avatar, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PropTypes from 'prop-types';
import { styled } from '@mui/system'
import React, { useContext, useEffect, useState } from 'react';
import { socket } from './Socket';
import { ChatContext } from './Chat';
import FetchAvatar from '../component/FetchAvatar'
import { FriendRequest, User } from './Chat.types';
import { StatusContext } from '../page/LeadPage';
import { FetchApi } from '../component/FetchApi';
import { useFetchAuth } from '../context/useAuth';

export const FriendListWrapper = styled('div')({
	borderRadius: '20px',
	border: `1px solid lightgray`,
	display: 'flex',
	flexDirection: 'column',
	width: '100%',
	backgroundColor: '#f2f2f2',
	padding: '8px',
	boxSizing: 'border-box',
	height: '100%',
	overflowY: 'auto',
});

interface FriendListItemWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	isActive?: boolean;
}

export const FriendListItemWrapper = styled('div')<FriendListItemWrapperProps>(({ isActive }) => ({
	display: 'flex',

	alignItems: 'center',
	height: '56px',
	margin: '4px',
	padding: '0 16px',
	borderRadius: '8px',
	cursor: 'pointer',
	backgroundColor: isActive ? '#EDEDED' : 'transparent',

	'&:hover': {
		backgroundColor: '#EDEDED',
	},
}));

export const FriendListItem = ({ friend, activeFriendId, onClick }: { friend: User, activeFriendId: number, onClick: (friend: User) => void }) => {
	const { friendStatusTab } = useContext(StatusContext)

	//console.log('friendStatusTab in FriendListItem: ', friendStatusTab)
	const status = friendStatusTab.find(item => item.id === friend.id)?.status as string

	//console.log('status in FriendListItem: ', status)

	return (
		<FriendListItemWrapper
			key={friend.id}
			isActive={friend.id === activeFriendId}
			onClick={() => onClick(friend)}
		>
			<FriendListItemAvatar>
				<FetchAvatar avatar={friend.avatar ? friend.avatar : ''} sx={{ height: '100%', width: '100%' }} status={status !== undefined ? status : 'online'} />
			</FriendListItemAvatar>
			<FriendListItemText>{friend.login}</FriendListItemText>
		</FriendListItemWrapper>
	);
}

FriendListItem.propTypes = {
	friend: PropTypes.shape({
		id: PropTypes.number.isRequired,
		login: PropTypes.string.isRequired,
		avatar: PropTypes.string,
	}).isRequired,
	activeFriendId: PropTypes.number.isRequired,
	onClick: PropTypes.func.isRequired,
};

export const FriendListItemAvatar = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '40px',
	width: '40px',
	borderRadius: '50%',
	marginRight: '16px',
	backgroundColor: '#ffffff',
	flexShrink: 0
});

export const FriendListItemText = styled('div')({
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	fontSize: '16px',
	fontWeight: '600',
});

//------------------------


export const FriendRequestWrapper = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	width: '100%',
	backgroundColor: '#f2f2f2',
	padding: '8px',
	boxSizing: 'border-box',
	height: '100%',
	overflowY: 'auto',
});

const FriendRequestItemWrapper = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	height: '56px',
	padding: '0 16px',
	borderRadius: '8px',
	cursor: 'pointer',

});

export const FriendRequestAvatar = styled('div')({
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

export const FriendRequestListItemText = styled('div')({
	display: 'flex',
	alignItems: 'center',
	height: '56px',
	paddingRight: '1rem',
	borderRadius: '8px',
});

export const FriendRequestButtonWrapper = styled('div')({
	display: 'flex',
});

export const FriendRequestButton = styled('div')(() => ({
	display: 'flex',
	alignItems: 'center',
	height: '56px',
	padding: '0 16px',
	margin: '4px',
	borderRadius: '8px',
	cursor: 'pointer',

	'&:hover': {
		backgroundColor: '#EDEDED',
	},
}));


const ButtonWrapper = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '40px',
	width: '40px',
	borderRadius: '50%',
	margin: '0.5rem',
	'&:hover': {
		backgroundColor: '#EDEDED',
	},
});

export const FriendRequestItem = ({ friendRequest, id }: { friendRequest: FriendRequest, id: number }) => {
	const { friendRequests, setFriendRequests } = useContext(ChatContext)

	const handleAcceptFriendRequest = (friendRequestId: number) => {
		socket.emit('acceptFriend', friendRequestId)
		setFriendRequests(friendRequests.filter((friendRequest) => friendRequest.id !== friendRequestId))
	}

	const handleDeclineFriendRequest = (friendRequestParam: FriendRequest) => {
		socket.emit('declineFriend', { senderId: friendRequestParam.user1Id, friendRequestId: friendRequestParam.id })
		setFriendRequests(friendRequests.filter((friendRequest) => friendRequest.id !== friendRequestParam.id))
	}

	if (id === friendRequest.user1Id)
		return null

	const auth = useFetchAuth() 
	const [avatarName, setAvatarName] = useState<string | undefined>(undefined)

	useEffect(() => {
		const getAvatarNameRequest = {
			api: {
				input: `http://${import.meta.env.VITE_SITE}/api/users/avatarName/${friendRequest.user1Id}`
			},
			auth: auth
		}

		const getAvatarName = async () => {
			const response = await FetchApi(getAvatarNameRequest)

			return response?.data
		} 

		getAvatarName().then(data => data.avatar ? setAvatarName(data.avatar) : setAvatarName(undefined))
	})

	return (
		<FriendRequestItemWrapper>
			<FriendRequestAvatar>
				<FetchAvatar avatar={avatarName} sx={{ height: '100%', width: '100%' }} />
			</FriendRequestAvatar>
			<FriendRequestListItemText>
				{friendRequest.user1Login}
			</FriendRequestListItemText>
			<ButtonWrapper onClick={() => handleAcceptFriendRequest(friendRequest.id)}>
				<CheckIcon />
			</ButtonWrapper>

			<ButtonWrapper onClick={() => handleDeclineFriendRequest(friendRequest)}>
				<CloseIcon />
			</ButtonWrapper>
		</FriendRequestItemWrapper>
	);
};

FriendRequestItem.propTypes = {
	friendRequest: PropTypes.shape({
		id: PropTypes.number.isRequired,
		user1Login: PropTypes.string.isRequired,
		user2Login: PropTypes.string.isRequired,
		user1Id: PropTypes.number.isRequired,
		user2Id: PropTypes.number.isRequired,
	}).isRequired,
	id: PropTypes.number.isRequired,
};

//--------------matching users


export const UserListWrapper = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	width: '100%',
	backgroundColor: '#f2f2f2',
	padding: '8px',
	boxSizing: 'border-box',
	height: '400px',
	overflowY: 'auto',
});

const UserListItemWrapper = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'space-between',
	height: '56px',
	padding: '0 16px',
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
	marginRight: '16px',
});

const UserListItemText = styled('div')({
	flexGrow: 1,
});

export const UserListItem = ({ user, friends, blockedUserIds, setBlockedUserIds, onClick, friendRequests, id }: { user: User, friends: User[], blockedUserIds: number[], setBlockedUserIds: (ids: number[]) => void, onClick: (id: number) => void, friendRequests: FriendRequest[], id: number }) => {

	if (id === user.id)
		return null

	const [isSendingRequest, setIsSendingRequest] = React.useState(false);

	const handleAddFriendClick = async () => {
		setIsSendingRequest(true);
		await onClick(user.id);
		setIsSendingRequest(false);
	};

	const handleUnblockUser = () => {
		const UnblockUserData = {
			sender_id: id,
			user_id: user.id
		}

		socket.emit('unblockUser', UnblockUserData)

		setBlockedUserIds(blockedUserIds.filter(id => id !== user.id))

	}

	return (
		<UserListItemWrapper>
			<UserListItemAvatar>
				<FetchAvatar avatar={user.avatar ? user.avatar : ''} sx={{ height: '100%', width: '100%' }} />
			</UserListItemAvatar>
			<UserListItemText>{user.login}</UserListItemText>
			{friends.find((friend) => friend.id === user.id) ?
				<CheckIcon />
				:
				friendRequests.find((request) => request.user1Id === user.id || request.user2Id === user.id) ?
					<MoreHorizIcon />
					:
					blockedUserIds.find(id => user.id === id) ?
						<IconButton onClick={handleUnblockUser}>
							<LockOpenIcon />
						</IconButton>
						:
						<IconButton onClick={handleAddFriendClick} disabled={isSendingRequest}>
							<AddIcon />
						</IconButton>

			}
		</UserListItemWrapper>
	);
};

UserListItem.propTypes = {
	user: PropTypes.shape({
		id: PropTypes.number.isRequired,
		login: PropTypes.string.isRequired,
		avatar: PropTypes.string,
	}).isRequired,
	friends: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number.isRequired,
			login: PropTypes.string.isRequired,
		}),
	).isRequired,
	blockedUserIds: PropTypes.arrayOf(PropTypes.number),
	setBlockedUserIds: PropTypes.func.isRequired,
	onClick: PropTypes.func.isRequired,
	friendRequests: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number.isRequired,
			user1Login: PropTypes.string.isRequired,
			user2Login: PropTypes.string.isRequired,
			user1Id: PropTypes.number.isRequired,
			user2Id: PropTypes.number.isRequired,
		}),
	).isRequired,
	id: PropTypes.number.isRequired
};