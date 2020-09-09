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
letrasResearch.name = 'letrasResearch';
var letrasDesign = new THREE.Object3D();
letrasDesign.name = 'letrasDesign';
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

function addModel() {

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
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
            techo = elements.children[12];
            techo.renderOrder = 0;
            techo.name = "techo";

            planta.add(techo);

            banco = elements.children[11];
            banco.renderOrder = 0;
            banco.name = "banco";

            planta.add(banco);

            cristaleraEntrada = elements.children[10];
            cristaleraEntrada.renderOrder = 1;
            cristaleraEntrada.name = "cristaleraEntrada";

            planta.add(cristaleraEntrada);

            pared = elements.children[9];
            pared.renderOrder = 0;
            pared.name = "pared";

            planta.add(pared);

            cristaleraAgora = elements.children[8];
            cristaleraAgora.renderOrder = 1;
            cristaleraAgora.name = "cristaleraAgora";

            planta.add(cristaleraAgora);

            centro = elements.children[7];
            centro.renderOrder = 0;
            centro.name = "centro";

            interactivos.add(centro);

            research = elements.children[6];
            research.renderOrder = 0;
            research.name = "research";

            interactivos.add(research);

            design = elements.children[5];
            design.renderOrder = 0;
            design.name = "design";

            interactivos.add(design);

            comunicacion = elements.children[4];
            comunicacion.renderOrder = 0;
            comunicacion.name = "comunicacion";

            interactivos.add(comunicacion);

            clever = elements.children[3];
            clever.renderOrder = 0;
            clever.name = "clever";

            interactivos.add(clever);

            cristaleraFrontal = elements.children[2];
            cristaleraFrontal.renderOrder = 2;
            cristaleraFrontal.name = "cristaleraFrontal";

            planta.add(cristaleraFrontal);

            sillas = elements.children[1];
            sillas.renderOrder = 0;
            sillas.name = "sillas";

            planta.add(sillas);

            teles = elements.children[0];
            teles.renderOrder = 0;
            teles.name = "teles";

            planta.add(teles);

            scene.add(planta);
            scene.add(interactivos);

            interactivos.children.map(function(interactiveObject) {
                Reticulum.add( interactiveObject, {
                    fuseDuration: utils.reticleDurations.medium,
                    fuseColor: utils.reticleColors.yellow.dark,
                    reticleHoverColor: utils.reticleColors.pink,
                    fuseVisible: true,
                    onGazeOver: function(){
                        moveLetters3d(interactiveObject.name, activeLetters);
                    },
                    onGazeOut: function(){
                        removeLetters3D(interactiveObject.name);
                    },
                    onGazeLong: function(){
                        openSection(interactiveObject.name);
                    }
                });
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

function addScreens() {

    videoMP4 = document.createElement('video').canPlayType('video/mp4') !== '';
    videoOgg = document.createElement('video').canPlayType('video/ogg') !== '';

    var url, url2;
    if (videoMP4) {
        url = 'videos/bots.mp4';
        url2 = 'videos/vr_ar.mp4';
        console.log('play mp4');
    } else if (videoOgg) {
        url = 'videos/bots.mp4';
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
    
    Reticulum.add( screen1Mesh, {
        fuseDuration: utils.reticleDurations.medium,
        fuseColor: utils.reticleColors.yellow.dark,
        reticleHoverColor: utils.reticleColors.pink,
        fuseVisible: true,
        onGazeLong: function(){
            video2.pause();
            video.play();
        }
    });

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
    Reticulum.add( screen2mesh, {
        fuseDuration: utils.reticleDurations.medium,
        fuseColor: utils.reticleColors.yellow.dark,
        reticleHoverColor: utils.reticleColors.pink,
        fuseVisible: true,
        onGazeLong: function(){
            video.pause();
            video2.play();
        }
    });

    scene.add(screensGroup);

    $("#allowVideo").css('display', 'block');
}

function removeMembers() {
    var nummemberActually = membersGroup.children.length;
    for (var a = 0; a < nummemberActually; a++) {
        movement({y: -1}, membersGroup.children[a].position, 0, 500, TWEEN.Easing.Back.In);
        Reticulum.remove(  membersGroup.children[a] );
        if (a == nummemberActually - 1) {
            membersGroup = new THREE.Object3D();
            membersGroup.name = 'members';
            membersAdded = false;
        }
    }
}
function addMembers(members) {
    if(membersGroup.children) removeMembers();
    setTimeout(function () {
        for (var a = 0; a < members.length; a++) {
            var img = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("images/membersPhoto/circular/" + members[a].name + ".png"),
                transparent: true,
                color: utils.white
              });
            img.map.needsUpdate = true;
          
            var scale = 0.5;
            var sprite = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), img);
            sprite.position.set(members[a].position.x, members[a].position.y - 2, members[a].position.z);
            sprite.name = members[a].name;
            sprite.lookAt(camera.position);
            membersGroup.add(sprite);
            movement({y: members[a].position.y}, sprite.position, 300 * a, 500, TWEEN.Easing.Back.Out);
            Reticulum.add( sprite, {
                fuseDuration: utils.reticleDurations.medium,
                fuseColor: utils.reticleColors.yellow.dark,
                reticleHoverColor: utils.reticleColors.pink,
                fuseVisible: true,
                onGazeLong: function(){
                    console.log(sprite);
                }
            });
        }
        scene.add(membersGroup);
    }, 1000);
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

function moveLetters3d(objectName, prevObject) {
    var object;
    switch (objectName) {
        case 'centro':
            object = letrasRadical;
        break;
        case 'research':
            object = letrasResearch;
        break;
        case 'design':
            object = letrasDesign;
        break;
    }
    if(object){
        for (var a = 0; a < 12; a++) {
            if (prevObject != undefined && prevObject.children[a]) new TWEEN.Tween(prevObject.children[a].position).to({y: -1.5}, 100).easing(TWEEN.Easing.Quartic.Out).onUpdate(function () {
            }).delay(10 * a).start();
            if (object != undefined && object.children[a]) new TWEEN.Tween(object.children[a].position).to({y: 0.2}, 100).easing(TWEEN.Easing.Back.Out).onUpdate(function () {
            }).delay(10 * a).start();
            object.lookAt(camera.position);
        }
    }
}

function removeLetters3D(objectName) {
    var object;
    switch (objectName) {
        case 'centro':
            object = letrasRadical;
        break;
        case 'research':
            object = letrasResearch;
        break;
        case 'design':
            object = letrasDesign;
        break;
    }
    if (object) {
        for (var a = 0; a < object.children.length; a++) {
            if (tweenLettersIn != undefined) tweenLettersIn.stop();
            new TWEEN.Tween(object.children[a].position).to({y: -1.5}, 100).easing(TWEEN.Easing.Quartic.Out).onUpdate(function () {
            }).delay(50 * a).start();
        }
    }
}

function openSection(sectionName){
    var object, position;
    switch (sectionName) {
        case 'centro':
            object = utils.radicalMembers;
            position = utils.cameraPositions.radical;
            movement({intensity: 2}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
        break;
        case 'research':
            object = utils.researchMembers;
            position = utils.cameraPositions.research;
            movement({intensity: 0}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 2}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
        break;
        case 'design':
            object = utils.jefesAndVenturesMembers;
            position = utils.cameraPositions.design;
            movement({intensity: 0}, radicallight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, researchlight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 2}, designlight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, screen1Light, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0}, screen2Light, 0, 2000, TWEEN.Easing.Quartic.Out);
        break;
    }
    movement({ x: position.x - 0.02, y: position.y, z: position.z }, controls.target, 0, 1000, TWEEN.Easing.Quartic.Out);
    movement(position, camera.position, 0, 1000, TWEEN.Easing.Quartic.Out);
    addMembers(object);
}

function onDocumentMouseDown(e) {

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

    if (videoTexture != undefined) videoTexture.update();

    if (videoTexture2 != undefined) videoTexture2.update();
}

function movement(value, object, delay, duration, easingType) {
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

