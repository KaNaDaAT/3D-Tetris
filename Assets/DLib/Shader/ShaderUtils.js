import { DefaultShader } from './DefaultShader.js';
import { GouraudDiffuseShader } from './GouraudDiffuseShader.js';
import { GouraudSpecularShader } from './GouraudSpecularShader.js';
import { PhongDiffuseShader } from './PhongDiffuseShader.js';
import { PhongSpecularShader } from './PhongSpecularShader.js';

/**
 * Returns a list with all default shaders that where loaded correctly.
 * 
 * @returns {Promise<Array<Shader>>} List of the loaded shaders.
 */
export async function getDefaultShaders() {
	const shaders = [];
	if (DefaultShader.INSTANCE)
		shaders.push(DefaultShader.INSTANCE);
	if (GouraudDiffuseShader.INSTANCE)
		shaders.push(GouraudDiffuseShader.INSTANCE);
	if (GouraudSpecularShader.INSTANCE)
		shaders.push(GouraudSpecularShader.INSTANCE);
	if (PhongDiffuseShader.INSTANCE)
		shaders.push(PhongDiffuseShader.INSTANCE);
	if (PhongSpecularShader.INSTANCE)
		shaders.push(PhongSpecularShader.INSTANCE);
	return shaders;
}

/** Tries to load all default shaders.
 * 
 * @returns true when loaded successfuly and false otherwise
 */
export async function tryLoadDefaultShaders() {
	let loaded = true;
	if (DefaultShader.INSTANCE === null)
		loaded = loaded && await new DefaultShader().load();
	if (GouraudDiffuseShader.INSTANCE === null)
		loaded = loaded && await new GouraudDiffuseShader().load();
	if (GouraudSpecularShader.INSTANCE === null)
		loaded = loaded && await new GouraudSpecularShader().load();
	if (PhongDiffuseShader.INSTANCE === null)
		loaded = loaded && await new PhongDiffuseShader().load();
	if (PhongSpecularShader.INSTANCE === null)
		loaded = loaded && await new PhongSpecularShader().load();
	return loaded;
}