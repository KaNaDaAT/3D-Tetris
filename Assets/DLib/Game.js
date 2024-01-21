import { Camera } from './Core/Camera.js';
import { Display } from './Core/Display.js';
import { GameObject } from './Core/GameObject.js';
import { Light } from './Core/Light.js';
import { Quaternion } from './Core/Quaternion.js';
import { Time } from './Core/Time.js';
import { World } from './Core/World.js';
import { DLibConfig } from './DLibConfig.js';
import * as glm from './gl-matrix/index.js';
import { DefaultShader } from './Shader/DefaultShader.js';
import { GouraudDiffuseShader } from './Shader/GouraudDiffuseShader.js';
import { GouraudSpecularShader } from './Shader/GouraudSpecularShader.js';
import { PhongDiffuseShader } from './Shader/PhongDiffuseShader.js';
import { PhongSpecularShader } from './Shader/PhongSpecularShader.js';
import { Shader } from './Shader/Shader.js';
import { tryLoadDefaultShaders } from './Shader/ShaderUtils.js';
import {
	validateNumber,
	validateType,
} from './Utils/TypeCheck.js';
import { WavefrontOBJParser } from './Wavefront/WavefrontOBJParser.js';

export class Game {

	//#region Singleton
	/**
	* @returns {Game} The INSTANCE of the Game.
	*/
	static #INSTANCE = null;
	/**
	* @returns {Game} The INSTANCE of the Game.
	*/
	static get INSTANCE() {
		return Game.#INSTANCE;
	}

	constructor() {
		if (Game.#INSTANCE != null) {
			throw new Error("Game already instantiated!")
		} else {
			Game.#INSTANCE = this;
		}
	}
	//#endregion

	//#region Properties

	#running = false;
	#started = false;

	/** @type {GameObject[]} */
	#gameObjects = {};
	/** @type {{time: Number, gameObject: GameObject}[]} */
	#gameObjectsToKill = [];
	/** @type {Shader[]} */
	#shaders = [];


