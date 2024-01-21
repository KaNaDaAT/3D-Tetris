import {
	ConfigurationAlreadySetError,
} from '../Exceptions/ConfigurationAlreadySetError.js';
import { Game } from '../Game.js';

/**
 * A Shader made out of a vertex and fragment shader.
 */
export class Shader {
	path = '';
	name = 'default';
	get supportsLight() { return true; }

	/** @type {Boolean} */
	#isLoaded = false;
	/** @type {Boolean} */
	get isLoaded() { return this.#isLoaded; }

	#program = null;
	#buffer = {}
	#vertexShader = null;
	#fragmentShader = null;

	constructor(name) {
		this.name = name;
	}

	/** 
	 * Loads the shader from a path based on the name configured when creating this shader.<br>
	 * Loading is only possible once in order to prevent errors.
	 * 
	 * @param {String} path - The path to load the shader from. If it ends with '/' it will load it from that location based on the name of this shader.
	 * 
	 * @returns {Promise<boolean>} Returns true if loaded correctly and false otherwise.
	 */
	async load(path) {
		if (this.#isLoaded) {
			throw new ConfigurationAlreadySetError();
		}
		const gl = Game.graphics;
		if (!Boolean(path)) path = './'
		else if (path.endsWith('/')) path += this.name;
		this.path = path;

		// create the shaders from the source
		this.#vertexShader = await fetch(`${this.path}.vert`)
			.then(response => response.text())
			.then(shader_source => this.#createShader(gl.VERTEX_SHADER, shader_source))
			.catch(error => {
				console.error('An error occurred loading the vertex shader file:', error);
				return false;
			});

		this.#fragmentShader = await fetch(`${this.path}.frag`)
			.then(response => response.text())
			.then(shader_source => this.#createShader(gl.FRAGMENT_SHADER, shader_source))
			.catch(error => {
				console.error('An error occurred loading the fragment shader file:', error);
				return false;
			});
		if (!Boolean(this.#vertexShader) || !Boolean(this.#fragmentShader))
			return false;

		// Create the program and attach the shaders
		const program = gl.createProgram();
		gl.attachShader(program, this.#vertexShader);
		gl.attachShader(program, this.#fragmentShader);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error(gl.getProgramInfoLog(program));
			gl.deleteProgram(program);
			return false;
		}
		this.#program = program;
		this.#isLoaded = true;
		return true;
	}

	use() {
		this.validate();
		Game.graphics.useProgram(this.#program)
	}

	// Uniform methods
	uniformTransform(matrix) {
		const uniform = this.getUniform('u_transform');
		if (uniform === null)
			return false;
		Game.graphics.uniformMatrix4fv(uniform, false, matrix);
		return true;
	}

	uniformView(matrix) {
		const uniform = this.getUniform('u_view');
		if (uniform === null)
			return false;
		Game.graphics.uniformMatrix4fv(uniform, false, matrix);
		return true;
	}

	uniformProjection(matrix) {
		const uniform = this.getUniform('u_projection');
		if (uniform === null)
			return false;
		Game.graphics.uniformMatrix4fv(uniform, false, matrix);
		return true;
	}

	uniformLightPosition(vec3) {
		const uniform = this.getUniform('u_lightPosition');
		if (uniform === null)
			return false;
		Game.graphics.uniform3fv(uniform, vec3);
		return true;
	}

	uniformLightColor(vec3) {
		const uniform = this.getUniform('u_lightColor');
		if (uniform === null)
			return false;
		Game.graphics.uniform3fv(uniform, vec3);
		return true;
	}

	uniformNormalMatrix(matrix) {
		const uniform = this.getUniform('u_normalMatrix');
		if (uniform === null)
			return false;
		Game.graphics.uniformMatrix3fv(uniform, false, matrix);
		return true;
	}

	uniformLightView(matrix) {
		const uniform = this.getUniform('u_lightView');
		if (uniform === null)
			return false;
		Game.graphics.uniformMatrix4fv(uniform, false, matrix);
		return true;
	}


	getAttrib(key) {
		this.use();
		let attrib = this.#buffer[key];
		if (attrib !== undefined) {
			// Key exists in the map, return the value
			return attrib;
		}
		// Key not found, get the attrib location and add it to the map
		attrib = Game.graphics.getAttribLocation(this.#program, key);
		this.#buffer[key] = attrib;
		return attrib;
	}


	getUniform(key) {
		this.use();
		let uniform = this.#buffer[key];
		if (uniform !== undefined) {
			// Key exists in the map, return the value
			return uniform;
		}
		// Key not found, get the uniform location and add it to the map
		uniform = Game.graphics.getUniformLocation(this.#program, key);
		this.#buffer[key] = uniform;
		return uniform;
	}


	#createShader(shader_type, shader_source) {
		const gl = Game.graphics;
		const shader = gl.createShader(shader_type);
		gl.shaderSource(shader, shader_source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('Error compiling shader:', gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			throw new Error(`Could not create shader ${this.name} of type '${shader_type}'.`);
		}
		return shader;
	}

	validate() {
		if (!this.#isLoaded) throw new Error(`Shader ${this.name} not yet loaded.`);
	}
}