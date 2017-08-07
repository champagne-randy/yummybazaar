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
	

	vendorKeys:					Observable<string[]>;
	private vendorKeysSub:		Subscription;
	selectedVendors:			Observable<Set<any>>;
	private selectedVendorsSub:	Subscription;
	
	

	
	constructor(
		private logger: 	LoggerService,
		private service: 	VendorService,
		private storage:	StorageService
	) {
		// TODO
		// - these should be streams
		// - refac this to push data from storage onto the stream on startup
		// fetch properties from local storage if exists
		this.vendorKeys 	 = this.storage.get('vendorKeys');
		this.selectedVendors = this.storage.get('selectedVendors');
	}; 



	ngOnInit(): void {

		// Debug
		this.logger.log('Starting VendorIndexComponent.ngOnInit()');

		// init VendorService if necessary
		if (!this.service.serviceInitiated)
			this.service.init();

		// subscribe to vendorKeysStream
		this.vendorKeysSub = this.service.vendorKeysStream.subscribe(
			(data) => {
				this.vendorKeys = data;
				this.storage.save('vendorKeys',this.vendorKeys);
			}
		);

		// subscribe to selectedVendorsStream
		this.selectedVendorsSub = this.service.selectedVendorsStream.subscribe(
			(data) => {
				this.selectedVendors = data;
				this.storage.save('selectedVendors',this.selectedVendors);
			}
		);

		// Debug
		this.logger.log('Completed VendorIndexComponent.ngOnInit()');
	};



	ngOnDestroy(): void {

		// Debug
		this.logger.log('Starting VendorIndexComponent.ngOnDestroy()');

		// cancel subscriptions
		this.vendorKeysSub.unsubscribe();
		this.selectedVendorsSub.unsubscribe();

		// destroy VendorService if necessary
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








