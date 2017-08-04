import { 
	Component,
	OnInit
}					 		from '@angular/core';
import { 
	Subject 
} 							from 'rxjs/Subject';
import { 
	LoggerService,
	startsWithAlpha	
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
	providers: 	[ VendorService ]
})
export class VendorIndexComponent implements OnInit {
	

	loading: 	  	 boolean;
	vendors: 	  	 any;
	numVendors:   	 number;
	vendorKeys:	  	 string[];
	selectedVendors: any[];
	

	
	constructor(
		private service: VendorService
	) { };



	ngOnInit() {
		this.service.init();
		this.init();
	}



	// ToDo:
	// - use a Stream based design pattern to initialize these members
	// - find a way to subscribe to the WatchQuery method from the Apllo client
	// - can i use an async/await pattern here?
	private init() {

		this.vendors 	= this.service.fetchAllVendors();
		this.numVendors = this.service.numVendors;
		this.vendorKeys = this.service.vendorKeys;

	}




}








