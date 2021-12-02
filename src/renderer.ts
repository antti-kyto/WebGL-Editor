import { getFileContent, createWhiteTexture } from './util';
import { Mesh } from './mesh';
import { GameObject } from './gameObject';
import { Buffers } from './buffers';
import { Camera } from './camera';

import { vec3, mat4 } from 'gl-matrix';

export class GameEngine {

    gl: any
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

        this.gl = this.canvas.getContext('webgl');

        // Only continue if WebGL is available and working
        if (this.gl === null) {
            alert('Unable to initialize WebGL. Your browser or machine may not support it.');
            return;
        }

        // We want empty (white) texture. Because shader is expecting one
        this.emptyTexture = createWhiteTexture(this.gl)

        // //plane
        this.costructBufferDatas(
            'plane',
            [
                -1.0, -1.0, 0.0,
                1.0, -1.0, 0.0,
                1.0, 1.0, 0.0,
                -1.0, 1.0, 0.0,
            ],
            [0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,
                0.0, 0.0, -1.0,],
            [],
            [
                0.0, 0.0,
                1.0, 0.0,
                0.0, 1.0,
                1.0, 1.0,
            ],
            [0, 1, 2, 0, 2, 3]
        )

        // Init Shader program
        const promiseVs: Promise<string> = getFileContent('../shaders/main.vs')
        const promiseFs: Promise<string> = getFileContent('../shaders/main.fs')

