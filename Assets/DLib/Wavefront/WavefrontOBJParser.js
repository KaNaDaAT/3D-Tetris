import { WavefrontOBJ } from './WavefrontOBJ.js';

/**
 * An parser for Wavefront obj files.
 */
export class WavefrontOBJParser {

	constructor() { }

	/** Parses the data of an obj file into a WavefrontOBJ 
	 * 
	 * @param {String} data - The data that shall be parsed
	 * @returns {WavefrontOBJ} The object wrapping all the information.
	 */
	parse(data) {
		const knownFaces = {}
		const readVertices = [];
		const vertices = [];
		const readNormals = [];
		const normals = [];
		const readTextures = [];
		const textures = [];
		const indices = [];
		let index = 0;
		const bounds = {
			min: [Infinity, Infinity, Infinity],
			max: [-Infinity, -Infinity, -Infinity]
		};
		const lines = data.split('\n');
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line.startsWith('#'))
				continue;
			const parts = line.split(/\s+/);
			switch (parts[0]) {
				case 'v':
					this.#parseVertex(parts, readVertices, bounds);
					break;
				case 'vp':
					// Ignore for now
					break;
				case 'vn':
					this.#parseVertexNormal(parts, readNormals);
					break;
				case 'vt':
					this.#parseTextureVertex(parts, textures);
					break;
				case 'f':
					index = this.#parseFace(parts, index, indices, readVertices, vertices, readTextures, textures, readNormals, normals, knownFaces);
					break;
				default:
					// Ignore other lines
					break;
			}
		}
		return new WavefrontOBJ(vertices, normals, textures, indices, bounds);
	}



	/** Parses an *.obj file based on its path.
	 * 
	 * @param {String} file_path - the path of the .
	 * @returns 
	 */
	async parseFile(file_path) {
		return await fetch(file_path)
			.then(response => response.text())
			.then(data_raw => this.parse(data_raw))
			.catch(error => {
				console.error(`An error occurred loading the obj file '${file_path}':`, error);
				return null;
			});
	}

	#parseVertex(parts, vertices, bounds) {
		const [x, y, z] = parts.slice(1, 4).map(parseFloat);
		vertices.push([x, y, z]);
		bounds.min[0] = Math.min(bounds.min[0], x);
		bounds.min[1] = Math.min(bounds.min[1], y);
		bounds.min[2] = Math.min(bounds.min[2], z);
		bounds.max[0] = Math.max(bounds.max[0], x);
		bounds.max[1] = Math.max(bounds.max[1], y);
		bounds.max[2] = Math.max(bounds.max[2], z);
	}

	#parseVertexNormal(parts, normals) {
		normals.push(parts.slice(1, 4).map(parseFloat));
	}

	#parseTextureVertex(parts, textures) {
		textures.push(parts.slice(1, 3).map(parseFloat));
	}

	#parseFace(parts, index, indices, readVertices, vertices, readTextures, textures, readNormals, normals, knownFaces) {
		for (let j = 1; j < parts.length; j++) {
			const vertexData = parts[j].split('/');
			if (vertexData in knownFaces) {
				indices.push(knownFaces[vertexData]);
			} else {
				indices.push(index);
				knownFaces[vertexData] = index++;
				const vertexIndex = parseInt(vertexData[0]) - 1;
				const textureIndex = parseInt(vertexData[1]) - 1;
				const normalIndex = parseInt(vertexData[2]) - 1;
				vertices.push(readVertices[vertexIndex]);
				if (textureIndex >= 0)
					textures.push(readTextures[textureIndex]);
				if (normalIndex >= 0)
					normals.push(readNormals[normalIndex]);
			}
		}
		return index;
	}
}
