import { validateType } from '../Utils/TypeCheck.js';
import { GameObject } from './GameObject.js';
import { Transform } from './Transform.js';

/**
 * The {@link Component} class represents a base class for components in the gam. 
 * It provides common functionality and properties that are needed.
 *  @class
 */
export class Component {

	/** @type {String} */
	get tag() { return this.gameObject.tag; }

	/** @type {GameObject} */ #gameObject = null;
	/** 
	 * The {@link GameObject} this component is attached to. 
	 * 
	 * Its recommended to use {@linkcode GameObject.attachComponent}/{@linkcode GameObject.detachComponent} but setting the property works fine as well as it 
	 * will automatically call the needed attach and detach operations.
	 * @type {GameObject} 
	 */
	get gameObject() { return this.#gameObject; }
	set gameObject(x) {
		if (x === this.#gameObject) return;
		validateType(x, 'gameObject', GameObject, true);
		if (this.#gameObject) this.#gameObject.detachComponent(this); 
		this.#gameObject = x;
		if (x) x.attachComponent(this);
	}

	/** @type {Transform} */
	get transform() { return this.gameObject.transform; }

	/**
	 * Instantiates a new {@link Component}.
	 * @param {GameObject} gameObject - The {@link GameObject} this Component is attached to.
	 */
	constructor(gameObject) {
		this.gameObject = gameObject;
	}


	/**
	 * Checks if the tag is equal to the tag of the associated `GameObject`.
	 * @param {String} tag - The tag to compare.
	 * @returns {Boolean} Returns `true` if the tags are equal, `false` otherwise.
	 */
	equalTag(tag) {
		return this.tag === tag;
	}

	/**
	 * Gets the first {@link Component} of the given `type` from the {@link GameObject} associated with this {@link Component}.
	 * @param {Type} type - The type of the {@link Component} to get.
	 * @returns {Component} The {@link Component} that was found or null if non was found.
	 */
	getComponent(type) {
		return this.gameObject.getComponent(type);
	}

	/**
	 * Gets the first {@link Component} of the given `name` from the {@link GameObject} associated with this {@link Component}.
	 * @param {Type} name - The name of the {@link Component} to get.
	 * @returns {Component} The {@link Component} that was found or null if non was found.
	 */
	getComponentByName(name) {
		return this.gameObject.getComponentByName(name);
	}

	/**
	 * Gets a list of {@link Component}s of the given `type` from the {@link GameObject} associated with this {@link Component}.
	* @param {Type} type - The type of the {@link Component}s to get.
	* @param {Boolean} [inactive=true] - Whether to include inactive {@link Behaviour}s.
	* @param {Boolean} [children=false] - Whether to include {@link Component}s from children objects.
	* @returns {Component[]} The list of {@link Component}s that were found.
	*/
	getComponents(type, inactive = true, children = false) {
		return this.gameObject.getComponent(type, inactive, children);
	}

	/**
	 * Sends a signal to destroy the {@link GameObject} associated with this {@link Component}.
	 * @param {Number} time - Time in seconds till the object shall be destroyed.
	 */
	kill(time) {
		this.gameObject.kill(time);
	}

	/**
	 * Get a registered {@link GameObject} by the specified tag.
	 * @param {String} tag - The tag of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject} The first {@link GameObject} that was found or null.
	 */
	static findObjectByTag(tag, inactive = false) {
		return GameObject.findObjectByTag(tag, inactive);
	}

	/**
	 * Get a list of registered {@link GameObject}s by the specified tag.
	 * @param {String} tag - The tag of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject[]} The list of {@link GameObject}s that where found.
	 */
	static findObjectsByTag(tag, inactive = false) {
		return GameObject.findObjectByTag(tag, inactive);
	}


}