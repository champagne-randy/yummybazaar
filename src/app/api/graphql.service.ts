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
}  							from '../api';
import { 
	deepFindObjectProp,
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
export class GraphQLService implements OnInit, OnDestroy {

	serviceInitiated:			boolean;
	serviceDestroyed:			boolean;
	private loading: 	  		boolean;
	loadingStream:				Observable<boolean>;
	dataStream: 				ApolloQueryObservable<any>;
	private dataSub:			Subscription;
	private fetchMoreTrigger: 	Observable<boolean>;
	private fetchMoreSub: 		Subscription;
	private fetchMoreFlag: 	 	boolean;
	private cursor: 		 	string;
	

	
	constructor(
		private client: Apollo,
		private logger: LoggerService
	) { 

		// initial states for GraphQLService
		this.serviceInitiated 	= false;
		this.serviceDestroyed 	= false;
		this.loading 	 		= true;
		this.fetchMoreFlag 		= false;
		this.cursor 	 		= null;
	};



	ngOnInit(): void {

		// Debug
		this.logger.log('Starting GraphQLService.ngOnInit()');
		

		// run initialization logic
		this.init();


		// Debug
		this.logger.log('Completed GraphQLService.ngOnInit()');
	}


	ngOnDestroy(): void {

		// Debug
		this.logger.log('Starting GraphQLService.ngOnDestroy()');
		
		// run destruction logic
		this.destroy();

		// Debug
		this.logger.log('Completed GraphQLService.ngOnDestroy()');
	}



	// run new query against GraphQL API
	// ToDo:
	// x impl this
	// - test this manually
	// - impl unit tests
	fetch(
			query: any, 
			offset: string,
			limit: number,
			path2FetchMoreFlag: string,		// data.shop.collections.pageInfo.hasNextPage;
			path2Object: string				// data.shop.collections.edges.slice(-1)[0].cursor;
	): void {


		// don't fetch unless GraphQLService is initialized 
		if(!this.serviceInitiated)
			return;


		// Debug
		this.logger.log('Starting GraphQLService.init()');


		// initialize collection stream
		this.dataStream = this.client
			.watchQuery<any>(
				{
					query: query,
					variables: {
						offset: offset,
						limit: limit
					}
				}
			)
		;


		// TODO
		// - impl a stream that watches this.dataStream.complete
		// - it should update this.loading = !this.dataStream.complete



		// subscribe this.fetchMoreFlag & this.cursor to dataStream
		this.dataSub = this.dataStream.subscribe(
			({data, loading}) => {

				// Debug
				this.logger.log('Starting to consume payload from API');


				// - set fetchMoreFlag 
				this.fetchMoreFlag = deepFindObjectProp(data, path2FetchMoreFlag);


				// - set cursor
				this.cursor = deepFindObjectProp(data, path2Object).slice(-1)[0].cursor;


				// Debug
				this.logger.log('Finished consuming payload from API');
			},
			(err) => { 
				this.logger.error('Fetch error: ' + err.message); 
			}
		);	


		// Debug
		this.logger.log('Completed GraphQLService.init()');

	}



	// init GraphQLService
	// ToDo:
	// x impl this
	// x test this manually
	// - impl unit tests
	init(): void {

		// init fetchMoreTrigger
		this.fetchMoreTrigger = Observable
			.interval(100)					// poll every 100ms
			.map(()=>this.fetchMoreFlag)		// watch this.fetchMoreFlag
			.distinctUntilChanged()			// only react when it is change
			.filter(flag=>!!flag)			// only emit when this.fetchMoreFlag goes from false to true
		;


		// trigger this.fetchMore() once when this.fetchMoreFlag goes from false to true
		this.fetchMoreSub = this.fetchMoreTrigger.subscribe(
			() => this.fetchMore()
		);


		// mark GraphQLService as initialized
		this.serviceInitiated = true;
	}



	// init GraphQLService
	// ToDo:
	// x impl this
	// x test this manually
	// - impl unit tests
	destroy(): void {

		// cancel subscriptions
		this.dataSub.unsubscribe();
		this.fetchMoreSub.unsubscribe();

		// mark GraphQLService as destroyed
		this.serviceDestroyed = true;
	}



	// fetch additional results from GraphQL api if available
	// TODO:
	// - impl this
	//		+ how do I pass a custom resolver from client?  
	//		+ it should be an updateQuery
	// - test this manually
	// - impl unit tests
	private fetchMore(): void {

		// Debug
		this.logger.log('Starting GraphQLService.fetchMore()');


		// halt if there is no more data to be fetched
		if (!this.fetchMoreFlag){
			this.logger.warn('There is no more data to be fetched');
			return;
		}


		// fetch more data
		this.dataStream.fetchMore(
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
		this.logger.log('Completed GraphQLService.fetchMore()');
	}

}







	


