//GAME SCRIPT

import { GameEngine } from './renderer'
import { GameObject } from './gameObject'

import { load } from '@loaders.gl/core';
import { GLTFLoader } from '@loaders.gl/gltf';

import { loadTexture } from './util'
import { Camera } from './camera';
import { FreeLook } from './freelook';

const cameraScale: number = -100
let then: number = 0

// Start
function main() {
    try {
        const gameEngine: GameEngine = new GameEngine(500, 500, cameraScale);
        gameEngine.clearCanvas();

        const camera: GameObject = new GameObject([0,0,-9]);
        camera.addComponent(Camera);
        camera.addComponent(FreeLook);
        Camera.camera = camera;
        // gameEngine.scene.push(camera);

        load("./models/head6.glb", GLTFLoader)
            .then((reps) => {

                const texture: any = loadTexture(gameEngine.gl, './textures/tile.jpg')
                gameEngine.costructBufferDatas(
                    reps.meshes[0].name,
                    reps.meshes[0].primitives[0].attributes.POSITION.value,
                    reps.meshes[0].primitives[0].attributes.NORMAL.value,
                    [],
                    reps.meshes[0].primitives[0].attributes.TEXCOORD_0 ? reps.meshes[0].primitives[0].attributes.TEXCOORD_0.value : [],
                    reps.meshes[0].primitives[0].indices.value)

                gameEngine.initBuffers()
                const firstO: GameObject = new GameObject([0, 0, 0], gameEngine.meshList[reps.meshes[0].name])
                firstO.texture = texture
                gameEngine.scene.push(firstO)

                requestAnimationFrame((time) => update(gameEngine, time));
            });
    } catch (err: any) {
        console.error(err)
    }
}

function update(gameEngine: GameEngine, time: number) {

    time *= 0.001;  // convert to seconds
    const deltaTime: number = time - then;
    then = time;

    gameEngine.scene.forEach(gameObject => {
        // gameObject.transform.rotate([deltaTime*1, deltaTime, 0])
        gameObject.components.forEach(component => {
            component.update(deltaTime)
        })
    });

    gameEngine.drawScene();
    requestAnimationFrame((time) => update(gameEngine, time))
}

window.onload = main;