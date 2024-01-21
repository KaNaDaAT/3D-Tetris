import { Game } from '../Game.js';
import * as glm from '../gl-matrix/index.js';
import { Path } from '../Path.js';
import * as tc from '../Utils/TypeCheck.js';
import { Shader } from './Shader.js';

let INSTANCE = null;

/**
 * The default GouraudSpecularShader.
 */
export class GouraudSpecularShader extends Shader {

	/** @type {GouraudSpecularShader} */
	static get INSTANCE() {
		return INSTANCE;
	}


	/** @type {Array<number>(3)} */
	#ambientColor;
	/**
	 * Set the value of the property.
	 * @param {Array<number>|glm.vec3} newValue - The new value to set.
	 * @throws {TypeError} If the newValue is not of type string.
	 */
	set ambientColor(newValue) {
		const validated = tc.isVec3(newValue);
		if (validated  != null) {
			this.#ambientColor = validated;
			this.#setAmbientColor(this.#ambientColor)
		} else {
			throw TypeError("The 'ambientColor' needs to be of a similar type as 'vec3'.");
		}
	}
	get ambientColor() { return [this.#ambientColor[0], this.#ambientColor[1], this.#ambientColor[2]] }


	/** @type {Array<number>(3)} */
	#diffuseColor;
	/**
	 * Set the value of the property.
	 * @param {Array<number>|glm.vec3} newValue - The new value to set.
	 * @throws {TypeError} If the newValue is not of type string.
	 */
	set diffuseColor(newValue) {
		const validated = tc.isVec3(newValue);
		if (validated  != null) {
			this.#diffuseColor = validated;
			this.#setDiffuseColor(this.#diffuseColor)
		} else {
			throw TypeError("The 'diffuseColor' needs to be of a similar type as 'vec3'.");
		}
	}
	get diffuseColor() { return [this.#diffuseColor[0], this.#diffuseColor[1], this.#diffuseColor[2]] }


	/** @type {Array<number>(3)} */
	#specularColor;
	/**
	 * Set the value of the property.
	 * @param {Array<number>|glm.vec3} newValue - The new value to set.
	 * @throws {TypeError} If the newValue is not of type string.
	 */
	set specularColor(newValue) {
		const validated = tc.isVec3(newValue);
		if (validated  != null) {
			this.#specularColor = validated;
			this.#setSpecularColor(this.#specularColor)
		} else {
			throw TypeError("The 'specularColor' needs to be of a similar type as 'vec3'.");
		}
	}
	get specularColor() { return [this.#specularColor[0], this.#specularColor[1], this.#specularColor[2]] }


	/** @type {Number} */
	#specularIntensity;
	/**
	 * Set the value of the property.
	 * @param {float} newValue - The new value to set.
	 * @throws {TypeError} If the newValue is not of type string.
	 */
	set specularIntensity(newValue) {
		const validated = tc.isNumber(newValue);
		if (validated  != null) {
			this.#specularIntensity = validated;
			this.#setSpecularIntensity(this.#specularIntensity)
		} else {
			throw TypeError("The 'specularIntensity' needs to be of a similar type as 'float'.");
		}
	}
	get specularIntensity() { return this.#specularIntensity; }


	/** @type {Number} */
	#shininess;
	/**
	 * Set the value of the property.
	 * @param {float} newValue - The new value to set.
	 * @throws {TypeError} If the newValue is not of type string.
	 */
	set shininess(newValue) {
		const validated = tc.isNumber(newValue);
		if (validated  != null) {
			this.#shininess = validated;
			this.#setShininess(this.#shininess)
		} else {
			throw TypeError("The 'shininess' needs to be of a similar type as 'float'.");
		}
	}
	get shininess() { return this.#shininess; }


	constructor(ambientColor = [1, 1, 1], diffuseColor = [1, 1, 1], specularColor = [1, 1, 1], specularIntensity = 1, shininess = 32) {
		super("gouraudSpecular")
		this.#ambientColor = ambientColor;
		this.#diffuseColor = diffuseColor;
		this.#specularColor = specularColor;
		this.#specularIntensity = specularIntensity;
		this.#shininess = shininess;
	}

	/** 
	 * Loads the shader if possible. Once its loaded it cannot be loaded again.
	 * In order for it to work the Game needs to be configured with the WebGLRenderingContext.
	 * 
	 * @returns {Promise<boolean>} Returns true if loaded correctly and false otherwise.
	 */
	async load() {
		if (await super.load(Path.shaderDefaultsPath)) {
				if (INSTANCE === null)
					INSTANCE = this;
				this.#setAmbientColor(this.#ambientColor);
				this.#setDiffuseColor(this.#diffuseColor);
				this.#setSpecularColor(this.#specularColor);
				this.#setSpecularIntensity(this.#specularIntensity);
				this.#setShininess(this.#shininess);
				return true;
			}
			return false;
	}


	#setAmbientColor(vec3) {
		const uniform = this.getUniform('u_ambientColor');
		if (uniform === null)
			return false;
		Game.graphics.uniform3fv(uniform, vec3);
		return true;
	}

	#setDiffuseColor(vec3) {
		const uniform = this.getUniform('u_diffuseColor');
		if (uniform === null)
			return false;
		Game.graphics.uniform3fv(uniform, vec3);
		return true;
	}

	#setSpecularColor(vec3) {
		const uniform = this.getUniform('u_specularColor');
		if (uniform === null)
			return false;
		Game.graphics.uniform3fv(uniform, vec3);
		return true;
	}

	#setSpecularIntensity(num) {
		const uniform = this.getUniform('u_specularIntensity');
		if (uniform === null)
			return false;
		Game.graphics.uniform1f(uniform, num);
		return true;
	}

	#setShininess(num) {
		const uniform = this.getUniform('u_shininess');
		if (uniform === null)
			return false;
		Game.graphics.uniform1f(uniform, num);
		return true;
	}

}