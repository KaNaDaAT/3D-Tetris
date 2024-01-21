import { DLibConfig } from '../DLibConfig.js';
import {
	ComponentAttachedError,
} from '../Exceptions/ComponentAttachedError.js';
import { Game } from '../Game.js';
import { Renderer } from '../Render/Renderer.js';
import { deepClone } from '../Utils/Clone.js';
import {
	isType,
	validateNumber,
	validateType,
} from '../Utils/TypeCheck.js';
import { UID } from '../Utils/UID.js';
import { AttachableComponent } from './AttachableComponent.js';
import { Collider } from './Collider.js';
import { Mono } from './Mono.js';
import { Rigidbody } from './Rigidbody.js';
import { Transform } from './Transform.js';

const gameObjectIDs = {};

/**
 * An GameObject similar to and Unity GameObject but combining MonoBehaviour, Transform and Render with it. 
 * @class
 */
export class GameObject {

	/**
	 * Flag that indicates debug mode on the GameObject. 
	 * @type {Boolean}
	 */
	debug = false;

	/** @type {Boolean} */ #dead = false;
	/**
	 * Flag that indicates debug mode on the GameObject. 
	 * @type {Boolean}
	 */
	get dead() { return this.#dead; };

	/** 
	 * The unique id of this GameObject.
	 * @type {String} 
	 */
	#uid;
	get uid() {
		return this.#uid;
	}

	/** @type {String} */ #tag = "default";
	/** @type {String} */
	get tag() { return this.#tag; }
	set tag(x) { this.#tag = validateType(x, 'tag', String); }


	/** @type {Boolean} */ #enabled = true;
	/** @type {Boolean} */
	get enabled() { return this.#enabled; }
	set enabled(x) { this.#enabled = validateType(x, 'enabled', Boolean); }

	/** @type {Boolean} Indicates that the {@link GameObject} is enabled and all parent {@link GameObject}s are as well.*/
	get active() {
		if (this.#transform.parent != null) {
			return this.#enabled && this.#transform.parent.gameObject.enabled;
		}
		return this.#enabled;
	}

	/** @type {Transform} */ #transform = null;
	/** 
	 * The {@link Transform} of the {@link GameObject}.
	 * @type {Transform} 
	 */
	get transform() { return this.#transform; }

	/** @type {Renderer} */ #renderer = null;
	/** 
	 * The {@link Renderer} of the {@link GameObject}. May be null.
	 * @type {Renderer}
	 */
	get renderer() { return this.#renderer; }
	set renderer(x) {
		if (this.#renderer === x) return;
		validateType(x, 'renderer', Renderer, true);
		this.detachComponent(this.#renderer);
		if (x != null) this.attachComponent(x);
	}

	/** @type {Rigidbody} */ #rigidbody = null;
	/** 
	 * The {@link Rigidbody} of the {@link GameObject}. May be null.
	 * @type {Rigidbody}
	 */
	get rigidbody() { return this.#rigidbody; }
	set rigidbody(x) {
		if (this.#rigidbody === x) return;
		validateType(x, 'rigidbody', Rigidbody, true);
		this.detachComponent(this.#rigidbody);
		if (x != null) this.attachComponent(x);
	}

	/** @type {Collider[]} */ #colliders = []
	/** 
	 * Copy of the list storing the {@link Collider}s of the {@link GameObject}.
	 * @type {Collider[]} 
	 */
	get colliders() { return [...this.#colliders]; }

	/** @type {AttachableComponent[]} */ #components = []
	/** 
	 * Copy of the list storing the {@link AttachableComponent}s of the {@link GameObject}.
	 * @type {AttachableComponent[]}
	 */
	get components() { return [...this.#components]; }

	/** @type {Mono[]} */ #monos = []
	/** 
	 * Copy of the list storing the {@link Mono}s of the {@link GameObject}.
	 * @type {Mono[]}
	 */
	get monos() { return this.#monos; }

	/**
	 * Creates a new Transform instance.
	 * @constructor
	 * @param {['x', 'y', 'z']} position - The position of the GameObject.
	 * @param {['pitch', 'yaw', 'roll']|['x', 'y', 'z', 'w']} rotation - The rotation of the GameObject.
	 * @param {['x', 'y', 'z']} scale - The scale of the GameObject.
	 */
	constructor(position = [0.0, 0.0, 0.0], rotation = [0.0, 0.0, 0.0], scale = [1.0, 1.0, 1.0]) {
		this.#transform = new Transform(this, position, rotation, scale);
		do { this.#uid = UID.create(); } while (gameObjectIDs[this.#uid]);
		gameObjectIDs[this.#uid] = true;
	}

	//#region Attach/Remove
	/**
	 * Attaches a component to {@link GameObject}. If already attached to another {@link GameObject} it will automatically get detached first.
	 * @param {AttachableComponent} component - The component to attach.
	 * @returns {Boolean} - If was attached `true` and otherwise `false`.
	 * @throws {TypeError} - Throws if `component` is of incompatible type.
	 */
	attachComponent(component) {
		if (component == null) return false;
		validateType(component, 'component', AttachableComponent);
		if (component instanceof Renderer) {
			if (component.gameObject != null && component.gameObject !== this) throw new ComponentAttachedError(component, this);
			if (this.#renderer != null) this.#renderer.gameObject = null;
			this.#renderer = null;
			component.gameObject = this;
			this.#renderer = component;
			return true;
		} else if (component instanceof Rigidbody) {
			if (component.gameObject != null && component.gameObject !== this) throw new ComponentAttachedError(component, this);
			if (this.#rigidbody != null) this.#rigidbody.gameObject = null;
			this.#rigidbody = null;
			component.gameObject = this;
			this.#rigidbody = component;
			return true;
		} else if (component instanceof Collider) {
			return this.attachCollider(component);
		} else if (component instanceof Mono) {
			return this.attachMono(component);
		} else {
			if (component.gameObject != null && component.gameObject !== this) throw new ComponentAttachedError(component, this);
			if (this.#components.find(x => x === component) == null) {
				component.gameObject = null;
				this.#components.push(component);
				component.gameObject = this;
				return true;
			}
			return false;
		}
	}

	/**
	 * Attaches a {@link Collider} to {@link GameObject}. If already attached to another {@link GameObject} it will automatically get detached first.
	 * @param {Collider} component - The {@link Collider} to attach.
	 * @returns {Boolean} - If was attached `true` and otherwise `false`.
	 * @throws {TypeError} - Throws if `component` is not of type {@link Collider}.
	 */
	attachCollider(component) {
		validateType(component, 'component', Collider);
		if (component.gameObject != null && component.gameObject !== this) throw new ComponentAttachedError(component, this);
		if (this.#colliders.find(x => x === component) == null) {
			component.gameObject = null;
			this.#colliders.push(component);
			component.gameObject = this;
			return true;
		}
		return false;
	}

	/**
	 * Attaches a {@link Mono} to {@link GameObject}. If already attached to another {@link GameObject} it will automatically get detached first.
	 * @param {Collider} component - The {@link Mono} to attach.
	 * @returns {Boolean} - If was attached `true` and otherwise `false`.
	 * @throws {TypeError} - Throws if `component` is not of type {@link Mono}.
	 */
	attachMono(component) {
		validateType(component, 'component', Mono);
		if (component.gameObject != null && component.gameObject !== this) throw new ComponentAttachedError(component, this);
		if (this.#monos.find(x => x === component) == null) {
			component.gameObject = null;
			this.#monos.push(component);
			component.gameObject = this;
			return true;
		}
		return false;
	}

	/**
	 * Detaches a component from to {@link GameObject}.
	 * @param {AttachableComponent} component - The component to detach.
	 * @returns {Boolean} - If was detached `true` and otherwise `false`.
	 */
	detachComponent(component) {
		if (component == null || component.gameObject == null || component.gameObject !== this) return false;
		if (component === this.#renderer) {
			if (this.#renderer === component) {
				this.#renderer = null;
				component.gameObject = null;
				return true;
			}
			return false;
		} else if (component instanceof Rigidbody) {
			if (this.#rigidbody === component) {
				this.#rigidbody = null;
				component.gameObject = null;
				return true;
			}
			return false;
		} else if (component instanceof Collider) {
			return this.detachCollider(component);
		} else if (component instanceof Mono) {
			return this.detachMono(component);
		} else {
			const oldComponents = this.#components;
			this.#components = this.#components.filter(x => x !== component);
			if (oldComponents.length !== this.#components.length) {
				component.gameObject = null;
				return true;
			}
			return false;
		}
	}

	/**
	 * Detaches a {@link Collider} from to {@link GameObject}.
	 * @param {Collider} component - The {@link Collider} to detach.
	 * @returns {Boolean} - If it was detached `true` and otherwise `false`.
	 */
	detachCollider(component) {
		if (component == null || component.gameObject == null || component.gameObject !== this) return false;
		const oldColliders = this.#colliders;
		this.#colliders = this.#colliders.filter(x => x !== component);
		if (oldColliders.length !== this.#colliders.length) {
			component.gameObject = null;
			return true;
		}
		return false;
	}

	/**
	 * Detaches a {@link Mono} from to {@link GameObject}.
	 * @param {Mono} component - The {@link Mono} to detach.
	 * @returns {Boolean} - If it was detached `true` and otherwise `false`.
	 */
	detachMono(component) {
		if (component == null || component.gameObject == null || component.gameObject !== this) return false;
		const oldMonos = this.#monos;
		this.#monos = this.#monos.filter(x => x !== component);
		if (oldMonos.length !== this.#monos.length) {
			component.gameObject = null;
			return true;
		}
	}
	//#endregion

	//#region game loop stuff

	/**
	 * The 'Awake' in the game loop.
	 */
	#awake() {
		for (let i = 0; i < this.#monos.length; i++) {
			if (!this.#monos[i].isAwake) {
				this.#monos[i].awake();
				this.#monos[i].isAwake = true;
			}
		}
		// ToDo: Other awakes
	}

	/**
	 * Only called from GameLoop!<br>
	 * The 'Update' in the game loop. Used for main logic.
	 */
	update() {
		this.#awake();
		if (!this.active) return;
		for (let i = 0; i < this.#monos.length; i++) {
			if (this.#monos[i].enabled) {
				this.#monos[i].update();
			}
		}
	}

	/**ToDo:
	 * Only called from GameLoop!<br>
	 * The 'FixedUpdate' in the game loop. Used for physics.
	 */
	fixedUpdate() {
		if (!this.active) return;
		if (this.#rigidbody != null && this.#rigidbody.enabled) {
			this.#rigidbody.fixedUpdate();
		}
		for (let i = 0; i < this.#colliders.length; i++) {
			if (this.#colliders[i].enabled) {
				this.#colliders[i].fixedUpdate();
			}
		}
		for (let i = 0; i < this.#monos.length; i++) {
			if (this.#monos[i].enabled) {
				this.#monos[i].fixedUpdate();
			}
		}
	}
	/**
	 * Only called from GameLoop!<br>
	 * The 'LateUpdate' in the game loop. Used for logic that shall happen after animations.
	 */
	lateUpdate() {
		for (let i = 0; i < this.#monos.length; i++) {
			if (this.#monos[i].enabled) {
				this.#monos[i].lateUpdate();
			}
		}
	}

	/**
	 * Only called from GameLoop!<br>
	 * The 'Render' in the game loop. Used only for rendering. Should only be overriden with care.
	 */
	render() {
		if (this.#renderer != null) {
			this.#renderer.draw(this.#transform);
			if (this.debug)
				this.#renderer.drawCS(transform.position, transform.rotation, transform.scale);
		}
		for (var child of this.#transform.children) {
			child.gameObject.render();
		}
	}

	//#endregion

	//#region Component relevant

	/**
	 * Creates a new GameObject with the given Components.
	 * @param {AttachableComponent[]} components - Components to attach to the newly created GameObject. Each element has to be the type of AttachableComponent or the created instance. It will be skipped otherwise
	 * @return {GameObject} - Returns the created GameObject.
	 */
	static create(...components) {
		const gameObject = new GameObject();
		for (let i = 0; i < components.length; i++) {
			validateType(components[i], `components[${i}]`, AttachableComponent)
			if (typeof components[i] === 'function') {
				gameObject.attachComponent(new components[i](gameObject));
			} else {
				gameObject.attachComponent(components[i]);
			}
		}
		if (DLibConfig.autoRegister)
			Game.INSTANCE.register(gameObject);
		return gameObject;
	}

	/**
	 * Creates a new GameObject of the given type with the given components.
	 * @param {Type} type - The type of the GameObject to create.
	 * @param {AttachableComponent[]} components - Components to attach to the newly created GameObject. Each element has to be the type of AttachableComponent or the created instance. It will be skipped otherwise
	 * @return {*} - Returns the created GameObject.
	 */
	static createOf(type, ...components) {
		var gameObject = type;
		if (typeof gameObject === 'function') {
			gameObject = new gameObject();
		}
		validateType(gameObject, 'type', GameObject);
		for (let i = 0; i < components.length; i++) {
			validateType(components[i], `components[${i}]`, AttachableComponent)
			if (typeof components[i] === 'function') {
				gameObject.attachComponent(new components[i](gameObject));
			} else {
				gameObject.attachComponent(components[i]);
			}
		}
		if (DLibConfig.autoRegister)
			Game.INSTANCE.register(gameObject);
		return gameObject;
	}

	/**
	 * Creates a new GameObject with the given Components.
	 * 
	 * Different to {@linkcode create} it will never register it automatically. 
	 * However a Prefab might still be added to the Game but its not recommended to do so.
	 * @param {AttachableComponent[]} components - Components to attach to the newly created GameObject. Each element has to be the type of AttachableComponent or the created instance. It will be skipped otherwise
	 * @return {GameObject} - Returns the created GameObject.
	 */
	static createPrefab(...components) {
		const gameObject = new GameObject();
		for (let i = 0; i < components.length; i++) {
			validateType(components[i], `components[${i}]`, AttachableComponent)
			if (typeof components[i] === 'function') {
				gameObject.attachComponent(new components[i](gameObject));
			} else {
				gameObject.attachComponent(components[i]);
			}
		}
		return gameObject;
	}


	/**
	 * Copy prefab as new GameObject from an existing one.
	 * @param {GameObject} prefab - The Prefab a new GameObject shall be created from
	 * @return {GameObject} - Returns the createdprefab  GameObject.
	 */
	static copyPrefab(prefab) {
		validateType(prefab, 'prefab', GameObject);
		const gameObject = this.#createFromPrefab(prefab);
		return gameObject;
	}

	/**
	 * Create new GameObject from an existing one.
	 * @param {GameObject} prefab - The Prefab a new GameObject shall be created from
	 * @return {GameObject} - Returns the created GameObject.
	 */
	static createFromPrefab(prefab) {
		validateType(prefab, 'prefab', GameObject);
		const gameObject = this.#createFromPrefab(prefab);
		if (DLibConfig.autoRegister)
			Game.INSTANCE.register(gameObject);
		return gameObject;
	}
	/**
	 * @param {GameObject} prefab - The Prefab a new GameObject shall be created from
	 * @return {GameObject} - Returns the created GameObject.
	 */
	static #createFromPrefab(prefab) {
		const gameObject = new GameObject(prefab.transform.position, prefab.transform.rotation, prefab.transform.scale);
		for (let i = 0; i < prefab.#components.length; i++) {
			const component = deepClone(prefab.#components[i]);
			component.gameObject = gameObject;
		}
		for (let i = 0; i < prefab.#monos.length; i++) {
			const mono = deepClone(prefab.#monos[i]);
			mono.gameObject = gameObject;
		}
		for (let i = 0; i < prefab.#colliders.length; i++) {
			const collider = deepClone(prefab.#colliders[i]);
			collider.gameObject = gameObject;
		}
		gameObject.rigidbody = deepClone(prefab.#rigidbody);
		gameObject.renderer = deepClone(prefab.#renderer);
		for (let child of prefab.transform.children) {
			const childTransform = this.#createFromPrefab(child.gameObject).transform;
			childTransform.parent = gameObject.transform;
		}
		return gameObject;
	}

	/**
	 * Sends a signal to destroy the {@link GameObject}.
	 * @param {GameObject} gameObject - The {@link GameObject} that shall be destroyed.
	 * @param {Number} time - The time in sec the {@link GameObject} will be destroyed in.
	 */
	static kill(gameObject, time = 0) {
		Game.kill(gameObject, time);
	}

	/**
	 * Sends a signal to destroy this {@link GameObject}.
	 * @param {Number} time - The time in sec the {@link GameObject} will be destroyed in.
	 */
	kill(time = 0) {
		this.#dead = true;
		Game.kill(this, time);
		this.#transform.parent = null;
		for (var child of this.#transform.children) {
			child.gameObject.kill(time);
		}
	}

	/**
	 * Gets the first {@link Component} of the given `type` from the {@link GameObject} associated with this {@link Component}.
	 * @param {Type} type - The type of the {@link Component} to get.
	 * @returns {Component} The {@link Component} that was found or null if non was found.
	 */
	getComponent(type) {
		if (type == null)
			return null;
		if (isType(type, Renderer)) {
			return this.#renderer;
		} else if (isType(type, Rigidbody)) {
			return this.#rigidbody;
		} else if (isType(type, Collider)) {
			return this.#colliders.map(x => x);
		} else if (isType(type, Mono)) {
			for (let i = 0; i < this.#monos.length; i++) {
				if (isType(this.#monos[i], type))
					return this.#monos[i];
			}
		} else {
			for (let i = 0; i < this.#components.length; i++) {
				if (isType(this.#components[i], type))
					return this.#components[i];
			}
		}
		return null;
	}

	/**
	 * Gets the first {@link Component} of the given `name` from the {@link GameObject} associated with this {@link Component}.
	 * @param {String} name - The name of the {@link Component} to get.
	 * @returns {Component} The {@link Component} that was found or null if non was found.
	 */
	getComponentByName(name) {
		if (name == null)
			return null;
		if (this.#renderer != null && this.#renderer.constructor.name === name) {
			return this.#renderer;
		} else if (this.#rigidbody != null && this.#rigidbody.constructor.name === name) {
			return this.#rigidbody;
		} else if ('collider' === name || 'Collider' === name) {
			return this.#colliders.map(x => x);
		} else {
			for (let i = 0; i < this.#monos.length; i++) {
				if (this.#monos[i] != null && this.#monos[i].constructor.name === name)
					return this.#monos[i];
			}
			for (let i = 0; i < this.#components.length; i++) {
				if (this.#components[i] != null && this.#components[i].constructor.name === name)
					return this.#components[i];
			}
		}
		return null;
	}

	/**
	 * Gets a list of {@link Component}s of the given `type` from the {@link GameObject}.
	 * @param {Type} type - The type of the {@link Component}s to get.
	 * @param {Boolean} [inactive=true] - Whether to include inactive {@link Behaviour}s.
	 * @param {Boolean} [children=false] - Whether to include {@link Component}s from children objects.
	 * @returns {Component[]} The list of {@link Component}s that were found.
	*/
	getComponents(type, inactive = true, children = false) {
		if (!inactive && !this.active) return;
		const list = [];
		if (isType(type, Renderer)) {
			if (!inactive && this.#renderer != null && this.#renderer.enabled)
				list.push(this.#renderer);
		} else if (isType(type, Rigidbody)) {
			list.push(this.#rigidbody);
		} else if (isType(type, Collider)) {
			list.push(...this.#colliders.map(x => x));
		} else if (isType(type, Mono)) {
			for (let i = 0; i < this.#monos.length; i++) {
				if (isType(this.#monos[i], type))
					list.push(...this.#monos[i]);
			}
		} else {
			for (let i = 0; i < this.#components.length; i++) {
				if (isType(this.#components[i], type))
					list.push(...this.#components[i]);
			}
		}
		if (children) {
			for (let child of getChildren(inactive)) {
				list.push(...child.getComponents(type, inactive, false));
			}
		}
		return [];
	}

	/**
	 * Gets a list of all child {@link GameObject}s of this.
	 * @param {Boolean} [disabled=true] - Whether to include disabled {@link GameObject}s and their children or not.
	 * @param {Boolean} [depth=-1] - Depth which up to include {@link GameObject}s from children objects. Using -1 means until there are no more.
	 * @returns {GameObject[]} The list of {@link GameObject}s that were found.
	*/
	getChildren(disabled = true, depth = -1) {
		validateType(disabled, 'disabled', Boolean);
		depth = validateNumber(depth, 'depth');
		if (depth == 0 || this.transform.children == null) return [];
		if (!disabled && !this.enabled) return [];
		const foundChildren = [];
		for (let i = 0; i < this.transform.children.length; i++) {
			foundChildren.push(...(this.transform.children[i].gameObject.getChildren(inactive, depth - 1)))
		}
		return foundChildren;
	}

	/**
	 * Get a registered {@link GameObject} by the specified tag.
	 * @param {String} tag - The tag of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject} The first {@link GameObject} that was found or null.
	 */
	static findObjectByTag(tag, inactive = false) {
		return Game.findObjectByTag(tag, inactive);
	}

	/**
	 * Get a list of registered {@link GameObject}s by the specified tag.
	 * @param {String} tag - The tag of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject[]} The list of {@link GameObject}s that where found.
	 */
	static findObjectsByTag(tag, inactive = false) {
		return Game.findObjectByTag(tag, inactive);
	}

	/**
	 * Get a registered {@link GameObject} by the specified tag.
	 * @param {Type} type - The type of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject} The first {@link GameObject} that was found or null.
	 */
	static findObjectByType(tag, inactive = false) {
		return Game.findObjectByType(tag, inactive);
	}

	/**
	 * Get a list of registered {@link GameObject}s by the specified type.
	 * @param {Type} type - The type of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject[]} The list of {@link GameObject}s that where found.
	 */
	static findObjectsByType(tag, inactive = false) {
		return Game.findObjectByType(tag, inactive);
	}

	//#endregion

}