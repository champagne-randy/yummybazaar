import { 
	Injectable,
	OnInit
}					 		from '@angular/core';
import * as _				from 'lodash';
import { 
	Product
}				 			from '../models';
import client 				from './graphql-client';
import Logger 				from '../logger.service';


@Injectable()
export class ProductService implements OnInit {
	

	// constructor
	constructor(
		private logger: 	Logger,
		private products: 	Product[],
		private brands: 	_.Dictionary<Product[]>
	) { };



	ngOnInit() {
		this.init();
	}



	init() {

		client
			.fetchAllProducts()
			.then(
				(catalog: Product[]) => {

					// populate products cache
					this.products = catalog;

					// populate brands cache
					this.brands = _.groupBy(catalog,(p)=>p.vendor);



					// Debug: inspect products cache
					this.logger.log(`Received ${this.products.length} products from Shopify backend`);
					//this.logger.log(JSON.stringify(this.products,null,4));

					// Debug: inspect brands cache
					this.logger.log(`Received ${Object.keys(this.brands).length} brands from Shopify backend`);
					//this.logger.log(JSON.stringify(this.brands,null,4));
				}
			)
			.catch(this.logger.error)
		;
	}




	getProduct(id: string) {
		return 	_.find(this.products,(p)=>p.id);
	}




	getBrand(vendor: string){
		return this.brands[vendor];
	}

}


