var camera, crosshair, loadcrosshair, scene, renderer, controls, controlsdevice, uniforms,
    numVertices, effect, intersected, intersectedScreens, intersectedTravel, intersectedInfo, intersectedMembers,
    intersectedExit, sky, plane, particleCube, radicalText,
    radicalTextNParticles, researchText, researchTextNParticles, interval, radicallight, researchlight, designlight,
    screen1Light, screen2Light, actualLab, exitIcon, arrowIconGeometry,
    width = window.innerWidth,
    height = window.innerHeight;

var isMobile = false;

var videoMP4, videoOgg, video, videoTexture, video2, videoTexture2, screen1Mesh, screen2Mesh;

var centro, design, research, clever, maker, sillas, comunicacion, pared, cristaleraFrontal, cristaleraEntrada,
    cristaleraAgora, banco, teles, pantalla1;

var tweenLettersIn;

var utils = new LabsUtils();

var clock = new THREE.Clock();
var mouse = new THREE.Vector2();
var raycasterMesas = new THREE.Raycaster();
var raycasterTravel = new THREE.Raycaster();
var raycasterScreens = new THREE.Raycaster();
var raycasterInfo = new THREE.Raycaster();
var raycasterMembers = new THREE.Raycaster();
var raycasterExit = new THREE.Raycaster();

var manager = new THREE.LoadingManager();

var radicalMembers = [
    {name: 'jota', position: {x: -2, y: 0.8, z: -1.1}},
    {name: 'salva', position: {x: -2.9, y: 0.8, z: -1.2}},
    {name: 'sergio', position: {x: -3.2, y: 0.8, z: -1.9}},
    {name: 'alvaro', position: {x: -2.9, y: 0.8, z: -2.7}}
];

var checkstatus = {
    mesas: true,
    infoCard: true,
    members: true,
    travel: true,
    screens: false
};


var membersAdded = false;
var sectionInfoAdded = false;

var planta = new THREE.Object3D();
planta.name = "estructura";
var interactivos = new THREE.Object3D();
interactivos.name = "mesasInteractivas";
var screensGroup = new THREE.Object3D();
screensGroup.name = "screens";
var letrasRadical = new THREE.Object3D();
letrasRadical.name = 'lerasRadical';
var letrasResearch = new THREE.Object3D();
letrasRadical.name = 'letrasResearch';
var letrasDesign = new THREE.Object3D();
letrasRadical.name = 'letrasDesign';
var travelPoints = new THREE.Object3D();
travelPoints.name = 'travelPoints';
var spriteGroup = new THREE.Object3D();
spriteGroup.name = 'spriteGroup';
var membersGroup = new THREE.Object3D();
membersGroup.name = 'members';
var infoGroup = new THREE.Object3D();
infoGroup.name = 'infoGroup';
var exitGroup = new THREE.Object3D();
exitGroup.name = 'exitGroup';

var activeLetters;

var numeroParticulas = 2000;
var disperseParticles = {nParticles: numeroParticulas, path: 'disperse'};
var min = -3, max = 3;
var verticesArray = [];
var particlesAnimation = true;


$(document).ready(function () {
    // startLogoAnim();
    $('#container').addClass('displayOn');
    $('#logoBox').css('display', 'none');
    $('#fireWorks').css('display', 'none');
    initRender();
    animate();
});

$(document).on("keydown", function (e) {
    if (e.keyCode == '38') {
        if (particleCube != undefined) particlesDisperse(radicalTextNParticles, 'radical');
        TweenMax.to(camera, 0.5, {
            fov: "-=5", onUpdate: function () {
                camera.updateProjectionMatrix();
            }
        });

    }
    else if (e.keyCode == '40') {
        if (particleCube != undefined) particlesDisperse(researchTextNParticles, 'research');
        removeLetters3D();
        setTimeout(function () {
            moveLetters3d(letrasResearch);
        }, 100);
    }
    else if (e.keyCode == '37') {
        if (particleCube != undefined) particlesDisperse(2000, 'disperse');
        removeLetters3D();
    }
    else if (e.keyCode == '39') {
        if (particleCube != undefined) particlesDisperse(researchTextNParticles, 'research');
        removeLetters3D();
        setTimeout(function () {
            moveLetters3d(letrasDesign);
        }, 100);
    }
});