        Promise.all([promiseVs, promiseFs]).then((res: [string, string]) => {
            this.shaderProgram = this.initShaderProgram(this.gl, res[0], res[1])
            this.programInfo = {
                program: this.shaderProgram,
                attribLocations: {
                    vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                    vertexNormal: this.gl.getAttribLocation(this.shaderProgram, 'aVertexNormal'),
                    vertexColor: this.gl.getAttribLocation(this.shaderProgram, 'aVertexColor'),
                    textureCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
                },
                uniformLocations: {
                    projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                    viewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uViewMatrix'),
                    modelMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelMatrix'),
                    normalMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uNormalMatrix'),
                    viewPos: this.gl.getUniformLocation(this.shaderProgram, 'uViewPos'),
                    
                    materialDiffuse: this.gl.getUniformLocation(this.shaderProgram, 'uMaterial.diffuse'),
                    materialSpecular: this.gl.getUniformLocation(this.shaderProgram, 'uMaterial.specular'),
                    materialShininess: this.gl.getUniformLocation(this.shaderProgram, 'uMaterial.shininess')
                },
            };

            this.readyToRender = true
        });
    }

    costructBufferDatas(meshName: string, positions: number[], normals: number[], colors: number[], textureCoordinates: number[], indices: number[]) {

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
        this.bufferDatas.vertexColors = this.bufferDatas.vertexColors.concat(Array.from(colors))
        this.bufferDatas.textureCoord = this.bufferDatas.textureCoord.concat(Array.from(textureCoordinates))
        this.bufferDatas.indices = this.bufferDatas.indices.concat(Array.from(indices))
    }

    initBuffers() {
        // Create a buffer for the square's positions.
        // Select the positionBuffer
        // Pass the list of positions into WebG
        const positionBuffer: any = this.gl.createBuffer()
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER,
            new Float32Array(this.bufferDatas.position),
            this.gl.STATIC_DRAW);

        const normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferDatas.normal),
            this.gl.STATIC_DRAW)

        // Create a buffer for the colors.
        // Select the textureCoordBuffer
        // Pass the list of textureCoordinates into WebG
        const vertexColorBuffer: any = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferDatas.vertexColors),
            this.gl.STATIC_DRAW);

        // Create a buffer for the textureCoordinates.
        // Select the textureCoordBuffer
        // Pass the list of textureCoordinates into WebG
        const textureCoordBuffer: any = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.bufferDatas.textureCoord),
            this.gl.STATIC_DRAW);

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.bufferDatas.indices), this.gl.STATIC_DRAW);

        this.buffers.position = positionBuffer
        this.buffers.normal = normalBuffer
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
        this.gl.clearColor(.15, .15, .15, 1.0);  // Clear to black, fully opaque
        this.gl.clearDepth(1.0);                 // Clear everything
        this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things

        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);

        // Clear the canvas before we start drawing on it.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    drawScene() {

        if (!this.readyToRender) {
            console.log("Not Ready to Render")
            return
        }

        this.clearCanvas()

        // Create a perspective matrix
        const fieldOfView: number = 50 * Math.PI / 180;   // in radians
        const aspect: number = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
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
            mat4.translate(modelMatrix,
                modelMatrix,
                element.transform.position);

            mat4.scale(modelMatrix,
                modelMatrix,
                element.transform.scale);

            const normalizedRot: vec3 = [0, 0, 0]
            vec3.normalize(normalizedRot, element.transform.rotation)
            mat4.rotate(modelMatrix,
                modelMatrix,
                Math.abs(element.transform.rotation[0]) + Math.abs(element.transform.rotation[1]) + Math.abs(element.transform.rotation[2]),
                [normalizedRot[0], normalizedRot[1], normalizedRot[2]])

            // Tell WebGL how to pull out the positions from the position buffer
            {
                const numComponents: number = 3;  // pull out 2 values per iteration
                const type: any = this.gl.FLOAT;    // the data in the buffer is 32bit floats
                const normalize: boolean = false;  // don't normalize
                const stride: number = 0;         // how many bytes to get from one set of values to the next
                const offset: number = 0;         // how many bytes inside the buffer to start from
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
                this.gl.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                this.gl.enableVertexAttribArray(
                    this.programInfo.attribLocations.vertexPosition);
            }

            // Tell WebGL how to pull out the normals from
            // the normal buffer into the vertexNormal attribute.
            {
                const numComponents = 3;
                const type = this.gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normal);
                this.gl.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexNormal,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                this.gl.enableVertexAttribArray(
                    this.programInfo.attribLocations.vertexNormal);
            }

            // Tell WebGL how to pull out the vertexColor from the vertexColor buffer
            {
                const numComponents: number = 4;  // pull out 2 values per iteration
                const type: any = this.gl.FLOAT;    // the data in the buffer is 32bit floats
                const normalize: boolean = false;  // don't normalize
                const stride: number = 0;         // how many bytes to get from one set of values to the next
                const offset: number = 0;         // how many bytes inside the buffer to start from
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertexColors);
                this.gl.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexColor,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                this.gl.enableVertexAttribArray(
                    this.programInfo.attribLocations.vertexColor);
            }

            // tell webgl how to pull out the texture coordinates from buffer
            {
                const num: number = 2; // every coordinate composed of 2 values
                const type: any = this.gl.FLOAT; // the data in the buffer is 32 bit float
                const normalize: boolean = false; // don't normalize
                const stride: number = 0; // how many bytes to get from one set to the next
                const offset: number = 0; // how many bytes inside the buffer to start from
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.textureCoord);
                this.gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
                this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
            }

            // Tell WebGL which indices to use to index the vertices
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

            // Tell WebGL to use our program when drawing
            this.gl.useProgram(this.programInfo.program);

            // Tell WebGL we want to affect texture unit 0
            // Bind the texture to texture unit 0
            // Tell the shader we bound the texture to texture unit 0
            this.gl.uniform1i(this.programInfo.uniformLocations.materialDiffuse, 0);
            this.gl.uniform1i(this.programInfo.uniformLocations.materialSpecular, 1);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, element.texture != null ? element.texture : this.emptyTexture);

            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, element.texture2 != null ? element.texture2 : this.emptyTexture);

            const normalMatrix = mat4.create();
            mat4.invert(normalMatrix, modelMatrix);
            mat4.transpose(normalMatrix, normalMatrix);

            // Set the shader uniforms
            this.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            this.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.viewMatrix,
                false,
                viewMatrix);
            this.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.modelMatrix,
                false,
                modelMatrix);
            this.gl.uniformMatrix4fv(
                this.programInfo.uniformLocations.normalMatrix,
                false,
                normalMatrix);
            this.gl.uniform3fv(
                this.programInfo.uniformLocations.viewPos,
                Camera.camera.transform.position);

            // TODO MATERIALS CLASS
            this.gl.uniform1f(this.programInfo.uniformLocations.materialShininess, 68.0);

            {
                const offset: number = element.mesh.offset;
                const vertexCount: number = element.mesh.vertexCount;
                this.gl.drawElements(this.gl.TRIANGLES, vertexCount, this.gl.UNSIGNED_SHORT, offset);
            }
        });
    }
}