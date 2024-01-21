import { AttachableComponent } from '../Core/AttachableComponent.js';
import { Transform } from '../Core/Transform.js';
import { Game } from '../Game.js';
import * as glm from '../gl-matrix/index.js';
import { DefaultShader } from '../Shader/DefaultShader.js';
import { Shader } from '../Shader/Shader.js';
import { deepClone } from '../Utils/Clone.js';
import {
	validateType,
	validateVec3,
	validateVec4,
} from '../Utils/TypeCheck.js';
import { WavefrontOBJ } from '../Wavefront/WavefrontOBJ.js';

/**
 * Class that renderes a Shape based on vertices, indices and a Shader. 
 * @class
 * @param {WavefrontOBJ} wavefrontOBJ The {@link WavefrontOBJ} to render.
 * @param {Shader} shader The {@link Shader} defining the rendering.
 * @param {[['x', 'y', 'z']...]} colors The {@link glm.vec3} containing colors for the coloring.
 * @param {Number} colormode The way the colors will be choosen for the surfaces
 */
export class Renderer extends AttachableComponent {

	static get CM_CYCLIC() { return 'cyclic'; }
	static get CM_REPEAT() { return 'repeat'; }
	static get CM_NORMALS_REPEAT() { return 'normals_repeat'; }

	static get DEFAULT() { return new Renderer(); }

