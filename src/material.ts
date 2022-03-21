import { GameEngine } from './renderer';
import { getFileContent, createSolidTexture } from './util';

export class Material {

    diffuse: WebGLTexture
    normalMap: WebGLTexture
    specular: WebGLTexture
    shininess: number

    constructor(
        diffuse: WebGLTexture = createSolidTexture(GameEngine.gl, new Uint8Array([255, 255, 255, 255])),
        normalMap: WebGLTexture = createSolidTexture(GameEngine.gl, new Uint8Array([255/2, 255/2, 255, 0])),
        specular: WebGLTexture = createSolidTexture(GameEngine.gl, new Uint8Array([255, 255, 255, 255])),
        shininess: number = 24
    ) {
        this.diffuse = diffuse
        this.normalMap = normalMap
        this.specular = specular
        this.shininess = shininess
    }
}