import * as glm from '../gl-matrix/index.js';
import {
	isNumber,
	isVec3,
	isVec4,
	throwTypeError,
	validateType,
	validateVec3,
} from '../Utils/TypeCheck.js';
import { GameObject } from './GameObject.js';
import { Quaternion } from './Quaternion.js';

/**
 * An Transform similar to and Unity Transform.<br>
 * Manipulate in order to move, scale or rotate an object.<br>
 * @class
 * @param {['x', 'y', 'z']} position - The position of the transform.
 * @param {['x', 'y', 'z', 'w']} rotation - The rotation of the transform.
 * @param {['x', 'y', 'z']} scale - The scale of the transform.
 */
export class Transform {

	/** @type {GameObject} */
	#gameObject = null;
	/** @type {GameObject} */
	get gameObject() { return this.#gameObject; }

	/** @type {Transform} */
	#parent = null;
	/** @type {Transform} The parent of this transform */
	get parent() { return this.#parent; }
	set parent(x) {
		if (x === this.#parent) return;
		if (this.#parent != null)
			this.#parent.#children = this.#parent.#children.filter(x => x !== this);
		this.#parent = validateType(x, 'parent', Transform, true);
		if (this.#parent != null)
			this.#parent.#children.push(this);
	}

	/** @type {Transform[]} */
	#children = [];
	/** @type {Transform[]} The children of this {@link Transform}. */
	get children() { return [...this.#children]; }



	/** @type {['x', 'y', 'z']} */
	#position;
	/** @type {['x', 'y', 'z']} */
	get position() { return this.#position; }
	set position(x) { this.#position = validateVec3(x, 'position'); }
	// ToDo: Flip position = worldPosition and worldPosition becomes localPosition
	get worldPosition() { return glm.vec3.transformMat4(glm.vec3.create(), glm.vec3.create(), this.transformationMatrix); }
	/** @type {['x', 'y', 'z', 'w']} */
	#rotation;
	/** @type {['x', 'y', 'z', 'w']} represented as quaternion. Can be set as such or as ['pitch', 'yaw', 'roll'] euler angles. */
	get rotation() { return this.#rotation; }
	set rotation(x) {
		const vec3Check = isVec3(x);
		if (vec3Check != null) {
			this.#rotation = Quaternion.eulerToQuat(vec3Check);
			return;
		}
		const vec4Check = isVec4(x);
		if (vec4Check != null) {
			this.#rotation = vec4Check;
			return;
		}
		throwTypeError('rotation', 'vec3|vec4', typeof x)
	}
	/** @type {['x', 'y', 'z']} */ #scale;
	/** @type {['x', 'y', 'z']} */
	get scale() { return this.#scale; }
	set scale(x) { this.#scale = validateVec3(x, 'scale'); }

	/**
	 * Returns the local transformation Matrix.
	 * @type {glm.mat4} 
	 */
	get localTransformationMatrix() {
		const translationMatrix = glm.mat4.create();
		glm.mat4.fromTranslation(translationMatrix, this.#position);
		const rotationMatrix = glm.mat4.create();
		glm.mat4.fromQuat(rotationMatrix, this.#rotation);
		const scaleMatrix = glm.mat4.create();
		glm.mat4.fromScaling(scaleMatrix, this.#scale);

		const transformationMatrix = glm.mat4.create();
		glm.mat4.multiply(transformationMatrix, translationMatrix, rotationMatrix);
		glm.mat4.multiply(transformationMatrix, transformationMatrix, scaleMatrix);
		return transformationMatrix;
	}

	/**
	 * Returns the world transformation Matrix.
	 * @type {glm.mat4} 
	 */
	get transformationMatrix() {
		return this.#parent == null ? this.localTransformationMatrix : glm.mat4.multiply(glm.mat4.create(), this.#parent.transformationMatrix, this.localTransformationMatrix);
	}


	/**
	 * Creates a new Transform instance.
	 * @constructor
	 * @param {GameObject} gameObject - The gameObject that transform refers to.
	 * @param {['x', 'y', 'z']} position - The position of the transform.
	 * @param {['pitch', 'yaw', 'roll']|['x', 'y', 'z', 'w']} rotation - The rotation of the transform.
	 * @param {['x', 'y', 'z']} scale - The scale of the transform.
	 */
	constructor(gameObject, position = [0.0, 0.0, 0.0], rotation = [0.0, 0.0, 0.0], scale = [1.0, 1.0, 1.0]) {
		this.#gameObject = validateType(gameObject, 'gameObject', GameObject, true);
		this.position = position;
		this.rotation = rotation;
		this.scale = scale;
	}

	/**
	 * Converts the transform to world space.
	 * @returns {Transform}
	 */
	toWorldSpace() {
		var position = [...this.position];
		var rotation = [...this.rotation];
		var scale = [...this.scale];

		if (this.parent) {
			const parentWorldTransform = this.parent.toWorldSpace();
			glm.vec3.add(position, position, parentWorldTransform.position);
			glm.quat.multiply(rotation, rotation, parentWorldTransform.rotation);
			glm.vec3.multiply(scale, scale, parentWorldTransform.scale);
		}

		return new Transform(null, position, rotation, scale);
	}



	//#region Move

	/**
	 * Moves the object relative to a rotation.<br>
	 * If no rotation is given it will use its own.
	 * @param {['x', 'y', 'z']} vector - The vector to move by.
	 * @param {['pitch', 'yaw', 'roll']|['x', 'y', 'z', 'w']} rotation - The rotation to relative move by.
	 */
	moveR(vector, rotation = null) {
		if (rotation === null)
			rotation = this.rotation;
		else
			rotation = Quaternion.create(rotation);
		const quat = rotation;
		const rotationMatrix = glm.mat4.fromQuat(glm.mat4.create(), quat);
		const movement = glm.vec3.transformQuat(glm.vec3.create(), vector, rotationMatrix);
		this.position[0] += movement[0];
		this.position[1] -= movement[1];
		this.position[2] -= movement[2];
	}

	/**
	 * Moves the object in Worldspace by given vector.
	 * @param {['x', 'y', 'z']} movement - The vector to move by.
	 */
	moveWS(movement) {
		validateVec3(movement, 'movement');
		this.position[0] += movement[0];
		this.position[1] += movement[1];
		this.position[2] += movement[2];
	}

	//#endregion

	//#region Rotate

	/**
	 * Rotates the object relative to its current rotation and a pivot point.
	 * @param {['pitch', 'yaw', 'roll']|['x', 'y', 'z', 'w']} rotation - How much rotation as vec3 in degrees or as quat.
	 * @param {['x', 'y', 'z']} pivot - Which point to rotate around.
	 */
	rotate(rotation, pivot = null) {
		if (pivot != null)
			validateVec3(pivot, 'pivot');
		rotation = Quaternion.create(rotation);

		// Create transformation matrix
		const transformationMatrix = glm.mat4.fromRotationTranslation(glm.mat4.create(), this.rotation, this.position);

		// Create rotation matrix
		const rotationMatrix = glm.mat4.create();
		glm.mat4.fromQuat(rotationMatrix, rotation);
		// If a pivot point is specified, translate to pivot, rotate, then translate back
		if (pivot != null && pivot != this.position) {
			const inversePivot = glm.vec3.negate(glm.vec3.create(), pivot);
			glm.mat4.translate(transformationMatrix, transformationMatrix, pivot);
			glm.mat4.mul(transformationMatrix, rotationMatrix, transformationMatrix);
			glm.mat4.translate(transformationMatrix, transformationMatrix, inversePivot);
			glm.mat4.getTranslation(this.position, transformationMatrix);
		}
		else {
			// If no pivot point specified, just apply rotation to transformation matrix
			glm.mat4.mul(transformationMatrix, transformationMatrix, rotationMatrix);
		}

		// Update object state with new position and rotation
		glm.mat4.getRotation(this.rotation, transformationMatrix);
	}

	/**
	 * Rotates the object relative to its current rotation and a pivot point.
	 * @param {['pitch', 'yaw', 'roll']|['x', 'y', 'z', 'w']} rotation - How much rotation as vec3 in degrees or as quat.
	 * @param {['x', 'y', 'z']} pivot - Which point to rotate around.
	 */
	rotateWS(rotation, pivot = null) {
		if (pivot != null)
			validateVec3(pivot, 'pivot');
		const rotationMatrix = glm.mat4.create();
		glm.mat4.fromQuat(rotationMatrix, Quaternion.create(rotation));

		if (pivot != null && pivot != this.position) {
			const pivotToObj = glm.vec3.sub(glm.vec3.create(), this.position, pivot);
			glm.vec3.transformMat4(pivotToObj, pivotToObj, rotationMatrix);
			glm.vec3.add(this.position, pivot, pivotToObj);
		} else {
			const transformationMatrix = glm.mat4.fromRotationTranslation(glm.mat4.create(), this.rotation, this.position);
			glm.mat4.mul(transformationMatrix, rotationMatrix, transformationMatrix);
			glm.mat4.getRotation(this.rotation, transformationMatrix);
		}
	}

	/**
	 * Rotates the object around the x-axis.
	 * @param {Number} degrees - The amount to rotate in degrees.
	 * @param {Number} y - Offset on y-axis.
	 * @param {Number} z - Offset on z-axis.
	 */
	rotateAroundX(degrees, y = 0, z = 0) {
		this.rotate([degrees, 0, 0], [this.position[0], y, z]);
	}

	/**
	 * Rotates the object around the y-axis.
	 * @param {Number} degrees - The amount to rotate in degrees.
	 * @param {Number} x - Offset on x-axis.
	 * @param {Number} z - Offset on z-axis.
	 */
	rotateAroundY(degrees, x = 0, z = 0) {
		this.rotate([0, degrees, 0], [x, this.position[1], z]);
	}

	/**
	 * Rotates the object around the z-axis.
	 * @param {Number} degrees - The amount to rotate in degrees.
	 * @param {Number} x - Offset on x-axis.
	 * @param {Number} y - Offset on y-axis.
	 */
	rotateAroundZ(degrees, x = 0, y = 0) {
		this.rotate([0, 0, degrees], [x, y, this.position[2]]);
	}

	//#endregion

	//#region Scale

	/**
	 * Scales the transform by a factor.
	 * @param {number|['x', 'y', 'z']} factor - The factor to grow by. Can be an array to scale change axis seperatly.
	 */
	growF(factor) {
		if (isNumber(factor)) {
			this.scale = [this.scale[0] * factor, this.scale[1] * factor, this.scale[2] * factor];
		} else if (isVec3(factor)) {
			this.scale = [this.scale[0] * factor[0], this.scale[1] * factor[1], this.scale[2] * factor[2]];
		}
	}
	/**
	 * Shrinks the transform by a factor.<br>
	 * @param {number|['x', 'y', 'z']} quotient - The factor to shrinl by. Can be an array to change each axis seperatly.
	 */
	shrinkF(quotient) {
		if (isNumber(quotient)) {
			this.scale = [this.scale[0] / quotient, this.scale[1] / quotient, this.scale[2] / quotient];
		} else if (isVec3(factor)) {
			this.scale = [this.scale[0] / quotient[0], this.scale[1] / quotient[1], this.scale[2] / quotient[2]];
		}
	}

	/**
	 * Scales the transform additive by a value.
	 * @param {number|['x', 'y', 'z']} value - The value to grow by. Can be an array to change each axis seperatly.
	 */
	growA(value) {
		if (isNumber(sum)) {
			this.scale = [this.scale[0] + value, this.scale[1] + value, this.scale[2] + value];
		} else if (isVec3(factor)) {
			this.scale = [this.scale[0] + value[0], this.scale[1] + value[1], this.scale[2] + value[2]];
		}
	}

	/**
	 * Scales the transform additive by a value.
	 * @param {number|['x', 'y', 'z']} value - The value to shrink by. Can be an array to change each axis seperatly.
	 */
	shrinkA(value) {
		if (isNumber(sum)) {
			this.scale = [this.scale[0] + value, this.scale[1] + value, this.scale[2] + value];
		} else if (isVec3(factor)) {
			this.scale = [this.scale[0] + value[0], this.scale[1] + value[1], this.scale[2] + value[2]];
		}
	}

	//#endregion

	//#region Default Vectors

	forward(scale = 1) {
		const forward = glm.vec3.transformQuat(glm.vec3.create(), [0, 0, -1], this.rotation);
		return glm.vec3.scale(forward, forward, scale);
	}

	back(scale = 1) {
		const back = glm.vec3.transformQuat(glm.vec3.create(), [0, 0, 1], this.rotation);
		return glm.vec3.scale(back, back, scale);
	}

	up(scale = 1) {
		const upward = glm.vec3.transformQuat(glm.vec3.create(), [0, 1, 0], this.rotation);
		return glm.vec3.scale(upward, upward, scale);
	}

	down(scale = 1) {
		const downward = glm.vec3.transformQuat(glm.vec3.create(), [0, -1, 0], this.rotation);
		return glm.vec3.scale(downward, downward, scale);
	}

	right(scale = 1) {
		const right = glm.vec3.transformQuat(glm.vec3.create(), [1, 0, 0], this.rotation);
		return glm.vec3.scale(right, right, scale);
	}

	left(scale = 1) {
		const left = glm.vec3.transformQuat(glm.vec3.create(), [-1, 0, 0], this.rotation);
		return glm.vec3.scale(left, left, scale);
	}

	static forward(scale = 1) { return [0, 0, -scale]; }

	static back(scale = 1) { return [0, 0, scale]; }

	static up(scale = 1) { return [0, scale, 0]; }

	static down(scale = 1) { return [0, -scale, 0]; }

	static right(scale = 1) { return [scale, 0, 0]; }

	static left(scale = 1) { return [-+scale, 0, 0]; }

	//#endregion

}