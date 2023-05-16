
import { GameData, constants, updateData } from './gameType'


const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 640;

const SCORE_FONT = 75;
const TIMER_FONT = 70;
const ENDGAMEFONT = 130;


const drawCountDown = (canvas: any, countdown: number) => {

	// Set font to futuristic style and increase size by 50%
	const context = canvas.getContext('2d');

	context.beginPath();
	context.fillStyle =  '#15232f';
	context.arc(Math.floor(canvas.width / 2), Math.floor(canvas.heigth / 2), Math.floor(canvas.heigth / 4), 0, Math.PI * 2, false)
	context.fill();


	context.font = "112.5px 'Tr2n', sans-serif";

	// Set color and thickness for countdown text
	context.strokeStyle = '#2f8ca3';
	// context.textAlign = "center";
	// Draw countdown text
	context.strokeText(countdown.toString(), canvas.width / 2, canvas.height / 2);
	context.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
}

export function drawEndGame(canvas: any, p1score: number, p2score: number) {
	const context = canvas.getContext('2d');

	const scaledFont = Math.floor((ENDGAMEFONT * canvas.height) / CANVAS_HEIGHT);
	// Clear the canvas
	context.clearRect(0, 0, canvas.width, canvas.height);

	// draw background
	context.fillStyle = '#15232f';
	context.fillRect(0, 0, canvas.width, canvas.height);

	// Set the font and alignment for the text
	context.font = `${scaledFont}px 'Tr2n', sans-serif`;
	context.textAlign = "center";
	context.fillStyle = '#2f8ca3';

	// Draw the text in the center of the canvas
	context.fillText('Game Over', Math.floor(canvas.width / 2), Math.floor(canvas.height / 4));
	context.fillText(p1score.toString(), Math.floor(canvas.width / 4), Math.floor(canvas.height / 2) + 30)
	context.fillText(p2score.toString(), Math.floor((canvas.width - (canvas.width / 4))), Math.floor(canvas.height / 2) + 30)
}

function drawEndGameWatchers(canvas: any, gameData: GameData) {
	const context = canvas.getContext('2d');

	const scaledFont = Math.floor((ENDGAMEFONT * canvas.height) / CANVAS_HEIGHT);
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = '#15232f';
	context.fillRect(0, 0, canvas.width, canvas.height);

	context.font = `${scaledFont}px 'Tr2n', sans-serif`;
	context.textAlign = "center";
	context.fillStyle = '#2f8ca3';

	context.fillText(`Game Over\n${gameData.player1.login}: ${gameData.player1.score}\n${gameData.player2.login}: ${gameData.player2.score}`, canvas.width / 2, canvas.height / 2)
}

const drawTimer = (canvas: any, timer: number, gameDuration: number) => {
	const context = canvas.getContext('2d');

	// scaling the print
	const scaledFont = Math.floor((TIMER_FONT * canvas.height) / CANVAS_HEIGHT);
	const widthMargin = Math.floor( (350 * canvas.width) / CANVAS_WIDTH );
	const heightMargin = Math.floor((20 * canvas.height) / CANVAS_HEIGHT);


	const minute = Math.floor((((gameDuration - timer) * 16) / 1000) / 60);
	const seconde = Math.floor((((gameDuration - timer) * 16) / 1000) % 60);

	const toString = minute.toString() + ':' + seconde.toString().padStart(2, '0');

	// Set font to futuristic style and increase size by 50%
	context.font = `${scaledFont}px 'Tr2n', sans-serif`;

	// Set color and thickness for countdown text
	context.strokeStyle = '#2f8ca3';

	// Draw timer text
	context.strokeText(toString, canvas.width / 2 + widthMargin, canvas.height - heightMargin);
}


const drawScore = (canvas: any, scorePlayer1: number, scorePlayer2: number) => {
	const context = canvas.getContext('2d');

	const scorePlayer1str = scorePlayer1.toString()
	const scorePlayer2str = scorePlayer2.toString()
	//scaling
	const scaledFont = Math.floor((SCORE_FONT * canvas.height) / CANVAS_HEIGHT);
	const heightMargin = Math.floor((85 * canvas.height) / CANVAS_HEIGHT);
	const widthMargin = Math.floor( (40 * canvas.width) / CANVAS_WIDTH );

	// Set font to futuristic style
	context.font = `${scaledFont}px 'Tr2n', sans-serif`;


	// Measure the width of players login text
	const player1LoginWidth = context.measureText(scorePlayer1str).width;
	const player2LoginWidth = context.measureText(scorePlayer2str).width;

	// Draw player 1 score
	context.fillStyle = '#2f8ca3';
	context.fillText(scorePlayer1str, canvas.width / 2 - (player1LoginWidth + widthMargin), heightMargin);

	// Draw player 2 score
	context.fillStyle = '#2f8ca3';
	context.fillText(scorePlayer2str, canvas.width / 2 + player2LoginWidth, heightMargin);
}

export const draw = (canvas: any, game: updateData, gameModel: constants) => {

	// scaling game to current height and width
	const scale_p1y = Math.floor(game.p1y * gameModel.playerYratio);
	const scale_p2y = Math.floor(game.p2y * gameModel.playerYratio);
	const scale_bx = Math.floor(game.bx * gameModel.ballXratio);
	const scale_by = Math.floor(game.by * gameModel.ballYratio);

	const context = canvas.getContext('2d');

	// background
	context.fillStyle = '#15232f';
	context.fillRect(0, 0, canvas.width, canvas.height);

	drawScore(canvas, game.p1score, game.p2score);
	drawTimer(canvas, game.timer, gameModel.gameDuration);

	if (game.countDown > 0)
		drawCountDown(canvas,game.countDown);

	// dram middle line
	context.strokeStyle = 'white';
	context.beginPath();
	context.moveTo(canvas.width / 2, 0);
	context.lineTo(canvas.width / 2, canvas.height);
	context.stroke();

	// draw players
	context.fillStyle = 'white';
	if (gameModel.Playerwidth && gameModel.margin && gameModel.Playerheight) {
		context.fillRect(gameModel.margin, scale_p1y - (gameModel.Playerheight / 2), gameModel.Playerwidth, gameModel.Playerheight);
		context.fillRect(canvas.width - (gameModel.Playerwidth + gameModel.margin), scale_p2y - (gameModel.Playerheight / 2), gameModel.Playerwidth, gameModel.Playerheight);
	}

	// draw ball
	context.beginPath();
	context.fillStyle = 'white';
	context.arc(scale_bx, scale_by, gameModel.ballRad, 0, Math.PI * 2, false)
	context.fill();
};
