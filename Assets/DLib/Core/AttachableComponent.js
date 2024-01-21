import { Component } from './Component.js';
import { GameObject } from './GameObject.js';

/**
 * The {@link AttachableComponent} class represents a {@link Component}
 * that can be attached to a game object. It provides some additional functionality.
 * @class
 * @extends Component
 */
export class AttachableComponent extends Component {

	/** @type {Boolean} */ #enabled = true;
	/** @type {Boolean} */ 
	get enabled() { return this.#enabled; }
	set enabled(x) {  this.#enabled  = validateType(x, 'enabled', Boolean); }

	/** @type {Boolean} Indicates that the {@link Behaviour} is enabled and the associated {@link GameObject} is active. */ 
	get active() { return this.#enabled && this.gameObject.active; }

	/**
	 * Instantiates a new {@link AttachableComponent}.
	 * @param {GameObject} gameObject - The {@link GameObject} this Component is attached to.
	 */
	constructor(gameObject) {
		super(gameObject);
	}
}