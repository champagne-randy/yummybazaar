/*
import { 
	Component,
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
	CollectionsQuery
}  							from '../api/queries';
import { 
	LoggerService,
	StorageService	
}							from '../utils';
import {
	VendorService
}							from './vendor.service';








@Component({
	selector: 	'vendor-index',
	template: 	require('./vendor-index.component.html'),
})
export class VendorIndexComponent implements OnInit, OnDestroy {
	

	vendorKeys:					any;
	private vendorKeysSub:		Subscription;
	selectedVendors:			any;
	private selectedVendorsSub:	Subscription;
	
	

	
	constructor(
		private logger: 	LoggerService,
		private service: 	VendorService,
		private storage:	StorageService
	) {
		// fetch last cache from local storage if exists
		this.vendorKeys 	 = this.storage.get('vendorKeys');
		this.selectedVendors = this.storage.get('selectedVendors');
	}; 



	ngOnInit(): void {


		// Debug
		this.logger.log('Starting VendorIndexComponent.ngOnInit()');



		// wait for VendorService to be initiated if necessary
		if (!this.service.serviceInitiated)
			this.service.init();



		// subscribe to vendorKeysStream from this.service
		// TODO
		// x impl this
		// - test this manually
		this.vendorKeysSub = this.service.vendorKeysStream.subscribe(
			(vendorKeys) => {

				// add new data to cache
				this.vendorKeys = vendorKeys;

				// add/update cache in local storage
				this.storage.save(
					'vendorKeys',
					this.vendorKeys
				);

				// Debug
				this.logger.log('Updated vendorKeys');
			}
		);



		// subscribe to selectedVendorsStream from this.service
		// TODO
		// x impl this
		// - test this manually
		this.selectedVendorsSub = this.service.selectedVendorsStream.subscribe(
			(selectedVendors) => {

				// add new data to cache
				this.selectedVendors = selectedVendors;

				// add/update cache in local storage
				this.storage.save(
					'selectedVendors',
					this.selectedVendors
				);

				// Debug
				this.logger.log('Updated selectedVendors');
			}
		);



		// Debug
		this.logger.log('Completed VendorIndexComponent.ngOnInit()');
	};



	ngOnDestroy(): void {

		// Debug
		this.logger.log('Starting VendorIndexComponent.ngOnDestroy()');


		// cancel local subscriptions
		this.vendorKeysSub.unsubscribe();
		this.selectedVendorsSub.unsubscribe();


		// wait for VendorService to be destroyed if necessary
		if(!this.service.serviceDestroyed)
			this.service.destroy();


		// Debug
		this.logger.log('Completed VendorIndexComponent.ngOnDestroy()');
	}



	selectVendor(key: string): void {

		// Debug
		this.logger.log('Starting VendorIndexComponent.selectVendor()');
		this.logger.log(`selecting vendors with key: ${JSON.stringify(key,null,4)}`);

		// use VendorService to change vendor selection
		this.service.setSelectedVendor(key);

		// Debug
		this.logger.log('Completed VendorIndexComponent.selectVendor()');
	}



}

*/






