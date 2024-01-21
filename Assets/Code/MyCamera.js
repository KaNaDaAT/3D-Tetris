import { Camera } from '../DLib/Core/Camera.js';
import { Display } from '../DLib/Core/Display.js';
import { Keys } from '../DLib/Core/Keys.js';
import { Quaternion } from '../DLib/Core/Quaternion.js';
import { Time } from '../DLib/Core/Time.js';

export class MyCamera extends Camera {

	#mouseDownPos = null;
	constructor(fov, aspect_ratio, near, far) {
		super(fov, aspect_ratio, near, far)
		this.registerEvents();
	}

	registerEvents() {
		Display.wrapper.addEventListener('mousedown', this.#mouseDown.bind(this));
		Display.wrapper.addEventListener('mouseup', this.#mouseUp.bind(this));
		Display.wrapper.addEventListener('mousemove', this.#mouseMove.bind(this));
		Display.wrapper.addEventListener('mouseout', this.#mouseOut.bind(this));
	}

	positionStep = 1.112912114;
	zoomFactor = 0.5;
	rotationStep = 20.0;
	update() {
		super.update();
		this.#handleRotationInput(this.rotationStep * Time.INSTANCE.delta);
		// this.#handlePositionInput(this.positionStep * Time.INSTANCE.delta);
		this.#handleZoomInput(Math.pow(1 + this.zoomFactor, Time.INSTANCE.delta));
		this.#handlePerspectiveToggle();
		this.#handleReset();
	}

	#handleRotationInput(degrees) {
		if (Keys.INSTANCE.keyPressed('i')) {	// rotate clockwise around x-axis 
			this.transform.rotate([+degrees, 0, 0], [0, 0, 0]);
		}
		if (Keys.INSTANCE.keyPressed('k')) {	// rotate counterclockwise around x-axis 
			this.transform.rotate([-degrees, 0, 0], [0, 0, 0]);
		}
		if (Keys.INSTANCE.keyPressed('l')) {	// rotate clockwise around y-axis 
			this.transform.rotate([0, +degrees, 0], [0, 0, 0]);
		}
		if (Keys.INSTANCE.keyPressed('j')) {	// rotate counterclockwise around y-axis 
			this.transform.rotate([0, -degrees, 0], [0, 0, 0]);
		}
		if (Keys.INSTANCE.keyPressed('o')) {	// rotate clockwise around z-axis 
			this.transform.rotate([0, 0, +degrees], [0, 0, 0]);
		}
		if (Keys.INSTANCE.keyPressed('u')) {	// rotate counterclockwise around z-axis 
			this.transform.rotate([0, 0, -degrees], [0, 0, 0]);
		}
	}

	#handlePositionInput(step) {
		if (Keys.INSTANCE.keyPressed('ArrowLeft')) {	// move left 
			this.transform.moveWS(this.transform.left(step));
		}
		if (Keys.INSTANCE.keyPressed('ArrowRight')) { 	// move right
			this.transform.moveWS(this.transform.right(step));
		}
		if (Keys.INSTANCE.keyPressed('ArrowUp')) {		// move up
			this.transform.moveWS(this.transform.up(step));
		}
		if (Keys.INSTANCE.keyPressed('ArrowDown')) {	// move down
			this.transform.moveWS(this.transform.down(step));
		}
	}

	#handleZoomInput(step) {
		if (Keys.INSTANCE.keyPressed('+')) {			// move zoom in
			this.fov /= step;
		}
		if (Keys.INSTANCE.keyPressed('-')) {			// move zoom out
			this.fov *= step;
		}
	}

	#handlePerspectiveToggle() {
		if (Keys.INSTANCE.keyDown('v')) {
			this.viewingMode = (this.viewingMode + 1) % 2
		}
	}

	#handleReset() {
		if (Keys.INSTANCE.keyPressed('R')) {
			this.viewingMode = Camera.VIEWING_MODE_PERSPECTIVE;
			this.fov =  Quaternion.toRadian(45),
			this.transform.position = [15, 10, 15];
			this.transform.rotation = [-25, 45, 0];
		}
	}

	#senitivity = 60;
	#mouseDown(event) {
		this.#mouseDownPos = [event.x, event.y];
	}

	#mouseUp(event) {
		this.#mouseMove(event);
		this.#mouseDownPos = null;
	}

	#mouseMove(event) {
		if (this.#mouseDownPos) {
			const deltaX = this.#mouseDownPos[0] - event.x;
			const normalizedDeltaX = deltaX / canvas.width;
			const scaledDeltaX = normalizedDeltaX * this.#senitivity * -1;

			this.transform.rotate([0, scaledDeltaX, 0], [0, 0, 0]);
			this.#mouseDownPos = [event.x, event.y];
		}
	}

	#mouseOut(event) {
		this.#mouseUp(event)
	}
}
