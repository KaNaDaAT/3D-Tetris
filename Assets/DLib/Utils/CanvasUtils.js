
/**
 * Resizes a canvas to match its displayed size.
 * @param {HTMLCanvasElement} canvas - The canvas to resize.
 * @param {Number} [multiplier=1] - The amount to multiply the size by. Defaults to 1. Use window.devicePixelRatio for native pixels.
 * @returns {Boolean} - True if the canvas was resized, false otherwise.
 */
export function resizeCanvasToDisplaySize(canvas, multiplier = 1) {
	const width = Math.floor(canvas.clientWidth * multiplier);
	const height = Math.floor(canvas.clientHeight * multiplier);
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
		return true;
	}
	return false;
}
