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
	CollectionsQuery,
	GraphQLService
}  							from '../api';
import { 
	LoggerService,
	startsWithAlpha	
}							from '../utils';




// TODO:
// - use StorageService to cache GraphQL client
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
@Injectable()
export class VendorService implements OnInit, OnDestroy {

	serviceInitiated:			boolean;
	serviceDestroyed:			boolean;
	private loading: 	  		boolean;
	loadingStream:				Observable<boolean>;
	private loadingSub:			Subscription;
	private vendorsCache: 	  	Object;
	vendorsStream: 				Observable<any>;
	private vendorsCacheSub: 	Subscription;
	private vendorKeys:	  		string[];
	vendorKeysStream: 			Observable<any>;
	private vendorKeysSub: 		Subscription;
	private selectedVendors:	Set<any>;
	selectedVendorsStream: 		Observable<any>;
	private selectedVendorsSub: Subscription;
	private serviceDataSub:		Subscription;
	private serviceloadingSub:	Subscription;
	private path2FetchMoreFlag: string;
	private path2Object:		string;
	
	

	
	constructor(
		private service: GraphQLService,
		private logger: LoggerService
	) { 
		this.loading 	 		= true;
		this.serviceInitiated	= false;
		this.serviceDestroyed 	= false;
		this.vendorsCache 		= {};
		this.path2FetchMoreFlag = 'data.shop.collections.pageInfo.hasNextPage';
		this.path2Object 		= 'data.shop.collections.edges';
	}



	ngOnInit(): void {

		// Debug
		this.logger.log('Starting VendorService.ngOnInit()');
		
		// run initialization logic
		this.init();

		// Debug
		this.logger.log('Completed VendorService.ngOnInit()');
	}


	ngOnDestroy(): void {

		// Debug
		this.logger.log('Starting VendorService.ngOnDestroy()');
		
		// run destruction logic
		this.destroy();

		// Debug
		this.logger.log('Completed VendorService.ngOnDestroy()');
	}



	// ToDo:
	// x impl this
	// x test this manually
	// - impl unit tests
	init(): void {

		// only initialized VendorService once
		if(this.serviceInitiated)
			return;


		// Debug
		this.logger.log('Starting VendorService.init()');



		// init GraphQLService if necessary
		if (!this.service.serviceInitiated)
			this.service.init();



		// init loadingStream
		this.loadingStream = Observable
			.interval(100)				// run every 100ms
			.map(()=>this.loading)		// poll this.loading
			.distinctUntilChanged()		// only react when it is change
		;
		// log update to this.loading
		this.loadingSub = this.loadingStream.subscribe(
			() => this.logger.log(`Updated loading`)
		);



		// init vendorsStream
		this.vendorsStream = Observable
			.interval(100)				// run every 100ms
			.map(()=>this.vendorsCache)	// poll this.vendorsCache
			.distinctUntilChanged()		// only react when it is change
		;
		// log update to this.vendorsCache
		this.vendorsCacheSub = this.vendorsStream.subscribe(
			() => this.logger.log(`Updated vendorsCache`)
		);



		// init vendorKeysStream
		this.vendorKeysStream = Observable
			.interval(100)					// run every 100ms
			.map(()=>this.vendorKeys)		// poll this.vendorKeys
			.distinctUntilChanged()			// only react when it is change
		;
		// log update to this.vendorKeys
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



		// subscribe to this.service's dataStream
		this.serviceDataSub = this.service.dataStream.subscribe(
			({data, loading}) => {

				// Debug
				this.logger.log('Starting to consume collections payload');


				// TODO:
				// - how should I use this loading property?
				this.loading = loading;


				// populate vendor cache
				this.vendorsCache = this.processNewVendors(data.shop.collections.edges);


				// generate vendor keys array
				this.vendorKeys = Object.keys(this.vendorsCache).sort();


				// select vendors with first key
				if (this.vendorKeys.length > 0) {
					this.setSelectedVendor(this.vendorKeys[0]);
				}


				// Debug
				this.logger.log('Finished consuming collections payload');
			},
			(err) => { 
				this.logger.error('Fetch error: ' + err.message); 
			}
		);	



		// subscribe to this.service's loadingStream
		this.serviceloadingSub = this.service.loadingStream.subscribe(
			(loading) => {
				this.loading = loading;
			}
		);



		// pre-fetch logic
		// TODO
		// - impl this
		//		query: any, 
		//		offset: string,
		//		limit: number,
		//		path2FetchMoreFlag: string,
		//		path2Object: string
		this.service.fetch(
			CollectionsQuery,
			null,
			250,
			this.path2FetchMoreFlag,
			this.path2Object
		);



		// mark VendorService as initialized
		this.serviceInitiated = true;



		// Debug
		this.logger.log('Completed VendorService.init()');

	}


	destroy(): void {

		// cancel subscriptions
		this.loadingSub.unsubscribe();
		this.vendorKeysSub.unsubscribe();
		this.vendorsCacheSub.unsubscribe();
		this.selectedVendorsSub.unsubscribe();
		this.serviceDataSub.unsubscribe();

		// destroy GraphQLService if necessary
		if(!this.service.serviceDestroyed)
			this.service.destroy();

		// mark service as destroyed
		this.serviceDestroyed = true;
	}



	// TODO:
	// - impl this
	// - test this manually
	// - impl unit tests
	setSelectedVendor(key: string): void {
		this.selectedVendors = this.vendorsCache[key];
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



}




