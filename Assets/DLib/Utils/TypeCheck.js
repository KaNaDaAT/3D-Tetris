import * as glm from '../gl-matrix/index.js';

/** 
 * Checks if the value is instance of a type.
 * @param {*} value - The value to check.
 * @param {Type} expectedType - The type thats expected.
 * @returns {Boolean} - true if instance of type and otherwise false.
 */
export function isType(value, expectedType) {
	if (value instanceof expectedType || typeof value === expectedType || value.constructor === expectedType)
		return true;
	if (value.constructor != null) {
		try {
			const checkValue = new value();
			return (checkValue instanceof expectedType || typeofcheckValue === expectedType);
		} catch (TypeError) {
			return false
		}
	}
	return false;
}

/**
 * Checks if a value is representing a number and returns it as such.
 * @param {*} value - The value to validate.
 * @returns {Number} Will be null if the check failed.
 */
export function isNumber(value) {
	if (value != null && !isNaN(value)) {
		return parseFloat(value);
	}
	return null;
}

/**
 * Checks if a value is representing a vec2 and returns it as an value.
 * @param {*} value - The value to validate.
 * @returns {Array<Number>} Will be null if the check failed.
 */
export function isVec2(value) {
	if (value == null)
		return null;
	if (Array.isArray(value) && value.length === 2) {
		return [value[0], value[1]];
	}
	if (value instanceof glm.glMatrix.ARRAY_TYPE && value.length === 2) {
		return [value[0], value[1]];
	}
	return null;
}

/**
 * Checks if a value is representing a vec3 and returns it as an value.
 * @param {*} value - The value to validate.
 * @returns {Array<Number>} Will be null if the check failed.
 */
export function isVec3(value) {
	if (value == null)
		return null;
	if (Array.isArray(value) && value.length === 3) {
		return [value[0], value[1], value[2]];
	}
	if (value instanceof glm.glMatrix.ARRAY_TYPE && value.length === 3) {
		return [value[0], value[1], value[2]];
	}
	return null;
}


/**
 * Checks if a value is representing a vec4 and returns it as an value.
 * @param {*} value - The value to validate.
 * @returns {Array<Number>} Will be null if the check failed.
 */
export function isVec4(value) {
	if (value == null)
		return null;
	if (Array.isArray(value) && value.length === 4) {
		return [value[0], value[1], value[2], value[3]];
	}
	if (value instanceof glm.glMatrix.ARRAY_TYPE && value.length === 4) {
		return [value[0], value[1], value[2], value[3]];
	}
	return null;
}

/** 
 * Checks if the value is instance of a type.
 * @param {*} value - The value to check.
 * @param {String} name - The name of the parameter that had an type error.
 * @param {Type} expectedType - The type thats expected.
 * @param {Boolean} [allowNull=false] - Wheter a null value is allowed or will throw.
 * @return {*} the value to validate the type for.
 * @throws {TypeError} - Throws on type mismatch.
 */
export function validateType(value, name, expectedType, allowNull = false) {
	if (value == null) return allowNull ? null : throwTypeError(name, expectedType, null);
	const check = isType(value, expectedType);
	if (!check) throwTypeError(name, expectedType, value);
	return value;
}

/**
 * Checks if a value is representing a number.
 * @param {*} value - The value to validate.
 * @param {String} name - The name of the parameter that had an type error.
 * @return {Boolean} allowZero - Does the value zero throw?.
 * @return {Number} the parsed number.
 * @throws {TypeError} - Throws on type mismatch.
 */
export function validateNumber(value, name = 'unknown', allowZero = true) {
	const check = isNumber(value);
	if (check == null) throwTypeError(name, 'number', value);
	if (!allowZero && check === 0) throw new Error(`The parameter ${name} is not allowed to be zero!`);
	return check;
}

/**
 * Checks if a value is representing a vec2.
 * @param {*} value - The value to validate.
 * @param {String} name - The name of the parameter that had an type error.
 * @param {Boolean} allowNumber - The name of the parameter that had an type error.
 * @return {Array<number>} the parsed vec2.
 * @throws {TypeError} - Throws on type mismatch.
 */
export function validateVec2(value, name = 'unknown', allowNumber = false) {
	let check = isVec2(value);
	if (check == null) {
		if (allowNumber) {
			check = isNumber(value);
			if (check != null)
				return [check, check, check, check]
		}
		throwTypeError(name, 'vec2', value);
	}
	return check;
}

/**
 * Checks if a value is representing a vec3.
 * @param {*} value - The value to validate.
 * @param {String} name - The name of the parameter that had an type error.
 * @param {Boolean} allowNumber - The name of the parameter that had an type error.
 * @return {Array<number>} the parsed vec3.
 * @throws {TypeError} - Throws on type mismatch.
 */
export function validateVec3(value, name = 'unknown', allowNumber = false) {
	let check = isVec3(value);
	if (check == null) {
		if (allowNumber) {
			check = isNumber(value);
			if (check != null)
				return [check, check, check, check]
		}
		throwTypeError(name, 'vec3', value);
	}
	return check;
}


/**
 * Checks if a value is representing a vec4.
 * @param {*} value - The value to validate.
 * @param {String} name - The name of the parameter that had an type error.
 * @param {Boolean} allowNumber - The name of the parameter that had an type error.
 * @return {Array<number>} the parsed vec3.
 * @throws {TypeError} - Throws on type mismatch.
 */
export function validateVec4(value, name = 'unknown', allowNumber = false) {
	let check = isVec4(value);
	if (check == null) {
		if (allowNumber) {
			check = isNumber(value);
			if (check != null)
				return [check, check, check, check]
		}
		throwTypeError(name, 'vec4', value);
	}
	return check;
}

/**
 * Throws a standard TypeError.
 * @param {String} name - The name of the parameter that had an type error.
 * @param {Type} expected - The expected type of the parameter.
 * @param {*} actual - The actual type or the value.
 */
export function throwTypeError(name, expected, actual) {
	if (expected != null && expected.name != null) {
		expected = expected.name;
	}
	if (actual != null) {
		if (actual.name == null && actual.constructor.name != null) {
			actual = actual.constructor.name;
		} else if (actual.name != null) {
			actual = actual.name;
		}
	}
	throw new TypeError(`Expected type similar to '${expected}' for parameter '${name}', but received '${actual}'`);
}