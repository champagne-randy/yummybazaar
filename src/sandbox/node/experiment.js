'use strict';


const Rx 		= require('rxjs');


// action to run when new data flows on stream
const printMessage = (message) => console.log(message);



// create observable 
const stream = Rx.Observable.create(
	(observer) => {

		// simulate async event that fires every 1 second
		let value = 0;
		const interval = setInterval(
			() => {
				observer.next(value);
				value++;
			}, 
			1000
		);

		// return function with clean up logic
		return () => clearInterval(interval);
	}
);

// subscribe to observable
const subscription = stream.subscribe(val => console.log(val));


// unsubscribe after 10 seconds
setTimeout(
	() => {
		subscription.unsubscribe();
	}, 
	10000
);






