import { Color } from '../DLib/Core/Color.js';
import { Display } from '../DLib/Core/Display.js';
import { GameObject } from '../DLib/Core/GameObject.js';
import { Quaternion } from '../DLib/Core/Quaternion.js';
import { Time } from '../DLib/Core/Time.js';
import { Game } from '../DLib/Game.js';
import { Path } from '../DLib/Path.js';
import { ShapeRenderer } from '../DLib/Render/ShapeRenderer.js';
import { PhongDiffuseShader } from '../DLib/Shader/PhongDiffuseShader.js';
import { UICustom } from '../DLib/UI/UICustom.js';
import { Alignment } from '../DLib/UI/UIElement.js';
import { UIManager } from '../DLib/UI/UIManager.js';
import { Grid } from '../DLib/Utils/Grid.js';
import { UID } from '../DLib/Utils/UID.js';
import { GameController } from './GameController.js';
import { MyCamera } from './MyCamera.js';
import { TetrisCube } from './TetrisCube.js';

var grid_width = 4;
var grid_height = 10;
var grid_depth = 4;
var url = new URL(window.location.href);
var url_width = url.searchParams.get("width");
var url_height = url.searchParams.get("height");
var url_depth = url.searchParams.get("depth");
if (url_width && !isNaN(url_width)) grid_width = parseInt(url_width);
if (url_height && !isNaN(url_height)) grid_height = parseInt(url_height);
if (url_depth && !isNaN(url_depth)) grid_depth = parseInt(url_depth);

const main = async () => {
	const game = await Game.setup();
	game.light.position = [5, Infinity, 5]


	// Grid
	const gridSize = [grid_width, grid_height, grid_depth]
	const grid = Grid.create3d(...gridSize, 1);

	// Custom Camera
	const myCam = new MyCamera(
		Quaternion.toRadian(50),
		Display.aspectRatio,
		0.01,
		100.0
	);
	myCam.transform.position = [(grid_width + grid_height) / 1.2, grid_height / 1.2, (grid_depth + grid_height) / 1.2];
	myCam.transform.rotation = [-25, 45, 0];
	game.camera = myCam;

	// Custom GameController
	const gameControllerGameObject = GameObject.create();
	const gameController = new GameController(gameControllerGameObject);
	gameControllerGameObject.tag = "gamecontroller";

	const cube_data = await Game.PARSER.parseFile(`${Path.modelPath}cube.obj`);
	const shapeRendererRed = new ShapeRenderer(cube_data, PhongDiffuseShader.INSTANCE, [[1, 0.4, 0.4]]);
	const shapeRendererGreen = new ShapeRenderer(cube_data, PhongDiffuseShader.INSTANCE, [[0, 0.8, 0]]);
	const shapeRendererBlue = new ShapeRenderer(cube_data, PhongDiffuseShader.INSTANCE, [[0, 1, 0]]);
	const shapeRendererYellow = new ShapeRenderer(cube_data, PhongDiffuseShader.INSTANCE, [[1, 1, 0]]);

	const cubeRed = GameObject.createPrefab(shapeRendererRed);
	const cubeGreen = GameObject.createPrefab(shapeRendererGreen);
	const cubeBlue = GameObject.createPrefab(shapeRendererBlue);
	const cubeYellow = GameObject.createPrefab(shapeRendererYellow);

	const tetraLine = GameObject.createPrefab(TetrisCube);
	tetraLine.position = [0, 10, 0]
	const tetraLine1 = GameObject.copyPrefab(cubeRed);
	const tetraLine2 = GameObject.copyPrefab(cubeRed);
	const tetraLine3 = GameObject.copyPrefab(cubeRed);
	const tetraLine4 = GameObject.copyPrefab(cubeRed);
	tetraLine1.transform.position = [0, 2, 0];
	tetraLine2.transform.position = [0, 1, 0];
	tetraLine3.transform.position = [0, 0, 0];
	tetraLine4.transform.position = [0, -1, 0];
	tetraLine1.transform.parent = tetraLine.transform;
	tetraLine2.transform.parent = tetraLine.transform;
	tetraLine3.transform.parent = tetraLine.transform;
	tetraLine4.transform.parent = tetraLine.transform;

	const tetraQuad = GameObject.createPrefab(TetrisCube);
	tetraQuad.position = [0, 10, 0]
	const tetraQuad1 = GameObject.copyPrefab(cubeYellow);
	const tetraQuad2 = GameObject.copyPrefab(cubeYellow);
	const tetraQuad3 = GameObject.copyPrefab(cubeYellow);
	const tetraQuad4 = GameObject.copyPrefab(cubeYellow);
	tetraQuad1.transform.position = [0, 0, 0];
	tetraQuad2.transform.position = [0, 1, 0];
	tetraQuad3.transform.position = [1, 0, 0];
	tetraQuad4.transform.position = [1, 1, 0];
	tetraQuad1.transform.parent = tetraQuad.transform;
	tetraQuad2.transform.parent = tetraQuad.transform;
	tetraQuad3.transform.parent = tetraQuad.transform;
	tetraQuad4.transform.parent = tetraQuad.transform;

	gameController.prefabs = [tetraLine, tetraQuad];

	const uimanager = new UIManager();
	uimanager.tag = "uimanager";
	Game.INSTANCE.register(uimanager);
	const text_fps = new UICustom([10, 10, 100, 50], 0, Alignment.TOP_RIGHT, Color.BLANK);
	const text_fps_id = UID.create();
	uimanager.createTextCallback(text_fps_id, () => {
		return Time.INSTANCE.smoothFps;
	});
	text_fps.html = `
<div class="container">
	<span class="text_fps" id='${text_fps_id}'></span>
</div>
`;
	uimanager.DISPLAY.addUI(text_fps);

	const gameOverText = new UICustom([0, 0, 300, 100], 0, Alignment.CENTER, Color.BLANK);
	gameOverText.visible = false;
	gameOverText.html = `
<button class="game-over-button" onclick="(function a(){ window.Game.findObjectByTag('gamecontroller').getComponentByName('GameController').reload(); })();">GameOver</button>
`;
	uimanager.DISPLAY.addUI(gameOverText);

	gameController.gameOverText = gameOverText;
	game.start();
	return game;
}

export const game = await main();
