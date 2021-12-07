import { getFileContent, createSolidTexture } from './util';
import { Mesh } from './mesh';
import { GameObject } from './gameObject';
import { Buffers } from './buffers';
import { Camera } from './camera';

import { vec3, mat4, quat } from 'gl-matrix';

export class GameEngine {

    static gl: any
    canvas: any

    readyToRender: boolean = false
    meshList: any = []
    scene: Array<GameObject> = []
    emptyTexture: any = null
    cameraScale: number = 0

    buffers: Buffers = new Buffers()
    bufferDatas: Buffers = new Buffers()

    shaderProgram: any
    programInfo: any

    constructor(canvasWidth: number, canvasHeight: number, cameraScale: number) {
        this.canvas = document.querySelector('#glCanvas');

        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.cameraScale = cameraScale

        GameEngine.gl = this.canvas.getContext('webgl');

        // Only continue if WebGL is available and working
        if (GameEngine.gl === null) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        // We want empty (white) texture. Because shader is expecting one
        this.emptyTexture = createSolidTexture(GameEngine.gl)

        // //plane
        this.costructBufferDatas(
            'plane',
            [
                1.0, 0.0, -1.0,
                -1.0, 0.0, -1.0,
                -1.0, 0.0, 1.0,
                1.0, 0.0, 1.0,
            ],
            [
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,
                0.0, 1.0, 0.0,],
            [],
            [
                1.0, 1.0,
                0.0, 1.0,
                0.0, 0.0,
                1.0, 0.0,
            ],
            [0, 1, 2, 0, 2, 3],
            [
                1., 0., 0., 1,
                1., 0., 0., 1,
                1., 0., 0., 1,
                1., 0., 0., 1,
            ]
        )

        // Init Shader program
        const promiseVs: Promise<string> = getFileContent('../shaders/main.vs')
        const promiseFs: Promise<string> = getFileContent('../shaders/main.fs')

        Promise.all([promiseVs, promiseFs]).then((res: [string, string]) => {
            this.shaderProgram = this.initShaderProgram(GameEngine.gl, res[0], res[1])
            this.programInfo = {
                program: this.shaderProgram,
                attribLocations: {
                    vertexPosition: GameEngine.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                    vertexNormal: GameEngine.gl.getAttribLocation(this.shaderProgram, 'aVertexNormal'),
                    vertexTangent: GameEngine.gl.getAttribLocation(this.shaderProgram, 'aVertexTangent'),
                    vertexColor: GameEngine.gl.getAttribLocation(this.shaderProgram, 'aVertexColor'),
                    textureCoord: GameEngine.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
                },
                uniformLocations: {
                    projectionMatrix: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                    viewMatrix: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uViewMatrix'),
                    modelMatrix: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uModelMatrix'),
                    normalMatrix: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uNormalMatrix'),
                    viewPos: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uViewPos'),
                    numPointLights: GameEngine.gl.getUniformLocation(this.shaderProgram, 'vNumPointLights'),

                    materialDiffuse: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uMaterial.diffuse'),
                    materialNormal: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uMaterial.normal'),
                    materialSpecular: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uMaterial.specular'),
                    materialShininess: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uMaterial.shininess'),

                    dirLightDirection: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uDirLight.direction'),
                    dirLightAmbient: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uDirLight.ambient'),
                    dirLightDiffuse: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uDirLight.diffuse'),
                    dirLightSpecular: GameEngine.gl.getUniformLocation(this.shaderProgram, 'uDirLight.specular')

                },
            };

            this.readyToRender = true
        });
    }

