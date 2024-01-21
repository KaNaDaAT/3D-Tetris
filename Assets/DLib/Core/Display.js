import { Game } from '../Game.js';
import { isType, validateNumber } from '../Utils/TypeCheck.js';

export class Display {

	/**
	 * The width of the rendering canvas.  
	 * @type {Number}
	 */
	static get width() { return Display.canvas.clientWidth; }
	/** 
	 * The height of the rendering canvas. 
	 * @type {Number} 
	 */
	static get height() { return Display.canvas.clientHeight; }

	/** @type {Number} */ static #aspectRatio = 16 / 9;
	/** 
	 * The aspectRatio of the rendering canvas.
	 * @type {Number} 
	 */
	static get aspectRatio() { return Display.#aspectRatio; }
	static set aspectRatio(x) { Display.#aspectRatio = validateNumber(x, 'aspectRatio'); }

	/** @type {HTMLCanvasElement | OffscreenCanvas} */ static #canvas = null;
	/**
	 * The rendering canvas. 
	 * @type {HTMLCanvasElement | OffscreenCanvas} 
	 */
	static get canvas() { return this.#canvas; }

	/** @type {Element} */ static #wrapper = null;
	/**
	 * The wrapper for the canvas and overlay. 
	 * @type {Element} 
	 */
	static get wrapper() { return this.#wrapper; }
	static get hasWrapper() { return this.#wrapper != null; }

	/** @type {Element} */ static #overlay = null;
	/**
	 * The overlay to draw ui on. 
	 * @type {Element} 
	 */
	static get overlay() { return this.#overlay; }
	/** @type {Boolean} */
	static get hasOverlay() { return this.#overlay != null; }

	
	/** @type {Boolean} */ static #updated = false;
	/**
	 * If true the Display got resized in this frame.
	 * @type {Boolean} 
	 */
	static get updated() { return this.#updated; }

	static loadCanvas(canvasId) {
		const canvas = document.querySelector(`#${canvasId}`);
		if (canvas == null || (!isType(canvas, HTMLCanvasElement) && !isType(canvas, OffscreenCanvas))) {
			throw new Error(`Their was no canvas with the given id '${canvasId}'`);
		}
		Display.#canvas = canvas;
		Display.#wrapper = document.querySelector(`#${canvasId}-wrapper`);
		Display.#overlay = document.querySelector(`#${canvasId}-overlay`);
	}

	/**
	 * Resizes the canvas to match thee aspect ratio.
	 * 
	 * Does only normalize canvas size when no wrapper was defined. 
	 */
	static update() {
		Display.#updated = false;
		if (Display.hasWrapper) {
			const width = Math.floor(Display.wrapper.clientWidth);
			const height = Math.floor(width / Display.aspectRatio)
			if(Display.canvas.width == width && Display.canvas.height == height)
				return;
			Display.#updated = true;
			Display.canvas.width = width;
			Display.canvas.height = height;
			Display.overlay.style.width = `${Display.width}px`;
			Display.overlay.style.height = `${Display.height}px`;
		} else {
			const width = Math.floor(Display.canvas.clientWidth);
			const height = Math.floor(Display.canvas.clientHeight);
			Display.canvas.width = width;
			Display.canvas.height = height;
		}
		Game.graphics.viewport(0, 0, Display.width, Display.height);

	}
}