function initRender() {

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true, alpha: true});
    renderer.sortObjects = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff, 0);
    renderer.setViewport(0, 0, width, height);
    renderer.getMaxAnisotropy();

    element = renderer.domElement;

    var container = document.getElementById('container');
    container.appendChild(element);

    camera = new THREE.PerspectiveCamera(60, (width / height), 0.01, 10000000);
    camera.position.set(-0.8, 1.1, -0.8);

    Reticulum.init(camera, utils.reticulumDefaultConfig);

    scene.add(camera);

    if (window.DeviceOrientationEvent && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        isMobile = true;
        console.log('navigator: ', navigator);
        console.log("Oriented device");
        effect = new THREE.StereoEffect(renderer);
        effect.setSize(window.innerWidth, window.innerHeight);
        effect.setEyeSeparation = 0.5;

        controls = new THREE.OrbitControls(camera, element);
        controls.target.set(
            camera.position.x + 0.1,
            camera.position.y,
            camera.position.z
        );

        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }

            controls = new THREE.DeviceOrientationControls(camera, true);
            controls.connect();
            controls.update();

            element.addEventListener('click', fullscreen, false);

            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }

        window.addEventListener('deviceorientation', setOrientationControls, true);

        controlsdevice = new THREE.DeviceOrientationControls(camera, true);
        controlsdevice.connect();


    } else {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.70;
        controls.enableZoom = false;
        controls.target.set(camera.position.x, camera.position.y, camera.position.z + 0.5);
    }
    addTravelPoints();

    ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.position.set(0, 0.6, 0);
    scene.add(ambientLight);

    radicallight = new THREE.PointLight(0xffee66, 0, 2.5, 1);
    radicallight.position.set(-2.5, 0.8, -2);
    scene.add(radicallight);

    if (!isMobile) {
        researchlight = new THREE.PointLight(0xff9999, 0, 2.5, 1);
        researchlight.position.set(-2.5, 0.8, 0.5);
        scene.add(researchlight);

        designlight = new THREE.PointLight(0x9999ff, 0, 2.5, 1);
        designlight.position.set(-2.5, 0.8, 2.5);
        scene.add(designlight);

        screen1Light = new THREE.PointLight(0xffffff, 0, 1, 1);
        screen1Light.position.set(-0.4, 1.1, 0.74);
        scene.add(screen1Light);

        screen2Light = new THREE.PointLight(0xffffff, 0, 1, 1);
        screen2Light.position.set(-0.4, 1.1, 4.15);
        scene.add(screen2Light);
    }

    buildShape();

    window.addEventListener('resize', onWindowResize, false);
    if (!isMobile) {
        document.addEventListener('mousemove', onDocumentMouseMove, false);
    }
    if (!isMobile) {
        document.addEventListener('mousedown', onDocumentMouseDown, false);
    }
    $(document).on({
        'touchstart': function () {
            console.log('detecta touch');
            video.play();
            video2.play();
            video.pause();
            video2.pause();
        }
    });
}

function buildShape() {

    var skyGeometry = new THREE.SphereGeometry(10, 32, 32);
    var skyMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('images/sky2.jpg'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
        color: 0xFFFFFF,
        depthWrite: true
    });
    sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.renderOrder = 0;
    sky.rotation.y = 1.7;
    sky.name = "sky";

    scene.add(sky);

    addModel();
}

function particlesDisperse(Particles, path) {
    if (disperseParticles.path != path && particleCube != undefined) {
        if (path != 'disperse') reorderParticles(disperseParticles.nParticles, 'disperse');
        setTimeout(function () {
            reorderParticles(Particles, path)
        }, 100);
    }
}

function reorderParticles(Particles, path) {
    if (path == 'radical') {
        if (!particlesAnimation) {
            particleCube.position.set(-2.7, 1, -2.1);
            particleCube.lookAt(camera.position);
            particleCube.geometry.vertices = radicalText.vertices;
            disperseParticles = {nParticles: Particles, path: 'radical'};
        } else if (particlesAnimation) {
            movement({x: -2.7, y: 1, z: -2.1}, particleCube.position, 0, 500, TWEEN.Easing.Back.Out);
            setTimeout(function () {
                particleCube.lookAt(camera.position);
            }, 100);
            for (var a = 0; a < Particles; a++) {
                movement({
                    x: radicalText.vertices[a].x,
                    y: radicalText.vertices[a].y,
                    z: radicalText.vertices[a].z
                }, particleCube.geometry.vertices[a], 0.1 * a, 1000, TWEEN.Easing.Back.Out);
                if (a == Particles - 1) disperseParticles = {nParticles: Particles, path: 'radical'};
            }
        }
    } else if (path == 'research') {
        if (!particlesAnimation) {
            particleCube.position.set(-2.7, 1, 1);
            particleCube.lookAt(camera.position);
            particleCube.geometry.vertices = researchText.vertices;
            disperseParticles = {nParticles: Particles, path: 'research'};
        } else if (particlesAnimation) {
            movement({x: -2.7, y: 1, z: 1}, particleCube.position, 0, 500, TWEEN.Easing.Back.Out);
            setTimeout(function () {
                particleCube.lookAt(camera.position);
            }, 100);
            for (var a = 0; a < Particles; a++) {
                movement({
                    x: researchText.vertices[a].x,
                    y: researchText.vertices[a].y,
                    z: researchText.vertices[a].z
                }, particleCube.geometry.vertices[a], 0.1 * a, 1000, TWEEN.Easing.Back.Out);
                if (a == Particles - 1) disperseParticles = {nParticles: Particles, path: 'research'};
            }
        }
    } else if (path == 'disperse') {
        if (!particlesAnimation) {
            particleCube.position.set(0, 0, 0);
            particleCube.geometry.vertices = verticesArray;
            disperseParticles = {nParticles: numeroParticulas, path: 'disperse'};
        } else if (particlesAnimation) {
            movement({x: 0, y: 0, z: 0}, particleCube.position, 0, 500, TWEEN.Easing.Back.Out);
            setTimeout(function () {
                particleCube.lookAt(camera.position);
            }, 100);
            for (var a = 0; a < Particles; a++) {
                movement({
                    x: verticesArray[a].x,
                    y: verticesArray[a].y,
                    z: verticesArray[a].z
                }, particleCube.geometry.vertices[a], 0.1 * a, 1000, TWEEN.Easing.Back.Out);
                if (a == Particles - 1) disperseParticles = {nParticles: numeroParticulas, path: 'disperse'};
            }
        }
    }
}

