import { GameEngine } from './renderer';
import { getFileContent, createSolidTexture } from './util';

export class Material {

    diffuse: WebGLTexture
    specular: WebGLTexture
    shininess: number

    constructor(
        diffuse: WebGLTexture = createSolidTexture(GameEngine.gl),
        specular: WebGLTexture = createSolidTexture(GameEngine.gl),
        shininess: number = 0
    ) {
        this.diffuse = diffuse
        this.specular = specular
        this.shininess = shininess
    }
}