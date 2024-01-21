import * as glm from '../gl-matrix/index.js';
import {
	isNumber,
	isVec3,
	isVec4,
	throwTypeError,
	validateVec3,
} from '../Utils/TypeCheck.js';

export class Quaternion {

	/**
	 * Create a quaternion from euler angles or a quaternion.
	 * 
	 * @param {['pitch', 'yaw', 'roll']|['x', 'y', 'z', 'w']} rotation - The rotation to create a quat from.
	 * @returns {['x', 'y', 'z', 'w']} - The created quat.
	 */
	static create(rotation) {
		if (isVec3(rotation) != null) {
			return Quaternion.eulerToQuat(rotation);
		}
		const vec4Check = isVec4(rotation);
		if (vec4Check != null) {
			return vec4Check;
		}
		throwTypeError('rotation', '[pitch, yaw, roll]|[x, y, z, w]', typeof rotation);
	}

	/**
	 * Create a quaternion from the euler angles.
	 * 
	 * @param {['pitch', 'yaw','roll']} euler - The euler to convert to a quat. Should be in degrees.
	 * @returns {['x', 'y', 'z', 'w']} - The converted quat.
	 */
	static eulerToQuat(euler) {
		validateVec3(euler, 'euler')
		const quaternion = glm.quat.create();
		glm.quat.fromEuler(quaternion, ...euler);
		glm.quat.normalize(quaternion, quaternion);
		return quaternion;
	}

	/**
	 * Create euler angles from a quat.
	 * 
	 * @param {['x', 'y', 'z', 'w']} quat - The quat to convert to euler.
	 * @returns {['pitch', 'yaw', 'roll']} - The converted euler. Will be in degrees.
	 */
	static quatToEuler(quat) {
		validateVec4(quat)
		const euler = new glm.glMatrix.ARRAY_TYPE(3);

		const sp = Math.sqrt(1 + 2 * (quat[3] * quat[1] - quat[0] * quat[2]));
		const cp = Math.sqrt(1 - 2 * (quat[3] * quat[1] - quat[0] * quat[2]));
		const pitch = (2 * Math.atan2(sp, cp) - M_PI / 2);
		euler[0] = Quaternion.toDegree(pitch);

		const sy = 2 * (quat[3] * quat[2] + quat[0] * quat[1]);
		const cy = 1 - 2 * (quat[1] * quat[1] + quat[2] * quat[2]);
		const yaw = Math.atan2(sy, cy);
		euler[1] = Quaternion.toDegree(yaw);

		const sr = 2 * (quat[3] * quat[0] + quat[1] * quat[2]);
		const cr = 1 - 2 * (quat[0] * quat[0] + quat[1] * quat[1]);
		const roll = Math.atan2(sr, cr);
		euler[2] = Quaternion.toDegree(roll);

		return euler;
	}

	/**
	 * Normalized a euler so it is represented in its most simple way.
	 * 
	 * @param {['pitch', 'yaw', 'roll']} euler - The euler to normalize. Should be in degrees.
	 * @returns {['pitch', 'yaw', 'roll']} - The converted euler. Will be in degrees.
	 */
	static normalizeEuler(euler) {
		return Quaternion.quatToEuler(Quaternion.eulerToQuat(euler))
	}

	/**
	 * Converts a number or vec3 from radian to degree.
	 * 
	 * @param {number|['x', 'y', 'z']} radian - The number or array in radians.
	 * @returns {number|['x', 'y', 'z']} - The number or array in degrees.
	 */
	static toDegree(radian) {
		if (isNumber(radian) != null) {
			return radian * 180 / Math.PI;
		}
		if (isVec3(radian) != null) {
			return [radian[0] * 180 / Math.PI, radian[1] * 180 / Math.PI, radian[2] * 180 / Math.PI]
		}
		throwTypeError('radian', 'number|[x, y, z]', typeof radian)
	}

	/**
	 * Converts a number or vec3 from degree to radian.
	 * 
	 * @param {number|['x', 'y', 'z']} degree - The number or array in degrees.
	 * @returns {number|['x', 'y', 'z']} - The number or array in radians.
	 */
	static toRadian(degree) {
		if (isNumber(degree) != null) {
			return degree * Math.PI / 180;
		}
		if (isVec3(degree) != null) {
			return [degree[0] * Math.PI / 180, degree[1] * Math.PI / 180, degree[2] * Math.PI / 180]
		}
		throwTypeError('degree', 'number|[x, y, z]', typeof degree)
	}
}