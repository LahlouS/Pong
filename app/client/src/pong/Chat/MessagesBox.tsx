import React, { useState, useRef, useEffect, useContext, useCallback, HtmlHTMLAttributes } from 'react';
import { Avatar, Box, Paper, TextField, List, ListItem, ListItemText, Typography, Snackbar } from '@mui/material';
import { styled } from '@mui/system';
import { ChatContext } from './Chat';
import useAuth from '../context/useAuth';
import { socket } from './Socket';
import { MessageData } from './Chat.types';
import FetchAvatar from '../component/FetchAvatar';
import { SettingsButtton } from './ControlButton';
import { Message } from './MessageBoxUtils';
import { StatusContext } from '../page/LeadPage';


const ChatInputField = styled(TextField)({
	width: '100%',
	'& .MuiInputLabel-root.Mui-focused': {
		opacity: 0.3,
	},
	'& .MuiFilledInput-underline:after': {
		border: 'none',
	},
});

function ChatInput() {

	const [inputValue, setInputValue] = useState('');
	const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false)
	const [alertMessage, setAlertMessage] = useState<string>('')

	const { id } = useAuth()

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setInputValue(event.target.value);
	};

	const {
		current,
		target,
	} = useContext(ChatContext)

	const handleSubmit = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		if (target.id !== 0) {

			const payload: MessageData = {
				content: inputValue,
				sender_id: id,
				recipient_id: target.id
			}

			setInputValue('')

			socket.emit('directMessage', payload)
		}
		else if (current.id !== 0) {
			const messageData: MessageData = {
				content: inputValue,
				sender_id: id,
				room: {
					id: current.id,
					name: current.name
				}
			}

			setInputValue('')

			socket.emit('roomMessage', messageData, (data: any) => {
				if (data.error !== undefined) {
					setIsAlertOpen(true)
					setAlertMessage(data.error)
				}
			})
		}
	}, [socket, target, current, inputValue])

	//multiline #I delete it from ChatInputField because when my imput is too long the behavior is horrible
	return (
		<>
			<ChatInputField
				fullWidth
				variant='filled'
				label="Type your message here..."
				value={inputValue}
				onChange={handleInputChange}
				onKeyDown={(e) => {
					if (e.key === 'Enter'/*  && onSubmit */) {
						handleSubmit(e);
						setInputValue('');
						e.preventDefault();
					}
				}}
				InputProps={{
					autoComplete: 'off',
					autoCorrect: 'off',
					style: {
						fontFamily: '"system-ui", sans-serif'
					}
				}}
			/>
			<Snackbar
				open={isAlertOpen}
				autoHideDuration={4000}
				onClose={() => { setIsAlertOpen(false), setAlertMessage('') }}
				message={alertMessage}
			/>
		</>
	);
}

const ChatBox = styled(Paper)({
	display: 'flex',
	flexDirection: 'column',
	borderRadius: '20px',
	overflow: 'hidden',
	boxShadow: 'none',
	border: `1px solid lightgray`,
	position: 'relative', /* add position relative */
	//height: '600px',
	height: '100%',
	width: '100%',
	maxWidth: '100%',
	margingBottom: 0
});

const ChatHeader = styled(Box)(({ theme }) => ({
	width: '100%',
	justifyContent: 'space-between',
	height: '5%',
	display: 'flex',
	alignItems: 'center',
	backgroundColor: theme.palette.background.paper,
	borderBottom: `1px solid ${theme.palette.grey[300]}`,
	padding: theme.spacing(2),
}));

const ChatBody = styled(Box)({
	flex: 1,
	overflow: 'auto',
	padding: '16px',
	paddingBottom: 64,
	height: '85%',
	flexDirection: 'column-reverse', /* add this CSS property to reverse the order of child elements */

});

const ChatFooter = styled(Box)(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	height: 'auto',
	backgroundColor: theme.palette.background.paper,
	position: 'absolute', /* add position absolute */
	bottom: 0, /* position it at the bottom */
	left: 0, /* align it to the left */
	right: 0, /* align it to the right */
}));

export const MessagesBox = () => {
	const chatBodyRef = useRef<HTMLDivElement>(null)

	const { id } = useAuth()
	const { blockedUserIds } = useContext(ChatContext)
	const { friendStatusTab } = useContext(StatusContext)

	const {
		rooms, directMessages,
		current,
		target,
	} = useContext(ChatContext)

	const [messageList, setMessageList] = useState<React.ReactNode[]>([])

	useEffect(() => {
		if (target.id !== 0) {
			setMessageList(directMessages.map((message, index) => {
				if (message.sender_id === id || message.recipient_id === id) {
					return <Message
						key={message.id}
						message={{
							id: message.id,
							sender: {
								id: message.sender_id,
								login: message.sender.login
							},
							content: message.content
						}} id={id} />
				}
				return null
			}))

		}
		else if (current.id !== 0) {
			const room = rooms.find((room) => {
				return room.room_id === current.id
			})

			if (room === undefined) {
				setMessageList([])
			}
			else {
				setMessageList(room.messages.map((message, index) => {
					return <Message
						key={message.id}
						message={{
							id: message.id,
							sender: {
								id: message.sender_id,
								login: message.sender.login
							},
							content: (blockedUserIds.find(id => id === message.sender_id) ? 'message sender blocked' : message.content)
						}} id={id} />
				}))
			}
		}
		else if (current.id === 0 && target.id === 0) {
			setMessageList([])
		}
	}, [target, current, directMessages, rooms])

	useEffect(() => {
		if (chatBodyRef.current) {
			chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
		}
	}, [messageList]);

	const status = friendStatusTab.find(item => item.id === target.id)?.status as string

	return (
		<ChatBox>
			{
				target.id !== 0 ?
					<ChatHeader>
						<FetchAvatar avatar={target.id !== 0 ? target.avatar : ''} sx={null} status={status !== undefined ? status : 'online'} />
						<Typography sx={{ p: '2rem' }}>{target.login}</Typography>
						<SettingsButtton />
					</ChatHeader>
					:
					current.id !== 0 ?

						<ChatHeader>
							<Avatar >
								{current.name.charAt(0)}
							</Avatar>
							<Typography sx={{ p: '2rem' }}>{current.name}</Typography>
							<SettingsButtton />
						</ChatHeader>
						:
						null
			}
			<ChatBody ref={chatBodyRef}>
				{messageList}
			</ChatBody>
			<ChatFooter>
				<ChatInput />
			</ChatFooter>
		</ChatBox>
	);
};
