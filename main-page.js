import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Initialize all renderers and scenes on page load
document.addEventListener('DOMContentLoaded', () => {
    setupWordHighlighting();
    setupScrollAnimations();
    initMainScene();
    initAboutScene();
    initWhatIsThisScene();
});


// Add hover effect to paragraph words
function setupWordHighlighting() {
    const paragraphs = document.getElementsByClassName('words-highlight');
    
    for(let paragraph of paragraphs) {
        const words = paragraph.textContent.split(/\s+/);
        paragraph.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
    }
}

// Reveal elements as they scroll into view
function setupScrollAnimations() {
    const sections = document.querySelectorAll('.animation');
    
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.75 &&
            rect.bottom >= 0
        );
    }
    
    function checkScroll() {
        sections.forEach(section => {
            if (isElementInViewport(section)) {
                section.classList.add('visible');
            }
        });
    }
    
    checkScroll(); // Check initial positions
    window.addEventListener('scroll', checkScroll);
}

// *** MAIN HEADER SCENE *** //

function initMainScene() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const canvas = document.getElementById('header-c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 10;
    
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 0, 1);
    scene.add(light);
    
    // Create gradient icosahedron with wireframe
    const icosahedron = createGradientIcosahedron();
    scene.add(icosahedron);
    
    // Background gradient
    const plane = createGradientBackground();
    plane.position.z = -100;
    scene.add(plane);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        icosahedron.rotateX(0.006);
        icosahedron.rotateY(-0.004);
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Create icosahedron with color gradient and wireframe
function createGradientIcosahedron() {
    // Create main geometry
    const geometry = new THREE.IcosahedronGeometry(4, 1);
    const wireframeGeometry = new THREE.IcosahedronGeometry(4.2, 1);
    
    // Setup material
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        flatShading: true,
        vertexColors: true,
        shininess: 0
    });
    
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
        transparent: true,
    });
    
    // Add color gradient
    const colors = [];
    const positionAttribute = geometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    const gradientColors = {
        topColor: new THREE.Color(0x0000ff),
        bottomColor: new THREE.Color(0xff0000) 
    };
    
    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        vertex.normalize();
        
        const color = new THREE.Color();
        color.copy(gradientColors.bottomColor).lerp(gradientColors.topColor, 0.5 + vertex.y * 0.5);
        colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    
    mesh.add(wireframeMesh);
    mesh.rotateX(0.2);
    mesh.rotateY(0.2);
    
    return mesh;
}

// Create gradient background
function createGradientBackground() {
    const vertexShader = `
        varying vec2 vUv;
        void main(){
            vUv = uv;
            gl_Position = vec4(position, 1.0);   
        }
    `;
    
    const fragmentShader = `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float extra;
        varying vec2 vUv;
        void main(){
            gl_FragColor = vec4(mix(color1, color2, vUv.y + extra), 1.0);
        }
    `;
    
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            color1: {value: new THREE.Color(0xFFFFFF)},
            color2: {value: new THREE.Color(0x000000)},
            extra: {value: -0.8}
        },
        depthTest: false,
    });
    
    const geometry = new THREE.PlaneGeometry(2.0, 2.0);
    const plane = new THREE.Mesh(geometry, material);
    plane.renderOrder = -1;
    
    return plane;
}

// *** ABOUT ME SCENE *** //