function addModel() {

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            //console.log(percentComplete);
            if (percentComplete == 100) {
                console.log('model loaded!!');
                setTimeout(function () {
                    addLetters3D(['R', 'a', 'd', 'i', 'c', 'a', 'l'], {x: -2.7, y: 1, z: -1.7}, letrasRadical);
                    addLetters3D(['R', 'e', 's', 'e', 'a', 'r', 'c', 'h'], {x: -2.7, y: 1, z: 1}, letrasResearch);
                    addLetters3D(['D', 'e', 's', 'i', 'g', 'n'], {x: -2.7, y: 1, z: 3}, letrasDesign);

                    addScreens();

                }, 1000);
            }
        }
    };
    var onError = function (xhr) {
    };

    THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath('models/vrLabsModel/');
    mtlLoader.load('planta6.mtl', function (materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath('models/vrLabsModel/');
        objLoader.load('planta6.obj', function (elements) {

            techo = elements.children[13];
            techo.renderOrder = 0;
            techo.name = "techo";

            planta.add(techo);

            banco = elements.children[12];
            banco.renderOrder = 0;
            banco.name = "banco";

            planta.add(banco);

            cristaleraEntrada = elements.children[11];
            cristaleraEntrada.renderOrder = 1;
            cristaleraEntrada.name = "cristaleraEntrada";

            planta.add(cristaleraEntrada);

            pared = elements.children[10];
            pared.renderOrder = 0;
            pared.name = "pared";

            planta.add(pared);

            cristaleraAgora = elements.children[9];
            cristaleraAgora.renderOrder = 1;
            cristaleraAgora.name = "cristaleraAgora";

            planta.add(cristaleraAgora);

            centro = elements.children[8];
            centro.renderOrder = 0;
            centro.name = "centro";

            interactivos.add(centro);

            research = elements.children[7];
            research.renderOrder = 0;
            research.name = "research";

            interactivos.add(research);

            design = elements.children[6];
            design.renderOrder = 0;
            design.name = "design";

            interactivos.add(design);

            comunicacion = elements.children[5];
            comunicacion.renderOrder = 0;
            comunicacion.name = "comunicacion";

            interactivos.add(comunicacion);

            clever = elements.children[4];
            clever.renderOrder = 0;
            clever.name = "clever";

            interactivos.add(clever);

            cristaleraFrontal = elements.children[3];
            cristaleraFrontal.renderOrder = 2;
            cristaleraFrontal.name = "cristaleraFrontal";

            planta.add(cristaleraFrontal);

            sillas = elements.children[2];
            sillas.renderOrder = 0;
            sillas.name = "sillas";

            planta.add(sillas);

            teles = elements.children[1];
            teles.renderOrder = 0;
            teles.name = "teles";

            planta.add(teles);

            maker = elements.children[0];
            maker.renderOrder = 0;
            maker.name = "maker";

            interactivos.add(maker);

            scene.add(planta);
            scene.add(interactivos);

            Reticulum.add( interactivos, {
                fuseDuration: utils.reticleDurations.medium,
                fuseColor: utils.reticleColors.blue.dark,
                reticleHoverColor: utils.reticleColors.basic,
                fuseVisible: true,
                onGazeOver: function(){
                  changeScaleSingle(object, utils.objectScale.big);
                },
                onGazeOut: function(){
                  changeScaleSingle(object, utils.objectScale.normal);
                },
                onGazeLong: function(){
                  console.log("gaze on");
                }
              });

        }, onProgress, onError);
    });
}

function addExitIcon(position) {
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath('models/');
    objLoader.load('exitModel.obj', function (elements) {
        console.log('icono exit: ', elements);
        var exitMaterial = new THREE.MeshBasicMaterial({color: 0xffdd44});
        exitIcon = new THREE.Mesh(elements.children[0].geometry, exitMaterial);
        exitIcon.position.set(position.x, position.y + 1, position.z);
        //exitIcon.position.set(-2.5, 0.8, -2);
        exitIcon.scale.set(0.1, 0.2, 0.2);
        exitGroup.add(exitIcon);
        scene.add(exitGroup);
        movement({y: position.y}, exitIcon.position, 300, 1000, TWEEN.Easing.Back.Out);
    });

}

