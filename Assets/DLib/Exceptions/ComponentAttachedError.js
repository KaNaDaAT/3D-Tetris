export class ComponentAttachedError extends Error {
	constructor(component, gameObject) {
		super();
		this.name = 'ComponentAttachedError';
		this.message = `The Component '${component.constructor.name}' is already attached to the GameObject with the id '${component.gameObject.uid}'. Cannot attach he GameObject with the id '${gameObject.uid}'.`;
		this.stack = (new Error()).stack;
	}
}