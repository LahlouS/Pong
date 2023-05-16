

export type GameData = {
	roomInfo: {
		//roomId: string,

		duration: number
		timer: number
		countDown: number
		playerHeigth: number
		margin?:number
		scaledPlayerheight?: number
		scaledPlayerwidth?: number
	}
	player1: {
		login?: string
		avatar?: string,
		y: number,
		score: number
	},
	player2: {
		login?: string,
		avatar?: string,
		y: number,
		score: number
	},
	ball: {
		x: number,
		y: number,
		r: number,
		speed?: {
			x: number,
			y: number
		}
	}
}

export type constants = {
	gameDuration: number;
	margin: number;

	Playerheight: number;
	Playerwidth: number;

	ballRad: number;

	p1Login?: string;
	// p1Avatar: string;

	p2Login?: string;
	// p2Avatar: string;

	playerYratio: number

	ballXratio: number
	ballYratio: number

}


// here i keep only the data that need to be constantly refresh to ease the computing during game
export type updateData = {
	timer: number
	countDown: number
	p1y: number
	p1score: number
	p2y: number
	p2score: number
	bx: number
	by: number
}

// fetching the invitation
export type InviteGameData = {
	id: number,
	createdAt: Date,
	sender_id: number,
	sender_login: string,
	sender_avatar:string,
	receiver_id: number,
	receiver_login: string,
	receiver_avatar:string,
	ballSpeed: string,
	paddleSize: string,
	duration: string,
	funnyPong: boolean
}

export type InviteGameDataPaylaod = {
	sender_id: number,
	sender_login: string,
	receiver_id: number,
	receiver_login: string,
	ballSpeed: string,
	paddleSize: string,
	duration: string,
	funnyPong: boolean
}