function addLetters3D(lettersArray, position, object) {
    var loader = new THREE.FontLoader();
    loader.load('scene/fonts/droid_sans_bold.typeface.js', function (font) {
        for (var a = 0; a < lettersArray.length; a++) {
            var radicalTextModel = new THREE.TextGeometry(lettersArray[a], {
                font: font,
                size: 0.1,
                height: 0.01,
                curveSegments: 3,
                bevelEnabled: true,
                bevelThickness: 0.01,
                bevelSize: 0.01
            });
            var materialFront = new THREE.MeshBasicMaterial({color: 0xffdd44});
            var materialSide = new THREE.MeshBasicMaterial({color: 0x333333});
            var materialArray = [materialFront, materialSide];
            var textMaterial = new THREE.MeshFaceMaterial(materialArray);
            var radicalTextMesh = new THREE.Mesh(radicalTextModel, textMaterial);
            radicalTextMesh.position.x = 0.1 * a;
            radicalTextMesh.position.y = -2;
            radicalTextModel.computeBoundingBox();
            object.add(radicalTextMesh);
        }
    });
    object.position.set(position.x, position.y, position.z);
    object.lookAt(camera.position);
    object.name = 'letras3D';
    scene.add(object);
}

function addParticleSystem() {
    var loader = new THREE.FontLoader();
    loader.load('scene/fonts/droid_sans_bold.typeface.js', function (font) {
        radicalText = new THREE.TextGeometry('CreativeTech + UX + Mobility', {
            font: font,
            size: 0.1,
            height: 0,
            curveSegments: 1
        });
        researchText = new THREE.TextGeometry('Research', {
            font: font,
            size: 0.1,
            height: 0,
            curveSegments: 1
        });
        var modifier = new THREE.SubdivisionModifier(1);
        modifier.modify(radicalText);
        modifier.modify(researchText);
        radicalTextNParticles = radicalText.vertices.length;
        researchTextNParticles = researchText.vertices.length;
    });
    var boxGeometry = new THREE.Geometry();
    for (var p = 0; p < numeroParticulas; p++) {
        var pX = Math.random() * (max - min + 1) + min,
            pY = Math.random() * (max - min + 1) + min,
            pZ = Math.random() * (max - min + 1) + min,
            particle = new THREE.Vector3(pX, pY, pZ);
        verticesArray.push({x: pX, y: pY, z: pZ});
        boxGeometry.vertices.push(particle);
    }
    var particleMaterial = new THREE.ParticleBasicMaterial({
        size: 0.02,
        color: 0x333333,
        transparency: true,
        opacity: 0.5
    });
    particleCube = new THREE.Points(boxGeometry, particleMaterial);
    particleCube.position.set(0, 0, 0);
    scene.add(particleCube);
}

function addScreens() {

    videoMP4 = document.createElement('video').canPlayType('video/mp4') !== '';
    videoOgg = document.createElement('video').canPlayType('video/ogg') !== '';

    var url, url2;
    if (videoMP4) {
        url = 'videos/bots.mp4';
        url2 = 'videos/vr_ar.mp4';
        console.log('play mp4');
    } else if (videoOgg) {
        url = 'videos/bots.ogv';
        url2 = 'videos/vr_ar.mp4';
        console.log('play ogg');
    } else alert('cant play mp4 or ogv');

    videoTexture = new THREEx.VideoTexture(url);
    video = videoTexture.video;

    videoTexture2 = new THREEx.VideoTexture(url2);
    video2 = videoTexture2.video;

    video.pause();
    video2.pause();

    var screen1Geometry = new THREE.PlaneGeometry(0.4, 0.25, 1, 1);
    var screen1Material = new THREE.MeshBasicMaterial({
        map: videoTexture.texture,
        overdraw: true,
        side: THREE.DoubleSide
    });
    screen1Mesh = new THREE.Mesh(screen1Geometry, screen1Material);
    screen1Mesh.position.set(-0.225, 1.13, 0.74);
    screen1Mesh.rotateY(-Math.PI / 2);
    screen1Mesh.name = 'screen1';

    var screen2Geometry = new THREE.PlaneGeometry(0.4, 0.25, 1, 1);
    var screen2Material = new THREE.MeshBasicMaterial({
        map: videoTexture2.texture,
        overdraw: true,
        side: THREE.DoubleSide
    });
    var screen2mesh = new THREE.Mesh(screen2Geometry, screen2Material);
    screen2mesh.position.set(-0.225, 1.13, 4.15);
    screen2mesh.rotateY(-Math.PI / 2);
    screen2mesh.name = 'screen2';

    screensGroup.add(screen1Mesh);
    screensGroup.add(screen2mesh);

    scene.add(screensGroup);
    $("#allowVideo").css('display', 'block');
}


function changeScale(object, scaleX, scaleY, scaleZ) {
    object.scale.set(scaleX, scaleY, scaleZ);
}

function changeScaleSingle(object, scale) {
    changeScale(object, scale, scale, scale);
}

