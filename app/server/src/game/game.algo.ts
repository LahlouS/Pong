import { BadGatewayException, BadRequestException, Injectable, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { 	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect
						} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service'
import { GameDataType, Status, gamePatron, GamePatron, Player, GameParams, UpdateGameDataType } from './game.types'
import { interval } from 'rxjs';
import { resolve } from 'path';
import { rejects } from 'assert';
import { error, time } from 'console';
import { EventEmitter } from 'events';

/**
 * here we run all the game algorithm when a room is set up
 */



export class GameAlgo {

	private	status: Status
	private	gameModel = gamePatron;
	private player1: Player | undefined;
	private player2: Player | undefined;

	//for legacy purpose
	public gameConfig: GameParams;
	public isInvites: number | undefined;
	// ------

	private interval: NodeJS.Timeout | undefined;

	private gameDataUpdate: UpdateGameDataType;


	public watchers: (Socket | null)[] = [];
	private readonly internalEvents: EventEmitter

	constructor (
		private readonly gameService: GameService,
				readonly server: Server,
				readonly roomID: string,
				readonly initialStatus: Status
	) {
		this.gameDataUpdate = this.initGameDataUpdate(this.gameModel);
		this.status = initialStatus;
		this.internalEvents = new EventEmitter();
	}

	public async launchGame() {
		return (
			new Promise<string>((resolve, rejects) => {
				this.internalEvents.once('stop', () => {
					this.status = Status.OVER;
					rejects('BLOCKED');
				});

				const checkPlayer = (count: number, timeout: NodeJS.Timeout) => {
					if (this.player1 && this.player2 && this.player2.id != this.player1.id && this.player2.isReady && this.player1.isReady)
					{
						clearTimeout(timeout);
						this.shutDownInternalEvents();
						this.server.to(this.player1.socketID).emit('initSetup', this.initGameDataSetUp(this.gameModel));
						this.server.to(this.player2.socketID).emit('initSetup', this.rotateInitSetup( this.initGameDataSetUp(this.gameModel)));
						this.startGame().then(solved => {
								this.gameService.endGameDBwrites(this.roomID, this.player1!, this.player2!, this.gameDataUpdate);
								this.status = Status.OVER;
								resolve(solved);
						})
						.catch(rejected => {
							this.status = Status.OVER;
							rejects(rejected);
						});
					}
					else if (count > 600)
					{
						clearTimeout(timeout);
						this.status = Status.OVER;
						return rejects('TIME');
					}
					else
					{
						clearTimeout(timeout);
						timeout = setTimeout(() => {
							checkPlayer(++count, timeout)
						}, 100)
					}
				}
				let count = 0;
				let timeout: any = 0 ;
				checkPlayer(count, timeout);
			})
		)
	}

	private async	startGame() {
			return new Promise<string>((resolve, rejects) => {
				this.status = Status.RUNNING;
				this.server.emit('newGameRunning');
				this.internalEvents.on('start', () => {
					clearInterval(this.interval);
					this.interval = setInterval(this.computeGame.bind(this), 16)
				});

				this.internalEvents.on('pause', (countDown: number) => {
					clearInterval(this.interval);
					let milisecond = 0;
					this.interval = setInterval(() => {
						this.countDown(countDown, milisecond++);
					}, 20)
				});

				this.internalEvents.on('stop', (endofgame) => {
					clearInterval(this.interval);
					if (endofgame === '0')
						resolve(endofgame);
					else
						rejects(endofgame);
				});

				this.internalEvents.emit('pause', (10));
			})
	}

	private computeGame() {
		this.gameDataUpdate.bx += this.gameModel.ballSpeedX;
		this.gameDataUpdate.by += this.gameModel.ballSpeedY;

		if (this.gameDataUpdate.by > this.gameModel.canvasHeight || this.gameDataUpdate.by < 0) {
			this.gameModel.ballSpeedY *= -1;
		}
		// player 1 kill zone
		if (this.gameDataUpdate.bx < 15) {
			let bornInfP1 = (this.gameDataUpdate.p1y - this.gameModel.playerHeight / 2)
			let bornSupP1 = (this.gameDataUpdate.p1y + this.gameModel.playerHeight / 2)

			if (this.gameDataUpdate.by > bornInfP1 && this.gameDataUpdate.by < bornSupP1) {
				this.gameModel.ballSpeedX *= -1;
			} else {
				this.gameDataUpdate.p2score += 1;
				this.gameDataUpdate.bx = this.gameModel.canvasWidth / 2;
				this.gameDataUpdate.by = this.gameModel.canvasHeight / 2;
				this.internalEvents.emit('pause', 3);
			}

		}
		// player 2 kill zone
		if (this.gameDataUpdate.bx > (this.gameModel.canvasWidth - 15)) {
			let bornInfP2 = (this.gameDataUpdate.p2y - (Math.floor(this.gameModel.playerHeight / 2)))
			let bornSupP2 = (this.gameDataUpdate.p2y + (Math.floor(this.gameModel.playerHeight / 2)))

			if (this.gameDataUpdate.by > bornInfP2 && this.gameDataUpdate.by < bornSupP2) {
				this.gameModel.ballSpeedX *= -1;
			} else {
				this.gameDataUpdate.p1score += 1;
				this.gameDataUpdate.bx = this.gameModel.canvasWidth / 2;
				this.gameDataUpdate.by = this.gameModel.canvasHeight / 2;
				this.internalEvents.emit('pause', 3);
			}
		}
		// game is finish by timeout || player lack of activity has been detected
		if ( ++this.gameDataUpdate.timer == this.gameModel.duration || this.playersTimeout() ) {
			this.server.to(this.player1!.socketID).volatile.emit('gameOver', this.gameDataUpdate);
			this.server.to(this.player2!.socketID).volatile.emit('gameOver', this.rotateGameDataUpdate(this.gameDataUpdate));
			this.status = Status.OVER;
			this.watchers.forEach((socket: Socket) => {
				if (socket)
					this.server.to(socket.id).volatile.emit('gameOver', this.gameDataUpdate);
			})
			this.internalEvents.emit('stop', '0');
			return ;
		}

		this.server.to(this.player1!.socketID).volatile.emit('updateClient', this.gameDataUpdate);
		this.server.to(this.player2!.socketID).volatile.emit('updateClient', this.rotateGameDataUpdate(this.gameDataUpdate));
		this.watchers.forEach((socket: Socket) => {
			if (socket)
				this.server.to(socket.id).volatile.emit('updateClient', this.gameDataUpdate);
		})
	}

	private countDown(countDown: number, miliseconds: number) {
		this.gameDataUpdate.countDown = countDown;
		this.server.to(this.player1!.socketID).volatile.emit('updateClient', this.gameDataUpdate);
		this.server.to(this.player2!.socketID).volatile.emit('updateClient', this.rotateGameDataUpdate(this.gameDataUpdate));

		this.watchers.forEach((socket: Socket) => {
			if (socket)
				this.server.to(socket.id).volatile.emit('updateClient', this.gameDataUpdate);
		})

		if (!countDown) {
			this.gameDataUpdate.countDown = -1;
			this.internalEvents.emit('start')
		}
		else if ((miliseconds === 50)) // 50 == 1sec
			this.internalEvents.emit('pause', (--countDown));
	}

	public initPlayer1(player: Player, gameConfig: GameParams | undefined) {
		this.player1 = player;

		if (this.status != Status.LOCKED) { // to not change it if in gameInvite process
			this.status = Status.ONE_PLAYER;
		}

		// registering player1 y listeners
		this.player1.playerSocket.on('quitGame', (socket: Socket) => { // player quiting the game
			this.internalEvents.emit('stop', '1');
		})

		this.player1.playerSocket.on('paddlePos', (y: number, socket: Socket) => { // player moving the paddle
			if (gameConfig && gameConfig.funnyPong)
				this.gameDataUpdate.p1y = (2 * (this.gameModel.canvasHeight / 2) - y);
			else
				this.gameDataUpdate.p1y = y;
			this.gameModel.p1timeout = Date.now();
		})

		this.player1.playerSocket.once('imReady', () => {
			this.player1!.isReady = true;
		})

		// -------------------------------

		/* player1 configure the game with parameter ballspeed, paddlSize and game duration */
		if (gameConfig)
		{
			if (gameConfig.ballSpeed === '7')
				this.gameModel = {...this.gameModel, ballSpeedX: 7, ballSpeedY: 7};
			else if (gameConfig.ballSpeed === '10')
				this.gameModel = {...this.gameModel, ballSpeedX: 10, ballSpeedY: 10};
			else if (gameConfig.ballSpeed === '12')
				this.gameModel = {...this.gameModel, ballSpeedX: 12, ballSpeedY: 12};

			if (gameConfig.duration === '1875')
				this.gameModel = {...this.gameModel, duration: 1875};
			else if (gameConfig.duration === '3750')
				this.gameModel = {...this.gameModel, duration: 3750};
			else if (gameConfig.duration === '7500')
				this.gameModel = {...this.gameModel, duration: 7500};

			if (gameConfig.paddleSize === '50')
				this.gameModel = {...this.gameModel, playerHeight: 50};
			else if (gameConfig.paddleSize === '100')
				this.gameModel = {...this.gameModel, playerHeight: 100};
			else if (gameConfig.paddleSize === '70')
				this.gameModel = {...this.gameModel, playerHeight: 70};

			this.gameModel = { ...this.gameModel, funnyPong: gameConfig.funnyPong }
			this.gameConfig = gameConfig;
		}
		else
			this.gameModel = {...this.gameModel, ballSpeedX: 7, ballSpeedY: 7, playerHeight: 100, duration: 3750 }

			this.server.to(this.player1.socketID).emit('lockAndLoaded');

	}

	public initPlayer2(player: Player) {
		this.player2 = player;
		this.status = Status.TWO_PLAYER;

		// registering player2 y listeners
		this.player2.playerSocket.on('quitGame', (socket: Socket) => { // player quiting the game
			this.internalEvents.emit('stop', '2');
		})

		this.player2.playerSocket.on('paddlePos', (y: number, socket: Socket) => { // player moving the paddle
			if (this.gameModel.funnyPong)
				this.gameDataUpdate.p2y = (2 * (this.gameModel.canvasHeight / 2) - y);
			else
				this.gameDataUpdate.p2y = y;
			this.gameModel.p2timeout = Date.now();
		})
		// ------------------------------

		this.player2.playerSocket.once('imReady', () => {
			this.player2!.isReady = true;
		})
		this.server.to(this.player2.socketID).emit('lockAndLoaded');
	}

	public getStatus() : Status {
		return (this.status);
	}

	public getPlayerID(player1ou2: number) : string {

		if (player1ou2 === 1)
			return this.player1!.id.toString()
		else if (player1ou2 === 2)
			return this.player2!.id.toString()
		else
			return "error"
	}

	public getPlayerSocketID(player1ou2: number) : string {

		if (player1ou2 === 1 && this.player1)
			return this.player1.socketID
		else if (player1ou2 === 2 && this.player2)
			return this.player2.socketID
		else
			return "error"
	}

	public getPlayerLogin(player1ou2: number) : string {

		if (player1ou2 === 1 && this.player1)
			return this.player1.login
		else if (player1ou2 === 2 && this.player2)
			return this.player2.login
		else
			return "error"
	}


	public getPlayerAvatar(player1ou2: number) : string {

		if (player1ou2 === 1 && this.player1)
			return this.player1.avatar
		else if (player1ou2 === 2 && this.player2)
			return this.player2.avatar
		else
			return "error"
	}

	public async playerChangeSocket(playerSocket: Socket, socketID: string, player1ou2: number) {
		if (player1ou2 === 1) {
			this.player1!.playerSocket = playerSocket
			this.player1!.socketID = socketID;
			this.player1!.playerSocket.on('quitGame', (socket: Socket) => { // player quiting the game
				this.internalEvents.emit('stop', '1');
			})
			this.player1!.playerSocket.on('paddlePos', (y: number, socket: Socket) => { // player moving the paddle
				if (this.gameModel.funnyPong)
					this.gameDataUpdate.p1y = (2 * (this.gameModel.canvasHeight / 2) - y);
				else
					this.gameDataUpdate.p1y = y;
					this.gameModel.p1timeout = Date.now();
			})
			this.player1!.playerSocket.once('imReady', () => {
				this.server.to(this.player1!.socketID).emit('initSetup', this.initGameDataSetUp(this.gameModel));
				this.player1!.isReady = true;
			})


			// const testTime = setTimeout(()=>{
				// this.server.to(socketID).emit('initSetup', this.initGameDataSetUp(this.gameModel));
				// clearInterval(testTime)
			// }, 100);

		}
		else if (player1ou2 === 2){
			this.player2!.playerSocket = playerSocket
			this.player2!.socketID = socketID;
			this.player2!.playerSocket.on('quitGame', (socket: Socket) => { // player quiting the game
				this.internalEvents.emit('stop', '2');
			})

			this.player2!.playerSocket.on('paddlePos', (y: number, socket: Socket) => { // player moving the paddle
				if (this.gameModel.funnyPong)
					this.gameDataUpdate.p2y = (2 * (this.gameModel.canvasHeight / 2) - y);
				else
					this.gameDataUpdate.p2y = y;
					this.gameModel.p2timeout = Date.now();
			})

			this.player2!.playerSocket.once('imReady', () => {
				this.server.to(this.player2!.socketID).emit('initSetup', this.rotateInitSetup( this.initGameDataSetUp(this.gameModel)));
				this.player2!.isReady = true;
			})

			// const testTime = setTimeout(()=>{
				// this.server.to(socketID).emit('initSetup', this.rotateInitSetup(this.initGameDataSetUp(this.gameModel)));
				// clearInterval(testTime)
			// }, 100);
		}

	}

	public async addWatcherSocketID(newWatcherSocket: Socket) {
		this.watchers.push(newWatcherSocket);

		newWatcherSocket.once('imReady', () => {
			this.server.to(newWatcherSocket.id).emit('initSetup', this.initGameDataSetUp( this.gameModel));
		})

		newWatcherSocket.on('quitGame', () => {
			this.watchers.forEach((value, index) => {
				if (value === newWatcherSocket) {
					this.watchers[index] = null;
				}
			})
		})
	}

	public shutDownInternalEvents() {
		this.internalEvents.removeAllListeners();
	}

	// initialising the players and ball positions

	/* THE UPDATE DATA STRUCTURE FOR WHEN THE GAME IS RUNNING */
	private initGameDataUpdate(gamePatron: GamePatron): UpdateGameDataType {
		return ({
			timer: 0,
			countDown: 0,
			p1y: gamePatron.canvasHeight / 2,
			p1score: 0,
			p2y: gamePatron.canvasHeight / 2,
			p2score: 0,
			bx: gamePatron.canvasWidth / 2,
			by: gamePatron.canvasHeight / 2,
		})
	}

	private rotateGameDataUpdate(data: UpdateGameDataType): UpdateGameDataType {
		let temp = {...data,
			p1y: data.p2y,
			p1score: data.p2score,
			p2y: data.p1y,
			p2score: data.p1score,
			bx: (this.gameModel.canvasWidth / 2) - (data.bx - (this.gameModel.canvasWidth / 2))
		}
		return temp;
	}

	/* ---------------------------------------------- */

	private playersTimeout(): boolean {
		if ((Date.now() - this.gameModel.p1timeout) > 10000)
		{
			this.gameDataUpdate.p1score = 0;
			this.gameDataUpdate.p2score += 1;
			return (true);
		}
		else if (((Date.now() - this.gameModel.p2timeout) > 10000 )) {
			this.gameDataUpdate.p1score += 1;
			this.gameDataUpdate.p2score = 0;
			return (true);
		}
		else
			return (false)
	}


	/* INITIALISING THE FULL DATA SET UP FOR STARTING THE GAME */
	initGameDataSetUp(gamePatron: GamePatron): GameDataType {
		return ({
			roomInfo: {
				playerHeigth: gamePatron.playerHeight,
				duration: gamePatron.duration,
				countDown: 0,
				timer: 0
			},
			player1: {
				login: this.player1!.login,
				avatar: this.player1?.avatar,
				y: gamePatron.canvasHeight / 2,
				score: 0,
				timeout: 0
			},
			player2: {
				login: this.player2!.login,
				avatar: this.player2?.avatar,
				y: gamePatron.canvasHeight / 2,
				score: 0,
				timeout: 0

			},
			ball: {
				x: gamePatron.canvasWidth / 2,
				y: gamePatron.canvasHeight / 2,
				r: 5,
			}
		})
	}


	private rotateInitSetup(gameData: GameDataType): GameDataType {
		let temp = {...gameData,
			player1: {
				...gameData.player2
			},
			player2: {
				...gameData.player1
			},
			ball: {
				...gameData.ball,
				x: (this.gameModel.canvasWidth / 2) - (gameData.ball.x - (this.gameModel.canvasWidth / 2))
			}
		};
		return temp;
	}
	/** ---------------------------------------------- */

}
