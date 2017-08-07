import { 
	AfterViewInit,
	Component,
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
	startsWithAlpha,
	StorageService
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
@Component({
	selector: 	'vendor-index',
	template: 	require('./vendor-index.component.html'),
})
export class VendorIndexComponent implements AfterViewInit, OnDestroy {

	loading: 	  				boolean;
	vendors: 	  				Object;
	vendorKeys:			  		Set<string>;
	selectedVendors:			any[];			// update type to Vendor interface from vendor.model.ts
	private dataSub:			Subscription;
	private path2FetchMoreFlag: string;
	private path2Object:		string;
	
	

	
	constructor(
		private service: 	GraphQLService,
		private logger: 	LoggerService,
		private storage:	StorageService
	) { 

		// set initial state
		this.loading 	 		= true;
		this.vendors 			= {};
		this.vendorKeys 		= new Set<string>();
		this.path2FetchMoreFlag = 'data.shop.collections.pageInfo.hasNextPage';
		this.path2Object 		= 'data.shop.collections.edges';


		// fetch vendors cache from local storage if exists
		if (this.storage.saved('vendors'))
			this.vendors 		 = this.storage.get('vendors');


		// fetch vendorKeys cache from local storage if exists
		if (this.storage.saved('vendorsKeys'))
			this.vendorKeys 	 = this.storage.get('vendorKeys');


		// fetch selectedVendors cache from local storage if exists
		if (this.storage.saved('selectedVendors'))
			this.selectedVendors = this.storage.get('selectedVendors');
	}



	ngAfterViewInit(): void {

		// Debug
		this.logger.log('Starting VendorIndexComponent.ngAfterViewInit()');
		
		// run initialization logic
		this.subscribe2Service();

		// Debug
		this.logger.log('Completed VendorIndexComponent.ngAfterViewInit()');
	}



	ngOnDestroy(): void {

		// Debug
		this.logger.log('Starting VendorIndexComponent.ngOnDestroy()');
		
		// run destruction logic
		this.destroy();

		// Debug
		this.logger.log('Completed VendorIndexComponent.ngOnDestroy()');
	}



	// ToDo:
	// x impl this
	// x test this manually
	// - impl unit tests
	subscribe2Service(): void {


		// Debug
		this.logger.log('Starting VendorIndexComponent.subscribe2Service()');



		// wait for GraphQLService to be initiated if necessary
		if (!this.service.initiated)
			this.service.init();



		// subscribe to dataStream from this.service
		this.dataSub = this.service.dataStream.subscribe(
			({data, loading}) => {

				// Debug
				this.logger.log('Starting to consume API payload in VendorIndexComponent.fetch()');


				// TODO:
				// - how should I use this loading property?
				this.loading = loading;


				// populate vendor cache
				try {
					this.processNewVendors(data.shop.collections.edges);
				}
				catch (e) {
					this.logger.warn('failed to process new vendors');
					this.logger.warn(e.message);
				}


				// select vendors with first key
				if (this.vendorKeys.size > 0) {
					this.selectVendor(null);
				}


				// Debug
				this.logger.log('Finished consuming API payload in VendorIndexComponent.fetch()');
			},
			(err) => { 
				this.logger.error('Fetch error: ' + err.message); 
			}
		);	



		// use this.service to trigger pre-fetch
		// TODO
		// - impl this
		//		query: any, 
		//		offset: string,
		//		limit: number,
		//		path2FetchMoreFlag: string,
		//		path2Object: string
		// - test this manually
		this.service.fetch(
			CollectionsQuery,
			null,
			250,
			this.path2FetchMoreFlag,
			this.path2Object
		);



		// Debug
		this.logger.log('Completed VendorIndexComponent.subscribe2Service()');

	}


	destroy(): void {

		// cancel subscriptions
		this.dataSub.unsubscribe();

		// destroy GraphQLService if necessary
		if(!this.service.destroyed)
			this.service.destroy();
	}



	// TODO:
	// - impl this
	// - test this manually
	// - impl unit tests
	selectVendor(key: string): void {

		// Debug
		this.logger.log('Starting VendorIndexComponent.selectVendor()');

		
		// if key was supplied
		if (key){

			// update selectedVendors
			this.selectedVendors = this.vendors[key];
		}
		else{

			// select first vendor if exists
			let firstVendorKey = this.vendorKeys[0];
			if (firstVendorKey)
				this.selectedVendors = this.vendors[firstVendorKey];
			else
				this.selectedVendors = null;
		}


		// Debug
		if (this.selectedVendors)
			this.logger.log(`selected vendors with key: ${JSON.stringify(key,null,4)}`);
		else
			this.logger.error('cache has no vendors to select from');


		// Debug
		this.logger.log('Completed VendorIndexComponent.selectVendor()');
	}



	// TODO:
	// x impl this
	// x test this manually
	// - impl unit tests
	private processNewVendors(newVendors: any[]): void {

		// Debug
		this.logger.log('Starting VendorIndexComponent.processNewVendors()');

		
		if (newVendors) {
			this.vendors = newVendors.reduce(
				(C:any,newVendor:any) => {
					
					let handle = newVendor.node.handle[0];

					// test if vendor key is alphabetic
					let key;
					startsWithAlpha(handle)
					? key = handle[0]
					: key = 123
					
					// add vendor to cache
					!!C[key]
					? C[key].add(newVendor)
					: C[key] = (new Set).add(newVendor)	


					// update vendorKeys cache
					this.vendorKeys.add(newVendor)
					
					
					return C;
				},
				this.vendors
			);


			// saved updated caches in local storage
			this.storage.save(
				'vendors',
				this.vendors
			);
			this.storage.save(
				'vendorKeys',
				this.vendorKeys
			);


			// Debug
			this.logger.log(`Processed ${newVendors.length} vendors`);
		}




		// Debug
		this.logger.log('Completed VendorIndexComponent.processNewVendors()');
	}



}