function addTravelPoints() {
    var locationPoints = [{x: -0.7, y: 1.4, z: -5.5}, {x: -2, y: 1.4, z: 2.5}, {x: -0.8, y: 1.4, z: -0.5}];
    var namePoints = ['makerPoint', 'tvPoint', 'labsPoint'];
    var objLoader = new THREE.OBJLoader();
    objLoader.setPath('models/');
    objLoader.load('arrow.obj', function (elements) {
        console.log('icono exit: ', elements);
        arrowIconGeometry = elements.children[0].geometry;

        for (var a = 0; a < locationPoints.length; a++) {
            var geometry = arrowIconGeometry;
            var material = new THREE.MeshBasicMaterial({color: 0xffdd44});
            var cube = new THREE.Mesh(geometry, material);
            cube.position.set(locationPoints[a].x, locationPoints[a].y, locationPoints[a].z);
            cube.name = namePoints[a];
            travelPoints.add(cube);
            scene.add(travelPoints);
        }
    });
}

function addMembers(members) {
    checkstatus.mesas = false;
    setTimeout(function () {
        for (var a = 0; a < members.length; a++) {
            var map = new THREE.TextureLoader().load("images/membersPhoto/circular/" + members[a].name + ".png");
            var material = new THREE.SpriteMaterial({map: map, color: 0xffffff, fog: true});
            var sprite = new THREE.Sprite(material);
            sprite.position.set(members[a].position.x, members[a].position.y - 2, members[a].position.z);
            sprite.name = members[a].name;
            sprite.scale.set(0.6, 0.6, 0.6);
            membersGroup.add(sprite);
            movement({y: members[a].position.y}, sprite.position, 300 * a, 500, TWEEN.Easing.Back.Out);
        }
        membersAdded = true;
        scene.add(membersGroup);
    }, 2000);
}

function removeMembers() {
    var nummemberActually = membersGroup.children.length;
    for (var a = 0; a < nummemberActually; a++) {
        movement({y: -1}, membersGroup.children[a].position, 0, 500, TWEEN.Easing.Back.In);
        if (a == nummemberActually - 1) {
            membersGroup = new THREE.Object3D();
            membersGroup.name = 'members';
            membersAdded = false;
        }
    }
}

function addInfoSection(images, name, timeout) {
    sectionInfoAdded = true;
    if (infoGroup.children.length > 0) {
        hideInfo();
    }

    setTimeout(function () {
        scene.remove(infoGroup);
        infoGroup = new THREE.Object3D();
        infoGroup.name = 'infoGroup';
        for (var a = 0; a < 3; a++) {
            var texture = THREE.ImageUtils.loadTexture("images/sectionInfo/info/" + images[a] + ".png");
            var geometry = new THREE.PlaneGeometry(1, 0.6, 1);
            var material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 1,
                color: 0xffffff
            });
            var plane = new THREE.Mesh(geometry, material);
            plane.name = name;
            infoGroup.add(plane);
        }
        infoGroup.position.set(-2.3, 0.35 - 2, -1.95);
        infoGroup.rotation.y = Math.PI / 2;
        movement({y: 0.35}, infoGroup.position, 1, 500, TWEEN.Easing.Back.Out);
        scene.add(infoGroup);
    }, timeout);

}

function openInfo() {
    checkstatus.members = false;
    checkstatus.infoCard = false;
    movement({y: 1}, infoGroup.position, 1, 500, TWEEN.Easing.Back.Out);
    movement({x: -1.8}, infoGroup.position, 1, 500, TWEEN.Easing.Quartic.Out);
    setTimeout(function () {
        movement({x: 1}, infoGroup.children[1].position, 1, 1000, TWEEN.Easing.Quartic.Out);
        movement({x: -1}, infoGroup.children[2].position, 1, 1000, TWEEN.Easing.Quartic.Out);
    }, 700);
    setTimeout(function () {
        movement({x: 0.77}, infoGroup.children[1].position, 1, 1000, TWEEN.Easing.Quartic.Out);
        movement({y: -1}, infoGroup.children[1].rotation, 1, 1000, TWEEN.Easing.Quartic.Out);
        movement({z: 0.42}, infoGroup.children[1].position, 1, 1000, TWEEN.Easing.Quartic.Out);
        movement({x: -0.77}, infoGroup.children[2].position, 1, 1000, TWEEN.Easing.Quartic.Out);
        movement({y: 1}, infoGroup.children[2].rotation, 1, 1000, TWEEN.Easing.Quartic.Out);
        movement({z: 0.42}, infoGroup.children[2].position, 1, 1000, TWEEN.Easing.Quartic.Out);
        addExitIcon({x: -1.7, y: 0.5, z: -1.95});
    }, 1700);
}

