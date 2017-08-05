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
}					 		from '@angular/core';
import {
	Observable
} 							from 'rxjs';
import {
	Subscription
}							from 'rxjs/Subscription';
import { 
	Apollo,
	ApolloQueryObservable
} 							from 'apollo-angular';
import {
	CollectionsQuery
}  							from '../api/queries';
import { 
	LoggerService,
	startsWithAlpha	
}							from '../utils';




@Injectable()
export class VendorService implements OnInit, OnDestroy {

	completedInit:				boolean;
	completedDestroy:			boolean;
	private loading: 	  		boolean;
	private vendorsCache: 	  	Object;
	vendorsCacheStream: 		Observable<any>;
	vendorsCacheSub: 			Subscription;
	private vendorKeys:	  		string[];
	vendorKeysStream: 			Observable<any>;
	vendorKeysSub: 				Subscription;
	private selectedVendors:	Set<any>;
	selectedVendorsStream: 		Observable<any>;
	selectedVendorsSub: 		Subscription;
	private collectionStream: 	ApolloQueryObservable<any>;
	private collectionSub:		Subscription;
	private fetchMoreStream: 	Observable<boolean>;
	private fetchMoreSub: 		Subscription;
	private hasNextPage: 	 	boolean;
	private cursor: 		 	string;
	

	
	constructor(
		private client: Apollo,
		private logger: LoggerService
	) { 
		this.completedInit 		= false;
		this.completedDestroy 	= false;
		this.loading 	 		= true;
		this.vendorsCache 		= {};
		this.hasNextPage 		= false;
		this.cursor 	 		= null;
	};



	ngOnInit(): void {
		this.init();
	}


	ngOnDestroy(): void {
		this.destroy();
	}



	// ToDo:
	// x impl this
	// x test this manually
	// - impl unit tests
	init(): void {

		// only initialized VendorService once
		if(this.completedInit)
			return;


		// Debug
		this.logger.log('Starting VendorService.init()');


		// initialize collection stream
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


		// parse vendors from collection stream
		this.collectionSub = this.collectionStream.subscribe(
			({data, loading}) => {

				// Debug
				this.logger.log('Starting to consume payload from API in VendorService.init()');


				// TODO:
				// - how should I use this loading property?
				this.loading = loading;


				// populate vendor cache
				this.vendorsCache = this.processNewVendors(data.shop.collections.edges);


				// generate vendor keys array
				this.vendorKeys = Object.keys(this.vendorsCache).sort();


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



		// init vendorsCacheStream
		this.vendorsCacheStream = Observable
			.interval(100)				// run every 100ms
			.map(()=>this.vendorsCache)	// poll vendorsCache
			.distinctUntilChanged()		// only react when it is change
		;
		// trigger this.vendorsCache() once when this.vendorsCache goes from false to true
		this.vendorsCacheSub = this.vendorsCacheStream.subscribe(
			() => this.logger.log(`Updated vendorsCache`)
		);



		// init vendorKeysStream
		this.vendorKeysStream = Observable
			.interval(100)					// run every 100ms
			.map(()=>this.vendorKeys)		// poll vendorKeys
			.distinctUntilChanged()			// only react when it is change
		;
		// trigger this.vendorKeys() once when this.vendorKeys goes from false to true
		this.vendorKeysSub = this.vendorKeysStream.subscribe(
			() => this.logger.log(`Updated vendorKeys`)
		);



		// init selectedVendorsStream
		this.selectedVendorsStream = Observable
			.interval(100)					// run every 100ms
			.map(()=>this.selectedVendors)	// poll selectedVendors
			.distinctUntilChanged()			// only react when it is change
		;
		// trigger this.selectedVendors() once when this.selectedVendors goes from false to true
		this.selectedVendorsSub = this.selectedVendorsStream.subscribe(
			() => this.logger.log(`Updated selectedVendors`)
		);



		// init fetchMoreStream
		this.fetchMoreStream = Observable
			.interval(100)					// run every 100ms
			.map(()=>this.hasNextPage)		// poll hasNextPage
			.distinctUntilChanged()			// only react when it is change
			.filter(flag=>!!flag)			// only emit this.hasNextPage goes from false to true
		;
		// trigger this.fetchMore() once when this.hasNextPage goes from false to true
		this.fetchMoreSub = this.fetchMoreStream.subscribe(
			() => this.fetchMore()
		);



		// mark VendorService as initialized
		this.completedInit = true;


		// Debug
		this.logger.log('Completed VendorService.init()');

	}


	destroy(): void {

		// cancel subscriptions
		this.vendorsCacheSub.unsubscribe();
		this.vendorKeysSub.unsubscribe();
		this.selectedVendorsSub.unsubscribe();
		this.collectionSub.unsubscribe();
		this.fetchMoreSub.unsubscribe();

		// mark VendorService as destroyed
		this.completedDestroy = true;
	}



	// TODO:
	// x impl this
	// x test this manually
	// - impl unit tests
	private fetchMore(): void {

		// Debug
		this.logger.log('Starting VendorService.fetchMore()');


		// halt if there is no more data to be fetched
		if (!this.hasNextPage){
			this.logger.warn('There is no more data to be fetched');
			return;
		}


		// fetch more data
		this.collectionStream.fetchMore(
			{
				variables: {
					after: this.cursor
				},
				updateQuery: (prev: any, { fetchMoreResult } :any) => 
				{
					// Debug
					//this.logger.log(`res is: ${JSON.stringify(res,null,4)}`);

					// register new results with Apollo client
					return Object.assign(
								{}, 
								prev, 
								{
									shop: {
										collections: {
											edges: [
												...prev.shop.collections.edges, 
												...fetchMoreResult.shop.collections.edges,
											],
											pageInfo: fetchMoreResult.shop.collections.pageInfo,
											__typename: "CollectionConnection"
										},
									},
									__typename: "Shop"
								}
							)
					;
				},
			}
		);

		// Debug
		this.logger.log('Completed VendorService.fetchMore()');
	}



	// TODO:
	// x impl this
	// x test this manually
	// - impl unit tests
	private processNewVendors(newVendors: any[]): Object {

		// Debug
		this.logger.log('Starting VendorService.processNewVendors()');

		let newVendorCache = null;
		if (newVendors) {
			newVendorCache = newVendors
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
								? C[key].add(v)
								: C[key] = (new Set).add(v)	
								
								
								return C;
							},
							this.vendorsCache
						)
			;
		}


		// Debug
		this.logger.log(`Processed ${newVendors.length} vendors`);
		this.logger.log('Completed VendorService.processNewVendors()');

		return newVendorCache;
	}



	// TODO:
	// x impl this
	// x test this manually
	// - impl unit tests
	fetchVendorsByKey(key: string): Set<any> {
		return this.vendorsCache[key];
	}



}




