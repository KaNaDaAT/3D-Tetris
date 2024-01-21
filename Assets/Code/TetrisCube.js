import { GameObject } from '../DLib/Core/GameObject.js';
import { Keys } from '../DLib/Core/Keys.js';
import { Mono } from '../DLib/Core/Mono.js';
import { Physics } from '../DLib/Core/Physics.js';
import { Time } from '../DLib/Core/Time.js';
import { Transform } from '../DLib/Core/Transform.js';
import { World } from '../DLib/Core/World.js';
import { Game } from '../DLib/Game.js';
import * as glm from '../DLib/gl-matrix/index.js';
import { Grid } from '../DLib/Utils/Grid.js';
import { GameController } from './GameController.js';

export class TetrisCube extends Mono {

	/** @type {Grid} */
	grid;
	/** @type {Boolean} */
	stayInPosition = false;
	/** @type {Transform[]} */
	childTransforms = [];

	awake() {
		this.grid = GameObject.findObjectByType(Grid, true);
		this.childTransforms = [...this.transform.children];
		this.transform.position = this.grid.calculatePosition([parseInt(this.grid.width / 2), 11, parseInt(this.grid.depth / 2)]);
	}

	update() {
		if (this.stayInPosition)
			return;
		this.childTransforms = [...this.transform.children];
		if (this.childTransforms.length == 0)
			Game.kill(this);

		this.transform.position[1] -= Time.INSTANCE.delta * Physics.gravity;
		const sortedPositions = this.childTransforms.sort((a, b) => a.worldPosition[1] - b.worldPosition[1]);

		if (sortedPositions[0].worldPosition[1] <= this.grid.bottomWS) {
			const rotatedPosition = glm.vec3.transformQuat(glm.vec3.create(), sortedPositions[0].position, this.transform.rotation);
			this.transform.position[1] = Math.round((this.grid.bottomWS - rotatedPosition[1]) * 10) / 10;
			this.stayInPosition = true;
		}

		if (GameController.INSTANCE.fallingCube !== this)
			return;

		this.handleMovement();
		this.handleRotation();
	}

	lateUpdate() {
		if (this.stayInPosition || GameController.INSTANCE.isPause)
			return;
		this.childTransforms = [...this.transform.children];
		const sortedPositions = this.childTransforms.sort((a, b) => a.worldPosition[1] - b.worldPosition[1]);
		this.handleCollision(sortedPositions);
	}

	handleCollision(sortedPositions) {
		var collision = GameController.INSTANCE.getCollision(this);
		if (collision) {
			var oldCollision;
			do {
				oldCollision = collision;
				this.transform.moveWS(World.UP);
				collision = GameController.INSTANCE.getCollision(this);
			} while (collision);
			const rotatedPosition = glm.vec3.transformQuat(glm.vec3.create(), sortedPositions[0].position, this.transform.rotation);
			const offset = oldCollision[1] - rotatedPosition[1];
			this.transform.position[1] = Math.floor((offset + 1) * 10) / 10;
			this.stayInPosition = true;
			return;
		}
	}

	handleMovement() {
		const oldPos = [...this.transform.position];
		if (Keys.INSTANCE.keyDown('ArrowRight') || Keys.INSTANCE.keyDown('d')) { // move the object drawn one unit in the positive x direction
			this.transform.moveWS([1, 0, 0]);
		}
		if (Keys.INSTANCE.keyDown('ArrowLeft') || Keys.INSTANCE.keyDown('a')) { // move the object drawn one unit in the negative x direction
			this.transform.moveWS([-1, 0, 0]);
		}
		if (Keys.INSTANCE.keyDown('ArrowUp') || Keys.INSTANCE.keyDown('w')) { // move the object drawn one unit in the negative z direction
			this.transform.moveWS([0, 0, -1]);
		}
		if (Keys.INSTANCE.keyDown('ArrowDown') || Keys.INSTANCE.keyDown('s')) { // move the object drawn one unit in the positive z direction
			this.transform.moveWS([0, 0, 1]);
		}
		if (!this.inBoundsXZ() || GameController.INSTANCE.getCollision(this)) {
			this.transform.position = oldPos;
		}
	}

	handleRotation() {
		const oldRotation = [...this.transform.rotation];
		if (Keys.INSTANCE.keyDown('x')) { // rotate the object drawn 90 degrees counterclockwise around the x axis
			this.transform.rotateWS([90, 0, 0]);
		}
		if (Keys.INSTANCE.keyDown('X')) { // rotate the object drawn 90 degrees clockwise around the x axis
			this.transform.rotateWS([-90, 0, 0]);
		}
		if (Keys.INSTANCE.keyDown('y')) { // rotate the object drawn 90 degrees counterclockwise around the y axis
			this.transform.rotateWS([0, 90, 0]);
		}
		if (Keys.INSTANCE.keyDown('Y')) { // rotate the object drawn 90 degrees clockwise around the y axis
			this.transform.rotateWS([0, -90, 0]);
		}
		if (Keys.INSTANCE.keyDown('z')) { // rotate the object drawn 90 degrees counterclockwise around the z axis
			this.transform.rotateWS([0, 0, 90]);
		}
		if (Keys.INSTANCE.keyDown('Z')) { // rotate the object drawn 90 degrees clockwise around the z axis
			this.transform.rotateWS([0, 0, -90]);
		}

		if (!this.inBounds() || GameController.INSTANCE.getCollision(this)) {
			this.transform.rotation = oldRotation;
		}
	}

	handleRotation1() {
		const oldRotation = [...this.transform.rotation];
		if (Keys.INSTANCE.keyDown('x')) { // rotate the object drawn 90 degrees counterclockwise around the x axis
			this.transform.rotate([90, 0, 0]);
		}
		if (Keys.INSTANCE.keyDown('X')) { // rotate the object drawn 90 degrees clockwise around the x axis
			this.transform.rotate([-90, 0, 0]);
		}
		if (Keys.INSTANCE.keyDown('y')) { // rotate the object drawn 90 degrees counterclockwise around the y axis
			this.transform.rotate([0, 90, 0]);
		}
		if (Keys.INSTANCE.keyDown('Y')) { // rotate the object drawn 90 degrees clockwise around the y axis
			this.transform.rotate([0, -90, 0]);
		}
		if (Keys.INSTANCE.keyDown('z')) { // rotate the object drawn 90 degrees counterclockwise around the z axis
			this.transform.rotate([0, 0, 90]);
		}
		if (Keys.INSTANCE.keyDown('Z')) { // rotate the object drawn 90 degrees clockwise around the z axis
			this.transform.rotate([0, 0, -90]);
		}

		if (!this.inBounds() || GameController.INSTANCE.getCollision(this)) {
			this.transform.rotation = oldRotation;
		}
	}

	inBoundsXZ() {
		return !this.childTransforms.some(x => !this.grid.inBoundsX(x.worldPosition) || !this.grid.inBoundsZ(x.worldPosition));
	}

	inBounds() {
		return this.inBoundsXZ() && !this.childTransforms.some(x => x.worldPosition[1] + 0.0001 <= this.grid.bottomWS);
	}
}