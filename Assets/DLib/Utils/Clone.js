export function deepClone(object) {
	if (object == null)
		return object;
	if (object['clone'] !== undefined && typeof object.clone === 'function')
		return object.clone();
	const clone = new object.constructor();

	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			const value = object[key];
			if (typeof value === 'object' && value != null) {
				clone[key] = deepClone(value); // Recursively copy nested objects
			} else {
				clone[key] = value;
			}
		}
	}

	return clone;
}