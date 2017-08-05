import { 
	Injectable,
	isDevMode
} 					from '@angular/core';


function addTimeCode(msg: string): string {
	return `[${Date().split(' ')[4]}] ${msg}`;
}


@Injectable()
export class LoggerService {

	
	log(msg: any)   { 
		if (isDevMode())
			console.log(addTimeCode(msg)); 
	}


	error(msg: any) { 
		if (isDevMode())
			console.error(addTimeCode(msg)); 
	}


	warn(msg: any)  { 
		if (isDevMode())
			console.warn(addTimeCode(msg)); 
	}
}
