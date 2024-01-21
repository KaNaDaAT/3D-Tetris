import { Transform } from '../Core/Transform.js';
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
export class ShapeRenderer extends Renderer {

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

	/**
	 * @inheritdoc
	 * @param {Transform} transform 
	 */
	draw(transform) {
		super.draw(transform);
		const gl = Game.graphics;
		const shader = this.shader;
		const indices = this.wavefrontOBJ.indices.flat();
		const transformationMatrix = transform.transformationMatrix;
		shader.uniformTransform(transformationMatrix);
		if (shader.supportsLight) {
			let view_matrix = glm.mat4.create();
			if (Game.INSTANCE.camera !== null)
				view_matrix = Game.INSTANCE.camera.view_matrix;
			const modelViewMatrix = glm.mat4.create();
			glm.mat4.multiply(modelViewMatrix, view_matrix, transformationMatrix);
			const normalMatrix = glm.mat3.create();
			glm.mat3.normalFromMat4(normalMatrix, modelViewMatrix);
			shader.uniformNormalMatrix(normalMatrix);
		}

		gl.bindVertexArray(this.vertexArray);

		gl.drawElements(
			gl.TRIANGLES,
			indices.length,
			gl.UNSIGNED_SHORT,
			0
		);

		gl.bindVertexArray(null);
	}

	clone() {
		return new ShapeRenderer(this.wavefrontOBJ, this.shader, deepClone(this.colors))
	}
}