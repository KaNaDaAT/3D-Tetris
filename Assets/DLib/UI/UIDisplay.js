import {
	validateType,
} from '../Utils/TypeCheck.js';
import { UIContainer } from "./UIContainer.js";

export class UIDisplay extends UIContainer {

	constructor() { 
		super(null);
	}


	/** 
	 * Override in order to change render behaviour.
	 * @param {String[]} sb - The String Builder to push back infos to. 
	 */
	render(sb = []) {
		validateType(sb, 'sb', Array);
		for (let child of this.children) {
			child.render(sb);
		}
		return sb;
	}


}