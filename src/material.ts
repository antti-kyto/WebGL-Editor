import { GameEngine } from './renderer';
import { getFileContent, createSolidTexture } from './util';

export class Material {

    diffuse: WebGLTexture
    specular: WebGLTexture
    shininess: number

    constructor(
        diffuse: WebGLTexture = createSolidTexture(GameEngine.gl),
        specular: WebGLTexture = createSolidTexture(GameEngine.gl, new Uint8Array([0, 0, 0, 0])),
        shininess: number = 32
    ) {
        this.diffuse = diffuse
        this.specular = specular
        this.shininess = shininess
    }
}