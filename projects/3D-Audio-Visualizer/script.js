import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const params = {
    red: 1.0,
    green: 1.0,
    blue: 1.0,
    treshold: 0.5,
    strength: 0.4,
    radius: 0.8,
    intensity: 2.5,
    song: null
};

// *** Basic three.js Set Up ***
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const camera = new THREE.PerspectiveCamera(
    45,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
);
const orbit = new OrbitControls(camera, canvas);
camera.position.set(6, 8, 14);
orbit.update();

const scene = new THREE.Scene();

// *** Adding icosahedron ***
const uniforms = {
    u_time: { value: 0.0 },
    u_frequency: {value: 0.0},
    u_intensity: {value: params.intensity},
    u_red: {value: params.red},
    u_green: {value: params.green},
    u_blue: {value: params.blue}
};
  
const mat = new THREE.ShaderMaterial({
    wireframe: true,
    uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent
});

const geo = new THREE.IcosahedronGeometry(4, 30);
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// *** Load Audio ***

const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
const analyser = new THREE.AudioAnalyser(sound, 32);

// *** Post Processing ***

renderer.outputColorSpace = THREE.SRGBColorSpace;

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(canvas.clientWidth, canvas.clientHeight)
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const outputPass = new OutputPass();

const bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
bloomComposer.addPass(outputPass);

// *** LIL GUI set up ***

const gui = new GUI();

const colorsFolder = gui.addFolder('Colors');
colorsFolder.add(params, 'red', 0, 1).onChange(function (value) {
    uniforms.u_red.value = value;
});
colorsFolder.add(params, 'green', 0, 1).onChange(function (value) {
    uniforms.u_green.value = value;
});
colorsFolder.add(params, 'blue', 0, 1).onChange(function (value) {
    uniforms.u_blue.value = value;
});

const bloomFolder = gui.addFolder('Bloom');
bloomFolder.add(params, 'treshold', 0, 1).onChange(function (value) {
    bloomPass.threshold = value;
});
bloomFolder.add(params, 'strength', 0, 3).onChange(function (value) {
    bloomPass.strength = value;
});
bloomFolder.add(params, 'radius', 0, 1).onChange(function (value){
    bloomPass.radius = value;
});

const songsFolder = gui.addFolder('Song');
songsFolder.add(params, 'song', ['','Game Over - Evening Telecast.mp3', 'Loading Screen - Dyalla.mp3', 'On The Hunt - Andrew Langdon.mp3', 'Portal Trip - Asher Fulero.mp3']).onChange(function(value){
    if (value){
        sound.stop();
        audioLoader.load("public/" + value, function(buffer) {
            sound.setBuffer(buffer);
            sound.play();
        });
    } else {
        sound.stop();
    }
});

const intensityFolder = gui.addFolder('Intensity');
intensityFolder.add(params, 'intensity', 0, 7).onChange(function (value){
    uniforms.u_intensity.value = value;
});

// *** Animation Loop ***

const clock = new THREE.Clock();
function animate(){
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    uniforms.u_time.value = clock.getElapsedTime();
    bloomComposer.render();

    mesh.rotateX(0.001);
    mesh.rotateY(0.001);
    mesh.rotateZ(0.001);

    requestAnimationFrame(animate);
}
animate();

// *** Event Listener ***

window.addEventListener('resize', function() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    bloomComposer.setSize(canvas.clientWidth, canvas.clientHeight);
});









