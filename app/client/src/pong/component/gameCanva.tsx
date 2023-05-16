import * as React from 'react'
import { Typography, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Swipeable from '../component/Swipeable'
import Profile from '../Profile/Profile'
import PropTypes from 'prop-types';
import { useFetchAuth } from '../context/useAuth'
import { FetchApi, Api, responseApi } from '../component/FetchApi'
import useAuth from '../context/useAuth'
// import '../page/game.css'
import { StatusContext } from '../page/LeadPage'
import { render } from 'react-dom'
import { Socket } from "socket.io-client";
import LinearProgress from '@mui/material/LinearProgress';
import FetchAvatar from '../component/FetchAvatar'
import { GameData, constants, updateData } from './gameType'
import { draw, drawEndGame } from './drawCanvas'


const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 640;
const PLAYER_HEIGHT = 100;
const PLAYER_WIDTH = 5;
const BALLRADIUS = 5;

const WAITING_FONT = 100;
const LOGIN_FONT = 30;
const SCORE_FONT = 75;
const TIMER_FONT = 70;
const ENDGAMEFONT = 180;




const Canvas = ({ socket, handleThereIsMatch, handleThereIsError }: { socket: Socket, handleThereIsMatch: () => void, handleThereIsError: (errorstr: string) => void }) => {
	// ref to the html5 canvas on wich we will draw
	const canvas = React.useRef<HTMLCanvasElement | null>(null); // reference/pointer on html5 canvas element, so you can draw on it
	const { socketStatus } = React.useContext(StatusContext);
	const [game, setGame] = React.useState<boolean>(false);
	const [fetched, setFetched] = React.useState<boolean>(false);
	const [gameContext, setGameContext] = React.useState<constants>();
	const [gameData, setGameData] = React.useState<GameData>();
	const { id } = useAuth();

	const quitGame = async () => {
		socket.emit('quitGame');
		if (socketStatus)
			socketStatus.emit('outGame', id);
		handleThereIsMatch()
	}

	const gameCanvas = React.useCallback((node: null | HTMLCanvasElement) => {
		if (node !== null) {
			canvas.current = node;
			setGame(true);
		}
	}, []);

	const canvaResize = async () => {
		const testTimeout = setTimeout(() => {
			if (canvas.current) {
				//			canvas.current.width = document.documentElement.clientWidth * 0.70;
				canvas.current.width = document.documentElement.clientWidth < 1300 ?
					Math.floor((document.documentElement.clientWidth * 0.70))
					: 1300 * 0.70
				canvas.current.height = canvas.current.width * 0.533;
			}
			setGameContext(undefined);
		}, 100)
		return () => {
			clearTimeout(testTimeout);
		}
	}

	const handleMouseMove = React.useMemo(() => {
		const canvasElement = canvas.current

		if (gameContext && game && canvasElement) {
			const sendPos = (y: number) => {
				socket.volatile.emit("paddlePos", y);
			}

			return ((event: any) => {
				const canvasLocation = canvasElement.getBoundingClientRect();
				const mouseLocation = event.clientY - canvasLocation?.y
				let y: number;

				if (mouseLocation < gameContext.Playerheight / 2) {
					y = gameContext.Playerheight / 2;
				} else if (mouseLocation > canvasElement.height - gameContext.Playerheight / 2) {
					y = canvasElement.height - gameContext.Playerheight / 2;
				} else {
					y = mouseLocation;
				}
				sendPos(Math.floor((y * CANVAS_HEIGHT) / canvasElement.height));
			});
		}
		return (undefined);
	}, [game, gameContext])


	// useEffect rendered only once to register the initSetup (wich tell the start)
	React.useEffect(() => {
		const timeTest = setTimeout(() => {
			socket.emit('imReady'); // the back-end wait for both player to be ready to be sure that one of the player didnt miss the init set-up

			socket.on("initSetup", (gameData: GameData) => {
				setFetched(true); // we know here that we receive the initSetup from back so we are sure there is a match
				setGameData(gameData); // we set here the const of the game like the players logins and paddle size
				// console.log('connection socketStatus: ', socketStatus)
			})
			socket.on('disconnection', (errorMessage: string) => {
				// console.log('deconnection socketStatus: ', socketStatus)
				//if (socketStatus)
				//	socketStatus.emit('outGame', id);
				handleThereIsError(errorMessage);
			})

		}, 100);
		window.addEventListener("resize", canvaResize);
		if (socketStatus)
			socketStatus.emit('inGame', id);

		return (() => {
			clearTimeout(timeTest);
			window.removeEventListener("resize", canvaResize);
		if (socketStatus)
			socketStatus.emit('outGame', id);

		})

	}, [])

	//set the game constants (gameContext) and draw the the initial set up and register the other listenner that will be send during the game
	React.useEffect(() => {
		if (gameData && game && canvas.current && !gameContext) {
			setGameContext({
				gameDuration: gameData.roomInfo.duration,
				margin: Math.floor((canvas.current.width * 5) / CANVAS_WIDTH),
				Playerheight: Math.floor((canvas.current.height * gameData.roomInfo.playerHeigth) / CANVAS_HEIGHT),
				Playerwidth: Math.floor((canvas.current.width * PLAYER_WIDTH) / CANVAS_WIDTH),
				ballRad: Math.floor((canvas.current.height * BALLRADIUS) / CANVAS_HEIGHT),
				p1Login: gameData.player1.login,
				p2Login: gameData.player2.login,

				// scale multiplicator
				playerYratio: (canvas.current.height) / CANVAS_HEIGHT,
				ballXratio: (canvas.current.width) / CANVAS_WIDTH,
				ballYratio: (canvas.current.height) / CANVAS_HEIGHT,
				// ***tu as commente les avatars pour le moment***
			})

		}
		if (gameData && gameContext && game) {

			// drawing the init setUp
			draw(canvas.current, {
				timer: gameData.roomInfo.timer,
				countDown: gameData.roomInfo.countDown,
				p1y: gameData.player1.y,
				p1score: gameData.player1.score,
				p2y: gameData.player2.y,
				p2score: gameData.player2.score,
				bx: gameData.ball.x,
				by: gameData.ball.y,
			}, gameContext);

			// registering the other event listener
			socket.on("updateClient", (gameData: updateData) => {
				if (gameContext) {
					draw(canvas.current, gameData, gameContext);
				}
			})

			socket.on("pause", (gameData: updateData) => {
				setFetched(true)
				drawEndGame(canvas.current, gameData.p1score, gameData.p2score);
			})

			socket.on("gameOver", (gameData: updateData) => {
				setFetched(true)
				drawEndGame(canvas.current, gameData.p1score, gameData.p2score);
			})

		}

	}, [gameData, gameContext, game])

	return (
		<>
			{!fetched ?
				(<>
					<Grid container
						direction="column"
						justifyContent="center"
						alignItems="center"
						sx={{ height: "95%" }}
					>
						<Grid sx={{ height: "20%" }}>
							<Typography variant="h3"
								style={{ color: '#919090' }}
							>
								Game Matching...
							</Typography>
						</Grid>
						<Grid sx={{ height: '10%', width: '75%', color: "#919090" }}>
							<LinearProgress color="inherit" />
						</Grid>

					</Grid>
				</>) : (<>
					<Grid container
						direction="column"
						justifyContent="center"
						sx={{ maxWidth: '1200px' }}
					>
						<Grid container
							direction="row"
							sx={{ height: '5rem', mb: 4 }}
						>
							<Grid item
								display="flex"
								xs={5}
								sx={{ height: '100%' }}
							>
								<Grid item xs={6}
									display="flex"
									alignItems="center"
									justifyContent="center"
									sx={{ height: '100%' }}
								>
									<FetchAvatar
										avatar={gameData?.player1.avatar}
										sx={{ height: '5rem', width: '5rem' }}
									/>
								</Grid>
								<Grid item xs={6}
									alignItems="center"
									display="flex"
									justifyContent="center"
									sx={{
										height: '100%',
									}}
								>
									<Typography
										sx={{
											'@media (max-width: 550px)': {
												display: "none"
											}
										}}
									>
										{gameData?.player1.login}
									</Typography>
								</Grid>
							</Grid>
							<Grid item xs={2}
								display="flex"
								alignItems="center"
								justifyContent="center"
								sx={{ height: '100%' }}
							>
								<Typography variant='h6'>VS</Typography>
							</Grid>
							<Grid item
								display="flex"
								xs={5}
								sx={{ height: '100%' }}
							>
								<Grid item xs={6}
									display="flex"
									alignItems="center"
									justifyContent="center"
									sx={{
										height: '100%',
									}}
								>
									<Typography
										sx={{
											'@media (max-width: 550px)': {
												display: "none"
											}
										}}
									>
										{gameData?.player2.login}
									</Typography>
								</Grid>
								<Grid item xs={6}
									display="flex"
									alignItems="center"
									justifyContent="center"
									sx={{ height: '100%' }}
								>
									<FetchAvatar
										avatar={gameData?.player2.avatar}
										sx={{ height: '5rem', width: '5rem' }}
									/>
								</Grid>
							</Grid>
						</Grid>
						<Grid item xs={12}
							display="flex"
							justifyContent="center"
							alignItems="center"
							sx={{ width: '100%', height: "32rem", mb: 4 }}
						>
							<canvas
								onMouseMove={handleMouseMove}
								ref={gameCanvas}
								height={document.documentElement.clientWidth < 1300 ?
									Math.floor((document.documentElement.clientWidth * 0.70) * 0.533)
									: (1250 * 0.70) * 0.533
								}
								width={document.documentElement.clientWidth < 1300 ?
									Math.floor((document.documentElement.clientWidth * 0.70))
									: 1250 * 0.70
								}
							/>
						</Grid>
						<Grid container
							display="flex"
							alignItems="center"
							justifyContent="flex-end"
							sx={{ height: "3rem" }}
						>
							<Button
								variant="outlined"
								onClick={quitGame}
								sx={{
									'&:hover': {
										backgroundColor: '#ff9070',
									}
								}}
							>
								QUIT GAME
							</Button>
						</Grid>

					</Grid>
				</>)
			}
		</>
	);
};

export default Canvas;
