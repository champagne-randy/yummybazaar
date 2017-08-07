// TODO:
// - use StorageService to cache GraphQL client
// - see: http://dev.apollodata.com/angular2/server-side-rendering.html
// - see: http://diveraj.com/lets-make-tiny-gradebook-angular2-storage/
// TODO:
// - Use RxJS so I only have to query the backend once
// - will this give me the progressive SPA ux?
// - see: http://dev.apollodata.com/angular2/queries.html#rxjs
// - see: http://dev.apollodata.com/angular2/typescript.html
// TODO:
// - impl pagination | infinite scroll to reduce round-trip time
// - this is prolly not as useful in the index view cause I need entire brand catalog
// - this will be useful in the brand view
// - see: http://dev.apollodata.com/angular2/pagination.html
// TODO:
// - impl logic to update client side cache whenever catalog is updated on backend
// - see: http://dev.apollodata.com/angular2/receiving-updates.html


// NG core modules
import { 
	isDevMode
} 							from '@angular/core';

// 3rd party modules
import{  
	ApolloClient,
	createNetworkInterface
} 							from 'apollo-client';

// import project utils
import {
	getDevHeaders,
	getProdHeaders,
	getDevUri,
	getProdUri
}							from './_credentials';

// Polyfills 
import 'whatwg-fetch';		// fetch





// init uri based on app mode
let uri: string;
(isDevMode) 
? uri = getDevUri()
: uri = getProdUri();



// init headers based on app mode
let headers: Object[];
(isDevMode) 
? headers = getDevHeaders()
: headers = getProdHeaders();



// reduce array into a single object
let newHeaders = headers.reduce(
	(newHeaders: any, header: any) =>{
		// add new header hash to newHeader cache
		newHeaders[header.key] = header.value;
		return newHeaders;
	},
	{}
);



// initialize Apollo client
const client = new ApolloClient({
	networkInterface: createNetworkInterface({
		uri: uri,
		opts: {
			headers: newHeaders
		}
	})
});



// export function that serves client
export function getApolloClient(): ApolloClient {
	return client;
}




