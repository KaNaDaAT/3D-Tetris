import { GameObject } from '../Core/GameObject.js';
import { DLibConfig } from '../DLibConfig.js';
import { Game } from '../Game.js';
import { LineRenderer } from '../Render/LineRenderer.js';
import { DefaultShader } from '../Shader/DefaultShader.js';
import { WavefrontOBJ } from '../Wavefront/WavefrontOBJ.js';
import { validateNumber } from './TypeCheck.js';

export class Grid extends GameObject {
	/**  @type {Number} */ #width;
	/**  @type {Number} Width of the Grid. */
	get width() { return this.#width; }
	/**  @type {Number} */ #height;
	/**  @type {Number} Height of the Grid. */
	get height() { return this.#height; }
	/**  @type {Number} */ #depth;
	/**  @type {Number} Depth of the Grid. */
	get depth() { return this.#depth; }
	/**  @type {Number} */ #spacing;
	/**  @type {Number} Spacing of the Grid. */
	get spacing() { return this.#spacing; }

	/**  @type {Number} */ get left() { return -((this.width - 1 / this.spacing) * this.spacing) / 2; }
	/**  @type {Number} */ get right() { return +((this.width - 1 / this.spacing) * this.spacing) / 2; }
	/**  @type {Number} */ get top() { return +((this.height - 1 / this.spacing) * this.spacing) / 2; }
	/**  @type {Number} */ get bottom() { return -((this.height - 1 / this.spacing) * this.spacing) / 2; }
	/**  @type {Number} */ get back() { return -((this.depth - 1 / this.spacing) * this.spacing) / 2; }
	/**  @type {Number} */ get front() { return +((this.depth - 1 / this.spacing) * this.spacing) / 2; }
	/**  @type {Number} */ get leftWS() { return this.left + this.transform.position[0]; }
	/**  @type {Number} */ get rightWS() { return this.right + this.transform.position[0]; }
	/**  @type {Number} */ get topWS() { return this.top + this.transform.position[1]; }
	/**  @type {Number} */ get bottomWS() { return this.bottom + this.transform.position[1]; }
	/**  @type {Number} */ get backWS() { return this.back + this.transform.position[2]; }
	/**  @type {Number} */ get frontWS() { return this.front + this.transform.position[2]; }

	/**
	 * 
	 * @param {Number} width - The width of the grid.
	 * @param {*} height - The height of the grid.
	 * @param {*} depth - The depth of the grid.
	 * @param {*} spacing - The size of each grid element.
	 */
	constructor(width = 10, height = 10, depth = 10, spacing = 10) {
		super();
		this.#width = validateNumber(width, 'width');
		this.#height = validateNumber(height, 'height');
		this.#depth = validateNumber(depth, 'depth');
		this.#spacing = validateNumber(spacing, 'spacing');
	}

	/**
	 * Calculates the position on the Grid from the world space. Does not work with rotation.
	 * @param {['x', 'y', 'z']} position The position in world space.
	 * @returns {['x', 'y', 'z']} The position in grid space.
	 */
	calculatePosition(position) {
		return [
			this.leftWS + position[0] * this.spacing,
			this.bottomWS + position[1] * this.spacing,
			this.backWS + position[2] * this.spacing
		]
	}

	inBounds(position, error = 0.0001) {
		if (Grid.round(position, error)[0] < this.leftWS || Grid.round(position, error)[0] > this.rightWS)
			return false;
		if (Grid.round(position, error)[1] < this.bottomWS || Grid.round(position, error)[1] > this.topWS)
			return false;
		if (Grid.round(position, error)[2] < this.backWS || Grid.round(position, error)[2] > this.frontWS)
			return false;
		return true;
	}

	inBoundsX(position, error = 0.0001) {
		if (Grid.round(position, error)[0]  < this.leftWS || Grid.round(position, error)[0]  > this.rightWS)
			return false;
		return true;
	}

	inBoundsY(position, error = 0.0001) {
		if (Grid.round(position, error)[1] < this.bottomWS || Grid.round(position, error)[1] > this.topWS)
			return false;
		return true;
	}

	inBoundsZ(position, error = 0.0001) {
		if (Grid.round(position, error)[2]  < this.backWS || Grid.round(position, error)[2]  > this.frontWS)
			return false;
		return true;
	}

	static round(position, error) {
		return [(Math.round(position[0] / error) * error), (Math.round(position[1] / error) * error), (Math.round(position[2] / error) * error)];
	}


	static create3d(width, height, depth, spacing = 1) {
		const vertices = [];
		const indices = [];
		const bounds = {
			min: [-width * spacing / 2, -height * spacing / 2, -depth * spacing / 2],
			max: [width * spacing / 2, height * spacing / 2, depth * spacing / 2]
		};

		// Create vertices and indicies for the backwall
		const left = bounds.min[0];
		const right = bounds.max[0];
		const top = bounds.max[1];
		const bottom = bounds.min[1];
		const back = bounds.min[2];
		const front = bounds.max[2];

		let index = 0;
		for (let x = 0; x <= width; x++) {
			for (let y = 0; y <= height; y++) {
				vertices.push([left, top - y * spacing, back]);
				vertices.push([right, top - y * spacing, back]);
				indices.push(index++, index++);
				vertices.push([left + x * spacing, top, back]);
				vertices.push([left + x * spacing, bottom, back]);
				indices.push(index++, index++);
			}
		}

		for (let z = 0; z <= depth; z++) {
			for (let y = 0; y <= height; y++) {
				vertices.push([left, top - y * spacing, back]);
				vertices.push([left, top - y * spacing, front]);
				indices.push(index++, index++);
				vertices.push([left, top, back + z * spacing]);
				vertices.push([left, bottom, back + z * spacing]);
				indices.push(index++, index++);
			}
		}

		for (let x = 0; x <= width; x++) {
			for (let z = 0; z <= depth; z++) {
				vertices.push([left + x * spacing, bottom, back]);
				vertices.push([left + x * spacing, bottom, front]);
				indices.push(index++, index++);
				vertices.push([left, bottom, back + z * spacing]);
				vertices.push([right, bottom, back + z * spacing]);
				indices.push(index++, index++);
			}
		}
		const gridWaveOBJ = new WavefrontOBJ(vertices, null, null, indices, bounds)
		const grid = new Grid(width, height, depth, spacing);
		const lineRender = new LineRenderer(gridWaveOBJ, DefaultShader.INSTANCE, [[1, 1, 1]]);
		lineRender.normalize = false;
		grid.attachComponent(lineRender);
		if (DLibConfig.autoRegister)
			Game.INSTANCE.register(grid);
		return grid;
	}
}