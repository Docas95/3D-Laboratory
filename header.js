import * as THREE from 'three';

document.addEventListener('DOMContentLoaded', () =>{
    initMainScene();
})


function initMainScene(){
    // *** Basic three.js set up ***
    const canvas = document.getElementById('c');

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    const camera = new THREE.PerspectiveCamera(
        45,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 14);
    
    // *** Add light ***
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(0, 0, 1);
    scene.add(light);

    // *** Add icosahedron ***
    const icosahedron = createGradientIcosahedron();
    const isMobile = window.innerWidth < 768;
        if (isMobile) {
            icosahedron.scale.set(0.7, 0.7, 0.7);
        }  
    scene.add(icosahedron);

    // *** Animation function ***
    function animation(){
        renderer.render(scene, camera);
        
        icosahedron.rotateX(0.01);
        icosahedron.rotateY(-0.01);

        requestAnimationFrame(animation);
    }
    animation();
}

function createGradientIcosahedron() {
    const geometry = new THREE.IcosahedronGeometry(4, 1);
    const wireframeGeometry = new THREE.IcosahedronGeometry(4.2, 1);
    
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
    
    const mesh = new THREE.Mesh(geometry, material);
    const wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    
    mesh.add(wireframeMesh);
    mesh.rotateX(0.2);
    mesh.rotateY(0.2);
    
    return mesh;
}