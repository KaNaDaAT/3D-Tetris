import { DLibConfig } from '../DLibConfig.js';

let INSTANCE = null;

export class Time {

	/**
	* @returns {Time} The INSTANCE of Time.
	*/
	static get INSTANCE() {
		return INSTANCE;
	}

	constructor() {
		if (Time.INSTANCE !== null) {
			throw new Error("Time already instantiated!")
		} else {
			INSTANCE = this;
			this.#start = performance.now();
		}
	}

	#start;
	/** 
	 * Point of time when the Game started.
	 * @type {Date}
	 */
	get start() { return this.#start; }

	#deltaTime;
	/** 
	 * Time since last frame in sec.
	 * @type {Number}
	 */
	get delta() { return this.#deltaTime; }

	#previousLoop = 0;
	/** 
	 * Returns the start time of the previous loop in ms.
	 * @type {Number}
	 */
	get previousLoop() { return this.#previousLoop; }

	#currentLoop = 0;
	/** 
	 * Returns the start time of the current loop in ms.
	 * @type {Number}
	 */
	get currentLoop() { return this.#currentLoop; }

	/** 
	 * Time since the start in ms.
	 * @type {Number}
	 */
	get current() { return performance.now() - this.#start; }

	/** 
	 * Time since the start in sec.
	 * @type {Number}
	 */
	get currentSec() { return (performance.now() - this.#start) / 1000; }

	#fps;
	/** 
	 * The current FPS count.
	 * @type {Number}
	 */
	get fps() { return this.#fps; }

	#lastfps = [];
	/** 
	 * The current FPS count.
	 * @type {Number}
	 */
	get smoothFps() { return Math.round(this.#lastfps.reduce((a, b) => a + b, 0) / this.#lastfps.length); }

	loop() {
		this.#previousLoop = this.#currentLoop;
		this.#currentLoop = performance.now() - this.#start;
		this.#deltaTime = Math.min((this.#currentLoop - this.#previousLoop) / 1000.0, 5 / DLibConfig.frameRate);
		const fps = 1 / this.#deltaTime;
		this.#fps = Math.floor(fps);
		this.#lastfps.push(fps);
		if (this.#lastfps.length > DLibConfig.frameRate)
			this.#lastfps.shift();
		if (this.#previousLoop == 0)
			this.#lastfps.shift();
	}

	resume() {
		this.#currentLoop = performance.now() - this.#start;
		this.#previousLoop = this.#currentLoop - (this.#deltaTime * 1000);
		this.#deltaTime = (this.#currentLoop - this.#previousLoop) / 1000.0;
	}
}