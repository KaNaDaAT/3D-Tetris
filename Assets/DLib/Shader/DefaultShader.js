import { Path } from '../Path.js';
import { Shader } from './Shader.js';

let INSTANCE = null

/**
 * The default shader used for default and simple rendering.
 */
export class DefaultShader extends Shader {

	get supportsLight() { return false; }

	/** @type {DefaultShader} */
	static get INSTANCE() {
		return INSTANCE;
	}


	constructor() {
		super("default")
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
			return true;
		}
		return false;
	}

}