	/** @type {Boolean} */
	#normalize = true;
	/** @type {Boolean} */
	get normalize() { return this.#normalize; }
	set normalize(x) {
		validateType(x, 'normalize', Boolean);
		this.#normalize = x;
	}

	// ToDo: Beatuify
	colors = [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]

	/** @type {WavefrontOBJ} */
	#wavefrontOBJ = null;
	/** @type {WavefrontOBJ} */
	get wavefrontOBJ() { return this.#wavefrontOBJ; }
	set wavefrontOBJ(x) {
		this.#wavefrontOBJ = validateType(x, 'wavefrontOBJ', WavefrontOBJ, true);
		this.init();
	}
	/** @type {Shader} */
	#shader = null;
	/** @type {Shader} */
	get shader() { return this.#shader; }
	/** @type {WebGLVertexArrayObject} */
	#vertexArray = null;
	/** @type {WebGLVertexArrayObject} */
	get vertexArray() { return this.#vertexArray; }
	/** @type {WebGLBuffer} */
	#vertexBuffer = null;
	/** @type {WebGLBuffer} */
	get vertexBuffer() { return this.#vertexBuffer; }
	/** @type {WebGLBuffer} */
	#normalBuffer = null;
	/** @type {WebGLBuffer} */
	get normalBuffer() { return this.#normalBuffer; }
	/** @type {WebGLBuffer} */
	#indexBuffer = null;
	/** @type {WebGLBuffer} */
	get indexBuffer() { return this.#indexBuffer; }
	/** @type {WebGLBuffer} */
	#colorBuffer = null;
	/** @type {WebGLBuffer} */
	get colorBuffer() { return this.#colorBuffer; }

	/**
	 * @constructor
	 * @param {WavefrontOBJ} wavefrontOBJ The {@link WavefrontOBJ} to render.
	 * @param {Shader} shader The {@link Shader} defining the rendering.
	 * @param {[['x', 'y', 'z']...]} colors The {@link glm.vec3} containing colors for the coloring.
	 * @param {Number} colormode The way the colors will be choosen for the surfaces
	 */
	constructor(wavefrontOBJ = null, shader = null, colors = null, colormode = Renderer.CM_CYCLIC) {
		super(null);
		if (wavefrontOBJ != null)
			validateType(wavefrontOBJ, 'wavefrontOBJ', WavefrontOBJ);
		if (shader == null) {
			shader = DefaultShader.INSTANCE;
		}
		validateType(shader, 'shader', Shader);
		if (colors != null && colors.length > 0) {
			validateVec3(colors[0], 'colors');
			this.colors = colors;
		}
		this.#wavefrontOBJ = wavefrontOBJ;
		this.#shader = shader;
		if (wavefrontOBJ != null)
			this.#applyColorMode(this.colors, this.wavefrontOBJ.vertices.length, colormode)

		if (wavefrontOBJ != null)
			this.init();
	}

	updateShader(shader) {
		this.#shader = shader;
		this.init();
	}

	init() {
		const gl = Game.graphics;
		const shader = this.#shader;
		const colors = this.colors.flat();
		const vertices = this.wavefrontOBJ.vertices.flat();
		const normals = this.wavefrontOBJ.normals.flat();
		const indices = this.wavefrontOBJ.indices.flat();

		// Clean up existing buffers
		this.#cleanupBuffers();

		this.#vertexArray = gl.createVertexArray();
		gl.bindVertexArray(this.vertexArray);

		this.#vertexBuffer = this.createAndBindBuffer(gl.ARRAY_BUFFER, vertices);
		this.setVertexAttribPointer(shader.getAttrib('a_position'), 3, gl.FLOAT);

		this.#normalBuffer = this.createAndBindBuffer(gl.ARRAY_BUFFER, normals);
		this.setVertexAttribPointer(shader.getAttrib('a_normal'), 3, gl.FLOAT);

		this.#colorBuffer = this.createAndBindBuffer(gl.ARRAY_BUFFER, colors);
		this.setVertexAttribPointer(shader.getAttrib('a_color'), 3, gl.FLOAT);

		this.#indexBuffer = this.createAndBindIndexBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

		gl.bindVertexArray(null);
	}

	createAndBindBuffer(target, data) {
		const buffer = Game.graphics.createBuffer();
		Game.graphics.bindBuffer(target, buffer);
		Game.graphics.bufferData(target, new Float32Array(data), Game.graphics.STATIC_DRAW);
		return buffer;
	}

	createAndBindIndexBuffer(target, data) {
		const buffer = Game.graphics.createBuffer();
		Game.graphics.bindBuffer(target, buffer);
		Game.graphics.bufferData(target, new Uint16Array(data), Game.graphics.STATIC_DRAW);
		return buffer;
	}

	setVertexAttribPointer(attrib, size, type) {
		if (attrib !== -1) {
			Game.graphics.enableVertexAttribArray(attrib);
			Game.graphics.vertexAttribPointer(attrib, size, type, false, 0, 0);
		}
	}

	#cleanupBuffers() {
		const gl = Game.graphics;
		gl.deleteBuffer(this.vertexBuffer);
		gl.deleteBuffer(this.normalBuffer);
		gl.deleteBuffer(this.colorBuffer);
		gl.deleteBuffer(this.indexBuffer);
		this.#vertexBuffer = null;
		this.#normalBuffer = null;
		this.#colorBuffer = null;
		this.#indexBuffer = null;
	}

	/**
	 * Creates the transformation matrix for the drawing
	 * 
	 * @param {glm.vec3} position - The Position to draw on
	 * @param {glm.quat} rotation - How the drawn object shall be rotated.
	 * @param {glm.vec3} scale - Which scale to draw the object in.
	 * @returns 
	 */
	createTransform(position, quat, scale) {
		const transform_matrix = glm.mat4.create();
		const position_matrix = glm.mat4.create();
		glm.mat4.translate(
			position_matrix,
			glm.mat4.create(),
			position
		);
		glm.quat.normalize(quat, quat);
		const rotationMatrix = glm.mat4.create()
		glm.mat4.fromQuat(rotationMatrix, quat);

		if (this.normalize) {
			const bounds = this.wavefrontOBJ.boundsMatrix;
			if (Boolean(bounds))
				glm.mat4.multiply(transform_matrix, transform_matrix, bounds); // Matches the bounds of this box
		}
		glm.mat4.scale(transform_matrix, transform_matrix, scale); // Scales the object
		glm.mat4.multiply(transform_matrix, rotationMatrix, transform_matrix); // Rotates the object
		glm.mat4.multiply(transform_matrix, position_matrix, transform_matrix); // moves to correct position
		return transform_matrix;
	}


	/** 
	 * Draws an Shape at a given position, with a given rotation and scale.
	 * 
	 * @param {glm.vec3} position - The Position to draw on
	 * @param {glm.quat} rotation - How the drawn object shall be rotated.
	 * @param {glm.vec3} scale - Which scale to draw the object in.
	 */
	draw(transform) {
		validateType(transform, 'transform', Transform);
		this.#shader.use();
	}
	


	/** 
	 * Draws an coordinate system for this Shape at a given position, with a given rotation and scale
	 * 
	 * @param {glm.vec3} position - The Position to draw on
	 * @param {glm.quat} rotation - How the drawn object shall be rotated.
	 * @param {glm.vec3} scale - Which scale to draw the object in.
	 */
	drawCS(position, rotation, scale) {
		validateVec3(position, 'position');
		validateVec4(rotation, 'rotation');
		validateVec3(scale, 'scale');
		const shader = DefaultShader.INSTANCE;
		if (shader === null) {
			console.warn("In order to draw a coordinate system the default shader must me set.")
			return;
		}
		this.init_cs();
		shader.use();

		const gl = Game.graphics;
		const quat = glm.quat.copy(glm.quat.create(), rotation);
		const transform_matrix = this.createTransform(position, quat, scale, false);

		shader.uniformTransform(transform_matrix);

		gl.bindVertexArray(this.#cs_vertexArray);
		gl.drawElements(
			gl.LINES,
			this.#cs_indices.length,
			gl.UNSIGNED_SHORT,
			0
		);
	}

	#cs_vertices = [0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0];
	#cs_colors = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0];
	#cs_indices = [0, 1, 2, 3, 4, 5];
	/** @type {WebGLVertexArrayObject} */
	#cs_vertexArray = null;
	/** @type {WebGLBuffer} */
	#cs_vertexBuffer = null;
	/** @type {WebGLBuffer} */
	#cs_colorBuffer = null;
	/** @type {WebGLBuffer} */
	#cs_indexBuffer = null;

	init_cs(force = false) {
		if (!force && this.#cs_vertexArray !== null) {
			return;
		}
		const gl = Game.graphics;
		this.#cs_vertexArray = gl.createVertexArray();

		// Clean up existing buffers
		this.#cs_cleanupBuffers();

		const shader = DefaultShader.INSTANCE;
		if (shader === null) {
			console.warn("In order to draw a coordinate system the default shader must me set.")
			return;
		}

		this.#cs_vertexArray = gl.createVertexArray();
		gl.bindVertexArray(this.#cs_vertexArray);

		this.#cs_vertexBuffer = this.createAndBindBuffer(gl.ARRAY_BUFFER, this.#cs_vertices);
		this.setVertexAttribPointer(shader.getAttrib('a_position'), 3, gl.FLOAT);

		this.#cs_colorBuffer = this.createAndBindBuffer(gl.ARRAY_BUFFER, this.#cs_colors);
		this.setVertexAttribPointer(shader.getAttrib('a_color'), 3, gl.FLOAT);

		this.#cs_indexBuffer = this.createAndBindIndexBuffer(gl.ELEMENT_ARRAY_BUFFER, this.#cs_indices);

		gl.bindVertexArray(null);
	}

	#cs_cleanupBuffers() {
		const gl = Game.graphics;
		gl.deleteBuffer(this.#cs_vertexBuffer);
		gl.deleteBuffer(this.#cs_colorBuffer);
		gl.deleteBuffer(this.#cs_indexBuffer);
		this.#cs_vertexBuffer = null;
		this.#cs_colorBuffer = null;
		this.#cs_indexBuffer = null;
	}

	#applyColorMode(colors, length, colormode) {
		switch (colormode) {
			case Renderer.CM_REPEAT:
				this.colors = this.#colorModeRepeat(colors, length);
				break;
			case Renderer.CM_NORMALS_REPEAT:
				this.colors = this.#colorModeNormalsRepeat(colors, length);
				break;
			case Renderer.CM_CYCLIC:
			default:
				const newcolors = []
				for (let i = 0; i < length; i++) {
					newcolors.push(colors[i % colors.length]);
				}
				this.colors = newcolors;
				break;
		}
	}

	#colorModeRepeat(colors, length) {
		const newcolors = []
		let count = length / colors.length;
		if (count <= 0)
			count = 1;
		for (let i = 0; i < length / count; i++) {
			const color = colors[i % colors.length];
			for (let j = 0; j < count; j++) {
				newcolors.push(color);
			}
		}
		newcolors.splice(length, newcolors.length - length);
		return newcolors;
	}

	#colorModeNormalsRepeat(colors, length) {
		const uniqueNormals = {}
		const newcolors = []
		let colorIndex = 0;
		for (let i = 0; i < length; i++) {
			const normal = this.wavefrontOBJ.normals[i];
			if (!(normal in uniqueNormals)) {
				uniqueNormals[normal] = colors[colorIndex++ % colors.length];
			}
			newcolors.push(uniqueNormals[normal]);
		}
		newcolors.splice(length, newcolors.length - length);
		return newcolors;
	}

	clone() {
		return new Renderer(this.wavefrontOBJ, this.shader, deepClone(this.colors))
	}
}