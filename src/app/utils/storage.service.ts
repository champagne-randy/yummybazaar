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


	localData: any;
	

	save(name: string, data: any): void{

		// init data cache if exists
		this.localData  = localStorage.getItem('yummybazaar.com');
		if(this.localData){
			this.localData = JSON.parse(this.localData);
		}else{
			this.localData = {};
		}

		// add new item to cache
		this.localData[name] = data;

		// store cache
		localStorage.setItem('yummybazaar.com',JSON.stringify(this.localData))
	}


	get(name: string = null): any{

		// retrieve data cache if exists
		let data = JSON.parse(localStorage.getItem('yummybazaar.com'));
		if(!data){
			return undefined;
		}

		// retrieve item if exists
		if(name){
			if(data[name]){
				return data[name];
			}else{
				return {};
			}
		}
	}
}
