import {
	Injectable,
	BadRequestException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import {
	toFileStream,
	toString,
	toCanvas,
	toDataURL,
} from 'qrcode';
import { Response } from 'express';
import { authenticator } from 'otplib';

@Injectable()
export class TwoFAService {
	constructor(
		private readonly usersService: UsersService,
	) {}

	public async isTwoFACodeValid(twoFACode: string, user: any) {


		return authenticator.verify({
			token: twoFACode,
			secret: user.twoFA,
		})
	}

	public async generateTwoFASecret(login: string) {


		const secret = authenticator.generateSecret();


		const otpauthUrl = authenticator.keyuri(
			login,
			`${process.env.TWOFA}`,
			secret
		);

		await this.usersService.setTwoFASecret(secret, login);


		return {
			secret,
			otpauthUrl
		}
	}

	public async QrCode(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl, {
			color: {
				dark: '#000000',
				light: '#FFFFFF'
//				light: '#F5F5FF'
			}

		});

	}
}
