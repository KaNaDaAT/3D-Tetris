import { Time } from './Time.js';

export class Keys {

	static get INSTANCE() {
		return INSTANCE;
	}

	#keysPressed = {};
	#mappings = {};

	constructor() {
		document.addEventListener('keydown', this.#keyDown.bind(this));
		document.addEventListener('keyup', this.#keyUp.bind(this));
	}

	finalize() {
		window.removeEventListener('keydown', this.#keyDown.bind(this));
		window.removeEventListener('keyup', this.#keyUp.bind(this));
	}

	/**
	 * Checks if a key is currently beeing pressed during this frame.
	 * 
	 * @param {String} key - The key to check.
	 * @returns {Boolean} Indicating if the key is currently beeing pressed.
	 */
	keyPressed(key) {
		const mapping = this.#mappings[key];
		if (mapping) {
			const [keyCode, shift] = mapping;
			return this.#keysPressed[keyCode].pressed
				&& (shift == this.isShift());
		}
		return false;
	}

	/**
	 * Checks if a key was pressed down in the last frame.
	 * 
	 * @param {String} key - The key to check.
	 * @returns {Boolean} Indicating if the key was pressed in the last frame.
	 */
	keyDown(key) {
		const mapping = this.#mappings[key];
		if (mapping) {
			const [keyCode, shift] = mapping;
			return this.#keysPressed[keyCode].pressed
				&& this.#keysPressed[keyCode].downTime >= Time.INSTANCE.previousLoop
				&& this.#keysPressed[keyCode].downTime < Time.INSTANCE.currentLoop
				&& (shift == this.isShift());
		}
		return false;
	}

	/**
	 * Checks if a key was released in the last frame.
	 * 
	 * @param {String} key - The key to check.
	 * @returns {Boolean} Indicating if the key was released in the last frame.
	 */
	keyUp(key) {
		const mapping = this.#mappings[key];
		if (mapping) {
			const [keyCode, shift] = mapping;
			return !this.#keysPressed[keyCode].pressed
				&& this.#keysPressed[keyCode].upTime >= Time.INSTANCE.previousLoop
				&& this.#keysPressed[keyCode].upTime < Time.INSTANCE.currentLoop
				&& (shift == this.isShift());
		}
		return false;
	}

	isShift() {
		let shift = false;
		if (this.#keysPressed['ShiftLeft']) {
			shift = this.#keysPressed['ShiftLeft'].pressed;
		}
		if (!shift && this.#keysPressed['ShiftRight']) {
			shift = this.#keysPressed['ShiftRight'].pressed;
		}
		return shift;
	}

	#keyDown(event) {
		if (this.#keysPressed[event.code] != null && this.#keysPressed[event.code].downTime != 0)
			this.#keysPressed[event.code] = { pressed: true, downTime: this.#keysPressed[event.code].downTime, upTime: 0 };
		else
			this.#keysPressed[event.code] = { pressed: true, downTime: Time.INSTANCE.current, upTime: 0 };
		this.#mappings[event.key] = [event.code, event.shiftKey]
	}

	#keyUp(event) {
		if (this.#keysPressed[event.code] != null && this.#keysPressed[event.code].upTime != 0)
			this.#keysPressed[event.code] = { pressed: false, downTime: 0, upTime: this.#keysPressed[event.code].upTime };
		else
			this.#keysPressed[event.code] = { pressed: false, downTime: 0, upTime: Time.INSTANCE.current };
		this.#mappings[event.key] = [event.code, event.shiftKey]
	}

}
const INSTANCE = new Keys();
