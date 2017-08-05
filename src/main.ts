// NG core modules
import {
	enableProdMode
} 							from '@angular/core';
import { 
	platformBrowserDynamic 
} 							from '@angular/platform-browser-dynamic';

// Project Modules
import { 
	AppModule 
} 							from './app/app.module';

// Project Utils
import { 
	environment 
} 							from '../environments/environment';


// set App in prod mode depending on env
if (environment.production)
	enableProdMode();

// bootstrap AppModule
platformBrowserDynamic().bootstrapModule(AppModule);



