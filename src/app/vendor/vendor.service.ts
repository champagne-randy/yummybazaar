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

import { 
	Injectable,
	OnInit, 
	OnDestroy
} 							from '@angular/core';
import { 
	Angular2Apollo,
	ApolloQueryObservable
} 							from 'angular2-apollo';
import {
	CollectionsQuery
}  							from '../api/queries';
import { 
	LoggerService,
	startsWithAlpha	
}							from '../utils';
import { 
	Vendor 
}							from '.';
import { 
	Product 
}							from '../product';
import {
	Subject
} 							from 'rxjs/Subject';
import {
	Subscription
}							from 'rxjs/Subscription';




@Injectable()
export class VendorService {

	// public properties
	loading: 	  	 boolean;
	vendors: 	  	 any;
	numVendors:   	 number;
	vendorKeys:	  	 string[];
	selectedVendors: any[];

	// public streams
	

	// public subscriptions
	vendorSub: 		 Subscription;

	// private pagination properties
	private collectionStream: 	ApolloQueryObservable<any>;
	private hasNextPage: 	 	boolean;
	private cursor: 		 	string;
	

	
	constructor(
		private client: Angular2Apollo,
		private logger: LoggerService
	) { 
		this.loading = true;
		this.vendors = {};
		this.hasNextPage = true;
		this.cursor = null;
	};




	// TODO:
	// x test this manually
	// - impl unit tests
	public init() {

		// Debug
		this.logger.log('Starting VendorService.init()');


		this.collectionStream = this.client
			.watchQuery<any>(
				{
					query: CollectionsQuery,
					variables: {
						after: this.cursor
					}
				}
			)
		;



		this.vendorSub = this.collectionStream.subscribe(
			({data, loading}) => {

				// Debug
				this.logger.log('Starting to consume payload from API in VendorService.init()');


				// TODO:
				// - how should I use this loading property?
				this.loading = loading;


				// populate vendor cache
				this.vendors = this.processNewVendors(data.shop.collections.edges);


				// generate vendor keys array
				this.vendorKeys = Object.keys(this.vendors).sort();


				// select vendors with first key
				if (this.vendorKeys.length > 0) {
					this.selectedVendors = this.fetchVendorsByKey(this.vendorKeys[0]);
				}


				// config pagination properties
				this.hasNextPage = data.shop.collections.pageInfo.hasNextPage;
				this.cursor = data.shop.collections.edges.slice(-1)[0].cursor;


				// Debug
				this.logger.log('Finished consuming payload from API in VendorService.init()');
			},
			(err) => { 
				this.logger.error('Fetch error: ' + err.message); 
			}
		);	


		// Debug
		this.logger.log('Completed VendorService.init()');

	}



	// TODO:
	// x test this manually
	// - impl unit tests
	private processNewVendors(newVendors: any[]): void {

		// Debug
		this.logger.log('Starting VendorService.processNewVendors()');

		let res = null;
		if (newVendors) {
			res = newVendors
						.reduce(
							(C:any,v:any) => {
								
								let handle = v.node.handle[0];

								// test if vendor key is alphabetic
								let key;
								startsWithAlpha(handle)
								? key = handle[0]
								: key = 123
								
								// add vendor to cache
								!!C[key]
								? C[key].push(v)
								: C[key] = [v]	
								
								
								return C;
							},
							this.vendors
						)
			;
		}


		// Debug
		this.logger.log('Completed VendorService.processNewVendors()');

		return res;
	}



	// TODO:
	// - implement this
	//		+ can i use an async/await pattern here?
	// - test this manually
	// - impl unit tests
	public fetchAllVendors(): any[]{

		// Debug
		this.logger.log('Starting VendorService.fetchAllVendors()');
		
		//while(this.hasNextPage){
		//	this.collectionStream.fetchMore
		//}

		// Debug
		this.logger.log('Completed VendorService.fetchAllVendors()');

		return this.vendors;
	}



	// TODO:
	// - test this manually
	// - impl unit tests
	public fetchVendorsByKey(key: string): any[] {
		return this.vendors[key];
	}
}