    costructBufferDatas(meshName: string, positions: number[], normals: number[], colors: number[], textureCoordinates: number[], indices: number[], tangents: number[]) {

        if (colors.length == 0) {
            for (let i: number = 0; i < positions.length / 3; i++) {
                colors.push(1, 1, 1, 1)
            }
        }

        if (this.bufferDatas.indices.length != 0) {
            indices = indices.map(a => a + this.bufferDatas.position.length / 3);
        }

        this.meshList[meshName] = new Mesh(this.bufferDatas.position.length, positions, indices)

        this.bufferDatas.position = this.bufferDatas.position.concat(Array.from(positions))
        this.bufferDatas.normal = this.bufferDatas.normal.concat(Array.from(normals))
        this.bufferDatas.tangent = this.bufferDatas.tangent.concat(Array.from(tangents))
        this.bufferDatas.vertexColors = this.bufferDatas.vertexColors.concat(Array.from(colors))
        this.bufferDatas.textureCoord = this.bufferDatas.textureCoord.concat(Array.from(textureCoordinates))
        this.bufferDatas.indices = this.bufferDatas.indices.concat(Array.from(indices))
    }

    initBuffers() {
        // Create a buffer for the square's positions.
        // Select the positionBuffer
        // Pass the list of positions into WebG
        const positionBuffer: any = GameEngine.gl.createBuffer()
        GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, positionBuffer)
        GameEngine.gl.bufferData(GameEngine.gl.ARRAY_BUFFER,
            new Float32Array(this.bufferDatas.position),
            GameEngine.gl.STATIC_DRAW);

