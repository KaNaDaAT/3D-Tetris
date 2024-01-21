import { validateNumber, validateType } from './Utils/TypeCheck.js';

export class DLibConfig {

	/** @type {Boolean} */
	static #autoRegister = true;
	/**
	 * When enabled create methos as GameObject.create or Grid.create3d will automatically register to the Game. 
	 * @type {Boolean} 
	 */
	static get autoRegister() { return this.#autoRegister; }
	static set autoRegister(x) { this.#autoRegister = validateType(x, 'autoRegister', Boolean); }

	/** @type {Number} */
	static #frameRate = 60;
	/**
	 * Declares the frame rate the game shall ran on
	 * @type {Number} 
	 */
	static get frameRate() { return this.#frameRate; }
	static set frameRate(x) { this.#frameRate = validateNumber(x, 'frameRate', false); }

}