import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from "@nestjs/common";
import { Request } from 'express';
import { jwtConstants} from "./constants";
import { JwtPayload } from './auth.types'


@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh'
) {
	constructor() {
		super({
			usernameField: 'login',
			jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                const data = request?.cookies[`${jwtConstants.refresh_jwt_name}`];
                if(!data){
                    return null;
                }
                return data
            }]),
			secretOrKey: jwtConstants.refresh_jwt_secret,
			passReqToCallback: true,
			ignoreExpiration: false
		  });
	}

	validate(request: Request, payload: JwtPayload) {
		const refreshToken = request?.cookies[`${jwtConstants.refresh_jwt_name}`];
		return { ...payload, refreshToken };
	}
}
