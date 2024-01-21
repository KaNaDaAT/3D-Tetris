import { validateNumber } from '../Utils/TypeCheck.js';

export class Physics {

	/** Default gravity of the game physics. 
	 * @type {Number} 
	 */
	get DEFAULT_GRAVITY() { return 9.81; }

	/** @type {Number} */
	static #gravity = 9.81;
	/** Current gravity of the game physics. 
	 * @type {Number}
	 */
	static get gravity() { return this.#gravity; }
	static set gravity(x) { this.#gravity = validateNumber(x, 'gravity');  }

}