import { Socket } from "socket.io"


// BACKEND GAME TYPES:

/* ----------- for game algo and sockets purpose ------------------- */

export interface GamePatron {
	//roomId: string, // not sure yet i need it
	p1Login: string,
	p2timeout: number,
	p1timeout: number,
	p2Login: string,
	countDownRequired: boolean,
	canvasHeight: number,
	canvasWidth: number,
	playerWidth: number,
	playerHeight: 50 | 70 | 100,
	ballSpeedX: 7 | 10 | 12,
	ballSpeedY: 7 | 10 | 12,
	duration: 1875 | 3750 | 7500,
	funnyPong: boolean
}


export const gamePatron: GamePatron = {
	p1Login: "--",
	p2Login: "--",
	countDownRequired: false,
	canvasHeight: 640,
	canvasWidth: 1200,
	playerHeight: 100,
	playerWidth: 5,
	ballSpeedX: 7,
	ballSpeedY: 7,
	duration: 3750,
	funnyPong: false,
	p2timeout: 0,
	p1timeout: 0
}

// export interface RoomInfo {
// 	roomId: string
// }

export type Player = {
	id: number,
	login: string,
	avatar: string,
	playerRole: "p1" | "p2",
	playerSocket: Socket,
	socketID: string
	isReady: boolean
}


export type GameDataType = {
	roomInfo: {
		//roomId: string, // not sure yet i need it
		playerHeigth: number
		duration: number
		timer: number
		countDown: number
	},
	player1: {
		login: string,
		avatar?: string,
		y: number,
		score: number,
		timeout: number
	},
	player2: {
		login: string,
		avatar?: string,
		y: number,
		score: number,
		timeout: number
	},
	ball: {
		x: number,
		y: number,
		r: number,
	}
}

export type UpdateGameDataType = {
	timer: number
	countDown: number
	p1y: number
	p1score: number
	p2y: number
	p2score: number
	bx: number
	by: number
}


export enum Status {	// game lifecycle status
	EMPTY,
	LOCKED,
	ONE_PLAYER,
	TWO_PLAYER,
	RUNNING,
	OVER
}

/* ----------- for game gateway purpose ------------------- */

export type GameParams = {
	ballSpeed: '7' | '10' | '12',
	paddleSize: '100' | '70' | '50',
	duration: '1875' | '3750' | '7500',
	funnyPong: boolean
}

export type ClientPayload = {
	id: string,
	login: string,
	config?: GameParams
}

/* ----------- for Database services purpose ------------------- */

export type matchHistoryPayload = {
	index: number,
	l1: string,
	a1: string,
	s1: number,
	l2: string,
	a2: string,
	s2: number
}

export type InviteGameData = {
	sender_id: number,
	sender_login: string,
	sender_avatar?:string,
	receiver_id: number,
	receiver_login: string,
	receiver_avatar?:string,
	ballSpeed: string,
	paddleSize: string,
	duration: string,
	funnyPong: boolean
}
