// NG core modules
import { 
	NgModule
} 							from '@angular/core';
import { 
	BrowserModule 
} 							from '@angular/platform-browser';

// 3rd party modules
import {
	ApolloClient,
	createNetworkInterface
} 							from 'apollo-client';
import { 
	ApolloModule 
} 							from 'apollo-angular';

// Project Components
import { 
	AppComponent 
} 							from './app.component';
import {
	VendorIndexComponent,
}							from './vendor'
import {
	ProductIndexComponent
} 							from './product';

// Project Services
import {
	provideClient
}							from './api';
import { 
	LoggerService,
	StorageService 
}							from './utils';
import {
	VendorService
}							from './vendor/vendor.service';






@NgModule({
	imports:      [ 
		ApolloModule.forRoot(provideClient),
		BrowserModule,
	],
	providers:    [ 
		LoggerService,
		StorageService,
		VendorService,
	],
	declarations: [ 
		AppComponent,
		ProductIndexComponent,
		VendorIndexComponent,
	],
	exports:      [ 
		AppComponent,
	],
	bootstrap:    [ 
		AppComponent,
	]
})
export class AppModule {}






