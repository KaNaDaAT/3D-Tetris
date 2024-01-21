import * as glm from '../gl-matrix/index.js';

export class WavefrontOBJ {
	vertices;
	normals;
	textures;
	indices;
	bounds;
	boundsMatrix;
	constructor(vertices, normals, textures, indices, bounds) {
		if (!Boolean(normals))
			normals = []
		if (!Boolean(textures))
			textures = []
		this.vertices = vertices;
		this.normals = normals;
		this.textures = textures;
		this.indices = indices.flat();
		this.bounds = bounds;

		const bounds_offset = [
			-(bounds.max[0] + bounds.min[0]) / 2,
			-(bounds.max[1] + bounds.min[1]) / 2,
			-(bounds.max[2] + bounds.min[2]) / 2,
		];
		const minXYZ = Math.max(bounds.max[0] - bounds.min[0], bounds.max[1] - bounds.min[1], bounds.max[2] - bounds.min[2]);
		const bounds_scale = [
			1 / minXYZ,
			1 / minXYZ,
			1 / minXYZ,
		];
		const bounds_matrix = glm.mat4.create();
		glm.mat4.fromScaling(bounds_matrix, bounds_scale); // scale the matrix based on the bounds
		glm.mat4.translate(bounds_matrix, bounds_matrix, bounds_offset); // translate the matrix based on the bounds
		this.boundsMatrix = bounds_matrix
	}
}
