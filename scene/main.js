
var camera, scene, renderer, controls, controlsdevice, 
    effect, sky, plane, radicalText, researchText, pointingLight, designlight, exitIcon,
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

var manager = new THREE.LoadingManager();

var checkstatus = {
    mesas: true,
    infoCard: true,
    members: true,
    travel: true,
    screens: false
};

var lightValues = {
    positions: {
        radical: {x: -2.5, y: 0.8, z: -2},
        research: {x: -2.5, y: 0.8, z: 0.5},
        design: {x: -2.5, y: 0.8, z: 2.5},
        screen1: {x: -0.4, y: 1.1, z: 0.74},
        screen2: {x: -0.4, y: 1.1, z: 4.15}
    },
    colors: {
        research: 0xff9999,
        radical: 0xffee66,
        design: 0x9999ff,
        screen1: 0xffffff,
        screen2: 0xffffff
    }
}

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

$(document).ready(function () {
    initRender();
    animate();
    $("#allowVideoScreen").on('click', function(){
        $('#allowVideoScreen').css('display', 'none');
        video.play();
        video2.play();
        video.pause();
        video2.pause();
    })
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
    camera.position.set(-0.8, 1.1, -5);

    Reticulum.init(camera, {
        proximity: true,
        near: 0.01, //near factor of the raycaster (shouldn't be negative and should be smaller than the far property)
        far: 10, //far factor of the raycaster (shouldn't be negative and should be larger than the near property)
        vibrate: 0,
        reticle: {
            visible: true,
            restPoint: 1, //Defines the reticle's resting point when no object has been targeted
            color: 0xF9Ec8D,
            innerRadius: 0.004,
            outerRadius: 0.006,
            hover: {
                color: 0xF9Ec8D,
                innerRadius: 0.008,
                outerRadius: 0.012,
                speed: 5,
                vibrate: 1 //Set to 0 or [] to disable
            }
        },
        click: {
          vibrate: 0
        },
        hover: {
          vibrate: 0
        },
        fuse: {
            visible: true,
            duration: 2.5,
            color: 0xF9Ec8D,
            innerRadius: 0.015,
            outerRadius: 0.025,
            vibrate: 1, //Set to 0 or [] to disable
            clickCancelFuse: false //If users clicks on targeted object fuse is canceled
        }
    });

    scene.add(camera);

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        $('#allowVideoScreen').css('display', 'block');
        isMobile = true;
        console.log('navigator: ', navigator);
        console.log("Oriented device");
        effect = new THREE.StereoEffect(renderer);
        effect.setSize(width, height);
        effect.setEyeSeparation = 0.5;
        
        controlsdevice = new THREE.DeviceOrientationControls(camera, true);
        controlsdevice.connect();
        function setOrientationControls(e) {
            if (!e.alpha) {
              return;
            }
            controlsdevice.connect();
            controlsdevice.update();
            element.addEventListener('click', fullscreen, false);
            window.removeEventListener('deviceorientation', setOrientationControls, true);
          }
    } else {
        $('#allowVideoScreen').css('display', 'none');
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.70;
        controls.enableZoom = false;
        controls.target.set(camera.position.x, camera.position.y, camera.position.z + 0.05);
    }

    ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.position.set(0, 0.6, 0);
    scene.add(ambientLight);

    pointingLight = new THREE.PointLight(0xffee66, 0, 2.5, 1);
    pointingLight.position.set(-2.5, 0.8, -2);
    scene.add(pointingLight);

    buildShape();
    window.addEventListener('resize', onWindowResize, false);
   
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
    skyMaterial.map.minFilter = THREE.LinearFilter;
    sky = new THREE.Mesh(skyGeometry, skyMaterial);
    sky.renderOrder = 0;
    sky.rotation.y = 1.7;
    sky.name = "sky";

    scene.add(sky);

    addModel();
    addScreens();
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
                }, 1000);
            }
        }
    };
    var onError = function (xhr) {
    };

    THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
    var indicadoresLoader = new THREE.MTLLoader();
    indicadoresLoader.setPath('models/vrLabsModel/');
    indicadoresLoader.load('indicadores.mtl', function (materials) {
        materials.preload();
        var indicadoresObj = new THREE.OBJLoader();
        indicadoresObj.setMaterials(materials);
        indicadoresObj.setPath('models/vrLabsModel/');
        indicadoresObj.load('indicadores.obj', function (elements) {
            for (var a = elements.children.length; a>=0; a-- ){
                if(elements.children[a])interactivos.add(elements.children[a]);
            }
            interactivos.children.map(function(interactiveObject) {
                interactiveObject.name = interactiveObject.name.replace(/_[a-z]*.[0-9]*/gi, "");
                Reticulum.add( interactiveObject, {
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
        scene.add(interactivos);
    });
    
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

            planta.add(centro);

            research = elements.children[6];
            research.renderOrder = 0;
            research.name = "research";

            planta.add(research);

            design = elements.children[5];
            design.renderOrder = 0;
            design.name = "design";

            planta.add(design);

            comunicacion = elements.children[4];
            comunicacion.renderOrder = 0;
            comunicacion.name = "comunicacion";

            planta.add(comunicacion);

            clever = elements.children[3];
            clever.renderOrder = 0;
            clever.name = "clever";

            planta.add(clever);

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
        }, onProgress, onError); 
        $('#container').addClass('displayOn');
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
    } else if (videoOgg) {
        url = 'videos/bots.mp4';
        url2 = 'videos/vr_ar.mp4';
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
    screen1Material.map.minFilter = THREE.LinearFilter;
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
    screen2Material.map.minFilter = THREE.LinearFilter;
    var screen2mesh = new THREE.Mesh(screen2Geometry, screen2Material);
    screen2mesh.position.set(-0.225, 1.13, 4.15);
    screen2mesh.rotateY(-Math.PI / 2);
    screen2mesh.name = 'screen2';

    screensGroup.add(screen1Mesh);
    screensGroup.add(screen2mesh);

    scene.add(screensGroup);
}

function playVideo(videoOpen){
    switch (videoOpen) {
        case "video1":
            video.play();
            video2.pause();
            if(controls) movement({x: -0.98, y: 1.1, z: 0.74}, controls.target, 0, 1000, TWEEN.Easing.Quartic.Out);
            movement({x: -1, y: 1.1, z: 0.74}, camera.position, 0, 1000, TWEEN.Easing.Quartic.Out);
            pointingLight.color.setHex( lightValues.colors.screen1 );
            pointingLight.position.set( lightValues.positions.screen1.x, lightValues.positions.screen1.y, lightValues.positions.screen1.z );
            movement({intensity: 1.5}, pointingLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
        break;
        case "video2":
            video.pause();
            video2.play();
            if(controls)movement({x: -0.98, y: 1.1, z: 4.15}, controls.target, 0, 1000, TWEEN.Easing.Quartic.Out);
            movement({x: -1, y: 1.1, z: 4.15}, camera.position, 0, 1000, TWEEN.Easing.Quartic.Out);
            pointingLight.color.setHex( lightValues.colors.screen2 );
            pointingLight.position.set( lightValues.positions.screen2.x, lightValues.positions.screen2.y, lightValues.positions.screen2.z );
            movement({intensity: 1.5}, pointingLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
        break;
    }
}
function removeMembers() {
    if(membersGroup.children) {
        var nummemberActually = membersGroup.children.length;
        for (var a = 0; a < nummemberActually; a++) {
            movement({y: -1}, membersGroup.children[a].position, 0, 500, TWEEN.Easing.Back.In);
            //Reticulum.remove(  membersGroup.children[a] );
            if (a == nummemberActually - 1) {
                membersGroup = new THREE.Object3D();
                membersGroup.name = 'members';
                membersAdded = false;
            }
        }
    }
}
function addMembers(members) {
    removeMembers();
    removeInfoSection();
    setTimeout(function () {
        for (var a = 0; a < members.length; a++) {
            var img = new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("images/membersPhoto/circular/" + members[a].name + ".png"),
                transparent: true,
                color: utils.white
              });
            img.map.minFilter = THREE.LinearFilter;
            img.map.needsUpdate = true;
            var scale = 0.3;
            var sprite = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), img);
            sprite.position.set(members[a].position.x, members[a].position.y - 2, members[a].position.z);
            sprite.name = members[a].name;
            sprite.lookAt({ x: camera.position.x, y: sprite.position.y, z: camera.position.z });
            membersGroup.add(sprite);
            movement({y: members[a].position.y}, sprite.position, 300 * a, 500, TWEEN.Easing.Back.Out);
        }
        membersGroup.children.map(function(element){
            Reticulum.add( element, {
                fuseVisible: true,
                onGazeLong: function(){
                    console.log(element.name);
                    addInfoSection(element.name,element.name);
                }
            });
        })
        scene.add(membersGroup);
    }, 1000);
}

function addInfoSection(image, name) {
    removeInfoSection();
    infoGroup = new THREE.Object3D();
    infoGroup.name = 'infoGroup';
    var texture = THREE.ImageUtils.loadTexture("images/info_board.png");
    var geometry = new THREE.PlaneGeometry(1, 0.6, 1);
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 1,
        color: 0xffffff
    });
    material.map.minFilter = THREE.LinearFilter;
    var plane = new THREE.Mesh(geometry, material);
    plane.name = name;
    infoGroup.add(plane);
    var infoTexture = THREE.ImageUtils.loadTexture("images/membersPhoto/info/"+image+".png");
    var infoGeometry = new THREE.PlaneGeometry(0.5, 0.45, 0.5);
    var infoMaterial = new THREE.MeshBasicMaterial({
        map: infoTexture,
        transparent: true,
        opacity: 1,
        color: 0xffffff
    });
    infoMaterial.map.minFilter = THREE.LinearFilter;
    var planeInfo = new THREE.Mesh(infoGeometry, infoMaterial);
    infoGroup.add(planeInfo);
    planeInfo.position.set(0,0,0.03);

    var closeTexture = THREE.ImageUtils.loadTexture("images/mediaControls/close.png");
    var closeGeometry = new THREE.PlaneGeometry(0.07, 0.07, 0.07);
    var closeMaterial = new THREE.MeshBasicMaterial({
        map: closeTexture,
        transparent: true,
        opacity: 1,
        color: 0xffffff
    });
    closeMaterial.map.minFilter = THREE.LinearFilter;
    var closeButton = new THREE.Mesh(closeGeometry, closeMaterial);
    infoGroup.add(closeButton);
    closeButton.position.set(0.4,0.23,0.05);

    Reticulum.add( closeButton, {
        fuseVisible: true,
        onGazeLong: function(){
            removeInfoSection();
        }
    });

    infoGroup.rotation.y = Math.PI / 2;
    infoGroup.position.set(camera.position.x-2, 5, camera.position.z);
    movement({y: 1}, infoGroup.position, 1, 500, TWEEN.Easing.Back.Out);
    scene.add(infoGroup);
}

