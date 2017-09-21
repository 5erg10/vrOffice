//-----------------EXPLODE CYLINDER -----------------------------------

var geometry = new THREE.CylinderGeometry( 2.5, 2.5, 3, 300, 300, true );
	var material = new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/ofi.jpg'), side: THREE.DoubleSide, transparent: true,  opacity: 1, color: 0xFFFFFF, depthWrite: false  });

	var explodeModifier = new THREE.ExplodeModifier();
	explodeModifier.modify( geometry );

	cylinder = new THREE.Mesh( geometry, material );

	numVertices = cylinder.geometry.vertices.length;

	for( var a = 0; a < numVertices; a+=3 ){
		//var number =  Math.random() * (1 - 2) + 1;
		var number =  Math.random() + 1;
		cylinder.geometry.vertices[ a ].multiplyScalar( number );
		cylinder.geometry.vertices[ a+1 ].multiplyScalar( number );
		cylinder.geometry.vertices[ a+2 ].multiplyScalar( number );
		//cylinder.geometry.vertices[ THREE.Math.randInt( 0, cylinder.geometry.vertices.length ) ].multiplyScalar( 1.01 );
		cylinder.geometry.verticesNeedUpdate = true; // important
	}

	scene.add( cylinder );