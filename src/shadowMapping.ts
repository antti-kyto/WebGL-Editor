import { GameEngine } from "./renderer";
import { getFileContent, createSolidTexture } from './util';
import { vec3, mat4, quat, glMatrix } from 'gl-matrix';
import { Camera } from "./camera";

export class ShadowMapping {

    directionalLight = mat4.create()

    static framebuffer
    static shadowMapTexture
    static lightSpaceMatrix: mat4

    shaderProgram
    programInfo

    readyToRender = false
    constructor() {

        // Init Shader program
        const promiseVs: Promise<string> = getFileContent('../shaders/shadowShader.vs')
        const promiseFs: Promise<string> = getFileContent('../shaders/shadowShader.fs')

        Promise.all([promiseVs, promiseFs]).then((res: [string, string]) => {
            this.shaderProgram = this.initShaderProgram(GameEngine.gl, res[0], res[1])
            this.programInfo = {
                program: this.shaderProgram,
                attribLocations: {
                    vertexPosition: GameEngine.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                },
                uniformLocations: {
                    lightSpaceMatrix: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uLightSpaceMatrix'),
                    modelMatrix: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uModelMatrix')
                },
            };

            //Shadows
            GameEngine.gl.getExtension('WEBGL_depth_texture')

            ShadowMapping.framebuffer = GameEngine.gl.createFramebuffer();
            GameEngine.gl.bindFramebuffer(GameEngine.gl.FRAMEBUFFER, ShadowMapping.framebuffer);

            ShadowMapping.shadowMapTexture = GameEngine.gl.createTexture();
            GameEngine.gl.bindTexture(GameEngine.gl.TEXTURE_2D, ShadowMapping.shadowMapTexture);
            GameEngine.gl.texParameteri(GameEngine.gl.TEXTURE_2D, GameEngine.gl.TEXTURE_MIN_FILTER, GameEngine.gl.NEAREST);
            GameEngine.gl.texParameteri(GameEngine.gl.TEXTURE_2D, GameEngine.gl.TEXTURE_MAG_FILTER, GameEngine.gl.NEAREST);
            GameEngine.gl.texParameteri(GameEngine.gl.TEXTURE_2D, GameEngine.gl.TEXTURE_WRAP_S, GameEngine.gl.CLAMP_TO_EDGE);
            GameEngine.gl.texParameteri(GameEngine.gl.TEXTURE_2D, GameEngine.gl.TEXTURE_WRAP_T, GameEngine.gl.CLAMP_TO_EDGE);

            GameEngine.gl.texImage2D(GameEngine.gl.TEXTURE_2D, 0, GameEngine.gl.DEPTH_COMPONENT, 2900, 2900,
                0, GameEngine.gl.DEPTH_COMPONENT, GameEngine.gl.UNSIGNED_SHORT, null);

            GameEngine.gl.framebufferTexture2D(GameEngine.gl.FRAMEBUFFER, GameEngine.gl.DEPTH_ATTACHMENT,
                GameEngine.gl.TEXTURE_2D, ShadowMapping.shadowMapTexture, 0);

            GameEngine.gl.bindTexture(GameEngine.gl.TEXTURE_2D, null);
            GameEngine.gl.bindFramebuffer(GameEngine.gl.FRAMEBUFFER, null);
            this.readyToRender = true
        });
    }

    clearCanvas() {
        GameEngine.gl.clearColor(1, 1, 1, 1.0);  // Clear to black, fully opaque
        GameEngine.gl.clearDepth(1.0);                 // Clear everything
        GameEngine.gl.enable(GameEngine.gl.DEPTH_TEST);           // Enable depth testing
        GameEngine.gl.enable(GameEngine.gl.BLEND);
        GameEngine.gl.blendFunc(GameEngine.gl.SRC_ALPHA, GameEngine.gl.ONE_MINUS_SRC_ALPHA);
        GameEngine.gl.depthFunc(GameEngine.gl.LEQUAL);            // Near things obscure far things

        GameEngine.gl.enable(GameEngine.gl.CULL_FACE);
        GameEngine.gl.cullFace(GameEngine.gl.BACK);

        // Clear the canvas before we start drawing on it.
        GameEngine.gl.clear(GameEngine.gl.COLOR_BUFFER_BIT | GameEngine.gl.DEPTH_BUFFER_BIT);
    }

    shadowMapRender() {
        if (!this.readyToRender) {
            console.log("Not Ready to Render")
            return
        }

        GameEngine.gl.bindFramebuffer(GameEngine.gl.FRAMEBUFFER, ShadowMapping.framebuffer);
        GameEngine.gl.viewport(0, 0, 2900, 2900);

        // Tell WebGL to use our program when drawing
        GameEngine.gl.useProgram(this.programInfo.program);

        this.clearCanvas()

        const fieldOfView: number = 50 * Math.PI / 180;   // in radians
        const aspect: number = GameEngine.gl.canvas.clientWidth / GameEngine.gl.canvas.clientHeight;
        const zNear: number = 0.1;
        const zFar: number = 1000.0;
        const projectionMatrix: mat4 = mat4.create();

        //Perspective. Create ProjectionMatrix
        mat4.perspective(projectionMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar);
        mat4.ortho(projectionMatrix, 10, -10, 10, -10, -1.0, 50);

        const viewMatrix: mat4 = mat4.create();
        mat4.lookAt(
            viewMatrix,
            [1, 1, 0],
            [0, 0, 0],
            [0, 1, 0])

        const lightSpaceMatrix: mat4 = mat4.create();
        mat4.mul(lightSpaceMatrix, projectionMatrix, viewMatrix)
        ShadowMapping.lightSpaceMatrix = lightSpaceMatrix

        GameEngine.scene.forEach(element => {
            if (!element.mesh) {
                return
            }
            // Set the drawing position
            const modelMatrix: mat4 = mat4.create();

            const translationMatrix: mat4 = mat4.create();
            const rotationMatrix: mat4 = mat4.create();
            const scaleMatrix: mat4 = mat4.create();

            const rotationQuaternion: quat = quat.create();
            quat.fromEuler(rotationQuaternion, element.transform.rotation[0], element.transform.rotation[1], element.transform.rotation[2])

            mat4.fromTranslation(translationMatrix, [element.transform.position[0], element.transform.position[1], element.transform.position[2]])
            mat4.fromQuat(rotationMatrix, rotationQuaternion)
            mat4.fromScaling(scaleMatrix, [element.transform.scale[0], element.transform.scale[1], element.transform.scale[2]])

            // T*R*S = modelMatrix
            mat4.mul(modelMatrix, translationMatrix, rotationMatrix)
            mat4.mul(modelMatrix, modelMatrix, scaleMatrix)

            GameEngine.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.lightSpaceMatrix,
                false,
                lightSpaceMatrix);
            GameEngine.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.modelMatrix,
                false,
                modelMatrix);
        
            {
                const offset: number = element.mesh.offset;
                const vertexCount: number = element.mesh.vertexCount;
                GameEngine.gl.drawElements(GameEngine.gl.TRIANGLES, vertexCount, GameEngine.gl.UNSIGNED_SHORT, offset);
            }

        })
    }

    initShaderProgram(gl: any, vsSource: any, fsSource: any): any {
        const vertexShader: any = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader: any = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program
        const shaderProgram: any = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        gl.bindAttribLocation(shaderProgram, 0, 'aVertexPosition');
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    loadShader(gl: any, type: any, source: any): any {
        const shader: any = gl.createShader(type);

        // Send the source to the shader object
        gl.shaderSource(shader, source);

        // Compile the shader program
        gl.compileShader(shader);

        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}