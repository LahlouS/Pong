import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common"
import { Observable } from "rxjs"

@Injectable()
export class WsGuard implements CanActivate {

	canActivate(context: ExecutionContext) /*:  boolean | Promise<boolean> | Observable<boolean >*/ {
		return true
	}
}
