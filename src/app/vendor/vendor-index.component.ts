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
	startsWithAlpha,
	StorageService	
}							from '../utils';
import { 
	Product 
}							from '../product';
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
		private service: 	VendorService,
		private storage:	StorageService
	) {
		// fetch properties from local storage if exists
		this.vendorKeys 	 = this.storage.get('vendorKeys');
		this.selectedVendors = this.storage.get('selectedVendors');
	}; 



	ngOnInit(): void {

		// init VendorService provider
		if (!this.service.completedInit)
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
	};



	ngOnDestroy(): void {

		// cancel subscriptions
		this.vendorKeysSub.unsubscribe();
		this.selectedVendorsSub.unsubscribe();

		// destroy service if necessary
		if(!this.service.completedDestroy)
			this.service.destroy();
	}



	fetchVendorsByKey(key: string): Set<any> {
		return this.service.fetchVendorsByKey(key);
	}



}








