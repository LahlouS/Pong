import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PasswordValidationPipe implements PipeTransform {
	transform(value: any) {
		const password = value.password;
		const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/;
		if (!password) {
			throw new BadRequestException('Password is required');
		}
		if (!passwordFormat.test(password)) {
			throw new BadRequestException('Invalid password format');
		}
		return value;
	}
}

@Injectable()
export class LoginValidationPipe implements PipeTransform {
	transform(value: any) {
		const login = value.login;
		const loginFormat = /^([0-9a-zA-Z_]){3,20}$/;
		if (!login) {
			throw new BadRequestException('Login is required');
		}
		if (!loginFormat.test(login)) {
			throw new BadRequestException('Invalid login format');
		}
		return value;
	}
}

@Injectable()
export class LoginSoloValidationPipe implements PipeTransform {
	transform(value: any) {
		const loginFormat = /^([0-9a-zA-Z_]){3,20}$/;
		if (!value) {
			throw new BadRequestException('Login is required');
		}
		if (!loginFormat.test(value)) {
			throw new BadRequestException('Invalid login format');
		}
		return value;
	}
}

@Injectable()
export class LoginPasswordValidationPipe implements PipeTransform {
	transform(value: any) {
		const login = value.login;
		const password = value.password;
		const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/;
		const loginFormat = /^([0-9a-zA-Z_]){3,20}$/;
		if (!login) {
			throw new BadRequestException('Login is required');
		}
		if (!password) {
			throw new BadRequestException('Password is required');
		}
		if (!passwordFormat.test(password)) {
			throw new BadRequestException('Invalid password format');
		}
		return value;
	}
}
