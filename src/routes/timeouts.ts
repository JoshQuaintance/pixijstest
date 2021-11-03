const timeouts = {};

/**
 * Executes function after a timeout
 * @param {function} callback The callback run after the timeout
 * @param {number} time The timeout amount in `ms`
 * @param {string} identifier The identifier used to store, and clear the timeout.
 */
export function executeAfterTimeout(
	callback: Function,
	time: number,
	identifier: string,
	runOnce: boolean = false
) {
	if (!callback) return console.error(new ReferenceError('The callback is not provided'));
	if (!time) return console.error(new ReferenceError('The timeout amount in ms is not provided'));
	if (!identifier)
		return console.error(new ReferenceError('The name of the timeout is not provided'));

	// Clears the timeout if it exists
	if (timeouts[identifier]) {
		if (runOnce) return;
		clearTimeout(timeouts[identifier]);
	}

	let newTimeout = setTimeout(() => {
		console.log(timeouts);
		callback();
		// Automatically clears the timeout and deletes it from the 'timeouts' object after it's run
		clearTimeout(timeouts[identifier]);
		delete timeouts[identifier];
	}, time);
	timeouts[identifier] = newTimeout;
	console.log(timeouts);
}

/**
 * Clear a timeout
 * @param identifier The identifier used to identify which timeout to clear
 */
export function cancelTimeout(identifier: string) {
	if (timeouts[identifier]) {
		clearTimeout(timeouts[identifier]);
		delete timeouts[identifier];
	} else {
		console.warn(`Timeout with identifier ${identifier} not found`);
	}
}
