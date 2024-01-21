import { Display } from '../Core/Display.js';
import { GameObject } from '../Core/GameObject.js';
import { Game } from '../Game.js';
import {
	validateNumber,
	validateType,
} from '../Utils/TypeCheck.js';
import { UIDisplay } from './UIDisplay.js';

export class UIManager extends GameObject {

	static get graphics() { return Game.graphics; }
	static get canvas() { return Display.canvas; }

	/** @type {UIDisplay} */
	#DISPLAY = null;
	/** 
	 * The default display to draw on.
	 * 
	 * After changing its values it will get updated next frame. the UIManager will  be updated by using {@linkcode render}
	 * @type {UIDisplay} 
	 */
	get DISPLAY() { return this.#DISPLAY; }

	/** @type {Number} */
	#referenceWidth = 1920;
	/**
	 * The width to scale the ui elements to.
	 * @type {Number} 
	 */
	get referenceWidth() { return this.#referenceWidth; }
	set referenceWidth(x) { this.#referenceWidth = validateNumber(x, 'referenceWidth'); }

	/** @type {Number} */
	#referenceHeight = 1080;
	/**
	 * The width to scale the ui elements to.
	 * @type {Number} 
	 */
	get referenceHeight() { return this.#referenceHeight; }
	set referenceHeight(x) { this.#referenceHeight = validateNumber(x, 'referenceHeight'); }


	constructor() {
		super();
		this.#DISPLAY = new UIDisplay();
		this.#DISPLAY.uimanager = this;
	}

	#redraw = false;
	redraw() {
		this.#redraw = true;
	}


	#firstRender = true;
	render() {
		if (Display.overlay != null) {
			if (Display.updated || this.#firstRender || this.#redraw) {
				this.#firstRender = false;
				const stringBuilder = this.#DISPLAY.render();
				const ui = stringBuilder.join("");
				Display.overlay.innerHTML = ui;
			}
			for (let id in this.#uiLoopCallBacks) {
				this.#uiLoopCallBacks[id](id);
			}
		} else {
			console.warn("No overlay configured!");
		}
		this.#redraw = false;
	}

	/**
	 * Gets a {@link UIContainer} by its uid.
	 * @param {String} uid - The uid of the {@link UIContainer}.
	 * @return {UIContainer} The found {@link UIContainer} or null.
	 */
	getByUid(uid) {
		for (let i = 0; i < this.#DISPLAY.children; i++) {
			const container = this.#getByUid(this.#DISPLAY.children[i], uid);
			if (container != null)
				return container;
		}
		return null;
	}

	/**
	 * Gets a {@link UIContainer} by its uid.
	 * @param {UIContainer} container - The {@link UIContainer}.
	 * @param {String} uid - The uid of the {@link UIContainer}.
	 * @return {UIContainer} The found {@link UIContainer} or null.
	 */
	#getByUid(container, uid) {
		if (container.uid === uid) {
			return container;
		}
		for (let i = 0; i < container.children; i++) {
			const container = this.#getByUid(container.children[i], uid);
			if (container != null)
				return container;
		}
		return null;
	}



	#uiLoopCallBacks = {};
	/**
	 * Creates a loop callback which can be used to dynamically update values in the ui. 
	 * 
	 * It works by getting a string value from the handler and setting it onto the html element with the given id.
	 * @param {*} id - A unique id so render does not duplicate the callbacks but replaces them. 
	 * @param {Function} handler - A function that should return a string in order to update values.
	 */
	createTextCallback(id, handler) {
		validateType(handler, 'handler', Function);
		this.#uiLoopCallBacks[id] = (id) => {
			const element = document.getElementById(id);
			element.textContent = handler();
		}

	}
	/**
	 * Creates a loop callback which can be used to dynamically update values in the ui. 
	 * 
	 * It works by getting a string value from the handler and setting it onto the html element with the given id.
	 * @param {*} id - A unique id so render does not duplicate the callbacks but replaces them. 
	 * @param {Function} handler - A function that should return a string in order to update values.
	 */
	createInnerHTMLCallback(id, handler) {
		validateType(handler, 'handler', Function);
		this.#uiLoopCallBacks[id] = (id) => {
			const element = document.getElementById(id);
			element.innerHTML = handler();
		}

	}
}