        const normalBuffer = GameEngine.gl.createBuffer();
        GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, normalBuffer);
        GameEngine.gl.bufferData(GameEngine.gl.ARRAY_BUFFER, new Float32Array(this.bufferDatas.normal),
            GameEngine.gl.STATIC_DRAW)

        const tangentBuffer = GameEngine.gl.createBuffer();
        GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, tangentBuffer);
        GameEngine.gl.bufferData(GameEngine.gl.ARRAY_BUFFER, new Float32Array(this.bufferDatas.tangent),
            GameEngine.gl.STATIC_DRAW)

        // Create a buffer for the colors.
        // Select the textureCoordBuffer
        // Pass the list of textureCoordinates into WebG
        const vertexColorBuffer: any = GameEngine.gl.createBuffer();
        GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, vertexColorBuffer);
        GameEngine.gl.bufferData(GameEngine.gl.ARRAY_BUFFER, new Float32Array(this.bufferDatas.vertexColors),
            GameEngine.gl.STATIC_DRAW);

        // Create a buffer for the textureCoordinates.
        // Select the textureCoordBuffer
        // Pass the list of textureCoordinates into WebG
        const textureCoordBuffer: any = GameEngine.gl.createBuffer();
        GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, textureCoordBuffer);
        GameEngine.gl.bufferData(GameEngine.gl.ARRAY_BUFFER, new Float32Array(this.bufferDatas.textureCoord),
            GameEngine.gl.STATIC_DRAW);

        const indexBuffer = GameEngine.gl.createBuffer();
        GameEngine.gl.bindBuffer(GameEngine.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        GameEngine.gl.bufferData(GameEngine.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.bufferDatas.indices), GameEngine.gl.STATIC_DRAW);

        this.buffers.position = positionBuffer
        this.buffers.normal = normalBuffer
        this.buffers.tangent = tangentBuffer
        this.buffers.vertexColors = vertexColorBuffer
        this.buffers.textureCoord = textureCoordBuffer
        this.buffers.indices = indexBuffer
    }

    initShaderProgram(gl: any, vsSource: any, fsSource: any): any {
        const vertexShader: any = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader: any = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program
        const shaderProgram: any = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
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

    clearCanvas() {
        GameEngine.gl.clearColor(.15, .15, .15, 1.0);  // Clear to black, fully opaque
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

    drawScene() {

        if (!this.readyToRender) {
            console.log("Not Ready to Render")
            return
        }

        // Tell WebGL to use our program when drawing
        GameEngine.gl.useProgram(this.programInfo.program);

        // THIS IS FOR POINT LIGHT
        GameEngine.gl.uniform1i(
            this.programInfo.uniformLocations.numPointLights,
            3);
        for (let i = 0; i < 3; i++) {
            const position = GameEngine.gl.getUniformLocation(this.shaderProgram, `uPointLights[${i}].position`)
            const constant = GameEngine.gl.getUniformLocation(this.shaderProgram, `uPointLights[${i}].constant`)
            const linear = GameEngine.gl.getUniformLocation(this.shaderProgram, `uPointLights[${i}].linear`)
            const quadratic = GameEngine.gl.getUniformLocation(this.shaderProgram, `uPointLights[${i}].quadratic`)
            const ambient = GameEngine.gl.getUniformLocation(this.shaderProgram, `uPointLights[${i}].ambient`)
            const diffuse = GameEngine.gl.getUniformLocation(this.shaderProgram, `uPointLights[${i}].diffuse`)
            const specular = GameEngine.gl.getUniformLocation(this.shaderProgram, `uPointLights[${i}].specular`)

            GameEngine.gl.uniform3fv(position, [-5 + (i * 5), 2, 0]);

            GameEngine.gl.uniform1f(constant, 1.0);
            GameEngine.gl.uniform1f(linear, 0.15);
            GameEngine.gl.uniform1f(quadratic, 0.035);

            GameEngine.gl.uniform3fv(ambient, [.0, .0, .0]);
            GameEngine.gl.uniform3fv(diffuse, [1 + i, 1, 0 + i]);
            GameEngine.gl.uniform3fv(specular, [0 + i, 1, 0 + i]);
        }

        // Set Directional Lights
        GameEngine.gl.uniform3fv(
            this.programInfo.uniformLocations.dirLightDirection,
            [1, 1, -1]);
        GameEngine.gl.uniform3fv(
            this.programInfo.uniformLocations.dirLightAmbient,
            [.51, .55, .58]);
        GameEngine.gl.uniform3fv(
            this.programInfo.uniformLocations.dirLightDiffuse,
            [0.99, 0.85, .65]);
        GameEngine.gl.uniform3fv(
            this.programInfo.uniformLocations.dirLightSpecular,
            [.32, .3, .25]);

        this.clearCanvas()

        // Create a perspective matrix
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

        // Orthographic
        // mat4.ortho(projectionMatrix, this.canvas.width, -this.canvas.width, this.canvas.height, -this.canvas.height, 0.1, 100);
        // mat4.scale(projectionMatrix, projectionMatrix, [this.cameraScale, this.cameraScale, 1])

        // Calculate View (Camera) matrix
        const cameraFront: vec3 = [0, 0, 0]
        cameraFront[0] = Math.sin(Camera.camera.transform.rotation[1]) * Math.cos(Camera.camera.transform.rotation[0]);
        cameraFront[1] = Math.sin(Camera.camera.transform.rotation[0]);
        cameraFront[2] = Math.cos(Camera.camera.transform.rotation[1]) * Math.cos(Camera.camera.transform.rotation[0]);
        vec3.normalize(cameraFront, cameraFront)
        const viewMatrix: mat4 = mat4.create();
        mat4.lookAt(
            viewMatrix,
            Camera.camera.transform.position,
            vec3.add(vec3.create(), Camera.camera.transform.position, cameraFront),
            [0, 1, 0])

        this.scene.forEach(element => {

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

            // Tell WebGL how to pull out the positions from the position buffer
            {
                const numComponents: number = 3;  // pull out 2 values per iteration
                const type: any = GameEngine.gl.FLOAT;    // the data in the buffer is 32bit floats
                const normalize: boolean = false;  // don't normalize
                const stride: number = 0;         // how many bytes to get from one set of values to the next
                const offset: number = 0;         // how many bytes inside the buffer to start from
                GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, this.buffers.position);
                GameEngine.gl.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                GameEngine.gl.enableVertexAttribArray(
                    this.programInfo.attribLocations.vertexPosition);
            }

            // Tell WebGL how to pull out the normals from
            // the normal buffer into the vertexNormal attribute.
            {
                const numComponents = 3;
                const type = GameEngine.gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, this.buffers.normal);
                GameEngine.gl.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexNormal,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                GameEngine.gl.enableVertexAttribArray(
                    this.programInfo.attribLocations.vertexNormal);
            }

            // Tell WebGL how to pull out the normals from
            // the normal buffer into the vertexNormal attribute.
            {
                const numComponents = 4;
                const type = GameEngine.gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, this.buffers.tangent);
                GameEngine.gl.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexTangent,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                GameEngine.gl.enableVertexAttribArray(
                    this.programInfo.attribLocations.vertexTangent);
            }

            // Tell WebGL how to pull out the vertexColor from the vertexColor buffer
            {
                const numComponents: number = 4;  // pull out 2 values per iteration
                const type: any = GameEngine.gl.FLOAT;    // the data in the buffer is 32bit floats
                const normalize: boolean = false;  // don't normalize
                const stride: number = 0;         // how many bytes to get from one set of values to the next
                const offset: number = 0;         // how many bytes inside the buffer to start from
                GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, this.buffers.vertexColors);
                GameEngine.gl.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexColor,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                GameEngine.gl.enableVertexAttribArray(
                    this.programInfo.attribLocations.vertexColor);
            }

            // tell webgl how to pull out the texture coordinates from buffer
            {
                const num: number = 2; // every coordinate composed of 2 values
                const type: any = GameEngine.gl.FLOAT; // the data in the buffer is 32 bit float
                const normalize: boolean = false; // don't normalize
                const stride: number = 0; // how many bytes to get from one set to the next
                const offset: number = 0; // how many bytes inside the buffer to start from
                GameEngine.gl.bindBuffer(GameEngine.gl.ARRAY_BUFFER, this.buffers.textureCoord);
                GameEngine.gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
                GameEngine.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
            }

            // Tell WebGL which indices to use to index the vertices
            GameEngine.gl.bindBuffer(GameEngine.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

            // Tell WebGL we want to affect texture unit 0
            // Bind the texture to texture unit 0
            // Tell the shader we bound the texture to texture unit 0
            GameEngine.gl.uniform1i(this.programInfo.uniformLocations.materialDiffuse, 0);
            GameEngine.gl.uniform1i(this.programInfo.uniformLocations.materialNormal, 1);
            GameEngine.gl.uniform1i(this.programInfo.uniformLocations.materialSpecular, 2);

            GameEngine.gl.activeTexture(GameEngine.gl.TEXTURE0);
            GameEngine.gl.bindTexture(GameEngine.gl.TEXTURE_2D, element.material.diffuse);

            GameEngine.gl.activeTexture(GameEngine.gl.TEXTURE1);
            GameEngine.gl.bindTexture(GameEngine.gl.TEXTURE_2D, element.material.normalMap);

            GameEngine.gl.activeTexture(GameEngine.gl.TEXTURE2);
            GameEngine.gl.bindTexture(GameEngine.gl.TEXTURE_2D, element.material.specular);

            // TODO MATERIALS CLASS
            GameEngine.gl.uniform1f(this.programInfo.uniformLocations.materialShininess, element.material.shininess);

            const normalMatrix = mat4.create();
            mat4.invert(normalMatrix, modelMatrix);
            mat4.transpose(normalMatrix, normalMatrix);

            // Set the shader uniforms
            GameEngine.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            GameEngine.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.viewMatrix,
                false,
                viewMatrix);
            GameEngine.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.modelMatrix,
                false,
                modelMatrix);
            GameEngine.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.normalMatrix,
                false,
                normalMatrix);
            GameEngine.gl.uniform3fv(
                this.programInfo.uniformLocations.viewPos,
                Camera.camera.transform.position);

            {
                const offset: number = element.mesh.offset;
                const vertexCount: number = element.mesh.vertexCount;
                GameEngine.gl.drawElements(GameEngine.gl.TRIANGLES, vertexCount, GameEngine.gl.UNSIGNED_SHORT, offset);
            }
        });
    }
}