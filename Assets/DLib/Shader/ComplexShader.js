import { Game } from '../Game.js';
import { Shader } from './Shader.js';

/**
 * A Shader made out of a vertex and fragment shader. <br />
 * Defines some methods that may be useful when creating custom shaders. <br />
 * These Methods are based on the default shader implementation.
 */
export class ComplexShader extends Shader {
	/** @type {WebGLRenderingContext} */

	constructor(name) {
		super(name)
	}

	uniformAmbientColor(vec3) {
		const uniform = this.getUniform('u_ambientColor');
		if (uniform === null)
			return false;
		Game.graphics.uniform3fv(uniform, vec3);
		return true;
	}

	uniformDiffuseColor(vec3) {
		const uniform = this.getUniform('u_diffuseColor');
		if (uniform === null)
			return false;
		Game.graphics.uniform3fv(uniform, vec3);
		return true;
	}

	uniformSpecularColor(vec3) {
		const uniform = this.getUniform('u_specularColor');
		if (uniform === null)
			return false;
		Game.graphics.uniform3fv(uniform, vec3);
		return true;
	}

	uniformSpecularIntensity(num) {
		const uniform = this.getUniform('u_specularIntensity');
		if (uniform === null)
			return false;
		Game.graphics.uniform1f(uniform, num);
		return true;
	}

	uniformSpecularShininess(num) {
		const uniform = this.getUniform('u_shininess');
		if (uniform === null)
			return false;
		Game.graphics.uniform1f(uniform, num);
		return true;
	}

}