function initAboutScene() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const canvas = document.getElementById('about-me-c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 60;
    
    // Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    
    // Create ring objects
    const rings = createRings(scene);
    
    // Handle click interactions
    setupRingInteractions(canvas, camera, rings);
    
    // Animation loop
    let removedRings = 0;
    
    function animate() {
        requestAnimationFrame(animate);
        
        const time = Date.now() / 1000;
        const heightMultiplier = 22;
        
        rings.forEach((ring, i) => {
            // Animate vertical position with sine wave
            ring.position.y = Math.sin(time + (Math.PI / rings.length * i)) * heightMultiplier;
            
            // Rotate rings that aren't launched
            if (!ring.userData.isLaunched) {
                ring.rotation.y = ((Math.PI / rings.length)) * time + (Math.PI / rings.length) * i;
            }
            
            // Update color based on height
            updateRingColor(ring, heightMultiplier);
            
            // Handle launched rings
            if (ring.userData.isLaunched) {
                handleLaunchedRing(ring, scene, rings, () => { removedRings++; });
                
                // Reset all rings when all have been removed
                if (removedRings === rings.length) {
                    removedRings = 0;
                    rings.forEach(r => scene.add(r));
                }
            }
        });
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Create rings for the About scene
function createRings(scene) {
    const ringGeometry = new THREE.TorusGeometry(6, 3, 8, 8);
    const wireframeGeometry = new THREE.TorusGeometry(6.3, 3.3, 8, 8);
    const wireframeMaterial = new THREE.MeshPhongMaterial({
        color: 0x000000, 
        wireframe: true, 
        side: THREE.DoubleSide
    });
    
    const ringCount = 6;
    const rings = [];
    const startX = -55;
    
    for (let i = 0; i < ringCount; i++) {
        // Alternate colors between red and blue
        const material = new THREE.MeshPhongMaterial({
            color: i % 2 === 0 ? 0x0000ff : 0xff0000, 
            side: THREE.DoubleSide
        });
        
        // Create ring
        const ring = new THREE.Mesh(ringGeometry, material);
        
        // Add wireframe
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        ring.add(wireframe);
        
        // Position and initialize
        ring.position.x = startX + i * 22;
        ring.userData = { isLaunched: false };
        
        scene.add(ring);
        rings.push(ring);
    }
    
    return rings;
}

// Update ring color based on height
function updateRingColor(ring, heightMultiplier) {
    const normalizedHeight = ring.position.y + heightMultiplier;
    const colorValue = normalizedHeight / (heightMultiplier * 2);
    
    const color = new THREE.Color(0x000000);
    color.r = colorValue;
    color.b = 1 - colorValue;
    
    ring.material.color = color;
}

// Handle a launched ring's animation
function handleLaunchedRing(ring, scene, rings, onRemoveCallback) {
    ring.position.z -= 0.5;
    ring.rotation.y += 0.075;
    
    if (ring.position.z <= -150) {
        scene.remove(ring);
        ring.position.z = 0;
        ring.userData.isLaunched = false;
        onRemoveCallback();
    }
}

// Setup click interactions for rings
function setupRingInteractions(canvas, camera, rings) {
    canvas.addEventListener('click', (event) => {
        const raycaster = new THREE.Raycaster();
        
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1,
            -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(rings, false);
        
        if (intersects.length > 0) {
            intersects[0].object.userData.isLaunched = true;
        }
    });
}

// *** WHAT IS THIS SCENE *** //

function initWhatIsThisScene() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const canvas = document.getElementById('what-is-this-c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 4.6;
    camera.position.y = 2.2;
    
    // Lighting
    const redLight = new THREE.DirectionalLight(0xff0000, 100);
    redLight.position.set(0, -20, 10);
    scene.add(redLight);
    
    const blueLight = new THREE.DirectionalLight(0x0000ff, 100);
    blueLight.position.set(0, 20, 10);
    scene.add(blueLight);
    
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemisphereLight.position.set(0, 20, 10);
    scene.add(hemisphereLight);
    
    // Animation state
    let model, mixer, actions, activeAction;
    const clock = new THREE.Clock();
    
    // Load 3D model
    loadRobotModel(scene).then(result => {
        model = result.model;
        mixer = result.mixer;
        actions = result.actions;
        activeAction = actions['Walking'];
        
        // Set up click interactions for the model
        setupModelInteractions(canvas, camera, model, mixer, actions, activeAction);
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        if (model) {
            model.rotation.y += 0.01;
        }
        
        const dt = clock.getDelta();
        if (mixer) mixer.update(dt);
        if (activeAction) activeAction.play();
        
        renderer.render(scene, camera);
    }
    
    animate();
}

// Load the robot model and set up animations
async function loadRobotModel(scene) {
    const loader = new GLTFLoader();
    
    return new Promise((resolve) => {
        loader.load('./RobotExpressive.glb', (gltf) => {
            const model = gltf.scene;
            const animations = gltf.animations;
            
            // Convert model to wireframe
            model.traverse((object) => {
                if (object.isMesh) {
                    if (Array.isArray(object.material)) {
                        object.material = object.material.map(mat => {
                            const newMat = mat.clone();
                            newMat.wireframe = true;
                            newMat.color.set(0x000000);
                            return newMat;
                        });
                    } else {
                        const newMat = object.material.clone();
                        newMat.wireframe = true;
                        newMat.color.set(0x000000);
                        object.material = newMat;
                    }
                }
            });
            
            // Set up animation actions
            const mixer = new THREE.AnimationMixer(model);
            const actions = {};
            const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
            const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp'];
            
            for (const clip of animations) {
                const action = mixer.clipAction(clip);
                actions[clip.name] = action;
                
                if (emotes.includes(clip.name) || states.indexOf(clip.name) >= 4) {
                    action.clampWhenFinished = true;
                    action.loop = THREE.LoopOnce;
                }
            }
            
            scene.add(model);
            
            resolve({
                model,
                mixer,
                actions,
                activeAction: actions['Walking']
            });
        });
    });
}

// Setup click interactions for the robot model
function setupModelInteractions(canvas, camera, model, mixer, actions, activeAction) {
    canvas.addEventListener('click', (event) => {
        const raycaster = new THREE.Raycaster();
        
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / canvas.clientWidth) * 2 - 1,
            -((event.clientY - rect.top) / canvas.clientHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, camera);
        
        model.updateMatrixWorld();
        const intersects = raycaster.intersectObjects([model], true);
        
        if (intersects.length > 0) {
            // Stop current animation
            if (activeAction) {
                activeAction.stop();
                mixer.stopAllAction();
            }
            
            // Play jump animation
            const jumpAction = actions['Jump'];
            jumpAction.reset();
            jumpAction.setLoop(THREE.LoopOnce, 1);
            jumpAction.clampWhenFinished = true;
            jumpAction.play();
            
            // Return to walking animation after jump completes
            jumpAction.getMixer().addEventListener('finished', () => {
                activeAction = actions['Walking'];
                activeAction.play();
            });
        }
    });
}