import { Game } from '../Game.js';
import * as glm from '../gl-matrix/index.js';
import { Shader } from '../Shader/Shader.js';
import { deepClone } from '../Utils/Clone.js';
import { WavefrontOBJ } from '../Wavefront/WavefrontOBJ.js';
import { Renderer } from './Renderer.js';

/**
 * Class that renderes a Shape based on vertices, indices and a Shader. 
 * @class
 * @param {WavefrontOBJ} wavefrontOBJ The {@link WavefrontOBJ} to render.
 * @param {Shader} shader The {@link Shader} defining the rendering.
 * @param {[['x', 'y', 'z']...]} colors The {@link glm.vec3} containing colors for the coloring.
 * @param {Number} colormode The way the colors will be choosen for the surfaces
 */
export class LineRenderer extends Renderer {

	/**
	 * @constructor
	 * @param {WavefrontOBJ} wavefrontOBJ The {@link WavefrontOBJ} to render.
	 * @param {Shader} shader The {@link Shader} defining the rendering.
	 * @param {[['x', 'y', 'z']...]} colors The {@link glm.vec3} containing colors for the coloring.
	 * @param {Number} colormode The way the colors will be choosen for the surfaces
	 */
	constructor(wavefrontOBJ, shader, colors = null, colormode = Renderer.CM_CYCLIC) {
		super(wavefrontOBJ, shader, colors, colormode)
	}

	draw(transform) {
		super.draw(transform);
		const position = transform.position;
		const rotation = transform.rotation;
		const scale = transform.scale;
		const gl = Game.graphics;
		const shader = this.shader;
		const indices = this.wavefrontOBJ.indices.flat();
		const quat = glm.quat.copy(glm.quat.create(), rotation);
		const transform_matrix = this.createTransform(position, quat, scale);

		shader.use();
		shader.uniformTransform(transform_matrix)
		gl.bindVertexArray(this.vertexArray);

		gl.drawElements(
			gl.LINES,
			indices.length,
			gl.UNSIGNED_SHORT,
			0
		);

		gl.bindVertexArray(null);
	}

	clone() {
		return new LineRenderer(this.wavefrontOBJ, this.shader, deepClone(this.colors))
	}
}