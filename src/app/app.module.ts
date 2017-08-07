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
	DumbComponent
}							from './vendor'
import {
	ProductIndexComponent
} 							from './product';

// Project Services
import {
	GraphQLService,
	getApolloClient
}							from './api';
import { 
	LoggerService,
	StorageService 
}							from './utils';






@NgModule({
	imports:      [ 
		ApolloModule.withClient(getApolloClient),
		BrowserModule,
	],
	providers:    [ 
		GraphQLService,
		LoggerService,
		StorageService,
	],
	declarations: [ 
		AppComponent,
		DumbComponent,
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






