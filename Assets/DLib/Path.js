

export class Path {

	/** @type {Path} */
	static #INSTANCE;

	/** @type {String} */
	#path = '';
	/** The `root` of VisotyJS 
	 * @type {String} */
	static get path() { return Path.#INSTANCE.#path; }

	constructor() {
		if (Path.#INSTANCE != null) {
			throw new Error("Path already instantiated!")
		} else {
			Path.#INSTANCE = this;
			this.#path = new URL(import.meta.url).pathname.split('/').slice(0, -1).join('/');
		}
	}

	/** The path to VisotyJS core module
	 *  @type {String} */
	static get corePath() { return Path.#INSTANCE.#path + '/Core/'; }
	/** The path to VisotyJS render module
	 *  @type {String} */
	static get renderPath() { return Path.#INSTANCE.#path + '/Render/'; }
	/** The path to VisotyJS ui module
	 *  @type {String} */
	static get uiPath() { return Path.#INSTANCE.#path + '/UI/'; }
	/** The path to VisotyJS shader module
	 *  @type {String} */
	static get shaderPath() { return Path.#INSTANCE.#path + '/Shader/'; }
	/** The path to VisotyJS default shader files
	 *  @type {String} */
	static get shaderDefaultsPath() { return Path.#INSTANCE.#path + '/Shader/defaults/'; }
	/** The path to VisotyJS default model files
	 *  @type {String} */
	static get modelPath() { return Path.#INSTANCE.#path + '/Models/'; }

}

new Path();