function removeInfoSection(){
    console.log(infoGroup.children.length);
    if(infoGroup.children.length > 0) {
        scene.remove(infoGroup);
    }
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
            pointingLight.color.setHex( lightValues.colors.radical );
            pointingLight.position.set( lightValues.positions.radical.x, lightValues.positions.radical.y, lightValues.positions.radical.z );
            movement({intensity: 1.5}, pointingLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
        break;
        case 'research':
            object = utils.researchMembers;
            position = utils.cameraPositions.research;
            pointingLight.color.setHex( lightValues.colors.research );
            pointingLight.position.set( lightValues.positions.research.x, lightValues.positions.research.y, lightValues.positions.research.z );
            movement({intensity: 1.5}, pointingLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
        break;
        case 'design':
            object = utils.jefesAndVenturesMembers;
            position = utils.cameraPositions.design;
            pointingLight.color.setHex( lightValues.colors.design );
            pointingLight.position.set( lightValues.positions.design.x, lightValues.positions.design.y, lightValues.positions.design.z );
            movement({intensity: 1.5}, pointingLight, 0, 2000, TWEEN.Easing.Quartic.Out);
            movement({intensity: 0.1}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
        break;
        case 'tv1':
            playVideo("video1");
        break;
        case 'tv2':
            playVideo("video2");
        break;
        case 'main':
            returnToMain();
        break;
        default:
        break;
    }
    if(position){
        if(controls)movement({ x: position.x - 0.02, y: position.y, z: position.z }, controls.target, 0, 1000, TWEEN.Easing.Quartic.Out);
        movement(position, camera.position, 0, 1000, TWEEN.Easing.Quartic.Out);
        addMembers(object);
    }
}

function returnToMain() {
    removeMembers();
    removeInfoSection();
    movement({x: -0.8, y: 1.1, z: -5}, camera.position, 0, 1000, TWEEN.Easing.Quartic.Out);
    if(controls) movement({x: -0.8, y: 1.1, z: -4.98}, controls.target, 0, 1000, TWEEN.Easing.Quartic.Out);
    movement({intensity: 0}, pointingLight, 0, 2000, TWEEN.Easing.Quartic.Out);
    movement({intensity: 0.8}, ambientLight, 0, 2000, TWEEN.Easing.Quartic.Out);
    video.pause();
    video2.pause();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (effect != undefined) effect.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  Reticulum.update();
  camera.updateMatrixWorld();
  
  if (controls) {
    controls.update(clock.getDelta());
  }
  if (controlsdevice) {
    controlsdevice.update();
  }
  render();
  TWEEN.update();
}

function render() {

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

