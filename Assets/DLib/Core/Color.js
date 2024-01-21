import { validateVec3 } from "../Utils/TypeCheck.js";
import { isVec3, isVec4 } from "../Utils/TypeCheck.js";

export class Color {

	//#region Propertys
	/** @type {['r', 'g', 'b', 'a']} */
	#rgba = [0, 0, 0, 0]
	/** 
	 * The rgba components of the Color in range from 0 to 255.
	 * @type {['r', 'g', 'b', 'a']|['r', 'g', 'b']} 
	 */
	get rgba() { return [this.r, this.g, this.b, this.a]; }
	set rgba(x) {
		if (isVec3(x) != null) {
			if (x[0] < 0 || x[0] > 255) throw new Error("Color value for 'r' has to be in range 0 to 255");
			if (x[1] < 0 || x[1] > 255) throw new Error("Color value for 'g' has to be in range 0 to 255");
			if (x[2] < 0 || x[2] > 255) throw new Error("Color value for 'b' has to be in range 0 to 255");
			this.#rgba = [Math.floor(x[0]), Math.floor(x[1]), Math.floor(x[2]), 255]
		} else if (isVec4(x) != null) {
			if (x[0] < 0 || x[0] > 255) throw new Error("Color value for 'r' has to be in range 0 to 255");
			if (x[1] < 0 || x[1] > 255) throw new Error("Color value for 'g' has to be in range 0 to 255");
			if (x[2] < 0 || x[2] > 255) throw new Error("Color value for 'b' has to be in range 0 to 255");
			if (x[3] < 0 || x[3] > 255) throw new Error("Color value for 'a' has to be in range 0 to 255");
			this.#rgba = [Math.floor(x[0]), Math.floor(x[1]), Math.floor(x[2]), Math.floor(x[3])]
		}
	}
	/** 
	 * The red component of the Color in range from 0 to 255.
	 * @type {Number} 
	 */
	get r() { return this.#rgba[0]; }
	/** 
	 * The green component of the Color in range from 0 to 255.
	 * @type {Number} 
	 */
	get g() { return this.#rgba[1]; }
	/** 
	 * The blue component of the Color in range from 0 to 255.
	 * @type {Number} 
	 */
	get b() { return this.#rgba[2]; }
	/** 
	 * The alpha component of the Color in range from 0 to 255.
	 * @type {Number} 
	 */
	get a() { return this.#rgba[3]; }

	/** 
	 * The rgba components of the Color in range from 0 to 1.
	 * @type {['r', 'g', 'b', 'a']} 
	 */
	get normalized() { return [r / 255, g / 255, b / 255, a / 255]; }
	/** 
	 * The red component of the Color in range from 0 to 1.
	 * @type {Number} 
	 */
	get nr() { return this.#rgba[0] / 255; }
	/** 
	 * The green component of the Color in range from 0 to 1.
	 * @type {Number} 
	 */
	get ng() { return this.#rgba[1] / 255; }
	/** 
	 * The blue component of the Color in range from 0 to 1.
	 * @type {Number} 
	 */
	get nb() { return this.#rgba[2] / 255; }
	/** 
	 * The alpha component of the Color in range from 0 to 1.
	 * @type {Number} 
	 */
	get na() { return this.#rgba[3] / 255; }
	

	//#endregion

	/**
	 * 
	 * @param {['r', 'g', 'b', 'a']} rgba - The rgba components of the Color in range from 0 to 255.
	 */
	constructor(...rgba) {
		this.rgba = rgba;
	}

	//#region Create Colors

	/**
	 * Create a Color from the RGB values.
	 * @param {['r', 'g', 'b']} rgb - The RGB values.
	 * @returns {Color} The created color.
	 */
	createRGB(rgb = [255, 255, 255]) {
		return new Color([rgb[0], rgb[1], rgb[2], 255]);
	}

	/**
	 * Create a Color from the RGBA values.
	 * @param {['r', 'g', 'b']} rgba - The RGBA values.
	 * @returns {Color} The created color.
	 */
	createRGBA(rgba = [255, 255, 255, 255]) {
		return new Color([rgba[0], rgba[1], rgba[2], rgba[3]]);
	}

	/**
	 * Create a Color from the normalized RGB values.
	 * @param {['r', 'g', 'b']} rgb - The normalized RGB values
	 * @returns {Color} The created color.
	 */
	createNRGB(rgb = [1, 1, 1]) {
		validateVec3(rgb, 'rgb');
		return new Color([rgb[0] * 255, rgb[1] * 255, rgb[2] * 255, 255]);
	}

	/**
	 * Create a Color from the normalized RGBA values.
	 * @param {['r', 'g', 'b']} rgba - The normalized RGBA values
	 * @returns {Color} The created color.
	 */
	createNRGBA(rgba = [1, 1, 1, 1]) {
		return new Color([rgba[0] * 255, rgba[1] * 255, rgba[2] * 255, rgba[3] * 255]);
	}

	//#endregion

	//#region Methods

	toHEX() {
		const rhex = this.r.toString(16).padStart(2, '0');
		const ghex = this.g.toString(16).padStart(2, '0');
		const bhex = this.b.toString(16).padStart(2, '0');
		const ahex = this.a.toString(16).padStart(2, '0');
		return '#' + rhex + ghex + bhex + ahex;
	}

	toHTML() {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
	}

	//#endregion

	//#region Default Colors

	static #BLANK = new Color(0, 0, 0, 0);
	/** @type {Color} */
	static get BLANK() { return Color.#BLANK; }

	static #RED = new Color(255, 0, 0, 255);
	/** @type {Color} */
	static get RED() { return Color.#RED; }

	static #GREEN = new Color(0, 255, 0, 255);
	/** @type {Color} */
	static get GREEN() { return Color.#GREEN; }

	static #BLUE = new Color(0, 0, 255, 255);
	/** @type {Color} */
	static get BLUE() { return Color.#BLUE; }

	static #WHITE = new Color(255, 255, 255, 255);
	/** @type {Color} */
	static get WHITE() { return Color.#WHITE; }

	static #BLACK = new Color(0, 0, 0, 255);
	/** @type {Color} */
	static get BLACK() { return Color.#BLACK; }


	//#endregion


}