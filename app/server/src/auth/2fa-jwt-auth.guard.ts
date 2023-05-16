import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwoFAJwtAuthGuard extends AuthGuard('twofa') {}
