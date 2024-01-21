import * as glm from '../gl-matrix/index.js';
import { GameObject } from './GameObject.js';

export class Camera extends GameObject {

	static MAIN = null;

	static get VIEWING_MODE_ORTHOGRAPHIC() { return 0; }
	static get VIEWING_MODE_PERSPECTIVE() { return 1; }

	/**
	 * Can be set to one of the available Viewingmodes so that the camera uses another.
	 * @type {Number}
	 */
	viewingMode = Camera.VIEWING_MODE_PERSPECTIVE;

	#view_matrix = glm.mat4.create();
	#projection_matrix = glm.mat4.create();

	constructor(fov, aspect_ratio, near, far) {
		super([0, 0, 0], [0, 0, 0], [1.0, 1.0, 1.0])
		if (Camera.MAIN == null)
			Camera.MAIN = this;
		this.fov = fov;
		this.aspect_ratio = aspect_ratio;
		this.near = near;
		this.far = far;
	}

	update() {
		const viewMatrix = glm.mat4.create();
		const target = glm.vec3.add(glm.vec3.create(), this.transform.position, this.transform.forward())
		glm.mat4.lookAt(viewMatrix, this.transform.position, target, this.transform.up());
		glm.mat4.scale(viewMatrix, viewMatrix, this.transform.scale);

		this.#view_matrix = viewMatrix;

		switch (this.viewingMode) {
			case Camera.VIEWING_MODE_ORTHOGRAPHIC:
				const mult = 25;
				const right = this.aspect_ratio * Math.tan(this.fov * 0.5) * mult;
				const top = right / this.aspect_ratio;
				glm.mat4.ortho(this.#projection_matrix, -right, right, -top, top, this.near, this.far)
				break;
			case Camera.VIEWING_MODE_PERSPECTIVE:
			default:
				glm.mat4.perspective(this.#projection_matrix, this.fov, this.aspect_ratio, this.near, this.far);
		}
	}

	/**
	 * Get the view matrix.
	 * @returns {glm.mat4} A copy of the view matrix.
	 */
	get view_matrix() {
		const view_matrix = glm.mat4.create();
		glm.mat4.copy(view_matrix, this.#view_matrix);
		return view_matrix;
	}

	/**
	 * Get the projection matrix.
	 * @returns {mat4} A copy of the projection matrix.
	 */
	get projection_matrix() {
		const projection_matrix = glm.mat4.create();
		glm.mat4.copy(projection_matrix, this.#projection_matrix);
		return projection_matrix;
	}
}
