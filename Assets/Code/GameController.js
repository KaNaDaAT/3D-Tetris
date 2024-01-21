import { GameObject } from '../DLib/Core/GameObject.js';
import { Keys } from '../DLib/Core/Keys.js';
import { Mono } from '../DLib/Core/Mono.js';
import { Physics } from '../DLib/Core/Physics.js';
import { Game } from '../DLib/Game.js';
import { UICustom } from '../DLib/UI/UICustom.js';
import { UIManager } from '../DLib/UI/UIManager.js';
import { Grid } from '../DLib/Utils/Grid.js';
import { TetrisCube } from './TetrisCube.js';

let INSTANCE = null;

export class GameController extends Mono {
	/**
	* @returns {GameController} The INSTANCE of GameController.
	*/
	static get INSTANCE() {
		return INSTANCE;
	}

	/** @type {Grid} */
	grid = null;
	/** @type {UIManager} */
	uimanager = null;
	/** @type {UICustom} */
	gameOverText = null;
	/** @type {Boolean} */
	isPause = false;
	/** @type {GameObject[]} */
	prefabs = [];

	/** @type {TetrisCube} */
	fallingCube = null;

	/** @type {['x', 'y', 'z'][]} */
	stablePositions = [];
	/** @type {GameObject[]} */
	stableCubes = [];
	/** @type {GameObject[]} */
	animateCubes = [];

	/** @type {Number} */
	animateStage = -1;

	lost = false;

	reload() {
		if (!this.lost)
			return;
		this.lost = false;
		this.gameOverText.visible = false;
		this.uimanager.redraw();
		this.stablePositions = [];
		if (this.fallingCube != null)
			Game.kill(this.fallingCube.gameObject());
		this.fallingCube = null;
		for (var stable of this.stableCubes) {
			if (stable != null && stable.transform.parent)
				Game.kill(stable.transform.parent.gameObject);
		}
		this.stableCubes = [];
		this.animateCubes = [];
		this.animateStage = -1;
		this.isPause = false;
		setTimeout(() => {
			this.createNewTetrisCube();
		}, 500);
	}

	awake() {
		if (GameController.INSTANCE == null || GameController.INSTANCE === this) {
			Physics.gravity = 2;
			this.grid = GameObject.findObjectByType(Grid, true);
			this.uimanager = Game.findObjectByType(UIManager);
			INSTANCE = this;
			setTimeout(() => {
				this.createNewTetrisCube();
			}, 1000);
		} else {
			this.gameObject.detachMono(this);
			delete this;
		}
	}

	update() {
		if (this.lost)
			this.isPause = true;

		if (Keys.INSTANCE.keyDown('p')) {
			this.isPause = !this.isPause;
			if (this.isPause) {
				Physics.gravity = 0;
			} else {
				Physics.gravity = 2;
			}
		}
		if (this.isPause)
			return;

		if (this.handleAnimate())
			return;

		this.handleLose();

		if (Keys.INSTANCE.keyPressed(' ')) {
			Physics.gravity = 10;
		} else {
			Physics.gravity = 2;
		}
		if (this.fallingCube == null)
			return;


		if (this.fallingCube.stayInPosition) {
			this.stablePositions.push(...this.fallingCube.childTransforms.map(x => x.worldPosition));
			this.stableCubes.push(...this.fallingCube.childTransforms.map(x => x.gameObject));
			this.fallingCube = null;
			this.handlePlatform();
		}
	}

	createNewTetrisCube() {
		if (this.lost)
			return;
		const prefab = this.randomItem(this.prefabs);
		this.fallingCube = GameObject.createFromPrefab(prefab).getComponent(TetrisCube);
	}

	randomItem(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	handleLose() {
		if (this.stablePositions.some(x => x[1] >= this.grid.topWS + 1)) {
			this.lost = true;
			this.gameOverText.visible = true;
			this.uimanager.redraw();
		}
	}

	handleAnimate() {
		if (this.animateStage == 0) {
			for (var animated of this.animateCubes) {
				animated.getComponent(TetrisCube).stayInPosition = false
			}
			this.animateStage = 1;
			return true;
		} else if (this.animateStage == 1) {
			for (var animated of this.animateCubes) {
				if (!animated.getComponent(TetrisCube).stayInPosition) {
					return true;
				}
			}
			this.stablePositions = this.stableCubes.map(x => [...x.transform.worldPosition]);
			this.animateStage = -1;
			return this.handlePlatform();
		} else {
			return false;
		}
	}


	handlePlatform() {
		var minPos = null;
		const destroy = [];
		for (var i = 0; i < this.grid.height; i++) {
			const pos = this.grid.bottomWS + i;
			const cubes = this.stableCubes.filter(x => Math.round((x.transform.worldPosition[1] - pos) * 100) / 100 == 0);
			if (cubes.length == (this.grid.width * this.grid.depth)) {
				if (minPos == null)
					minPos = pos;
				destroy.push(...cubes);
			}
		}
		if (destroy.length == 0) {
			// If nothing got destroyed we can finally restart.
			setTimeout(() => {
				this.createNewTetrisCube();
			}, 500);
			return false;
		}
		for (var dest of destroy) {
			Game.kill(dest);
		}
		const newStableCubes = [];
		const newStablePositions = [];
		const stableCubesAboveMin = [];
		for (let i = 0; i < this.stableCubes.length; i++) {
			if (!destroy.some(x => x === this.stableCubes[i])) {
				newStableCubes.push(this.stableCubes[i]);
				newStablePositions.push(this.stablePositions[i]);
				if (this.stablePositions[i][1] >= minPos) {
					stableCubesAboveMin.push(this.stableCubes[i]);
				}
			}
		}
		// Logic for Animating and recursive fall
		this.stableCubes = newStableCubes;
		this.stablePositions = newStablePositions;
		const animate = [];
		for (var stableCube of stableCubesAboveMin) {
			if (animate.find(x => x === stableCube.transform.parent.gameObject) == null) {
				animate.push(stableCube.transform.parent.gameObject);
			}
		}

		this.animateCubes = animate;
		this.animateStage = 0;
		return true;
	}

	/**
	 * Checks if the tetra is coliding with any other.
	 * @param {TetrisCube} tetra 
	 * @returns {['x', 'y', 'z']} The worldPosition of the collision or null if non.
	 */
	getCollision(tetra) {
		const childrenPositions = tetra.childTransforms.map(x => x.worldPosition);
		for (var childPosition of childrenPositions) {
			for (var i = 0; i < this.stablePositions.length; i++) {
				if (this.stableCubes[i].transform.parent === tetra.transform)
					continue;
				if (this.isOverlapping(childPosition, this.stablePositions[i])) {
					return this.stablePositions[i];
				}
			}
		}
		return null;
	}

	isOverlapping(position1, position2, size = 1) {
		const distance = Math.sqrt(
			(position1[0] - position2[0]) ** 2 +
			(position1[1] - position2[1]) ** 2 +
			(position1[2] - position2[2]) ** 2
		);
		return Math.round(distance * 100) / 100 < size
	}

}