function hideInfo() {
    checkstatus.members = true;
    checkstatus.infoCard = true;
    if (exitGroup.children.length > 0) movement({y: exitIcon.position.y - 1}, exitIcon.position, 1, 500, TWEEN.Easing.Quartic.Out);
    if (infoGroup.children[1].position.x > 0) movement({x: 1}, infoGroup.children[1].position, 1, 1000, TWEEN.Easing.Quartic.Out);
    movement({y: 0}, infoGroup.children[1].rotation, 1, 1000, TWEEN.Easing.Quartic.Out);
    movement({z: -0.01}, infoGroup.children[1].position, 1, 1000, TWEEN.Easing.Quartic.Out);
    if (infoGroup.children[2].position.x < 0) movement({x: -1}, infoGroup.children[2].position, 1, 1000, TWEEN.Easing.Quartic.Out);
    movement({y: 0}, infoGroup.children[2].rotation, 1, 1000, TWEEN.Easing.Quartic.Out);
    movement({z: 0.01}, infoGroup.children[2].position, 1, 1000, TWEEN.Easing.Quartic.Out);
    setTimeout(function () {
        movement({x: 0}, infoGroup.children[1].position, 1, 1000, TWEEN.Easing.Quartic.Out);
        movement({x: 0}, infoGroup.children[2].position, 1, 1000, TWEEN.Easing.Quartic.Out);
    }, 1000)
    setTimeout(function () {
        movement({y: 0.35}, infoGroup.position, 500, 500, TWEEN.Easing.Back.Out);
        movement({x: -2.3}, infoGroup.position, 0, 500, TWEEN.Easing.Quartic.Out);
        scene.remove(exitGroup);
    }, 2200);
}

function removeInfoSection() {
    hideInfo();
    movement({y: -1}, infoGroup.position, 1200, 500, TWEEN.Easing.Back.In);
    setTimeout(function () {
        scene.remove(infoGroup);
        infoGroup = new THREE.Object3D();
        infoGroup.name = 'infoGroup';
        sectionInfoAdded = false;
    }, 1300);
}

function explodeGeometry() {
    for (var a = 0; a < numVertices; a += 3) {
        var number = Math.random() * (1 - 4) + 1;
        //cylinder.geometry.vertices[ a ].multiplyScalar( 0.3 );
        //cylinder.geometry.vertices[ a+1 ].multiplyScalar( 0.3 );
        //cylinder.geometry.vertices[ a+2 ].multiplyScalar( 0.3 );
        cylinder.geometry.vertices[a].z += 0.1;
        cylinder.geometry.vertices[a + 1].z += 0.1;
        cylinder.geometry.vertices[a + 2].z += 0.1;
        //cylinder.geometry.vertices[ THREE.Math.randInt( 0, cylinder.geometry.vertices.length ) ].multiplyScalar( 1.01 );
        cylinder.geometry.verticesNeedUpdate = true; // important
    }
}

function moveLetters3d(object, prevObject) {
    for (var a = 0; a < 12; a++) {
        if (prevObject != undefined && prevObject.children[a]) new TWEEN.Tween(prevObject.children[a].position).to({y: -1.5}, 100).easing(TWEEN.Easing.Quartic.Out).onUpdate(function () {
        }).delay(10 * a).start();
        if (object != undefined && object.children[a]) new TWEEN.Tween(object.children[a].position).to({y: 0.2}, 100).easing(TWEEN.Easing.Back.Out).onUpdate(function () {
        }).delay(10 * a).start();
    }
    if (object != undefined) object.lookAt(camera.position);
}

function removeLetters3D(object) {
    if (object != undefined) {
        for (var a = 0; a < object.children.length; a++) {
            if (tweenLettersIn != undefined) tweenLettersIn.stop();
            //if( activeLetters != undefined ) tweenLettersOut = new TWEEN.Tween(activeLetters.children[a].position).to({ y: -1 }, 200).easing(TWEEN.Easing.Quartic.Out).onUpdate(function () {}).delay( 50 * a).start();
            new TWEEN.Tween(object.children[a].position).to({y: -1.5}, 100).easing(TWEEN.Easing.Quartic.Out).onUpdate(function () {
            }).delay(50 * a).start();
        }
    }
    //clearInterval(interval);
}

