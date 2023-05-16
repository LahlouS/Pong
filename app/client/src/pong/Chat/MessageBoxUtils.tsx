import { Box } from '@mui/material';
import PropTypes from 'prop-types'

type MessageProps = {
	message: {
		id: number;
		sender: { id: number; login: string };
		content: string;
	};
	id: number;
};

export const Message: React.FC<MessageProps> = ({ message, id }: MessageProps) => {
	const isCurrentUser = message.sender.id === id;

	return (
		<Box
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
				marginBottom: '8px',
			}}
		>
			<Box
				style={{
					display: 'flex',
					alignItems: 'center',
					fontSize: '0.8rem',
					fontWeight: 'bold',
					color: 'gray',
					marginBottom: '4px',
				}}
			>
				<Box style={{ marginRight: '4px' }}>{message.sender.login}</Box>
			</Box>
			<Box
				style={{
					maxWidth: '80%',
					backgroundColor: isCurrentUser ? '#DCF8C6' : '#f2f2f2',
					padding: '8px 12px',
					borderRadius: '12px',
					wordWrap: 'break-word',
				}}
			>
				{message.content}
			</Box>
		</Box>
	);
};
