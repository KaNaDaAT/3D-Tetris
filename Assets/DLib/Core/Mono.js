import { AttachableComponent } from './AttachableComponent.js';
import { Component } from './Component.js';
import { GameObject } from './GameObject.js';

/**
 * The {@link AttachableComponent} class represents a {@link Component}
 * that can be attached to a game object. It provides some additional functionality.
 * @class
 * @extends Component
 */
export class Mono extends AttachableComponent {

	/** @type {Boolean} */
	#awake = false;
	/** @type {Boolean} Check if the script is awoken already. */
	get isAwake() { return this.#awake; }
	set isAwake(_) { this.#awake = true; }

	/** @type {Boolean} Indicates that the {@link Behaviour} and the associated {@link GameObject} are enabled. */
	get active() { return this.enabled && this.gameObject.enabled; }

	/**
	 * Instantiates a new {@link AttachableComponent}.
	 * @param {GameObject} gameObject - The {@link GameObject} this Component is attached to.
	 */
	constructor(gameObject) {
		super(gameObject);
	}

	/**
	 * The 'Awake' in the game loop.<br>
	 * Get's called the first time the {@link Mono} get's attached to a {@link GameObject}.<br>
	 * Can be used for initializations.
	 */
	awake() { }

	/**
	 * The 'Update' in the game loop.<br>
	 * Used for main logic. For now also for physics.
	 */
	update() { }

	/**
	 * The 'LateUpdate' in the game loop.<br>
	 * Used for logic that shall happen after animations.
	 */
	lateUpdate() { }


	/**
	 * Event that fires when a collision was detected.
	 * @param {Collider} other - The other collider the collision happened for.
	 * @param {Collider} triggered - The exact {@link Collider}s of this {@link Mono} which the collision happened for.
	 */
	onCollision(other, triggered) { }

}