function onDocumentMouseMove(event) {
    //event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
    //-------------- SCREEN INTERSECTION ---------------------
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(screensGroup.children);
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
    }
    else document.body.style.cursor = 'auto';
    //-------------- TRAVEL POINTS INTERSECTION ---------------------
    var raycasterTravel = new THREE.Raycaster();
    raycasterTravel.setFromCamera(mouse, camera);
    var intersectTravel = raycasterTravel.intersectObjects(travelPoints.children);
   
    //-------------- MESAS INTERSECTION ---------------------

    if (checkstatus.mesas) {
        var raycasterMesas = new THREE.Raycaster();
        raycasterMesas.setFromCamera(mouse, camera);
        var intersections = raycasterMesas.intersectObjects(interactivos.children);
        if (intersections.length > 0) {
            if (intersected != intersections[0].object) {
                intersected = intersections[0].object;
                if (intersected.name == 'centro') {
                    moveLetters3d(letrasRadical, activeLetters);
                    if (particleCube != undefined) particlesDisperse(radicalTextNParticles, 'radical');
                    if (letrasRadical.children.length > 0) {
                        setTimeout(function () {
                            activeLetters = letrasRadical;
                        }, 100);
                    }
                }
                else if (intersections[0].object.name == 'design') {
                    moveLetters3d(letrasDesign, activeLetters);
                    if (particleCube != undefined) console.log(intersections[0].object.name);
                    if (letrasDesign.children.length > 0) {
                        setTimeout(function () {
                            activeLetters = letrasDesign;
                        }, 100);
                    }
                }
                else if (intersections[0].object.name == 'research') {
                    moveLetters3d(letrasResearch, activeLetters);
                    if (particleCube != undefined) particlesDisperse(researchTextNParticles, 'radical');
                    if (letrasResearch.children.length > 0) {
                        setTimeout(function () {
                            activeLetters = letrasResearch;
                        }, 100);
                    }
                }
            }
            document.body.style.cursor = 'pointer';
        }
        else if (intersected) {
            moveLetters3d(undefined, activeLetters);
            if (particleCube != undefined) particlesDisperse(2000, 'disperse');
            intersected = null;
            document.body.style.cursor = 'auto';
        }
    }
    //----------- PANEL INFO INTERSECTIONS ---------
    if (checkstatus.infoCard) {
        raycasterInfo.setFromCamera(mouse, camera);
        var intersectInfo = raycasterTravel.intersectObjects(infoGroup.children);
        if (intersectInfo.length > 0) {
            document.body.style.cursor = 'pointer';
        }
    }
    /*else {
     document.body.style.cursor = 'auto';
     }*/

    //---------------------------------------------
    //---------------------- MEMBERS GROUP --------------------------------------

    raycasterMembers.setFromCamera(mouse, camera);
    var intersectMembers = raycasterTravel.intersectObjects(membersGroup.children);
    if (intersectMembers.length > 0) {
        document.body.style.cursor = 'pointer';
    }

    //------------------------------------------------------------------------
    //---------------------- EXIT --------------------------------------------

    raycasterExit.setFromCamera(mouse, camera);
    var intersectExit = raycasterExit.intersectObjects(exitGroup.children);
    if (intersectExit.length > 0) {
        if (intersectedExit != intersectExit[0].object) {
            intersectedExit = intersectExit[0].object;
            exitIcon.material.color.setHex(0x00ff00);
        }
        else if (intersectedExit) {
            intersectedExit = null;
            exitIcon.material.color.setHex(0xffdd44);
        }
        document.body.style.cursor = 'pointer';
    }

    //------------------------------------------------------------------------
}

