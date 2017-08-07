import { 
	Injectable 
} 					from '@angular/core';





// TODO:
// - look into Redux
// - can I use it to implement a more robust local storage?
// - see: http://onehungrymind.com/build-better-angular-2-application-redux-ngrx/
// - see: http://dev.apollodata.com/angular2/redux.html
// - http://redux.js.org/
@Injectable()
export class StorageService {


	localCache: any;


	constructor(){

		// init data cache if exists
		this.localCache  = localStorage.getItem('yummybazaar.com');
		if(this.localCache){
			this.localCache = JSON.parse(this.localCache);
		}else{
			this.localCache = {};
		}

	}
	

	save(key: string, data: any): void {

		// add new item to cache
		this.localCache[key] = data;

		// store cache
		localStorage.setItem('yummybazaar.com',JSON.stringify(this.localCache))
	}


	get(key: string): any {

		let savedObject = undefined;

		// retrieve data cache if exists
		let savedCache = JSON.parse(localStorage.getItem('yummybazaar.com'));
		if(savedCache){
			// retrieve item if exists
			if(savedCache[key]){
				return savedCache[key];
			}else{
				return {};
			}
		}
	}


	saved(key: string): boolean {

		let status = false;

		// return bool indicating if this object was saved before
		if (this.localCache && !!this.localCache[key]) 
			status = true;

		return status;
	}


}






