import { Color } from '../Core/Color.js';
import { validateType } from '../Utils/TypeCheck.js';
import {
	Alignment,
	UIElement,
} from './UIElement.js';

export class UICustom extends UIElement {

	/** @type {Boolean} */
	#defaultDiv = true;
	/**
	 * Wheter it still render the default div box.
	 * @type {Boolean}
	 */
	get defaultDiv() { return this.#defaultDiv; }
	set defaultDiv(x) { this.#defaultDiv = validateType(x, 'defaultDiv', Boolean); }

	/** @type {String} */
	#html = true;
	/**
	 * The html that shall be rendered
	 * @type {String}
	 */
	get html() { return this.#html; }
	set html(x) { this.#html = validateType(x, 'html', String); }

	constructor(bounds = [0, 0, 100, 50], padding = [0, 0, 0, 0], alignment = Alignment.CENTER, color = Color.BLANK, parent = null) {
		super(bounds, padding, alignment, color, parent);
	}

	/** 
	 * Override in order to change render behaviour.
	 * @param {String[]} sb - The String Builder to push back infos to. 
	 */
	render(sb = []) {
		validateType(sb, 'sb', Array);
		if (this.defaultDiv)
			this.drawOpen(sb);

		if (!this.visible)
			return;
		sb.push(this.#html)

		if (this.defaultDiv)
			this.drawClose(sb);
		return sb;
	}




}