function onDocumentMouseDown(e) {
    //e.preventDefault();

    //-------------- SCREEN INTERACTION ---------------------
    if (checkstatus.screens) {
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(screensGroup.children);
        if (intersects.length > 0) {
            if (intersected != intersects[0].object) {
                intersected = intersects[0].object;
                if (intersected.name == 'screen1') {
                    if (video != undefined) {
                        video2.pause();
                        video.play();
                        movement({
                            x: intersected.position.x,
                            y: intersected.position.y,
                            z: intersected.position.z
                        }, controls.target, 0, 1000, TWEEN.Easing.Quartic.Out);
                        movement({
                            x: intersected.position.x - 0.3,
                            y: intersected.position.y,
                            z: intersected.position.z
                        }, camera.position, 0, 1000, TWEEN.Easing.Quartic.Out);
                    }
                }
                if (intersected.name == 'screen2') {
                    if (video2 != undefined) {
                        video.pause();
                        video2.play();
                        movement({
                            x: intersected.position.x,
                            y: intersected.position.y,
                            z: intersected.position.z
                        }, controls.target, 0, 1000, TWEEN.Easing.Quartic.Out);
                        movement({
                            x: intersected.position.x - 0.3,
                            y: intersected.position.y,
                            z: intersected.position.z
                        }, camera.position, 0, 1000, TWEEN.Easing.Quartic.Out);
                    }
                }
                ;
                console.log('inters ', intersected);
            }
        }
    }
    //----------------------------------------------
    if (checkstatus.mesas) {
        raycasterMesas.setFromCamera(mouse, camera);
        var intersections = raycasterMesas.intersectObjects(interactivos.children);
        if (intersections.length > 0) {
            if (intersections[0].object.name == 'centro') {
                if (!membersAdded) {
                    addMembers(radicalMembers);
                }
                else if (infoGroup.children.length > 0 && actualLab != 'centro') {
                    removeMembers();
                    removeInfoSection();
                }
                actualLab = 'centro';
                checkstatus.screens = false;
                movement({intensity: 2}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({x: -0.6, y: 1.1, z: -2}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out);
               
                if (controls) movement({x: -0.7, y: 1.1, z: -2}, controls.target, 0, 2000, TWEEN.Easing.Quartic.Out);
            }
            else if (intersections[0].object.name == 'design') {
                if (infoGroup.children.length > 0) {
                    removeMembers();
                    removeInfoSection();
                }
                actualLab = 'design';
                movement({intensity: 2}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({x: -0.6, y: 1.1, z: 2.5}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out);
                if (controls) movement({x: -0.7, y: 1.1, z: 2.5}, controls.target, 0, 2000, TWEEN.Easing.Quartic.Out);
            }
            else if (intersections[0].object.name == 'research') {
                if (infoGroup.children.length > 0) {
                    removeMembers();
                    removeInfoSection();
                }
                actualLab = 'research';
                movement({intensity: 2}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({x: -0.6, y: 1.1, z: 0.8}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out);
                if (controls) movement({x: -0.7, y: 1.1, z: 0.8}, controls.target, 0, 2000, TWEEN.Easing.Quartic.Out);
            }
        }
    }
    //--------------- TRAVEL POINTS INTERSECT ------------------
    if (checkstatus.travel) {
        raycasterTravel.setFromCamera(mouse, camera);
        var intersectTravel = raycasterTravel.intersectObjects(travelPoints.children);
        if (intersectTravel.length > 0) {
            movement({
                x: intersectedTravel.position.x,
                y: 1.1,
                z: intersectedTravel.position.z
            }, camera.position, 0, 3000, TWEEN.Easing.Quartic.Out);
            movement({
                x: intersectedTravel.position.x - 2,
                y: 1.1,
                z: intersectedTravel.position.z
            }, camera.position, 3500, 1000, TWEEN.Easing.Quartic.Out);
            if (!checkstatus.mesas) checkstatus.mesas = true;
            if (intersectedTravel.name == 'makerPoint') {
                if (infoGroup.children.length > 0) {
                    removeMembers();
                    removeInfoSection();
                }
                checkstatus.screens = false;
                if (controls) {
                    movement({
                        x: intersectedTravel.position.x - 0.1,
                        y: 1.1,
                        z: intersectedTravel.position.z
                    }, controls.target, 0, 3000, TWEEN.Easing.Quartic.Out);
                }
                movement({intensity: 0}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            }
            if (intersectedTravel.name == 'labsPoint') {
                if (infoGroup.children.length > 0) {
                    removeMembers();
                    removeInfoSection();
                }
                checkstatus.screens = false;
                if (controls) movement({
                    x: intersectedTravel.position.x - 0.1,
                    y: 1.1,
                    z: intersectedTravel.position.z
                }, controls.target, 0, 3000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            }
            if (intersectedTravel.name == 'tvPoint') {
                if (infoGroup.children.length > 0) {
                    removeMembers();
                    removeInfoSection();
                }
                checkstatus.screens = true;
                if (controls) movement({
                    x: intersectedTravel.position.x + 0.1,
                    y: 1.1,
                    z: intersectedTravel.position.z
                }, controls.target, 0, 3000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
                movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
                setTimeout(function () {
                    movement({intensity: 10}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                    movement({intensity: 10}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
                }, 2000);
            }
        }
    }
    //-----------------------------------------------------------------------
    //-----------------------INFO GROUP ----------------------------------
    if (checkstatus.infoCard) {
        raycasterInfo.setFromCamera(mouse, camera);
        var intersectInfo = raycasterTravel.intersectObjects(infoGroup.children);
        if (intersectInfo.length > 0) {
            if (infoGroup.position.y < 0.7) {
                openInfo();
            }
        }
    }

    //------------------------------------------------------------------------
    //---------------------- MEMBERS GROUP --------------------------------------
    if (checkstatus.members) {
        raycasterMembers.setFromCamera(mouse, camera);
        var intersectMembers = raycasterTravel.intersectObjects(membersGroup.children);
        if (intersectMembers.length > 0) {
            //if (intersectMembers[0].object.name == 'sergio') addInfoSection(sergioInfoImages, 'sergio', 300);
        }
    }

    //------------------------------------------------------------------------
    //---------------------- EXIT --------------------------------------------

    raycasterExit.setFromCamera(mouse, camera);
    var intersectExit = raycasterExit.intersectObjects(exitGroup.children);
    if (intersectExit.length > 0) {
        hideInfo();
    }

    //------------------------------------------------------------------------
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (effect != undefined) effect.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

    setTimeout(function () {
        requestAnimationFrame(animate);

    }, 1000 / 30);

    render();

    TWEEN.update();

    if (controls) controls.update(clock.getDelta());
    if (controlsdevice) {
        controlsdevice.update();
        /*console.log('device control: ', controlsdevice.deviceOrientation.gamma);*/
    }
}

function render() {
    Reticulum.update();

    if (effect) {
        try {
            effect.render(scene, camera);
        } catch (TypeError) {
            // console.log('TypeError');
        }
    }
    else {
        renderer.render(scene, camera);
    }

    sky.rotation.y += 0.0003;

    if (particleCube != undefined) {
        particleCube.geometry.verticesNeedUpdate = true;
        /*particleCube.lookAt( camera.position );*/
    }

    if (videoTexture != undefined) videoTexture.update();

    if (videoTexture2 != undefined) videoTexture2.update();

    if (travelPoints.children[0]) travelPoints.children[0].rotation.y += 0.01;
    if (travelPoints.children[1]) travelPoints.children[1].rotation.y += 0.01;
    if (travelPoints.children[2]) travelPoints.children[2].rotation.y += 0.01;

    //------------ MESAS INTERSECT -----------------------------

}

function movement(value, object, delay, duration, easingType) {
    //var easingType = TWEEN.Easing.Back.Out;
    var tween = new TWEEN.Tween(object)
        .to(value, duration)
        .easing(easingType)
        .onUpdate(function () {
        })
        .delay(delay)
        .start();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
    console.log("Latitude: " + position.coords.latitude +
        "Longitude: " + position.coords.longitude);
}

//getLocation();

