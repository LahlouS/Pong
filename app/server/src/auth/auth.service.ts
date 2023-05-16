import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './auth.types'
import { UserDto } from 'src/users/User.dto';
import { Response } from 'express'
import { jwtConstants} from "src/auth/constants";
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private readonly jwtService: JwtService
	) {}

	async validateUser(login: string, pass: string): Promise<any>{
		const user = await this.usersService.findOneUser(login);

		if (user && await bcrypt.compare(pass, user.password)) {
			const { password, ...result } = user;
			return (result);
		}

		return (null);
	}

	async login(user: any, response: Response) { // I put any to fit the tutorial but User seem to work fine

		const payload = { sub: user.id, login: user.login }
		const tokens = await this.getTokens(payload, response)
		await this.usersService.updateRefreshToken(payload.login, tokens.refreshToken);
		return {
			aT: tokens.accessToken
		}
	}

	async loginWithId(user: any, response: Response) { // I put any to fit the tutorial but User seem to work fine

		const payload = { sub: user.id, login: user.login }
		const tokens = await this.getTokens(payload, response)
		await this.usersService.updateRefreshToken(payload.login, tokens.refreshToken);
		return {
			id: user.id,
			aT: tokens.accessToken
		}
	}


	async logout(user: any, response: Response) {
		await this.usersService.updateRefreshToken(user.login, "");
		response.clearCookie(
			`${jwtConstants.refresh_jwt_name}`,
			{
				maxAge: 5000,
				httpOnly: true,
				sameSite: 'strict',

			}
		);
	}

	async refreshTokens(user: any, response: Response) {
		const userTry = await this.usersService.findOneUser(user.login);
		const tokens = await this.getTokens(user, response);
		await this.usersService.updateRefreshToken(user.login, tokens.refreshToken);
		return {
			aT: tokens.accessToken
		}
	}

	async getTwoFAToken(user: JwtPayload, response: Response) {

		const accessToken = await this.jwtService.signAsync(
			{
				sub: user.sub,
				login: user.login,
			},
			{
				secret: jwtConstants.twofa_jwt_secret,
				expiresIn: '5m',
			},
		);

		response.cookie(
			`${jwtConstants.twofa_jwt_name}`,
			accessToken,
			{
				maxAge: 300000,
				httpOnly: true,
				sameSite: 'strict'
			}
		);

	}

	async getTokens(user: JwtPayload, response: Response) {


		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(
				{
					sub: user.sub,
					login: user.login,
				},
				{
					secret: jwtConstants.jwt_secret,
					expiresIn: '10m',
	//				expiresIn: '2s',
				},
			),
			this.jwtService.signAsync(
				{
					sub: user.sub,
					login: user.login,
				},
				{
					secret: jwtConstants.refresh_jwt_secret,
					expiresIn: '7d',
				},
			),
		]);
		response.cookie(
			`${jwtConstants.refresh_jwt_name}`,
			refreshToken,
			{
				maxAge: 604800000,
				httpOnly: true,
				sameSite: 'strict'
			}
		);
		return {
			accessToken,
			refreshToken
		}

	}

	async get42ApiToken(client_code: string) {

		const requestOptions = {
			method: 'POST',
			header: {
				'Accept-Encoding' : 'application/json'
			}
		}

		const grant_type = 'authorization_code';
		const client_id = process.env.VITE_API_UID;
		const client_secret = process.env.API_SECRET;
		const code = client_code;
		const redirect_uri = `http://localhost:8080/redirect`;

		const response = await fetch('https://api.intra.42.fr/v2/oauth/token?' +
		`grant_type=${grant_type}&` +
		`client_id=${client_id}&` +
		`client_secret=${client_secret}&` +
		`code=${code}&` +
		`redirect_uri=${redirect_uri}`
		, requestOptions)
		.then(response => response.json())

		if (response['error'])
			return {
				statusCode: 403,
				body: response
		}
		return {
			statusCode: 200,
			body: response
		}
	}

}
