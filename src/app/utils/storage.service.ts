import { 
	Injectable 
} 					from '@angular/core';





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
