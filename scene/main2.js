
  var camera, scene, renderer, controls, controlsdevice, effect, sky, ambientLight,
  width = window.innerWidth,
  height = window.innerHeight;
var isMobile = false;
var wallMenuHasBeenRemoved = false;
var videoMP4, videoOgg, video, videoTexture, video2, videoTexture2, screen1Mesh, screen2Mesh;
var clock = new THREE.Clock();
var manager = new THREE.LoadingManager();
var textureLoader = new THREE.TextureLoader();
var utils = new LabsUtils();
var mtlLoader = new THREE.MTLLoader();
var planta = new THREE.Object3D();
var mesas = new THREE.Object3D();
var screensGroup = new THREE.Object3D();
var membersGroup = new THREE.Object3D();
var infoGroup = new THREE.Object3D();
var infoGroupIsShowing = false;
var screensAdded = false;
var tutorialFinished = false;
var distancesFromReticleToObject = [];
var MAX_DISTANCE = utils.reticulumFar;
var acceptVideo = document.getElementById('allowVideoScreen');
acceptVideo.onclick = function(){
  if (screensAdded) {
    $('#allowVideoScreen').css('display', 'none');
    video.play();
    video2.play();
    video.pause();
    video2.pause();
  }
}
$(document).ready(function () {
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
  renderer.setClearColor(utils.white, 0);
  renderer.setViewport(0, 0, width, height);
  renderer.getMaxAnisotropy();
  element = renderer.domElement;
  var container = document.getElementById('container');
  container.appendChild(element);
  camera = new THREE.PerspectiveCamera(60, (width / height), 0.01, 10000000);
  camera.position.set(utils.initialPositionTutorial.x, utils.initialPositionTutorial.y, utils.initialPositionTutorial.z);
  Reticulum.init(camera, utils.reticulumDefaultConfig);
  scene.add(camera);
  if (window.DeviceOrientationEvent && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    isMobile = true;
    $('#allowVideoScreen').css('display', 'block');
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
    controls.target.set(camera.position.x, camera.position.y, camera.position.z + 0.5);
  }
  renderTutorial();
  addHomeButton(tutorialFinished);
  addTravelPoints();
  ambientLight = new THREE.AmbientLight(utils.white);
  ambientLight.position.set(0, 1.2, 0);
  addWallMenu();
  addWallInfo();
  scene.add(ambientLight);
  updateLabelSizesAndColor();
  
  buildShape();
  window.addEventListener('resize', onWindowResize, false);
}
var parentTutorial = new THREE.Object3D();
var boxCount = 10;
var boxSize = 1;
var radius = MAX_DISTANCE - 1;
var movements;
var anAnimationHasStarted = false;
var wallInfoTextIsInflating = false;
var wallInfoTextIsDeflating = false;

function renderTutorial() {
  movements = 0;
  scene.add(parentTutorial);
  
  var boxGeometry = new THREE.BoxGeometry( boxSize, boxSize, boxSize );
  for( var i = 0; i < 3; i++ ) {
    var x = radius;
    var z = i * radius;
    addMesh(boxGeometry, x, 0, z, i);
  }
  radius = 10;
  for( var i = 0; i < boxCount; i++ ) {
    var x = 0 + Math.ceil(radius * Math.cos(2 * Math.PI * i / boxCount));
    var z = 0 + Math.ceil(radius * Math.sin(2 * Math.PI * i / boxCount));  
    addMesh(boxGeometry, x, 0, z, i);
  }
  parentTutorial.position.set(utils.initialPositionTutorial.x, 0, utils.initialPositionTutorial.z);
  calculateDistances();
}
var closeObjectLabels;
function highlightClosestObjects() {
  closeObjectLabels = [];
  for (var i = 0; i < parentTutorial.children.length; i++) {
    if (distancesFromReticleToObject[i] < MAX_DISTANCE) {
      changeColor(parentTutorial.children[i], utils.objectColors.highlight);
      if (distancesFromReticleToObject[i] > 2) {
        addProximityLabelToChild(parentTutorial.children[i].position);
      }
    } else {
      changeColor(parentTutorial.children[i], utils.objectColors.initial);
    }
  }
}
function removeCloseLabels() {
  if (closeObjectLabels && closeObjectLabels.length > 0) {
    for (var i = 0; i < closeObjectLabels.length; i++) {
      scene.remove(closeObjectLabels[i]);
    }
  }
}
var closeLabel;
function addProximityLabelToChild(childObjectPosition) {
  var fileName = tutorialFinished ? "tutorialFinished" : "isClose";
  if (movements == 1) fileName = "isClose_2";
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + fileName + utils.extension),
    transparent: true,
    side: THREE.DoubleSide,
    color: utils.white
  });
  img.map.needsUpdate = true;
  var scale = (tutorialFinished || (movements == 1)) ? 0.5 : 2;
  closeLabel = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), img);
  closeLabel.position.set(utils.initialPositionTutorial.x + childObjectPosition.x, tutorialFinished || (movements == 1) ? 1 : 2, utils.initialPositionTutorial.z + childObjectPosition.z);
  
  closeObjectLabels.push(closeLabel);
  scene.add(closeLabel);
}
function addMesh(geometry, x, y, z, i) {
  var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: utils.objectColors.initial } ) );
  object.position.x = x;
  object.position.y = y;
  object.position.z = z;
  
  Reticulum.add( object, {
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
      if (tutorialFinished) {
        goHome();
        deleteTutorialScene();
      } else {
        removeCloseLabels();
        var position = getPositionInTutorial(object);
        movement(position, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
          movements++;
          if (movements >= 2) {
            tutorialFinished = true;
          }
          updateHomeButtonPosition();
          calculateDistances();
        });
        if (controls) controls.target.set(position.x - 0.2, position.y, position.z);
      }
    }
  });
  parentTutorial.add( object );
}
function deleteTutorialScene() {
  for (var i = 0; i < parentTutorial.children.length; i++) {
    removeFromReticulum(parentTutorial.children[i]);
  }
  scene.remove(parentTutorial);
}
function getPositionInTutorial(object) {
  return { x: utils.initialPositionTutorial.x + object.position.x, y: 2, z: utils.initialPositionTutorial.z + object.position.z };
}
function buildShape() {
  var skyGeometry = new THREE.SphereGeometry(20, 32, 32);
  var skyMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(utils.rootDirectory + 'sky2.jpg'),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1,
    color: utils.white,
    depthWrite: true
  });
  sky = new THREE.Mesh(skyGeometry, skyMaterial);
  sky.renderOrder = 0;
  sky.rotation.y = 1.7;
  scene.add(sky);
  addModel();
}
function addModel() {
  var centro, design, research, clever, maker, sillas, comunicacion, pared, cristaleraFrontal, cristaleraEntrada, cristaleraAgora, banco;
  var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
      var percentComplete = xhr.loaded / xhr.total * 100;
      if (percentComplete == 100) {
        setTimeout(function () {
          addScreens();
        }, 1000);
      }
    }
  };
  var onError = function (xhr) {
    console.log('error', xhr)
  };
  THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
  
  mtlLoader.setPath('models/vrLabsModel/');
  mtlLoader.load('planta6.mtl', function (materials) {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('models/vrLabsModel/');
    objLoader.load('planta6.obj', function (elements) {
      techo = elements.children[13];
      techo.renderOrder = 0;
      planta.add(techo);
      banco = elements.children[12];
      banco.renderOrder = 0;
      planta.add(banco);
      cristaleraEntrada = elements.children[11];
      cristaleraEntrada.renderOrder = 1;
      planta.add(cristaleraEntrada);
      pared = elements.children[10];
      pared.renderOrder = 0;
      planta.add(pared);
      cristaleraAgora = elements.children[9];
      cristaleraAgora.renderOrder = 1;
      planta.add(cristaleraAgora);
      centro = elements.children[8];
      centro.renderOrder = 0;
      mesas.add(centro);
      research = elements.children[7];
      research.renderOrder = 0;
      mesas.add(research);
      design = elements.children[6];
      design.renderOrder = 0;
      mesas.add(design);          
      
      comunicacion = elements.children[5];
      comunicacion.renderOrder = 0;
      mesas.add(comunicacion);
      
      clever = elements.children[4];
      clever.renderOrder = 0;
      mesas.add(clever);
      
      cristaleraFrontal = elements.children[3];
      cristaleraFrontal.renderOrder = 2;
      planta.add(cristaleraFrontal);
      sillas = elements.children[2];
      sillas.renderOrder = 0;
      planta.add(sillas);
      maker = elements.children[0];
      maker.renderOrder = 0;
      mesas.add(maker);
      
      planta.add(mesas);
      planta.scale.set(2,2,2);
      scene.add(planta);
    }, onProgress, onError);
  });
}
function addScreens() {
  videoMP4 = document.createElement('video').canPlayType('video/mp4') !== '';
  videoOgg = document.createElement('video').canPlayType('video/ogg') !== '';
  var url, url2;
  if (videoMP4 || videoOgg) {
    url = 'videos/vr_ar.mp4';
    url2 = 'videos/bots.mp4';
  } else {
    alert('Can\'t play videos');
  }
  videoTexture = new THREEx.VideoTexture(url);
  videoTexture.needsUpdate = false;
  video = videoTexture.video;
  videoTexture2 = new THREEx.VideoTexture(url2);
  videoTexture2.needsUpdate = false;
  video2 = videoTexture2.video;
  video.pause();
  video2.pause();
  addScreen1();
  addScreen2();
  scene.add(screensGroup);
  $("#allowVideo").css('display', 'block');
  screensAdded = true;
}
function addScreen1() {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + "screenBack" + utils.extension),
    transparent: false,
    side: THREE.DoubleSide,
    color: utils.white
  });
  img.map.needsUpdate = true;
  var scale = 0.9;
  var screen1Back = new THREE.Mesh(new THREE.CubeGeometry(scale, scale - 0.3, 0.1), img);
  screen1Back.name = name;
  screen1Back.position.set(-0.45, 2, 1.48);
  screen1Back.rotateY(-Math.PI / 2);
  
  scene.add(screen1Back);
  var screen1Geometry = new THREE.PlaneGeometry(0.8, 0.5, 2, 1);
  var screen1Material = new THREE.MeshBasicMaterial({
    map: videoTexture.texture,
    side: THREE.DoubleSide
  });
  screen1Mesh = new THREE.Mesh(screen1Geometry, screen1Material);
  screen1Mesh.position.set(-0.51, 2, 1.48);
  screen1Mesh.rotateY(-Math.PI / 2);
  screen1Mesh.name = 'screen1';
  
  screensGroup.add(screen1Mesh);
}
function moveToScreen1() {
  removeFromReticulum(agoraLabel);
  if (infoGroupIsShowing) {
    removeInfoSection();
  }
  removeMembers();
  if (video !== undefined && video2 !== undefined) {
    video.pause();
    video2.pause();
    movement({x: -1.5, y: 2, z: screen1Mesh.position.z}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
      updateLabelSizesAndColor();
      addMediaControls(screen1Mesh, video);
      updateHomeButtonPosition();
    });
    if (controls) controls.target.set(screen1Mesh.position.x - 0.2, screen1Mesh.position.y, screen1Mesh.position.z);
  }
}
function addScreen2() {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + "screenBack" + utils.extension),
    transparent: false,
    side: THREE.DoubleSide,
    color: utils.white
  });
  img.map.needsUpdate = true;
  var scale = 0.9;
  var screen2Back = new THREE.Mesh(new THREE.CubeGeometry(scale, scale - 0.3, 0.1), img);
  screen2Back.name = name;
  screen2Back.position.set(-0.45, 2, 8.3);
  screen2Back.rotateY(-Math.PI / 2);
  
  scene.add(screen2Back);
  var screen2Geometry = new THREE.PlaneGeometry(0.8, 0.5, 2, 1);
  var screen2Material = new THREE.MeshBasicMaterial({
    map: videoTexture2.texture,
    side: THREE.DoubleSide
  });
  screen2Mesh = new THREE.Mesh(screen2Geometry, screen2Material);
  screen2Mesh.position.set(-0.51, 2, 8.3);
  screen2Mesh.rotateY(-Math.PI / 2);
  screen2Mesh.name = 'screen2';
  
  screensGroup.add(screen2Mesh);
}
function moveToScreen2() {
  removeFromReticulum(agoraLabel);
  if (infoGroupIsShowing) {
    removeInfoSection();
  }
  removeMembers();
  if (video !== undefined && video2 !== undefined) {
    video.pause();
    video2.pause();
    movement({x: -1.4, y: 2, z: screen2Mesh.position.z}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
      updateLabelSizesAndColor();
      addMediaControls(screen2Mesh, video2);
      updateHomeButtonPosition();
    });
    if (controls) controls.target.set(screen2Mesh.position.x - 0.2, screen2Mesh.position.y, screen2Mesh.position.z);
  }
}
function removeFromReticulum(meshObject) {
  Reticulum.remove(meshObject);
}
var mediaControlsContainer;
function addMediaControls(object, videoObject) {
  mediaControlsContainer = new THREE.Object3D();
  mediaControlsContainer.position.set(object.position.x - 0.32, object.position.y, object.position.z);
  mediaControlsContainer.rotateY(-Math.PI / 2);
  for (var i = 0; i < utils.mediaControls.length; i++) {
    addMediaButton(utils.mediaControls[i].name, utils.mediaControls[i].path, utils.mediaControls[i].position, videoObject);
  }
  scene.add(mediaControlsContainer)
}
function showMediaControls(screenObject) {
  movement({x: -0.26, y: 0, z: 0}, playButton.position, 0, 500, TWEEN.Easing.Back.Out);
  movement({x: -0.13, y: 0, z: 0}, stopButton.position, 0, 500, TWEEN.Easing.Back.Out);
  movement({x: 0, y: 0, z: 0}, pauseButton.position, 0, 500, TWEEN.Easing.Back.Out);
  movement({x: 0.13, y: 0, z: 0}, closeButton.position, 0, 500, TWEEN.Easing.Back.Out);
  movement({x: screenObject.position.x - 0.1, y: screenObject.position.y - 0.35, z: screenObject.position.z + 0.1}, mediaControlsContainer.position, 0, 1500, TWEEN.Easing.Back.Out)
}
var cameraLookingAtScreenRotationValue;
function saveCameraLookingAtScreenRotationValue() {
  cameraLookingAtScreenRotationValue = new THREE.Object3D();
  cameraLookingAtScreenRotationValue.rotation.copy(camera.rotation);
}
var playButton, stopButton, pauseButton, closeButton;
var videoPlaying = false;
var video2Playing = false;
function addMediaButton(name, path, position, videoObject) {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.subFolderMediaControls + path),
    transparent: true,
    side: THREE.DoubleSide
  });
  img.map.needsUpdate = true;
  var scale = 0.1;
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), img);
  plane.name = name;
  plane.position.set(position.x, position.y, position.z);
  if (name === utils.mediaNamePlay) {
    playButton = plane;
    addPlayButtonToReticulum(videoObject)
  } else if (name === utils.mediaNameStop) {
    stopButton = plane;
    addStopButtonToReticulum(videoObject);
  } else if (name === utils.mediaNamePause) {
    pauseButton = plane;
    addPauseButtonToReticulum(videoObject);
  } else if (name === utils.mediaNameClose) {
    closeButton = plane;
    addCloseButtonToReticulum(videoObject);
  }
  mediaControlsContainer.add(plane);
}
function addCloseButtonToReticulum(videoObject) {
  Reticulum.add( closeButton, {
    fuseDuration: utils.reticleDurations.fastest,
    reticleHoverColor: utils.reticleColors.red.light,
    fuseColor: utils.reticleColors.red.dark,
    fuseVisible: true,
    onGazeOver: function() {
      if (this.material.color) changeColor(closeButton, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(closeButton, utils.white );
    },
    onGazeLong: function() {
      videoObject.pause();
      videoObject.currentTime = 0;
      videoObject.load();
      videoObject.pause();
      videoPlaying = false;
      video2Playing = false;
      removeMediaControls();
      exitScreen(videoObject);
    }
  });
}
function addPlayButtonToReticulum(videoObject) {
  Reticulum.add( playButton, {
    fuseDuration: utils.reticleDurations.fastest,
    reticleHoverColor: utils.reticleColors.yellow.light,
    fuseColor: utils.reticleColors.yellow.dark,
    fuseVisible: true,
    onGazeOver: function() {
      if (this.material.color) changeColor(playButton, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(playButton, utils.white );
    },
    onGazeLong: function() {
      videoObject.play();
      if (videoObject === video) {
        showMediaControls(screen1Mesh);
        videoPlaying = true;
      } else if (videoObject === video2) {
        showMediaControls(screen2Mesh);
        video2Playing = true;
      }
      saveCameraLookingAtScreenRotationValue();
      removeFromReticulum(playButton);
      addPauseButtonToReticulum(videoObject);
      addStopButtonToReticulum(videoObject);
    }
  });
}
function addPauseButtonToReticulum(videoObject) {
  Reticulum.add( pauseButton, {
    fuseDuration: utils.reticleDurations.fastest,
    reticleHoverColor: utils.reticleColors.yellow.light,
    fuseColor: utils.reticleColors.yellow.dark,
    fuseVisible: true,
    onGazeOver: function() {
      if (this.material.color) changeColor(pauseButton, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(pauseButton, utils.white );
    },
    onGazeLong: function() {
      videoObject.pause();
      if (videoObject === video) {
        videoPlaying = false;
      } else if (videoObject === video2) {
        video2Playing = false;
      }
      removeFromReticulum(pauseButton);
      addPlayButtonToReticulum(videoObject);
      addStopButtonToReticulum(videoObject);
    }
  });
}
function addStopButtonToReticulum(videoObject) {
  Reticulum.add( stopButton, {
    fuseDuration: utils.reticleDurations.fastest,
    reticleHoverColor: utils.reticleColors.yellow.light,
    fuseColor: utils.reticleColors.yellow.dark,
    fuseVisible: true,
    onGazeOver: function() {
      if (this.material.color) changeColor(stopButton, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(stopButton, utils.white );
    },
    onGazeLong: function() {
      videoObject.pause();
      videoObject.currentTime = 0;
      videoObject.load();
      videoObject.pause();
      if (videoObject === video) {
        videoPlaying = false;
      } else if (videoObject === video2) {
        video2Playing = false;
      }
      removeFromReticulum(stopButton);
      removeFromReticulum(pauseButton);
      addPlayButtonToReticulum(videoObject);
    }
  });
}
function removeMediaControls() {
  if (playButton) removeFromReticulum(playButton);
  if (stopButton) removeFromReticulum(stopButton);
  if (pauseButton) removeFromReticulum(pauseButton);
  if (closeButton) removeFromReticulum(closeButton);
  scene.remove(mediaControlsContainer);
}
function exitScreen(videoObject) {
  if (videoObject === video) {
    movement({x: researchLabel.position.x + 1.6, y: utils.defaultObjectElevation, z: researchLabel.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
      updateLabelSizesAndColor();
      updateHomeButtonPosition();
    });
    if (controls) controls.target.set(researchLabel.position.x + 0.2, 2, researchLabel.position.z);
  } else if (videoObject === video2) {
    movement({x: nobodyLabel.position.x + 1.6, y: utils.defaultObjectElevation, z: nobodyLabel.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
      updateLabelSizesAndColor();
      updateHomeButtonPosition();
    });
    if (controls) controls.target.set(nobodyLabel.position.x + 0.2, 2, nobodyLabel.position.z);
  }
  videoObject.pause();
  updateLabelSizesAndColor();
  addAgoraLabelToReticulum();
}
var wallMenuOff, wallMenu, clickMeHint;
var wallMenuIsMoving = false;
var wallMenuIsOpen = false;
var deviceAlphaValueForWallMenu;
function addWallMenu() {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + "beevaLabs" + utils.extension),
    transparent: true,
    side: THREE.DoubleSide,
    color: utils.white
  });
  img.map.needsUpdate = true;
  wallMenu = new THREE.Mesh(new THREE.PlaneGeometry(utils.wallMenu.scale, utils.wallMenu.scale), img);
  wallMenu.position.set(utils.wallMenu.position.x, utils.wallMenu.position.y, utils.wallMenu.position.z);
  wallMenu.rotateY(-Math.PI / 2);
  wallMenu.visible = false;
  scene.add(wallMenu);
  img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + "beevaLabsOff" + utils.extension),
    transparent: true,
    side: THREE.DoubleSide,
    color: utils.white
  });
  img.map.needsUpdate = true;
  wallMenuOff = new THREE.Mesh(new THREE.PlaneGeometry(utils.wallMenu.scale, utils.wallMenu.scale), img);
  wallMenuOff.position.set(utils.wallMenu.position.x, utils.wallMenu.position.y, utils.wallMenu.position.z);
  wallMenuOff.rotateY(-Math.PI / 2);
  scene.add(wallMenuOff);
  addWallMenuToReticulum();
}
var wallInfo, wallInfoText;
var wallInfoIsVisible = true;
function addWallInfo() {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + "infoText" + utils.extension),
    transparent: false,
    side: THREE.DoubleSide,
    color: utils.white
  });
  img.map.needsUpdate = true;
  wallInfoText = new THREE.Mesh(new THREE.PlaneGeometry(utils.wallInfo.text.scale, utils.wallInfo.text.scale), img);
  wallInfoText.name = name;
  wallInfoText.position.set(utils.wallInfo.text.position.x, utils.wallInfo.text.position.y, utils.wallInfo.text.position.z);
  wallInfoText.rotateY(-Math.PI / 2);
  
  scene.add(wallInfoText);
  img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + "info" + utils.extension),
    transparent: true,
    side: THREE.DoubleSide,
    color: utils.white
  });
  img.map.needsUpdate = true;
  wallInfo = new THREE.Mesh(new THREE.PlaneGeometry(utils.wallInfo.icon.scale, utils.wallInfo.icon.scale), img);
  wallInfo.name = name;
  wallInfo.position.set(utils.wallInfo.icon.position.x, utils.wallInfo.icon.position.y, utils.wallInfo.icon.position.z);
  wallInfo.rotateY(-Math.PI / 2);
  
  scene.add(wallInfo);
  addWallInfoLogoToReticulum();
}
function addWallMenuToReticulum() {
  Reticulum.add( wallMenuOff, {
    reticleHoverColor: utils.reticleColors.yellow.bright,
    fuseColor: utils.reticleColors.purple,
    fuseDuration: utils.reticleDurations.fast,
    fuseVisible: true,
    onGazeOver: function() {
      if (!wallMenuIsOpen) {
        changeScaleSingle(wallMenuOff, utils.objectScale.big);
        if (this.material.color) changeColor(wallMenuOff, utils.selectedLabelColor );
      }
    },
    onGazeOut: function() {
      if (!wallMenuIsOpen) {
        changeScaleSingle(wallMenuOff, utils.objectScale.normal);
        if (this.material.color) changeColor(wallMenuOff, utils.white );
      }
    },
    onGazeLong: function() {
      if (!wallMenuIsMoving) {
        if (!wallMenuIsOpen) {
          removeFromReticulum(wallMenuOff);
          var labelPoints = [
            {name: utils.makerName, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}}, 
            {name: utils.radicalName, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}},
            {name: utils.researchName, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}}, 
            {name: utils.jefesName, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}}, 
            {name: utils.nobodyName, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}}, 
            {name: utils.comunicacionName, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}},
            {name: utils.agoraName, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}},
            {name: utils.tele1Name, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}},
            {name: utils.tele2Name, position: {x: -1.6, y: wallMenu.position.y, z: wallMenu.position.z + 0.05}}
          ];
          distributeObjectsAcrossCircumference(wallMenu, labelPoints);
          wallMenuOff.visible = false;
          wallMenu.visible = true;
        }
      }
    }
  });
  wallMenuHasBeenRemoved = false;
}
function addWallInfoLogoToReticulum() {
  Reticulum.add( wallInfo, {
    reticleHoverColor: utils.reticleColors.yellow.bright,
    fuseColor: utils.reticleColors.purple,
    fuseDuration: utils.reticleDurations.fast,
    fuseVisible: true,
    onGazeOver: function() {
      changeScaleSingle(wallInfo, utils.objectScale.big);
      if (this.material.color) changeColor(wallInfo, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      changeScaleSingle(wallInfo, utils.objectScale.normal);
      if (this.material.color) changeColor(wallInfo, utils.white );
    },
    onGazeLong: function() {
      if (!wallInfoIsVisible && !wallInfoTextIsInflating) {
        if (wallMenuIsOpen) {
          closeWallMenu();
        }
        wallInfoTextIsInflating = true;
        anAnimationHasStarted = true;
      } else {
        hideWallInfoText();
      }
    }
  });
}
function hideWallInfoText() {
  if (!wallMenuIsOpen && !wallInfoTextIsDeflating) {
    wallInfoTextIsDeflating = true;
    anAnimationHasStarted = true;
  }
}

function closeWallMenu() {
  wallMenuIsMoving = true;
  var directAccessLabels = [makerLabelDirect, radicalLabelDirect, researchLabelDirect, jefesLabelDirect, nobodyLabelDirect, comunicacionLabelDirect, agoraLabelDirect, tele1Direct, tele2Direct];
  for (var i = 0; i < directAccessLabels.length; i++) {
    removeFromReticulum(directAccessLabels[i]);
    (function(ind) {
      setTimeout(function(){
        scene.remove(directAccessLabels[ind]);
        if (ind == directAccessLabels.length - 1) {
          wallMenuIsOpen = false;
          wallMenuIsMoving = false;
          addWallMenuToReticulum();
        }
      }, 100 * ind);
    })(i);
  }
  wallMenuOff.visible = true;
  wallMenu.visible = false;
  wallInfoTextIsInflating = true;
  anAnimationHasStarted = true;
}
var researchLabelDirect, radicalLabelDirect, makerLabelDirect, nobodyLabelDirect, jefesLabelDirect, comunicacionLabelDirect, agoraLabelDirect, tele1Direct, tele2Direct;
function distributeObjectsAcrossCircumference(containerObject, objectsArray) {
  if (wallInfoIsVisible) {
    hideWallInfoText();
  }
  wallMenuIsMoving = true;
  var numElements = objectsArray.length;
  var angle = 0;
  var step = (2*Math.PI) / numElements;
  var container_height = containerObject.geometry.parameters.height;
  var container_width = containerObject.geometry.parameters.width;
  var radius = 0.55;
  for(var i = 0; i < numElements; i++) {
    var z = radius * Math.cos(angle);
    var y = radius * Math.sin(angle);
    if ((angle > 1.3 && angle < 2) || (angle > 4.1 && angle < 4.2)) {
      // due to the design of the labels, we need to increment the radius of the bottom
      // and top elements to avoid overlapping
      y += 0.05;
    }
    angle += step;
    addDirectAccess(containerObject, objectsArray[i], y, z, i);
  }
  setTimeout(function () {
    wallMenuIsMoving = false;
    wallMenuIsOpen = true;
  }, 1500);
}
function addDirectAccess(containerObject, object, yVal, zVal, index) {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.labelsDirectory + object.name + utils.extension),
    transparent: true,
    side: THREE.DoubleSide,
    color: utils.white
  });
  img.map.needsUpdate = true;
  var scale = 0.45;
  var plane = new THREE.Mesh(new THREE.PlaneGeometry((object.name === utils.tele1Name || object.name === utils.tele2Name) ? scale - 0.1 : scale, (object.name === utils.tele1Name || object.name === utils.tele2Name) ? scale/4 : scale/4.76), img);
  plane.name = object.name;
  plane.position.set(containerObject.position.x - 0.05 - 0.01*index, containerObject.position.y + 0.01*index, containerObject.position.z);
  plane.rotateY(-Math.PI / 2);
  if (object.name === utils.researchName) {
    researchLabelDirect = plane;
  } else if (object.name === utils.radicalName) {
    radicalLabelDirect = plane;
  } else if (object.name === utils.makerName) {
    makerLabelDirect = plane;
  } else if (object.name === utils.jefesName) {
    jefesLabelDirect = plane;
  } else if (object.name === utils.nobodyName) {
    nobodyLabelDirect = plane;
  } else if (object.name === utils.comunicacionName) {
    comunicacionLabelDirect = plane;
  } else if (object.name === utils.agoraName) {
    agoraLabelDirect = plane;
  } else if (object.name === utils.tele1Name) {
    tele1Direct = plane;
  } else if (object.name === utils.tele2Name) {
    tele2Direct = plane;
  }
  scene.add(plane);
  movement({x: plane.position.x, y: containerObject.position.y + yVal, z: containerObject.position.z + zVal}, plane.position, 100*index, 500, TWEEN.Easing.Quartic.Out);
  
  Reticulum.add( plane, {
    reticleHoverColor: utils.reticleColors.yellow.bright,
    fuseColor: utils.reticleColors.purple,
    fuseDuration: utils.reticleDurations.fast,
    fuseVisible: true,
    onGazeOver: function() {
      if (this.material.color) changeColor(plane, utils.selectedLabelColor );
      changeScaleSingle(plane, utils.objectScale.big);
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(plane, utils.white );
      changeScaleSingle(plane, utils.objectScale.normal);
    },
    onGazeLong: function() {
      closeWallMenu();
      if (object.name === utils.researchName) {
        movement({x: researchLabel.position.x + 1.6, y: utils.defaultObjectElevation, z: researchLabel.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
          addMembers(utils.researchMembers);
          updateLabelSizesAndColor();
          updateHomeButtonPosition();
        });
        if (controls) controls.target.set(researchLabel.position.x + 0.2, 2, researchLabel.position.z);
      } else if (object.name === utils.radicalName) {
        movement({x: radicalLabel.position.x + 1.6, y: utils.defaultObjectElevation, z: radicalLabel.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
          addMembers(utils.radicalMembers);
          updateLabelSizesAndColor();
          updateHomeButtonPosition();
        });
        if (controls) controls.target.set(radicalLabel.position.x + 0.2, 2, radicalLabel.position.z);
      } else if (object.name === utils.jefesName) {
        movement({x: jefesLabel.position.x + 1.6, y: utils.defaultObjectElevation, z: jefesLabel.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
          addMembers(utils.jefesAndVenturesMembers);
          updateLabelSizesAndColor();
          updateHomeButtonPosition();
        });
        if (controls) controls.target.set(jefesLabel.position.x + 0.2, 2, jefesLabel.position.z);
      } else if (object.name === utils.comunicacionName) {
        movement({x: comunicacionLabel.position.x + 1.6, y: utils.defaultObjectElevation, z: comunicacionLabel.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
          addMembers(utils.comunicacionMembers);
          updateLabelSizesAndColor();
          updateHomeButtonPosition();
        });
        if (controls) controls.target.set(comunicacionLabel.position.x + 0.2, 2, comunicacionLabel.position.z);
      } else if (object.name === utils.nobodyName) {
        movement({x: nobodyLabel.position.x + 1.6, y: utils.defaultObjectElevation, z: nobodyLabel.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
          updateLabelSizesAndColor();
          updateHomeButtonPosition();
        });
        if (controls) controls.target.set(nobodyLabel.position.x + 0.2, 2, nobodyLabel.position.z);
      } else if (object.name === utils.makerName) {
        moveToMaker();
      } else if (object.name === utils.agoraName) {
        moveToAgora();
      } else if (object.name === utils.tele1Name) {
        moveToScreen1();
      } else if (object.name === utils.tele2Name) {
        moveToScreen2();
      }
    }
  });
}
function moveToAgora() {
  movement({x: 3, y: utils.defaultObjectElevation, z: 6}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
    updateLabelSizesAndColor();
    addExitSign(utils.agoraName);
    updateHomeButtonPosition();
    changeScaleSingle(agoraLabel, utils.objectScale.normal);
  });
  if (controls) controls.target.set(3, 2, 6);
}
function moveToMaker() {
  movement({x: -4, y: utils.defaultObjectElevation, z: -10}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
    updateLabelSizesAndColor();
    addExitSign(utils.makerName);
    updateHomeButtonPosition();
    removeFromReticulum(wallMenuOff);
    removeFromReticulum(wallInfo);
    wallMenuHasBeenRemoved = true;
  });
  if (controls) controls.target.set(-4, 2, -10);
}
function addTravelPoints() {
  for (var i = 0; i < utils.labelPoints.length; i++) {
    addLabel(utils.labelPoints[i].name, utils.labelPoints[i].position);
  }
}
function changeScale(object, scaleX, scaleY, scaleZ) {
  object.scale.set(scaleX, scaleY, scaleZ);
}
function changeScaleSingle(object, scale) {
  changeScale(object, scale, scale, scale);
}
function changeColor(object, colorHex) {
  object.material.color.setHex( colorHex );
}
var homeButton;
function addHomeButton(isTutorialFinished) {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + "home_button" + utils.extension),
    transparent: true,
    color: utils.white,
    side: THREE.DoubleSide
  });
  img.map.needsUpdate = true;
  var scale = 1;
  homeButton = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), img);
  homeButton.position.set(camera.position.x, 0.2, camera.position.z);
  var xAxis = new THREE.Vector3(1,0,0);
  rotateAroundWorldAxis(homeButton, xAxis, 90 * Math.PI / 180);
  
  scene.add(homeButton);
  Reticulum.add( homeButton, {
    reticleHoverColor: utils.reticleColors.yellow.bright,
    fuseColor: utils.reticleColors.purple,
    fuseVisible: true,
    onGazeOver: function() {
      changeScaleSingle(homeButton, utils.objectScale.big);
    },
    onGazeOut: function() {
      changeScaleSingle(homeButton, utils.objectScale.normal);
    },
    onGazeLong: function() {
      goHome();
      if (!tutorialFinished) {
        deleteTutorialScene();
        tutorialFinished = true;
      }
    }
  });
}
function goHome() {
  removeMembers();
  if (infoGroupIsShowing) {
    removeInfoSection();
  }
  movement({x: utils.initialPosition.x, y: utils.initialPosition.y, z: utils.initialPosition.z}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
    updateLabelSizesAndColor();
    updateHomeButtonPosition();
    if (controls) controls.target.set(camera.position.x, camera.position.y, camera.position.z + 0.5);
  });
}
var researchLabel, radicalLabel, makerLabel, nobodyLabel, jefesLabel, comunicacionLabel, agoraLabel, tele1Label, tele2Label;
function addLabel(name, position) {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.labelsDirectory + name + utils.extension),
    transparent: true,
    color: utils.white
  });
  img.map.needsUpdate = true;
  var scale = 0.45;
  var plane = new THREE.Mesh(new THREE.PlaneGeometry((name === utils.tele1Name || name === utils.tele2Name) ? scale - 0.1 : scale, (name === utils.tele1Name || name === utils.tele2Name) ? scale/4 : scale/4.76), img);
  plane.name = name;
  plane.position.set(position.x, position.y, position.z);
  if (name === utils.researchName) {
    researchLabel = plane;
  } else if (name === utils.radicalName) {
    radicalLabel = plane;
  } else if (name === utils.makerName) {
    makerLabel = plane;
  } else if (name === utils.jefesName) {
    jefesLabel = plane;
  } else if (name === utils.nobodyName) {
    nobodyLabel = plane;
  } else if (name === utils.comunicacionName) {
    comunicacionLabel = plane;
  } else if (name === utils.agoraName) {
    agoraLabel = plane;
    addAgoraLabelToReticulum();
  } else if (name === utils.tele1Name) {
    tele1Label = plane;
  } else if (name === utils.tele2Name) {
    tele2Label = plane;
  }
  scene.add(plane);
  if (name !== utils.agoraName) {
    Reticulum.add( plane, {
      reticleHoverColor: utils.reticleColors.blue.light,
      fuseColor: utils.reticleColors.blue.dark,
      fuseDuration: utils.reticleDurations.medium,
      fuseVisible: true,
      onGazeOver: function() {
        if (this.material.color) changeColor(plane, utils.selectedLabelColor );
      },
      onGazeOut: function() {
        if (this.material.color) changeColor(plane, utils.white );
      },
      onGazeLong: function() {
        if (exitSignAdded) {
          removeFromReticulum(exitSign);
          scene.remove(exitSign);
          exitSignAdded = false;
        }
        if (wallMenuIsOpen) {
          closeWallMenu();
        }
        changeScaleSingle(plane, utils.objectScale.normal);
        removeMembers();
        removeInfoSection();
        if (name === utils.researchName) {
          addMembers(utils.researchMembers);
        } else if (name === utils.radicalName) {
          addMembers(utils.radicalMembers);
        } else if (name === utils.jefesName) {
          addMembers(utils.jefesAndVenturesMembers);
        } else if (name === utils.comunicacionName) {
          addMembers(utils.comunicacionMembers);
        }
        if (name !== utils.makerName) {
          if (name === utils.tele1Name) {
            moveToScreen1();
          } else if (name === utils.tele2Name) {
            moveToScreen2();
          } else {
            movement({x: plane.position.x + 1.6, y: utils.defaultObjectElevation, z: plane.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
              updateLabelSizesAndColor();
              updateHomeButtonPosition();
            });
            if (controls) controls.target.set(plane.position.x + 0.2, 2, plane.position.z);
          }
        } else {
          moveToMaker();
        }
      }
    });
  }
}
var exitSign;
var exitSignAdded = false;
function addExitSign(name) {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.rootDirectory + 'exit' + utils.extension),
    transparent: true,
    color: utils.white
  });
  img.map.needsUpdate = true;
  var scale = 0.5;
  exitSign = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), img);
  if (name === utils.agoraName) {
    exitSign.position.set(2, 1.8, 3.5);
  } else if (name === utils.makerName) {
    exitSign.position.set(-3.6, 1.8, -11);
  }
  scene.add(exitSign);
  Reticulum.add( exitSign, {
    reticleHoverColor: utils.reticleColors.green.light,
    fuseColor: utils.reticleColors.green.dark,
    fuseDuration: utils.reticleDurations.fast,
    fuseVisible: true,
    onGazeOver: function() {
      changeScaleSingle(exitSign, utils.objectScale.big);
    },
    onGazeOut: function() {
      changeScaleSingle(exitSign, utils.objectScale.normal);
    },
    onGazeLong: function() {
      if (name === utils.agoraName) {
        movement({x: researchLabel.position.x + 1.6, y: utils.defaultObjectElevation, z: researchLabel.position.z - 0.3}, camera.position, 0, 2000, TWEEN.Easing.Quartic.Out, function () {
          updateLabelSizesAndColor();
          updateHomeButtonPosition();
          removeFromReticulum(exitSign);
          scene.remove(exitSign);
        });
        if (controls) controls.target.set(researchLabel.position.x + 0.2, 2, researchLabel.position.z);
      } else if (name === utils.makerName) {
        goHome();
        removeFromReticulum(exitSign);
        scene.remove(exitSign);
      }
      exitSignAdded = false;
    }
  });
  exitSignAdded = true;
}
function addAgoraLabelToReticulum() {
  Reticulum.add( agoraLabel, {
    reticleHoverColor: utils.reticleColors.blue.light,
    fuseColor: utils.reticleColors.blue.dark,
    fuseDuration: utils.reticleDurations.medium,
    fuseVisible: true,
    onGazeOver: function() {
      if (this.material.color) changeColor(agoraLabel, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(agoraLabel, utils.white );
    },
    onGazeLong: function() {
      if (wallMenuIsOpen) {
        closeWallMenu();
      }
      changeScaleSingle(agoraLabel, utils.objectScale.normal);
      removeMembers();
      removeInfoSection();
      moveToAgora();
    }
  });
}
function updateLabelSizesAndColor() {
  var labelArray = [researchLabel, radicalLabel, makerLabel, nobodyLabel, jefesLabel, comunicacionLabel, agoraLabel, tele1Label, tele2Label];
  var cameraPosition = camera.position;
  var threshold = 2;
  for (var i = 0; i < labelArray.length; i++) {
    if (labelArray[i] !== undefined) {
      if (distance(cameraPosition, labelArray[i].position) > threshold) {
        changeScaleSingle(labelArray[i], utils.objectScale.huge);
      } else {
        changeScaleSingle(labelArray[i], utils.objectScale.normal);
      }
      if (distance(cameraPosition, labelArray[i].position) > utils.reticulumFar - 1) {
        changeColor(labelArray[i], utils.darkLabelColor);
      } else {
        changeColor(labelArray[i], utils.white);
      }
    }
  }
}
var rotWorldMatrix;
function rotateAroundWorldAxis(object, axis, radians) {
  rotWorldMatrix = new THREE.Matrix4();
  rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
  rotWorldMatrix.multiply(object.matrix);
  object.matrix = rotWorldMatrix;
  object.rotation.setFromRotationMatrix(object.matrix);
}
var memberPlanes = [];
function addMembers(members) {
  memberPlanes = [];
  for (var i = 0; i < members.length; i++) {
    addMember(members[i], i);
  }
}
function addMember(member, index) {
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.subFolderCircular + member.name + utils.extension),
    transparent: true,
    depthWrite: false,
    color: utils.white
  });
  img.map.needsUpdate = true;
  var scale = 0.7;
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(scale, scale), img);
  plane.name = member.name;
  plane.ventureLogo = member.ventureLogo;
  plane.position.set(member.position.x, member.position.y, member.position.z);
  
  membersGroup.add(plane);
  movement({y: member.position.y}, plane.position, 500 * index, 1500, TWEEN.Easing.Back.Out);
  memberPlanes.push(plane);
  scene.add(plane);
  Reticulum.add( plane, {
    reticleHoverColor: utils.reticleColors.green.light,
    fuseColor: utils.reticleColors.green.dark,
    fuseVisible: true,
    onGazeOver: function() {
      if (this.material.color) changeColor(plane, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(plane, utils.white );
    },
    onGazeLong: function() {
      if (!infoGroupIsShowing) {
        removeMembers();
        if (utils.isRadicalMember(plane)) {
          addRadicalMemberInfoSection(plane);
        } else if (utils.isResearchMember(plane)) {
          addResearchMemberInfoSection(plane);
        } else if (utils.isJefesAndVenturesMember(plane)) {
          addJefesAndVenturesMemberInfoSection(plane);
        } else if (utils.isComunicacionMember(plane)) {
          addComunicacionMemberInfoSection(plane);
        }
      }
    }
  });
}
function removeMembers() {
  var numberOfMembers = memberPlanes.length;
  for (var a = 0; a < numberOfMembers; a++) {
    movement({y: -4}, memberPlanes[a].position, 0, 500, TWEEN.Easing.Back.Out);
    removeFromReticulum(memberPlanes[a]);
    scene.remove(memberPlanes[a]);
    if (a == numberOfMembers - 1) {
      membersGroup = new THREE.Object3D();
      membersGroup.name = 'members';
      memberPlanes = [];
    }
  }
}
var infoCloseButton, infoEmailButton, infoCalendarButton, infoCallButton;
function addRadicalMemberInfoSection(memberObject) {
  addMemberInfoSection(memberObject, -4.5, -2, -4);
}
function addResearchMemberInfoSection(memberObject) {
  addMemberInfoSection(memberObject, -4.5, -2, 1.5);
}
function addJefesAndVenturesMemberInfoSection(memberObject) {
  addMemberInfoSection(memberObject, -4.5, -2, 5.5);
}
function addComunicacionMemberInfoSection(memberObject) {
  addMemberInfoSection(memberObject, -4.5, -2, 12.7);
}
var infoIsOpening = false;
function addMemberInfoSection(memberObject, x, y, z) {
  infoIsOpening = true;
  if (infoGroup.children.length > 0) {
    removeInfoSection();
  }
  scene.remove(infoGroup);
  infoGroup = new THREE.Object3D();
  var texture = textureLoader.load(utils.rootDirectory + "info_board" + utils.extension);
  var geometry = new THREE.PlaneGeometry(3, 1.8, 3);
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    color: utils.white
  });
  var plane = new THREE.Mesh(geometry, material);
  var closeButtonMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.subFolderMediaControls + "close" + utils.extension),
    transparent: true,
    side: THREE.DoubleSide
  });
  closeButtonMaterial.map.needsUpdate = true;
  var closeButtonMesh = new THREE.Mesh(new THREE.PlaneGeometry(utils.infoBoardButtons.close.scale, utils.infoBoardButtons.close.scale), closeButtonMaterial);
  closeButtonMesh.position.set(utils.infoBoardButtons.close.position.x, utils.infoBoardButtons.close.position.y, utils.infoBoardButtons.close.position.z);
  Reticulum.add( closeButtonMesh, {
    reticleHoverColor: utils.reticleColors.red.light,
    fuseColor: utils.reticleColors.red.dark,
    fuseDuration: utils.reticleDurations.fast,
    fuseVisible: true,
    onGazeOver: function() {
      if (this.material.color) changeColor(closeButtonMesh, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(closeButtonMesh, utils.white );
    },
    onGazeLong: function() {
      if (!infoIsOpening) {
        removeInfoSection();
        if (utils.isRadicalMember(memberObject)) {
          addMembers(utils.radicalMembers);
        } else if (utils.isResearchMember(memberObject)) {
          addMembers(utils.researchMembers);
        } else if (utils.isJefesAndVenturesMember(memberObject)) {
          addMembers(utils.jefesAndVenturesMembers);
        } else if (utils.isComunicacionMember(memberObject)) {
          addMembers(utils.comunicacionMembers);
        }
        infoGroupIsShowing = false;
      }
    }
  });
  plane.add(closeButtonMesh);
  var emailButtonMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.subFolderInfoBox + "email" + utils.extension),
    transparent: true,
    side: THREE.DoubleSide
  });
  emailButtonMaterial.map.needsUpdate = true;
  var infoEmailButton = new THREE.Mesh(new THREE.PlaneGeometry(utils.infoBoardButtons.email.scale, utils.infoBoardButtons.email.scale), emailButtonMaterial);
  infoEmailButton.position.set(utils.infoBoardButtons.email.position.x, utils.infoBoardButtons.email.position.y, utils.infoBoardButtons.email.position.z);
  Reticulum.add( infoEmailButton, {
    reticleHoverColor: utils.reticleColors.basic,
    fuseVisible: false,
    onGazeOver: function() {
      if (this.material.color) changeColor(infoEmailButton, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(infoEmailButton, utils.white );
    }
  });
  plane.add(infoEmailButton);
  var calendarButtonMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.subFolderInfoBox + "calendar" + utils.extension),
    transparent: true,
    side: THREE.DoubleSide
  });
  calendarButtonMaterial.map.needsUpdate = true;
  var infoCalendarButton = new THREE.Mesh(new THREE.PlaneGeometry(utils.infoBoardButtons.calendar.scale, utils.infoBoardButtons.calendar.scale), calendarButtonMaterial);
  infoCalendarButton.position.set(utils.infoBoardButtons.calendar.position.x, utils.infoBoardButtons.calendar.position.y, utils.infoBoardButtons.calendar.position.z);
  Reticulum.add( infoCalendarButton, {
    reticleHoverColor: utils.reticleColors.basic,
    fuseVisible: false,
    onGazeOver: function() {
      if (this.material.color) changeColor(infoCalendarButton, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(infoCalendarButton, utils.white );
    }
  });
  plane.add(infoCalendarButton);
  var callButtonMaterial = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.subFolderInfoBox + "call" + utils.extension),
    transparent: true,
    side: THREE.DoubleSide
  });
  callButtonMaterial.map.needsUpdate = true;
  var infoCallButton = new THREE.Mesh(new THREE.PlaneGeometry(utils.infoBoardButtons.call.scale, utils.infoBoardButtons.call.scale), callButtonMaterial);
  infoCallButton.position.set(utils.infoBoardButtons.call.position.x, utils.infoBoardButtons.call.position.y, utils.infoBoardButtons.call.position.z);
  Reticulum.add( infoCallButton, {
    reticleHoverColor: utils.reticleColors.basic,
    fuseVisible: false,
    onGazeOver: function() {
      if (this.material.color) changeColor(infoCallButton, utils.selectedLabelColor );
    },
    onGazeOut: function() {
      if (this.material.color) changeColor(infoCallButton, utils.white );
    }
  });
  plane.add(infoCallButton);
  var img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.subFolderCircular + memberObject.name + utils.extension),
    transparent: true,
    depthWrite: false,
    color: utils.white
  });
  var memberPicture = new THREE.Mesh(new THREE.PlaneGeometry(utils.infoBoardButtons.member.picture.scale, utils.infoBoardButtons.member.picture.scale), img);
  memberPicture.position.set(utils.infoBoardButtons.member.picture.position.x, utils.infoBoardButtons.member.picture.position.y, utils.infoBoardButtons.member.picture.position.z);
  plane.add(memberPicture);
  var memberName = memberObject.name;
  img = new THREE.MeshBasicMaterial({
    map: textureLoader.load(utils.subFolderInfo + memberName + utils.extension),
    transparent: true,
    depthWrite: false,
    color: utils.white
  });
  var memberInfo = new THREE.Mesh(new THREE.PlaneGeometry(utils.infoBoardButtons.member.info.scale, utils.infoBoardButtons.member.info.scale), img);
  memberInfo.position.set(utils.infoBoardButtons.member.info.position.x, utils.infoBoardButtons.member.info.position.y, utils.infoBoardButtons.member.info.position.z);
  plane.add(memberInfo);
  if (memberObject.ventureLogo !== undefined) {
    img = new THREE.MeshBasicMaterial({
      map: textureLoader.load(utils.newVenturesDirectory + memberObject.ventureLogo + utils.extension),
      transparent: true,
      depthWrite: false,
      color: utils.white
    });
    var ventureLogo = new THREE.Mesh(new THREE.PlaneGeometry(utils.infoBoardButtons.member.ventureLogo.scale, utils.infoBoardButtons.member.ventureLogo.scale), img);
    ventureLogo.position.set(utils.infoBoardButtons.member.ventureLogo.position.x, utils.infoBoardButtons.member.ventureLogo.position.y, utils.infoBoardButtons.member.ventureLogo.position.z);
    plane.add(ventureLogo);
  }
  infoGroup.add(plane);
  infoGroup.position.set(x, y, z);
  infoGroup.rotation.y = Math.PI / 2;
  movement({y: 2}, infoGroup.position, 0, 1500, TWEEN.Easing.Back.Out, function () { 
    infoIsOpening = false;
  });
  scene.add(infoGroup);
  infoGroupIsShowing = true;
}
function removeInfoSection() {
  if (infoCloseButton) removeFromReticulum(infoCloseButton);
  if (infoEmailButton) removeFromReticulum(infoEmailButton);
  if (infoCalendarButton) removeFromReticulum(infoCalendarButton);
  if (infoCallButton) removeFromReticulum(infoCallButton);
  movement({y: -2}, infoGroup.position, 0, 1200, TWEEN.Easing.Back.In, function () {
    scene.remove(infoGroup);
    infoGroup = new THREE.Object3D();
    infoGroupIsShowing = false;
  });
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (effect !== undefined) effect.setSize(window.innerWidth, window.innerHeight);
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
var controlsAreMoving = false;
var controlsAreCentered = false;
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
  if (wallMenuIsOpen || wallMenuIsMoving) {
    if (clickMeHint !== undefined) clickMeHint.visible = false;
  } else {
    if (clickMeHint !== undefined) clickMeHint.visible = true;
  }
  if (videoTexture !== undefined) videoTexture.update();
  if (videoTexture2 !== undefined) videoTexture2.update();
  if (memberPlanes.length > 0) {
    for (var i = 0; i < memberPlanes.length; i++) {
      memberPlanes[i].lookAt(camera.position);
    }
  }
  if (researchLabel !== undefined) {
    researchLabel.lookAt(camera.position);
  }
  if (radicalLabel !== undefined) {
    radicalLabel.lookAt(camera.position);
  }
  if (makerLabel !== undefined) {
    makerLabel.lookAt(camera.position);
  }
  if (jefesLabel !== undefined) {
    jefesLabel.lookAt(camera.position);
  }
  if (nobodyLabel !== undefined) {
    nobodyLabel.lookAt(camera.position);
  }
  if (comunicacionLabel !== undefined) {
    comunicacionLabel.lookAt(camera.position);
  }
  if (agoraLabel !== undefined) {
    agoraLabel.lookAt(camera.position);
  }
  if (tele1Label !== undefined) {
    tele1Label.lookAt(camera.position);
  }
  if (tele2Label !== undefined) {
    tele2Label.lookAt(camera.position);
  }
  if (exitSign !== undefined) {
    exitSign.lookAt(camera.position);
  }
  if (closeObjectLabels && closeObjectLabels.length > 0) {
    for (var i = 0; i < closeObjectLabels.length; i++) {
      closeObjectLabels[i].lookAt(camera.position);
    }
  }
  if (homeButton !== undefined) {
    if (controls) {
      homeButton.rotation.setFromRotationMatrix(camera.matrix);
    }
    if (controlsdevice) {
      homeButton.rotation.z = 180 - controlsdevice.deviceOrientation.alpha * Math.PI / 180 + 10;
    }
  }
  if (controls) {
    if (videoPlaying && cameraLookingAtScreenRotationValue !== undefined) {
      if (!controlsAreMoving) {
        if (camera.rotation.z < -1.4 && !controlsAreCentered) {
          controlsAreMoving = true;
          movement({x: screen1Mesh.position.x - 0.1, y: screen1Mesh.position.y, z: screen1Mesh.position.z + 0.1}, mediaControlsContainer.position, 0, 500, TWEEN.Easing.Back.Out, function () {
            controlsAreMoving = false;
            controlsAreCentered = true;
          });
        } else if (camera.rotation.z > cameraLookingAtScreenRotationValue.rotation.z && controlsAreCentered && !controlsAreMoving) {
          controlsAreMoving = true;
          movement({x: screen1Mesh.position.x - 0.1, y: screen1Mesh.position.y - 0.32, z: screen1Mesh.position.z + 0.1}, mediaControlsContainer.position, 0, 500, TWEEN.Easing.Back.Out, function () {
            controlsAreMoving = false;
            controlsAreCentered = false;
          });
        }
      }
    } else if (video2Playing && cameraLookingAtScreenRotationValue !== undefined) {
      if (!controlsAreMoving) {
        if (camera.rotation.z < -1.4 && !controlsAreCentered) {
          controlsAreMoving = true;
          movement({x: screen2Mesh.position.x - 0.1, y: screen2Mesh.position.y, z: screen2Mesh.position.z + 0.1}, mediaControlsContainer.position, 0, 500, TWEEN.Easing.Back.Out, function () {
            controlsAreMoving = false;
            controlsAreCentered = true;
          });
        } else if (camera.rotation.z > cameraLookingAtScreenRotationValue.rotation.z && controlsAreCentered && !controlsAreMoving) {
          controlsAreMoving = true;
          movement({x: screen2Mesh.position.x - 0.1, y: screen2Mesh.position.y - 0.32, z: screen2Mesh.position.z + 0.1}, mediaControlsContainer.position, 0, 500, TWEEN.Easing.Back.Out, function () {
            controlsAreMoving = false;
            controlsAreCentered = false;
          });
        }
      }
    }
  }
  if (anAnimationHasStarted) {
    clock = new THREE.Clock();
    anAnimationHasStarted = false;
  }
  if (wallInfoTextIsDeflating) {
    var t = clock.getElapsedTime();
    if (t >= 3.0) {
      wallInfoTextIsDeflating = false;
      wallInfoText.visible = false;
      wallInfoIsVisible = false;
    } else {
      wallInfoText.scale.x = 1 - (t/3.0);
      wallInfoText.scale.y = 1 - (t/3.0);
      wallInfoText.scale.z = 1 - (t/3.0);   
    }
  }
  if (wallInfoTextIsInflating) {
    var t = clock.getElapsedTime();
    wallInfoText.visible = true;
    if (t >= 3.0) {
      wallInfoTextIsInflating = false;
      wallInfoText.visible = true;
      wallInfoIsVisible = true;
    } else {
      wallInfoText.scale.x = 0 + (t/3.0);
      wallInfoText.scale.y = 0 + (t/3.0);
      wallInfoText.scale.z = 0 + (t/3.0);   
    }
  }
}
function movement(value, object, delay, duration, easingType, callback) {
  if (wallMenuHasBeenRemoved) {
    addWallMenuToReticulum();
    addWallInfoLogoToReticulum();
  }
  if (videoPlaying && !controlsAreMoving) {
    video.pause();
    video.currentTime = 0;
    video.load();
    video.pause();
    videoPlaying = false;
    removeMediaControls();
    addAgoraLabelToReticulum();
  }
  if (video2Playing && !controlsAreMoving){
    video2.pause();
    video2.currentTime = 0;
    video2.load();
    video2.pause();
    video2Playing = false;
    removeMediaControls();
    addAgoraLabelToReticulum();
 }
  var tween = new TWEEN.Tween(object)
    .to(value, duration)
    .easing(easingType)
    .delay(delay)
    .onComplete(function () {
      if (callback) {
        callback();
      }
    })
    .start();
}
function updateHomeButtonPosition() {
  if (!homeButton.visible) {
    homeButton.visible = true;
  }
  movement({x: camera.position.x, y: 0.2, z: camera.position.z}, homeButton.position, 0, 10, TWEEN.Easing.Quartic.Out);
}
function distance(positionA, positionB) {
  var difX = positionA.x - positionB.x;
  var difY = positionA.y - positionB.y;
  var difZ = positionA.z - positionB.z;
  return Math.sqrt(difX*difX + difY*difY + difZ*difZ);
}
function calculateDistances() {
  distancesFromReticleToObject = [];
  var objectPosition;
  for (var i = 0; i < parentTutorial.children.length; i++) {
    objectPosition = {x:parentTutorial.position.x + parentTutorial.children[i].position.x, y:parentTutorial.position.y + parentTutorial.children[i].position.y, z:parentTutorial.position.z + parentTutorial.children[i].position.z};
    var dist = distance(camera.position, objectPosition);
    distancesFromReticleToObject.push(dist);
  }
  highlightClosestObjects();
}