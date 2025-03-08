import * as THREE from 'three';

/**
 * Initialize everything when the page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    initMainScene();
    setupHeaderAnimations();
});

/**
 * Set up the falling animation for header elements
 */
function setupHeaderAnimations() {
    const h1 = document.getElementById('header-h1');
    const h2 = document.getElementById('header-h2');
    const h3 = document.getElementById('header-h3');
    
    // Apply falling animation classes
    h1.classList.add('fall-animation');
    h2.classList.add('fall-animation');
    h3.classList.add('fall-animation');
    
    // Set different animation delays
    h1.style.animationDelay = '0.2s';
    h2.style.animationDelay = '0.5s';
    h3.style.animationDelay = '0.8s';
}

/**
 * Initialize the main 3D scene for the header
 */
function initMainScene() {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    const canvas = document.getElementById('header-c');
    const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
    
    // Set initial size
    updateSize();
    
    const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 10;
    
    // Improved resize handler
    function updateSize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        
        return needResize;
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (updateSize()) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
    });
    
    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 0, 1);
    scene.add(light);
    
    // Create gradient icosahedron with wireframe
    const icosahedron = createGradientIcosahedron();
    
    // Adjust size based on screen
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
        icosahedron.scale.set(0.7, 0.7, 0.7);
    }
    
    scene.add(icosahedron);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Check if resize needed on each frame
        updateSize();
        
        icosahedron.rotateX(0.006);
        icosahedron.rotateY(-0.004);
        
        renderer.render(scene, camera);
    }
    
    animate();
}

/**
 * Create icosahedron with color gradient and wireframe
 * @returns {THREE.Mesh} The icosahedron mesh
 */
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