import React from 'react'
import { Box, styled } from '@mui/system'
import PropTypes from 'prop-types';
import { List, ListItem, IconButton, Avatar, Badge, TextField, Button, Collapse, Fade } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import SecurityIcon from '@mui/icons-material/Security';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FetchAvatar from '../component/FetchAvatar';
import { Room } from './Chat.types';

export const RoomListWrapper = styled('div')({
	borderRadius: '20px',
	border: `1px solid lightgray`,
	display: 'flex',
	flexDirection: 'column',
	width: '100%',
	backgroundColor: '#f2f2f2',
	padding: '8px',
	boxSizing: 'border-box',
	//height: '600px',
	height: '100%',
	overflowY: 'auto',
})

interface RoomListItemWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
	isActive?: boolean;
}

export const RoomListItemWrapper = styled('div')<RoomListItemWrapperProps>(({ isActive }) => ({
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

export const RoomListItemAvatar = styled('div')({
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

export const RoomListItemText = styled('div')({
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	fontSize: '16px',
	fontWeight: '600',
});

export const RoomListItem = ({ room, activeRoomId, onClick }: { room: Room, activeRoomId: number, onClick: (room: Room) => void }) => {
	return (
		<RoomListItemWrapper
			isActive={room.room_id === activeRoomId}
			onClick={() => onClick(room)}
		>
			<RoomListItemAvatar>
				<Avatar>{room.name.charAt(0)}</Avatar>
			</RoomListItemAvatar>
			<RoomListItemText>{room.name}</RoomListItemText>
		</RoomListItemWrapper>
	)
}

RoomListItem.propTypes = {
	room: PropTypes.shape({
		room_id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
	}).isRequired,
	activeRoomId: PropTypes.number.isRequired,
	onClick: PropTypes.func.isRequired,
};

export const RoomBarButtonWrapper = styled('div')({
	display: 'flex',
	gap: '8px',
	marginTop: 'auto',

})

export const RoomBarButton = styled('div')(() => ({
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

export const MatchingRoomListWrapper = styled('div')({
	display: 'flex',
	flexDirection: 'column',
	width: '100%',
	minWidth: '350px',
	backgroundColor: '#f2f2f2',
	padding: '8px',
	boxSizing: 'border-box',
	height: '400px',
	overflowY: 'auto',
});

const MatchingRoomListItemWrapper = styled('div')({
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

const MatchingRoomListItemAvatar = styled('div')({
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	height: '40px',
	width: '40px',
	borderRadius: '50%',
	marginRight: '16px',
});

const MatchingRoomListItemText = styled('div')({
	flexGrow: 1,
});

export const MatchingRoomListItem = ({ room, rooms, onClick }: { room: Room, rooms: Room[], onClick: (room: Room, password: string) => void }) => {

	const [isSendingRequest, setIsSendingRequest] = React.useState(false);
	const [isPasswordInputVisible, setIsPasswordInputVisible] = React.useState(false)
	const [password, setPassword] = React.useState<string>('')

	const handleAddRoomClick = async () => {
		setIsSendingRequest(true);
		await onClick(room, password);
		if (room.isPublic === false) {
			setIsPasswordInputVisible(false)
		}
		setIsSendingRequest(false);
	};

	const handleTogglePasswordInput = () => {
		isPasswordInputVisible ? setIsPasswordInputVisible(false) : setIsPasswordInputVisible(true)
	}

	return (
		<div>
			<MatchingRoomListItemWrapper>
				<MatchingRoomListItemAvatar>
					{room.isPublic == false ?
						<Badge
							overlap="circular"
							anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
							badgeContent={<SecurityIcon />}
						>
							<Avatar>{room.name.charAt(0)}</Avatar>
						</Badge>
						:

						<Avatar>{room.name.charAt(0)}</Avatar>}
				</MatchingRoomListItemAvatar>
				<MatchingRoomListItemText>{room.name}</MatchingRoomListItemText>
				{rooms.find((tmpRoom) => tmpRoom.room_id === room.room_id) ?
					<CheckIcon sx={{p: '6px'}}/>
					:
					room.isPublic === false ?

						<IconButton onClick={handleTogglePasswordInput}>
							<KeyboardArrowDownIcon style={{ transform: `rotate(${isPasswordInputVisible ? '180deg' : '0deg'})`, transition: 'transform 0.5s' }} />
						</IconButton>

						:

						<IconButton onClick={handleAddRoomClick} disabled={isSendingRequest}>
							<AddIcon />
						</IconButton>

				}
			</MatchingRoomListItemWrapper>
			{
				isPasswordInputVisible === true ?
					<Fade in={isPasswordInputVisible}>
						<Box
							sx={{ p: '1rem', display: 'flex'}}
						>
							<TextField label="password" onChange={(event: React.ChangeEvent<HTMLInputElement>) => (setPassword(event.target.value))}/>
							<Button onClick={handleAddRoomClick}>join</Button>

						</Box >
					</Fade>
					:
					null

			}
		</div >
	);
};
