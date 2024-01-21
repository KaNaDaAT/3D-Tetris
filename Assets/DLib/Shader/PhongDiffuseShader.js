import { Game } from '../Game.js';
import * as glm from '../gl-matrix/index.js';
import { Path } from '../Path.js';
import * as tc from '../Utils/TypeCheck.js';
import { Shader } from './Shader.js';

let INSTANCE = null;

/**
 * The default PhongDiffuseShader.
 */
export class PhongDiffuseShader extends Shader {

	/** @type {PhongDiffuseShader} */
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
		if (validated != null) {
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
		if (validated != null) {
			this.#diffuseColor = validated;
			this.#setDiffuseColor(this.#diffuseColor)
		} else {
			throw TypeError("The 'diffuseColor' needs to be of a similar type as 'vec3'.");
		}
	}
	get diffuseColor() { return [this.#diffuseColor[0], this.#diffuseColor[1], this.#diffuseColor[2]] }


	constructor(ambientColor = [1, 1, 1], diffuseColor = [1, 1, 1]) {
		super("phongDiffuse")
		this.#ambientColor = ambientColor;
		this.#diffuseColor = diffuseColor;
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

}