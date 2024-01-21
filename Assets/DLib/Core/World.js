import * as glm from '../gl-matrix/index.js';
import { LineRenderer } from '../Render/LineRenderer.js';
import { DefaultShader } from '../Shader/DefaultShader.js';
import { WavefrontOBJ } from '../Wavefront/WavefrontOBJ.js';

let INSTANCE = null;

export class World {

	static drawCoord = false;
	/** @type {LineRenderer} */
	renderer = null;

	/**
	* @returns {World} The INSTANCE of Game.
	*/
	static get INSTANCE() {
		return INSTANCE;
	}

	constructor() {
		if (Boolean(World.INSTANCE)) {
			throw new Error("World already instantiated!")
		} else {
			INSTANCE = this;
		}
	}

	static get VERTICES() {
		return [
			1, 0, 0,	// x_axis_positive
			-1, 0, 0,	// x_axis_negative
			0, 1, 0,	// y_axis_positive
			0, -1, 0,	// y_axis_negative
			0, 0, 1,	// z_axis_positive
			0, 0, -1,	// z_axis_negative
		];
	}

	static get COLORS() {
		return [
			[1.0, 0.0, 0.0],
			[1.0, 0.0, 0.0],
			[0.0, 1.0, 0.0],
			[0.0, 1.0, 0.0],
			[0.0, 0.0, 1.0]
			[0.0, 0.0, 1.0]
		];
	}

	static get INDICES() {
		return [0, 1, 2, 3, 4, 5];
	}

	static setupRendering() {
		World.INSTANCE.renderer = new LineRenderer(
			new WavefrontOBJ(
				World.VERTICES,
				[],
				[],
				World.INDICES,
				{ min: [-1, -1, -1], max: [1, 1, 1] }
			),
			DefaultShader.INSTANCE,
			World.COLORS
		);
	}

	static render() {
		if (World.drawCoord && Boolean(World.INSTANCE.renderer))
			World.INSTANCE.renderer.draw([0, 0, 0], glm.quat.create(), [10, 10, 10]);
	}

	static #right = glm.vec3.fromValues(1, 0, 0);
	static #left = glm.vec3.fromValues(-1, 0, 0);
	static #up = glm.vec3.fromValues(0, 1, 0);
	static #down = glm.vec3.fromValues(0, -1, 0);
	static #forward = glm.vec3.fromValues(0, 0, -1);
	static #back = glm.vec3.fromValues(0, 0, 1);

	static get RIGHT() {
		return World.#right;
	}

	static get LEFT() {
		return World.#left;
	}

	static get UP() {
		return World.#up;
	}

	static get DOWN() {
		return World.#down;
	}

	static get FORWARD() {
		return World.#forward;
	}

	static get BACK() {
		return World.#back;
	}
}

INSTANCE = new World();