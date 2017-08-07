import { 
	Injectable,
	AfterViewInit,
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
	CollectionsQuery,
	InitializationQuery
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
export class GraphQLService implements AfterViewInit, OnDestroy {

	initiated:					boolean;
	destroyed:					boolean;
	private loading: 	  		boolean;
	loadingStream:				Observable<boolean>;
	dataStream: 				ApolloQueryObservable<any>;
	private dataSub:			Subscription;
	private fetchMoreTrigger: 	Observable<boolean>;
	private fetchMoreSub: 		Subscription;
	private fetchMoreFlag: 	 	boolean;
	private cursor: 		 	string;
	private clientDataStream: 	Observable<any>;
	private clientDataSub:		Subscription;
	

	
	constructor(
		private client: Apollo,
		private logger: LoggerService
	) { 

		// initial states for GraphQLService
		this.initiated 			= false;
		this.destroyed 			= false;
		this.loading 	 		= true;
		this.fetchMoreFlag 		= false;
		this.cursor 	 		= null;

		// run initialization logic
		this.init();
	};



	ngAfterViewInit(): void {

		// Debug
		this.logger.log('Starting GraphQLService.ngAfterViewInit()');
		

		// run initialization logic
		this.init();


		// Debug
		this.logger.log('Completed GraphQLService.ngAfterViewInit()');
	}


	ngOnDestroy(): void {

		// Debug
		this.logger.log('Starting GraphQLService.ngOnDestroy()');
		
		// run destruction logic
		this.destroy();

		// Debug
		this.logger.log('Completed GraphQLService.ngOnDestroy()');
	}



	// init GraphQLService
	// ToDo:
	// - impl this
	// - test this manually
	// - impl unit tests
	init(): void {


		// Debug
		this.logger.log('Starting GraphQLService.init()');


		// listen for the moment this.client is initialized
		this.clientDataStream = Observable
			.interval(100)						// poll every 100ms
			.map(()=>this.client)				// check this.client
			.distinctUntilChanged()				// only react when it is change
		;


		// log that this.client is initialized & ready for subscriptions
		this.clientDataSub = this.clientDataStream.subscribe(
			() => {
				this.logger.log('Apollo client is initialized & ready for subscriptions');
			}
		);



		// schedule fetchMoreTrigger
		this.fetchMoreTrigger = Observable
			.interval(100)						// poll every 100ms
			.map(()=>this.fetchMoreFlag)		// watch this.fetchMoreFlag
			.distinctUntilChanged()				// only react when it is change
			.filter(flag=>!!flag)				// only emit when this.fetchMoreFlag goes from false to true
		;


		// trigger this.fetchMore() once when this.fetchMoreFlag goes from false to true
		this.fetchMoreSub = this.fetchMoreTrigger.subscribe(
			() => this.fetchMore()
		);


		// mark GraphQLService as initialized
		this.initiated = true;


		// Debug
		this.logger.log('Completed GraphQLService.init()');
	}



	// run new query against GraphQL API
	// ToDo:
	// - impl this
	// - test this manually
	// - impl unit tests
	fetch(
			query: any, 
			offset: string,
			limit: number,
			path2FetchMoreFlag: string,
			path2Object: string
	): void {


		// fetch only if GraphQLService is initialized 
		if(!this.initiated)
			return;


		// Debug
		this.logger.log('Starting GraphQLService.fetch()');



		// TODO
		// - impl a stream that watches this.dataStream.complete
		// - it should update this.loading = !this.dataStream.complete



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



		// subscribe this.fetchMoreFlag & this.cursor to dataStream
		this.clientDataSub = this.clientDataStream.subscribe(
			({data, loading}) => {

				// Debug
				this.logger.log('Starting to consume API payload in GraphQlService.fetch()');


				// update fetchMoreFlag 
				try {
					this.fetchMoreFlag = deepFindObjectProp(data, path2FetchMoreFlag);
				}
				catch (e){
					this.logger.warn('failed to update fetchMoreFlag');
					this.logger.warn(e.message);
				}


				// update cursor
				try {
					this.cursor = deepFindObjectProp(data, path2Object).slice(-1)[0].cursor;
				}
				catch (e){
					this.logger.warn('failed to update cursor');
					this.logger.warn(e.message);
				}


				// Debug
				this.logger.log('Finished consuming API payload in GraphQlService.fetch()');
			},
			(err) => { 
				this.logger.error('Fetch error: ' + err.message); 
			}
		);


		// Debug
		this.logger.log('Completed GraphQLService.fetch()');

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
					);
				},
			}
		);

		// Debug
		this.logger.log('Completed GraphQLService.fetchMore()');
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
		this.clientDataSub.unsubscribe();

		// mark GraphQLService as destroyed
		this.destroyed = true;
	}

}







	


