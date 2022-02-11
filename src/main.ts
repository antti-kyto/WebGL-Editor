//GAME SCRIPT

import { GameEngine } from './renderer'
import { GameObject } from './gameObject'

import { load } from '@loaders.gl/core';
import { GLTFLoader } from '@loaders.gl/gltf';

import { loadTexture } from './util'
import { Camera } from './camera';
import { FreeLook } from './freelook';
import { PointLight } from './pointLight';
import { Time } from './time';
import { glMatrix, vec3 } from 'gl-matrix';
import { Material } from './material';
import { ShadowMapping } from './shadowMapping';

const cameraScale: number = -100
let then: number = 0
let shadowMapping


let myLight: GameObject
// Start
function main() {
    try {
        const canvas = document.querySelector('#glCanvas');
        console.log(canvas.clientWidth)
        console.log(canvas.clientHeight)

        const gameEngine: GameEngine = new GameEngine(canvas.clientWidth, canvas.clientHeight, cameraScale);
        gameEngine.clearCanvas();

        const camera: GameObject = new GameObject([0, 0, -10]);
        camera.addComponent(Camera);
        camera.addComponent(FreeLook);
        Camera.camera = camera;
        camera.transform.rotate([0, glMatrix.toRadian(0), 0])
        GameEngine.scene.push(camera);

        camera.addComponent(PointLight);

        shadowMapping = new ShadowMapping();

        // Create ROOM
        {
            const brick: any = loadTexture(GameEngine.gl, './textures/brick.jpg', false)
            const brickNormal: any = loadTexture(GameEngine.gl, './textures/brick_normal.jpg')
            const brickAlbedo: any = loadTexture(GameEngine.gl, './textures/brick_albedo.jpg')

            const brickMat = new Material(brick, brickNormal, brickAlbedo, 124)
            let sO: GameObject = new GameObject([0, 0, 0], gameEngine.meshList["plane"], brickMat)
            sO.transform.translate([0, -3.4, 0])
            sO.transform.rotation = [0, 0, 0]
            sO.transform.scale = [30, 1, 30]
            GameEngine.scene.push(sO)
        }

        load("./models/sphere.glb", GLTFLoader)
            .then((reps) => {

                console.log(reps.meshes[0].primitives[0].attributes)

                const texture: any = loadTexture(GameEngine.gl, './textures/kannu.jpg', false)
                const textureNormal: any = loadTexture(GameEngine.gl, './textures/kannuNormal.jpg')
                const texture2: any = loadTexture(GameEngine.gl, './textures/roughness.jpg')
                const mat: Material = new Material()

                gameEngine.costructBufferDatas(
                    reps.meshes[0].name,
                    reps.meshes[0].primitives[0].attributes.POSITION.value,
                    reps.meshes[0].primitives[0].attributes.NORMAL.value,
                    [],
                    reps.meshes[0].primitives[0].attributes.TEXCOORD_0 ? reps.meshes[0].primitives[0].attributes.TEXCOORD_0.value : [],
                    reps.meshes[0].primitives[0].indices.value,
                    reps.meshes[0].primitives[0].attributes.TANGENT.value)

                gameEngine.initBuffers()
                let firstO: GameObject = new GameObject([0, 0, 0], gameEngine.meshList[reps.meshes[0].name], mat)
                firstO.transform.translate([0, -1.5, 0])
                firstO.transform.rotation = [0, 0, 0]
                firstO.transform.scale = [2, 2, 2]
                GameEngine.scene.push(firstO)

                firstO = new GameObject([0, 0, 0], gameEngine.meshList[reps.meshes[0].name], mat)
                firstO.transform.translate([-4, -1.5, -4])
                firstO.transform.rotation = [0, 0, 0]
                firstO.transform.scale = [2, 2, 2]
                GameEngine.scene.push(firstO)

                requestAnimationFrame((time) => update(gameEngine, time));
            });
    } catch (err: any) {
        console.error(err)
    }
}

function update(gameEngine: GameEngine, time: number) {

    time *= 0.001;  // convert to seconds
    Time.deltaTime = time - then
    then = time;

    GameEngine.scene.forEach(gameObject => {
        // gameObject.transform.rotate([Time.deltaTime*1, 0, 0])
        gameObject.components.forEach(component => {
            component.update()
        })
    });

    shadowMapping.shadowMapRender();
    gameEngine.drawScene();
    requestAnimationFrame((time) => update(gameEngine, time))
}

window.onload = main;