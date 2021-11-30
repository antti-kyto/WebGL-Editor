export function getFileContent(filePath: string): Promise<string> {
    return fetch(filePath)
        .then((r) => r.text())
        .then(text => {
            return text;
        })
}

export function createWhiteTexture(gl: any): any {
    const texture: any = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level: number = 0;
    const internalFormat: any = gl.RGBA;
    const width: number = 1;
    const height: number = 1;
    const border: number = 0;
    const srcFormat: any = gl.RGBA;
    const srcType: any = gl.UNSIGNED_BYTE;
    const pixel: Uint8Array = new Uint8Array([255, 255, 255, 255]);  // white
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    return texture;
}

export function loadTexture(gl: any, url: string): any {
    const texture: any = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    const level: number = 0;
    const internalFormat: any = gl.RGBA;
    const width: number = 1;
    const height: number = 1;
    const border: number = 0;
    const srcFormat: any = gl.RGBA;
    const srcType: any = gl.UNSIGNED_BYTE;
    const pixel: Uint8Array = new Uint8Array([255, 0, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType,
        pixel);

    const image: HTMLImageElement = new Image();
    image.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };
    image.src = url;

    return texture;
}

function isPowerOf2(value: number) {
    return (value & (value - 1)) == 0;
}