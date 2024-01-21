import { GameObject } from './GameObject.js';

export class Light extends GameObject {

	color = [1, 1, 1]

	constructor(position = [0, 10, 0], color = [1, 1, 1]) {
		super(position, [0, 0, 0], [1.0, 1.0, 1.0])
		this.color = color;
	}

}