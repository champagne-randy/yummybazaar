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
	//GraphQLComponent,
	getApolloClient
}							from './graphql';
import { 
	LoggerService,
	StorageService 
}							from './utils';
import { 
	SelectorComponent 
} 							from './vendor/selector/selector.component';
import { ListComponent } from './vendor/list/list.component';






@NgModule({
	imports:      [ 
		ApolloModule.withClient(getApolloClient),
		BrowserModule,
	],
	providers:    [ 
		LoggerService,
		StorageService,
	],
	declarations: [ 
		AppComponent,
		DumbComponent,
		//GraphQLComponent,
		ProductIndexComponent,
		VendorIndexComponent,
		SelectorComponent,
		ListComponent,
	],
	exports:      [ 
		AppComponent,
	],
	bootstrap:    [ 
		AppComponent,
	]
})
export class AppModule {}






