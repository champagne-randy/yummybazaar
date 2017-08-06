// TODO
// - impl this
// 		+ move this logic to a helper function named deepFindObjectProp
//		+ export this to Utils module
// 		+ do this Functionally
// 		+ split path2FetchMoreFlag on '.'
// 		+ iterate through paths collection with reduce()
// 		+ start with data object
// 		+ return object that's 1 layer deeper
//		+ how do I impl safety checks?
// - test this manually
// - impl unit test
// - see: https://stackoverflow.com/a/22129960/7897335
export const deepFindObjectProp = (obj: Object, paths: string): any => {

	return  paths.split('.')
				.reduce(
					(prevObj, curKey) => {
						return !!prevObj ? prevObj[curKey] : undefined
					}, 
					obj
				)
	;
}