	/** @type {WebGL2RenderingContext} */ #graphics = null;
	/** 
	 * The graphics used for all rendering.
	 * @type {WebGL2RenderingContext}
	 */
	get graphics() { return this.#graphics; }
	/** 
	 * The graphics used for all rendering.
	 * @type {WebGL2RenderingContext}
	 */
	static get graphics() { return Game.INSTANCE.graphics; }

	/** @type {WavefrontOBJParser} */
	static #parser = new WavefrontOBJParser();
	/** 
	 * The default Wavefront obj file parser
	 * @type {WavefrontOBJParser} 
	 */
	static get PARSER() { return Game.#parser; }

	/** @type {Camera} */
	#camera = null;
	/** 
	 * The Camera that is assigned to this Game. Currently only supporting one cam at a time. 
	 * @type {Camera} 
	 */
	get camera() { return this.#camera; }
	set camera(x) { this.#camera = validateType(x, 'camera', Camera); }

	/** @type {Light} */
	#light = null;
	/** 
	 * The Ligth that is assigned to this Game. Currently only supporting one light at a time. 
	 * @type {Camera} 
	 */
	get light() { return this.#light; }
	set light(x) { this.#light = validateType(x, 'light', Light); }

	//#endregion

	//#region Init

	/**
	 * Setups the Game with its default behaviour:<br>
	 * - Resizes canvas
	 * - Instantiates the path.
	 * - Loads the default shaders. Does however not add them to the game loop.
	 * - Instantiates a default light.
	 * - Instantiates a default camera.
	 * - Instantiates the World and setups its rendering.
	 * 
	 * @param {String} [canvasId='canvas'] - The id of the canvas to draw on.
	 * @param {Game} [gameType=Game] - The type of {@link Game} to create. Must be an instance of {@link Game}.
	 * @returns {Promise<Game>} - The instance of {@link Game}. Use `.start()` on it or use `Game.INSTANCE.start()`
	 */
	static async setup(canvasId = 'canvas', gameType = Game) {
		const game = new gameType();
		validateType(game, 'gameType', Game);
		try {
			Display.loadCanvas(canvasId);
			game.#graphics = Display.canvas.getContext("webgl2");
			if (game.#graphics == null)
				throw new Error("WebGL is not available in this browser");

			Display.update();

			if (!await tryLoadDefaultShaders())
				throw new Error("Was not able to load all default shaders!");

			game.addDefaultShaders();

			game.createDefaultLight();

			game.createDefaultCamera();

			World.setupRendering();
			return game;
		} catch (error) {
			Game.#INSTANCE = null;
			throw error;
		}
	}

	/**
	 * Adds a default {@link Camera} to the Game
	 */
	createDefaultCamera() {
		this.camera = new Camera(
			Quaternion.toRadian(45), // FOV
			Display.aspectRatio, // Aspect ratio
			0.1,
			100.0
		);
	}

	/**
	 * Adds a default {@link Light} to the Game
	 */
	createDefaultLight() {
		this.#light = new Light();
	}

	/**
	 * Adds the default Shaders to the Game if possible.
	 * @returns {Boolean} When true it worked as expected and otherwise false.
	 */
	addDefaultShaders() {
		if (DefaultShader.INSTANCE)
			this.#shaders.push(DefaultShader.INSTANCE);
		if (GouraudDiffuseShader.INSTANCE)
			this.#shaders.push(GouraudDiffuseShader.INSTANCE);
		if (GouraudSpecularShader.INSTANCE)
			this.#shaders.push(GouraudSpecularShader.INSTANCE);
		if (PhongDiffuseShader.INSTANCE)
			this.#shaders.push(PhongDiffuseShader.INSTANCE);
		if (PhongSpecularShader.INSTANCE)
			this.#shaders.push(PhongSpecularShader.INSTANCE);
	}

	//#endregion

	//#region Game States

	/**
	 * Starts the Game. From now on drawing and GameObject as well as Shader updating will be happening.
	 */
	start() {
		if (this.#started)
			throw new Error("Game has already started.");
		this.#started = true;
		new Time();
		window.requestAnimationFrame(this.#loop);
		this.#running = true;
	}

	/**
	 * Resumes the Game.
	 */
	resume() {
		this.#running = true;
	}

	/**
	 * Pauses the Game. Drawing will still happen.
	 */
	pause() {
		this.#running = false;
	}

	/**
	 * Ends the Game. It should not be used anymore.
	 */
	stop() {
		this.#running = false;
		this.#started = false;
		INSTANCE = null;
	}

	//#endregion

	//#region GameLoop

	// the main game loop where gameobjects awaken, update, lateupdate and the drawing happens.
	#loop = () => {
		const loopStartTime = performance.now();
		Time.INSTANCE.loop();
		if (Game.INSTANCE === null || !this.#started)
			return;
		this.#cleanFrame();

		const newGameObjectsToKill = []
		for (let i = 0; i < this.#gameObjectsToKill.length; i++) {
			this.#gameObjectsToKill[i].time -= Time.INSTANCE.delta;
			if (this.#gameObjectsToKill[i].time <= 0) {
				const gameObject = this.#gameObjects[this.#gameObjectsToKill[i].uid];
				if (gameObject == null)
					continue;
				gameObject.kill();
				delete this.#gameObjects[this.#gameObjectsToKill[i].uid];
			} else {
				newGameObjectsToKill.push(this.#gameObjectsToKill[i]);
			}
		}
		this.#gameObjectsToKill = newGameObjectsToKill;

		if (this.camera != null) {
			this.camera.update();
		}
		if (this.#light != null) {
			this.#light.update();
		}
		this.#updateCameraAndLight();
		if (this.#running) {
			const gameObjects = Object.values(this.#gameObjects);
			gameObjects.forEach(gameObject => gameObject.update());
			// ToDo: DLib extension for animation ...
			gameObjects.forEach(gameObject => gameObject.lateUpdate());

			Display.update();
			World.render();
			if (this.camera != null) {
				this.camera.render();
			}
			if (this.#light !== null) {
				this.#light.render();
			}
			gameObjects.forEach(gameObject => gameObject.render());
		}
		const expectedLoopDuration = 1000 / DLibConfig.frameRate;
		const loop = this.#loop;
		const loopDuration = (performance.now() - loopStartTime) + 10 * expectedLoopDuration / DLibConfig.frameRate;
		if (expectedLoopDuration > loopDuration) {
			setTimeout(function () {
				window.requestAnimationFrame(loop); // ToDo: Try flip. What if i wait after requesting the frame lol.
			}, expectedLoopDuration - loopDuration);
		} else {
			window.requestAnimationFrame(loop);
		}
	}

	#cleanFrame() {
		const gl = Game.graphics;
		gl.clearColor(0.1, 0.1, 0.1, 1.0);

		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST); // Enable depth
		gl.depthFunc(gl.LEQUAL); // Configure the depth obscure

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear color|depth buffer
	}

	#updateCameraAndLight() {
		if (this.camera !== null) {
			this.#shaders.forEach(shader => shader.uniformView(this.camera.view_matrix));
			this.#shaders.forEach(shader => shader.uniformProjection(this.camera.projection_matrix));
			if (this.#light !== null) {
				const transformedLightPosition = glm.vec3.create();
				glm.vec3.transformMat4(transformedLightPosition, this.#light.transform.position, this.camera.view_matrix)
				this.#shaders.forEach(shader => shader.uniformLightPosition(transformedLightPosition));
				this.#shaders.forEach(shader => shader.uniformLightColor(this.#light.color));
				// this.#shaders.forEach(shader => shader.uniformLightView(this.#light.view_matrix));
			}
		}
	}
	//#endregion

	//#region Methods



	/**
	 * Creates a shader for the Game and directly pushes it in the render logic.
	 * 
	 * @param {String} path - The path to load the shader from. If it ends with '/' it will load it from that location based on the name of this shader.
	 * @param {String} name - The name of the shader. Will be derived from the path if not specified.
	 * @returns {Promise<Shader>} The shader that was created or null if it failed.
	 */
	async createShader(path, name = null) {
		if (name === null)
			name = path.split('/').pop();
		const shader = new Shader(name);
		if (!await shader.load(path))
			return null;
		this.#shaders.push(shader);
		return shader;
	}

	/**
	 * Creates a shader for the Game and directly pushes it in the render logic.
	 * @param {String} path - The path to load the shader from. If it ends with '/' it will load it from that location based on the name of this shader.
	 * @param {String} name - The name of the shader. Will be derived from the path if not specified.
	 * @returns {Promise<Shader>} The shader that was created or null if it failed.
	 */
	async createComplexShader(path, name = null) {
		if (name === null)
			name = path.split('/').pop();
		const shader = new ComplexShader(name);
		if (!await shader.load(path))
			return null;
		this.#shaders.push(shader);
		return shader;
	}

	/**
	 * Adds an shader for the Game and directly pushes it in the render logic.
	 * @param {Shader} shader - The shader to add.
	 * @returns {Boolean} Indicating if the add worked or not.
	 */
	async addShader(shader) {
		if (!(shader instanceof Shader))
			throw new TypeError("The 'shader' has to be of type 'Shader'.")
		let loaded = true;
		if (!shader.isLoaded)
			loaded = await shader.load(path);
		if (!loaded)
			return false;
		this.#shaders.push(shader);
		return true;
	}

	/**
	 * Removes an shader for the Game and directly pushes it in the render logic.
	 * @param {Shader} shader - The shader that shall be removed.
	 * @returns {Promise<Shader>} The shader that was removed or null if it wasnt.
	 */
	async removeShader(shader) {
		const index = this.#shaders.indexOf(shader);
		if (index !== -1) {
			this.#shaders.splice(index, 1);
			return shader;
		}
		return null;
	}


	/**
	 * Registers a {@link GameObject} to the {@link Game}. In the next frame it will be awakend and in the frame after this it will run in the normal update cycle.
	 * @param {GameObject} gameObject - The {@link GameObject} that will be registered.
	 */
	register(gameObject) {
		if (this.isRegistered(gameObject)) {
			console.warn(`The GameObject with uid '${gameObject.uid}' is already registered to this game.`)
		}
		this.#gameObjects[gameObject.uid] = gameObject;
	}

	/**
	 * Checks if a {@link GameObject} is registered to the {@link Game}.
	 * @param {GameObject} gameObject - The {@link GameObject} that is looked up.
	 */
	isRegistered(gameObject) {
		validateType(gameObject, 'gameObject', GameObject);
		return this.#gameObjects[gameObject.uid] !== undefined;
	}

	/**
	 * Sends a signal to destroy the {@link GameObject}.
	 * @param {GameObject} gameObject - The {@link GameObject} that shall be destroyed.
	 * @param {Number} time - The time in sec the {@link GameObject} will be destroyed in.
	 */
	static kill(gameObject, time = 0) {
		validateType(gameObject, 'gameObject', GameObject);
		validateNumber(time, 'time');
		if (!gameObject.dead) {
			gameObject.kill(time);
			return;
		}
		Game.INSTANCE.#gameObjectsToKill.push({ time: time, gameObject: gameObject });
	}

	/**
	 * Get a registered {@link GameObject} by the its uid.
	 * @param {String} uid - The uid of the {@link GameObject} to get.
	 * @returns {GameObject} The {@link GameObject} or null.
	 */
	static findObjectByUid(uid) {
		const gameObject = Game.INSTANCE.#gameObjects[uid];
		if (gameObject != null)
			return gameObject;
		return null;
	}

	/**
	 * Get a registered {@link GameObject} by the specified tag.
	 * @param {String} tag - The tag of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject} The first {@link GameObject} that was found or null.
	 */
	static findObjectByTag(tag, inactive = false) {
		const list = Object.values(Game.INSTANCE.#gameObjects);
		for (let i = 0; i < list.length; i++) {
			if ((inactive || list[i].active) && list[i].tag == tag)
				return list[i];
		}
		return null;
	}

	/**
	 * Get a list of registered {@link GameObject}s by the specified tag.
	 * @param {String} tag - The tag of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject[]} The list of {@link GameObject}s that where found.
	 */
	static findObjectsByTag(tag, inactive = false) {
		const gameobjects = [];
		const list = Object.values(Game.INSTANCE.#gameObjects);
		for (let i = 0; i < list.length; i++) {
			if ((inactive || list[i].active) && list[i].tag == tag)
				gameobjects.push(list[i]);
		}
		return gameobjects;
	}

	/**
	 * Get a registered {@link GameObject} by the specified tag.
	 * @param {Type} type - The type of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject} The first {@link GameObject} that was found or null.
	 */
	static findObjectByType(type, inactive = false) {
		const list = Object.values(Game.INSTANCE.#gameObjects);
		for (let i = 0; i < list.length; i++) {
			if ((inactive || list[i].active) && list[i] instanceof type)
				return list[i];
		}
		return null;
	}

	/**
	 * Get a list of registered {@link GameObject}s by the specified type.
	 * @param {Type} type - The type of the {@link GameObject} to get.
	 * @param {Boolean} [inactive=false] - Whether to include disabled {@link GameObject}s.
	 * @returns {GameObject[]} The list of {@link GameObject}s that where found.
	 */
	static findObjectsByType(type, inactive = false) {
		const gameobjects = [];
		const list = Object.values(Game.INSTANCE.#gameObjects);
		for (let i = 0; i < list.length; i++) {
			if ((inactive || list[i].active) && list[i] instanceof type)
				gameobjects.push(list[i]);
		}
		return gameobjects;
	}

	//#endregion

	//#region Helpers


	//#endregion
}
