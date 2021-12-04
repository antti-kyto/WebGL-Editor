//GAME SCRIPT

import { GameEngine } from './renderer'
import { GameObject } from './gameObject'

import { load } from '@loaders.gl/core';
import { GLTFLoader } from '@loaders.gl/gltf';

import { loadTexture } from './util'
import { Camera } from './camera';
import { FreeLook } from './freelook';
import { Time } from './time';
import { glMatrix } from 'gl-matrix';
import { Material } from './material';

const cameraScale: number = -100
let then: number = 0

// Start
function main() {
    try {
        const gameEngine: GameEngine = new GameEngine(900, 900, cameraScale);
        gameEngine.clearCanvas();

        const camera: GameObject = new GameObject([0, 0, -10]);
        camera.addComponent(Camera);
        camera.addComponent(FreeLook);
        Camera.camera = camera;
        camera.transform.rotate([0, glMatrix.toRadian(0), 0])
        gameEngine.scene.push(camera);

        // Create ROOM
        {
            const brick: any = loadTexture(GameEngine.gl, './textures/brick.jpg')
            const brickNormal: any = loadTexture(GameEngine.gl, './textures/brick_normal.jpg')
            const brickAlbedo: any = loadTexture(GameEngine.gl, './textures/brick_albedo.jpg')

            const brickMat = new Material(brick, brickNormal, brickAlbedo)
            let sO: GameObject = new GameObject([0, 0, 0], gameEngine.meshList["plane"], brickMat)
            sO.transform.translate([0, 0, 10])
            sO.transform.rotate([-90, 0, 0])
            sO.transform.scale = [10, 1, 10]
            gameEngine.scene.push(sO)

            sO = new GameObject([0, 0, 0], gameEngine.meshList["plane"], brickMat)
            sO.transform.translate([-10, 0, 0])
            sO.transform.rotate([90, 90, 0])
            sO.transform.scale = [10, 1, 10]
            gameEngine.scene.push(sO)

            sO = new GameObject([0, 0, 0], gameEngine.meshList["plane"], brickMat)
            sO.transform.translate([10, 0, 0])
            sO.transform.rotate([90, -90, 0])
            sO.transform.scale = [10, 1, 10]
            gameEngine.scene.push(sO)

            sO = new GameObject([0, 0, 0], gameEngine.meshList["plane"], brickMat)
            sO.transform.translate([0, 0, -10])
            sO.transform.rotation = [90, 0, 0]
            sO.transform.scale = [10, 1, 10]
            gameEngine.scene.push(sO)

            sO = new GameObject([0, 0, 0], gameEngine.meshList["plane"], brickMat)
            sO.transform.translate([0, -10, 0])
            sO.transform.rotation = [0, 0, 0]
            sO.transform.scale = [10, 1, 10]
            gameEngine.scene.push(sO)

            sO = new GameObject([0, 0, 0], gameEngine.meshList["plane"], brickMat)
            sO.transform.translate([0, 10, 0])
            sO.transform.rotation = [180, 0, 0]
            sO.transform.scale = [10, 1, 10]
            gameEngine.scene.push(sO)
        }

        load("./models/kannu.glb", GLTFLoader)
            .then((reps) => {

                console.log(reps.meshes[0].primitives[0].attributes)

                const texture: any = loadTexture(GameEngine.gl, './textures/kannu.jpg')
                const textureNormal: any = loadTexture(GameEngine.gl, './textures/kannuNormal.jpg')
                const texture2: any = loadTexture(GameEngine.gl, './textures/roughness.jpg')
                const mat: Material = new Material(texture, textureNormal, texture2, 12)

                gameEngine.costructBufferDatas(
                    reps.meshes[0].name,
                    reps.meshes[0].primitives[0].attributes.POSITION.value,
                    reps.meshes[0].primitives[0].attributes.NORMAL.value,
                    [],
                    reps.meshes[0].primitives[0].attributes.TEXCOORD_0 ? reps.meshes[0].primitives[0].attributes.TEXCOORD_0.value : [],
                    reps.meshes[0].primitives[0].indices.value,
                    reps.meshes[0].primitives[0].attributes.TANGENT.value)

                gameEngine.initBuffers()
                const firstO: GameObject = new GameObject([0, 0, 0], gameEngine.meshList[reps.meshes[0].name], mat)
                firstO.transform.translate([0, -1.5, 0])
                firstO.transform.rotation = [0, 0, 0]
                firstO.transform.scale = [2, 2, 2]
                gameEngine.scene.push(firstO)

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

    gameEngine.scene.forEach(gameObject => {
        // gameObject.transform.rotate([Time.deltaTime*1, 0, 0])
        gameObject.components.forEach(component => {
            component.update()
        })
    });

    gameEngine.drawScene();
    requestAnimationFrame((time) => update(gameEngine, time))
}

window.onload = main;