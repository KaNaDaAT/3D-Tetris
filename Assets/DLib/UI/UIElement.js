import { Color } from '../Core/Color.js';
import {
	throwTypeError,
	validateType,
	validateVec4,
} from '../Utils/TypeCheck.js';
import { UIContainer } from './UIContainer.js';

export const Alignment = {
	TOP_LEFT: 'TOP_LEFT',
	TOP_RIGHT: 'TOP_RIGHT',
	BOTTOM_LEFT: 'BOTTOM_LEFT',
	BOTTOM_RIGHT: 'BOTTOM_RIGHT',
	CENTER: 'CENTER',
};

/**
 * @typedef {String} Alignment
 * Represents a set of alignments.
 * @enum {string} Alignment
 * @property {string} TOP_LEFT - Top Left aligned.
 * @property {string} TOP_RIGHT - Top Right aligned.
 * @property {string} BOTTOM_LEFT - Bottom Left aligned.
 * @property {string} BOTTOM_RIGHT - Bottom Right aligned.
 * @property {string} CENTER - Center aligned.
 */

export class UIElement extends UIContainer {

	/** @type {['top', 'right', 'bottom', 'left']} */
	#padding = [0, 0, 0, 0]
	/** 
	 * The padding of the UI Element. 
	 * @type {['top', 'right', 'bottom', 'left']|Number} 
	 */
	get padding() { return this.#padding; }
	set padding(x) { this.#padding = validateVec4(x, 'padding', true); }

	/** @type {['x', 'y', 'width', 'height']} */
	#bounds = [0, 0, 100, 50]
	/** 
	 * The x and y pos as well as the width and height of the UI Element. 
	 * @type {['x', 'y', 'width', 'height']} 
	 */
	get bounds() { return this.#bounds; }
	set bounds(x) { this.#bounds = validateVec4(x, 'bounds'); }

	/** @type {Alignment} */
	#alignment = Alignment.TOP_LEFT;
	/** 
	 * The Alignment of the UI Element. 
	 * @type {Alignment} 
	 */
	get alignment() { return this.#alignment; }
	set alignment(x) {
		if (Alignment[x] == null) {
			throwTypeError('alignment', 'Alignment', x)
		}
		this.#alignment = Alignment[x];
	}

	/** @type {Color} */
	#color = Color.BLANK;
	/** 
	 * The x and y pos as well as the width and height of the UI Element. 
	 * @type {Color} 
	 */
	get color() { return this.#color; }
	set color(x) { this.#color = validateType(x, 'color', Color); }

	/** @type {Boolean} */
	#visible = true;
	/** 
	 * The x and y pos as well as the width and height of the UI Element. 
	 * @type {Boolean} 
	 */
	get visible() { return this.#visible; }
	set visible(x) { this.#visible = validateType(x, 'visible', Boolean); }


	/**
	 * @param {['x', 'y', 'width', 'height']} bounds - The bounds of the UI Element.
	 * @param {Number|['top', 'right', 'bottom', 'left']} padding - The padding of the ui element.
	 * @param {Alignment} alignment - The alignment of the ui element.
	 * @param {Color} color - The color of the ui element.
	 * @param {UIContainer} parent - The parent to draw on. Default will be the {@link uimanager.DISPLAY}.
	 */
	constructor(bounds = [0, 0, 100, 50], padding = [0, 0, 0, 0], alignment = Alignment.CENTER, color = Color.BLANK, parent = null) {
		super(parent);
		this.bounds = bounds;
		this.padding = padding;
		this.alignment = alignment;
		this.color = color;
	}

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

	getBounds() {
		const x = this.scaleX(this.#bounds[0]);
		const y = this.scaleY(this.#bounds[1]);
		const width = this.scaleX(this.#bounds[2]);
		const height = this.scaleY(this.#bounds[3]);
		var bounds = `width: ${width}%; height: ${height}%;`;
		switch (this.alignment) {
			case Alignment.TOP_LEFT:
				bounds += `top: ${y}%; left: ${x}%;`;
				break;
			case Alignment.TOP_RIGHT:
				bounds += `top: ${y}%; right: ${x}%;`;
				break;
			case Alignment.BOTTOM_RIGHT:
				bounds += `bottom: ${y}%; left: ${x}%;`;
				break;
			case Alignment.BOTTOM_RIGHT:
				bounds += `bottom: ${y};% right: ${x}%;`;
				break;
			case Alignment.CENTER:
				bounds += `top: ${50 + y - height / 2}%; left: ${50 + x - width / 2}%;`;
				break;
		}
		return bounds
	}

	/**
	 * Returns the default style of the object.
	 * @return {String} style - The String Builder to push back infos to. 
	 */
	getStyle() {
		const padding = this.padding;
		return `position: absolute; background: ${this.color.toHTML()};` + this.getBounds() +
			`padding: ${this.scaleY(padding[0])}% ${this.scaleX(padding[1])}% ${this.scaleY(padding[2])}% ${this.scaleX(padding[3])}%;`
	}
	//#endregion

	/** 
	 * Override in order to change render behaviour.
	 * @param {String[]} sb - The String Builder to push back infos to. 
	 */
	render(sb = []) {
		validateType(sb, 'sb', Array);
		if (!this.#visible)
			return;
		this.drawOpen(sb);
		for (let child of this.children) {
			child.render(sb);
		}
		this.drawClose(sb);
		return sb;
	}


}