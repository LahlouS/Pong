import {
  ClassSerializerInterceptor,
  UnauthorizedException,
  BadRequestException,
  Controller,
  Header,
  Param,
  Body,
  Post,
  Get,
  UseInterceptors,
  Res,
  UseGuards,
  Request,
  Req,
  HttpCode,
  Query,
} from '@nestjs/common';
import { TwoFAService } from './twofa.service';
import { UsersService } from 'src/users/users.service'
import { AuthService } from 'src/auth/auth.service'
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TwoFAJwtAuthGuard } from 'src/auth/2fa-jwt-auth.guard';
import { jwtConstants} from "src/auth/constants";

@Controller('2fa')
//@UseInterceptors(ClassSerializerInterceptor)
export class TwofaController {
	constructor(
		private readonly twoFAService: TwoFAService,
		private readonly usersService: UsersService,
		private readonly authService: AuthService,
	) {}

	@UseGuards(JwtAuthGuard)
	@Post('generate')
	async register(
		@Res() response: Response, 
		@Request() req: any,
	) {
		const { otpauthUrl } = await this.twoFAService.generateTwoFASecret(req.user.login);

		return this.twoFAService.QrCode(response, otpauthUrl)
	}


	@UseGuards(JwtAuthGuard)
	@Get('activate')
	@HttpCode(200)
	async isActivate(
		@Req() request: any,
		@Body() body : any
	) {
		const user = await this.usersService.findOneUser(request.user.login);

		if (!user)
			throw BadRequestException;

		return {
			isTfaActivate: user.isTwoFA
		}
	}



/*	@UseGuards(JwtAuthGuard)
	@Get('turn-on')
	@HttpCode(200)
	async turnOnTFAuthentication(
		@Req() request: any,
		@Body() body : any
	) {

		const isCodeValid = await this.twoFAService.isTwoFACodeValid(
			body.twoFA,
			request.user.login
		);

		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}

		return await this.usersService.turnOnTwoFA(request.user.login);
	}*/

	@UseGuards(JwtAuthGuard)
	@Get('turn-off')
	@HttpCode(200)
	async turnOffTFAuthentication(
		@Req() request: any,
		@Body() body : any
	) {
		return await this.usersService.turnOffTwoFA(request.user.login);
	}


	@UseGuards(TwoFAJwtAuthGuard)
	@Post('authenticate')
	@HttpCode(200)
	async authenticate(
		@Req() req: any,
		@Query() { twoFA }: any,
		@Res({ passthrough: true }) response: Response
	) {

		const user = await this.usersService.findOneUser(req.user.login);

		if (!user)
			throw new BadRequestException();

		const isCodeValid = await this.twoFAService.isTwoFACodeValid(
			twoFA,
			user,
		);

		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}

		response.cookie(
			`${jwtConstants.twofa_jwt_name}`,
			null,
			{
				maxAge: 5000,
				httpOnly: true,
				sameSite: 'strict',

			}
		)

		return await this.authService.login(user, response);

	}

	@UseGuards(JwtAuthGuard)
	@Post('authenticate-first')
	@HttpCode(200)
	async authenticateFirst(
		@Req() req: any,
		@Query() { twoFA }: any,
		@Res({ passthrough: true }) response: Response
	) {

		const user = await this.usersService.findOneUser(req.user.login);

		if (!user)
			throw new BadRequestException();

		const isCodeValid = await this.twoFAService.isTwoFACodeValid(
			twoFA,
			user,
		);


		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}

		return await this.usersService.turnOnTwoFA(user.login);
	}

	@UseGuards(TwoFAJwtAuthGuard)
	@Get('authorisation')
	async checkToken(@Req() req: any,) {
		const {sub, login} = req.user.login;
		return {
			login: login,
			id: sub
		}
	}


}
