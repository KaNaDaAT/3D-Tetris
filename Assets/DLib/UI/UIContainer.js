import { Display } from '../Core/Display.js';
import {
	throwTypeError,
	validateNumber,
	validateType,
} from '../Utils/TypeCheck.js';
import { UID } from '../Utils/UID.js';

export class UIContainer {

	/** @type {UIManager} */
	#uimanager = null
	/** 
	 * The UIManager that will update the UIContainers. 
	 * @type {UIManager} 
	 */
	get uimanager() {
		if (this.#uimanager == null) {
			throw new Error("UIManager not yet configured!");
		}
		return this.#uimanager;
	}
	set uimanager(x) {
		if (x.constructor != null && x.constructor.name === 'UIManager') {
			this.#uimanager = x;
		} else {
			throwTypeError('uimanager', 'UIManager', x);
		}
	}


	/** @type {UIContainer} */
	#parent = null;
	#isDisplay = false;
	/** 
	 * Sets the parent. Null allowed.
	 * 
	 * Will call `addChild`/`removeChild`.
	 * @type {UIContainer} 
	 */
	get parent() { return this.#parent; }
	set parent(x) {
		if (this.#isDisplay) return;
		if (x === this.#parent) return;
		if (x != null) {
			validateType(x, 'parent', UIContainer);
			if (this.#parent != null) this.#parent.removeUI(this);
			x.addUI(this);
		} else {
			this.#parent.removeUI(this);
		}
	}

	/** @type {UIContainer[]} */
	#children = []
	/** 
	 * DO NOT MODIFY THE ARRAY DIRECTLY! 
	 * @type {UIContainer[]} 
	 */
	get children() { return this.#children; }

	/** @type {String} */
	#uid = null;
	/** @type {String} */
	get uid() { return this.#uid }

	constructor(parent) {
		if (this instanceof Display) {
			this.#parent = null;
			this.#isDisplay = true;
		} else {
			this.parent = parent;
		}
		this.#uid = UID.create();
	}


	//#region Add/Remove
	/**
	 * Adds an {@link UIContainer} to this one. Cannot add if already child of another. Use the parent property for this.
	 * 
	 * @param {UIContainer} uicontainer - The element to add.
	 * @returns {Boolean} - Whether it could be added or not.
	 * @throws {TypeError} - Throws if `uicontainer` is not of type {@link UIContainer}.
	 */
	addUI(uicontainer) {
		validateType(uicontainer, 'uicontainer', UIContainer);
		if (uicontainer.#parent == null) {
			this.#children.push(uicontainer);
			uicontainer.#parent = this;
			uicontainer.#uimanager = this.uimanager;
			return true;
		}
		console.warn("Cannot add 'uicontainer' because it already is added to another component");
		return false;
	}

	/**
	 * Removes an {@link UIContainer} to this one. Will update the parent property.
	 * 
	 * @param {UIContainer} uicontainer - The element to remove.
	 * @returns {Boolean} - Whether it could be removed or not.
	 * @throws {TypeError} - Throws if `uicontainer` is not of type {@link UIContainer}.
	 */
	removeUI(uicontainer) {
		validateType(uicontainer, 'uicontainer', UIContainer);
		if (uicontainer.#parent != this)
			return false;
		uicontainer.#parent = null;
		uicontainer.#uimanager = null;
		const children = this.#children;
		this.#children = this.#children.filter(x => x !== uicontainer);
		return children.length !== this.#children.length;
	}
	//#endregion

	//#region Draw
	/** 
	 * Override in order to draw the open tag.
	 * @param {String[]} sb - The String Builder to push back infos to. 
	 */
	drawOpen(sb) {
		sb.push(`<div style='${this.getStyle()}'>`)
	}

	/** 
	 * Override in order to draw the close tag.
	 * @param {String[]} sb - The String Builder to push back infos to. 
	 */
	drawClose(sb) {
		sb.push("</div>")
	}
	//#endregion

	//#region Helpers
	/**
	 * Scales the number into a percentage value based on the ui managers referenceWidth.
	 * 
	 * @param {Number} value - The number to scale.
	 * @return {Number} The scaled number.
	 */
	scaleX(value) {
		const x = validateNumber(value, 'value');
		return x * 100 / this.#uimanager.referenceWidth;
	}
	/**
	 * Scales the number into a percentage value based on the ui managers referenceHeight.
	 * 
	 * @param {Number} value - The number to scale.
	 * @return {Number} The scaled number.
	 */
	scaleY(value) {
		const y = validateNumber(value, 'value');
		return y * 100 / this.#uimanager.referenceHeight;
	}
	//#endregion

	/** 
	 * Override in order to change render behaviour.
	 * @param {String[]} sb - The String Builder to push back infos to. 
	 */
	render(sb = []) {
		validateType(sb, 'sb', Array);
		for (let child of this.#children) {
			child.render(sb);
		}
		return sb;
	}


}