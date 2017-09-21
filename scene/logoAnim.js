/**
* Created by sergiosantamaria on 23/09/16.
*/

(function(u,r){"function"===typeof define&&define.amd?define([],r):"object"===typeof module&&module.exports?module.exports=r():u.anime=r()})(this,function(){var u={duration:1E3,delay:0,loop:!1,autoplay:!0,direction:"normal",easing:"easeOutElastic",elasticity:400,round:!1,begin:void 0,update:void 0,complete:void 0},r="translateX translateY translateZ rotate rotateX rotateY rotateZ scale scaleX scaleY scaleZ skewX skewY".split(" "),y,f={arr:function(a){return Array.isArray(a)},obj:function(a){return-1<
Object.prototype.toString.call(a).indexOf("Object")},svg:function(a){return a instanceof SVGElement},dom:function(a){return a.nodeType||f.svg(a)},num:function(a){return!isNaN(parseInt(a))},str:function(a){return"string"===typeof a},fnc:function(a){return"function"===typeof a},und:function(a){return"undefined"===typeof a},nul:function(a){return"null"===typeof a},hex:function(a){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a)},rgb:function(a){return/^rgb/.test(a)},hsl:function(a){return/^hsl/.test(a)},
col:function(a){return f.hex(a)||f.rgb(a)||f.hsl(a)}},D=function(){var a={},b={Sine:function(a){return 1-Math.cos(a*Math.PI/2)},Circ:function(a){return 1-Math.sqrt(1-a*a)},Elastic:function(a,b){if(0===a||1===a)return a;var d=1-Math.min(b,998)/1E3,g=a/1-1;return-(Math.pow(2,10*g)*Math.sin(2*(g-d/(2*Math.PI)*Math.asin(1))*Math.PI/d))},Back:function(a){return a*a*(3*a-2)},Bounce:function(a){for(var b,d=4;a<((b=Math.pow(2,--d))-1)/11;);return 1/Math.pow(4,3-d)-7.5625*Math.pow((3*b-2)/22-a,2)}};["Quad",
"Cubic","Quart","Quint","Expo"].forEach(function(a,e){b[a]=function(a){return Math.pow(a,e+2)}});Object.keys(b).forEach(function(c){var e=b[c];a["easeIn"+c]=e;a["easeOut"+c]=function(a,b){return 1-e(1-a,b)};a["easeInOut"+c]=function(a,b){return.5>a?e(2*a,b)/2:1-e(-2*a+2,b)/2};a["easeOutIn"+c]=function(a,b){return.5>a?(1-e(1-2*a,b))/2:(e(2*a-1,b)+1)/2}});a.linear=function(a){return a};return a}(),z=function(a){return f.str(a)?a:a+""},E=function(a){return a.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase()},
F=function(a){if(f.col(a))return!1;try{return document.querySelectorAll(a)}catch(b){return!1}},A=function(a){return a.reduce(function(a,c){return a.concat(f.arr(c)?A(c):c)},[])},t=function(a){if(f.arr(a))return a;f.str(a)&&(a=F(a)||a);return a instanceof NodeList||a instanceof HTMLCollection?[].slice.call(a):[a]},G=function(a,b){return a.some(function(a){return a===b})},R=function(a,b){var c={};a.forEach(function(a){var d=JSON.stringify(b.map(function(b){return a[b]}));c[d]=c[d]||[];c[d].push(a)});
return Object.keys(c).map(function(a){return c[a]})},H=function(a){return a.filter(function(a,c,e){return e.indexOf(a)===c})},B=function(a){var b={},c;for(c in a)b[c]=a[c];return b},v=function(a,b){for(var c in b)a[c]=f.und(a[c])?b[c]:a[c];return a},S=function(a){a=a.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(a,b,c,m){return b+b+c+c+m+m});var b=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(a);a=parseInt(b[1],16);var c=parseInt(b[2],16),b=parseInt(b[3],16);return"rgb("+a+","+c+","+b+")"},
T=function(a){a=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(a);var b=parseInt(a[1])/360,c=parseInt(a[2])/100,e=parseInt(a[3])/100;a=function(a,b,c){0>c&&(c+=1);1<c&&--c;return c<1/6?a+6*(b-a)*c:.5>c?b:c<2/3?a+(b-a)*(2/3-c)*6:a};if(0==c)c=e=b=e;else var d=.5>e?e*(1+c):e+c-e*c,g=2*e-d,c=a(g,d,b+1/3),e=a(g,d,b),b=a(g,d,b-1/3);return"rgb("+255*c+","+255*e+","+255*b+")"},p=function(a){return/([\+\-]?[0-9|auto\.]+)(%|px|pt|em|rem|in|cm|mm|ex|pc|vw|vh|deg)?/.exec(a)[2]},I=function(a,b,c){return p(b)?
b:-1<a.indexOf("translate")?p(c)?b+p(c):b+"px":-1<a.indexOf("rotate")||-1<a.indexOf("skew")?b+"deg":b},w=function(a,b){if(b in a.style)return getComputedStyle(a).getPropertyValue(E(b))||"0"},U=function(a,b){var c=-1<b.indexOf("scale")?1:0,e=a.style.transform;if(!e)return c;for(var d=/(\w+)\((.+?)\)/g,g=[],m=[],f=[];g=d.exec(e);)m.push(g[1]),f.push(g[2]);e=f.filter(function(a,c){return m[c]===b});return e.length?e[0]:c},J=function(a,b){if(f.dom(a)&&G(r,b))return"transform";if(f.dom(a)&&(a.getAttribute(b)||
f.svg(a)&&a[b]))return"attribute";if(f.dom(a)&&"transform"!==b&&w(a,b))return"css";if(!f.nul(a[b])&&!f.und(a[b]))return"object"},K=function(a,b){switch(J(a,b)){case "transform":return U(a,b);case "css":return w(a,b);case "attribute":return a.getAttribute(b)}return a[b]||0},L=function(a,b,c){if(f.col(b))return b=f.rgb(b)?b:f.hex(b)?S(b):f.hsl(b)?T(b):void 0,b;if(p(b))return b;a=p(a.to)?p(a.to):p(a.from);!a&&c&&(a=p(c));return a?b+a:b},M=function(a){var b=/-?\d*\.?\d+/g;return{original:a,numbers:z(a).match(b)?
z(a).match(b).map(Number):[0],strings:z(a).split(b)}},V=function(a,b,c){return b.reduce(function(b,d,g){d=d?d:c[g-1];return b+a[g-1]+d})},W=function(a){a=a?A(f.arr(a)?a.map(t):t(a)):[];return a.map(function(a,c){return{target:a,id:c}})},N=function(a,b,c,e){"transform"===c?(c=a+"("+I(a,b.from,b.to)+")",b=a+"("+I(a,b.to)+")"):(a="css"===c?w(e,a):void 0,c=L(b,b.from,a),b=L(b,b.to,a));return{from:M(c),to:M(b)}},X=function(a,b){var c=[];a.forEach(function(e,d){var g=e.target;return b.forEach(function(b){var l=
J(g,b.name);if(l){var q;q=b.name;var h=b.value,h=t(f.fnc(h)?h(g,d):h);q={from:1<h.length?h[0]:K(g,q),to:1<h.length?h[1]:h[0]};h=B(b);h.animatables=e;h.type=l;h.from=N(b.name,q,h.type,g).from;h.to=N(b.name,q,h.type,g).to;h.round=f.col(q.from)||h.round?1:0;h.delay=(f.fnc(h.delay)?h.delay(g,d,a.length):h.delay)/k.speed;h.duration=(f.fnc(h.duration)?h.duration(g,d,a.length):h.duration)/k.speed;c.push(h)}})});return c},Y=function(a,b){var c=X(a,b);return R(c,["name","from","to","delay","duration"]).map(function(a){var b=
B(a[0]);b.animatables=a.map(function(a){return a.animatables});b.totalDuration=b.delay+b.duration;return b})},C=function(a,b){a.tweens.forEach(function(c){var e=c.from,d=a.duration-(c.delay+c.duration);c.from=c.to;c.to=e;b&&(c.delay=d)});a.reversed=a.reversed?!1:!0},Z=function(a){if(a.length)return Math.max.apply(Math,a.map(function(a){return a.totalDuration}))},O=function(a){var b=[],c=[];a.tweens.forEach(function(a){if("css"===a.type||"transform"===a.type)b.push("css"===a.type?E(a.name):"transform"),
a.animatables.forEach(function(a){c.push(a.target)})});return{properties:H(b).join(", "),elements:H(c)}},aa=function(a){var b=O(a);b.elements.forEach(function(a){a.style.willChange=b.properties})},ba=function(a){O(a).elements.forEach(function(a){a.style.removeProperty("will-change")})},ca=function(a,b){var c=a.path,e=a.value*b,d=function(d){d=d||0;return c.getPointAtLength(1<b?a.value+d:e+d)},g=d(),f=d(-1),d=d(1);switch(a.name){case "translateX":return g.x;case "translateY":return g.y;case "rotate":return 180*
Math.atan2(d.y-f.y,d.x-f.x)/Math.PI}},da=function(a,b){var c=Math.min(Math.max(b-a.delay,0),a.duration)/a.duration,e=a.to.numbers.map(function(b,e){var f=a.from.numbers[e],l=D[a.easing](c,a.elasticity),f=a.path?ca(a,l):f+l*(b-f);return f=a.round?Math.round(f*a.round)/a.round:f});return V(e,a.to.strings,a.from.strings)},P=function(a,b){var c;a.currentTime=b;a.progress=b/a.duration*100;for(var e=0;e<a.tweens.length;e++){var d=a.tweens[e];d.currentValue=da(d,b);for(var f=d.currentValue,m=0;m<d.animatables.length;m++){var l=
d.animatables[m],k=l.id,l=l.target,h=d.name;switch(d.type){case "css":l.style[h]=f;break;case "attribute":l.setAttribute(h,f);break;case "object":l[h]=f;break;case "transform":c||(c={}),c[k]||(c[k]=[]),c[k].push(f)}}}if(c)for(e in y||(y=(w(document.body,"transform")?"":"-webkit-")+"transform"),c)a.animatables[e].target.style[y]=c[e].join(" ");a.settings.update&&a.settings.update(a)},Q=function(a){var b={};b.animatables=W(a.targets);b.settings=v(a,u);var c=b.settings,e=[],d;for(d in a)if(!u.hasOwnProperty(d)&&
"targets"!==d){var g=f.obj(a[d])?B(a[d]):{value:a[d]};g.name=d;e.push(v(g,c))}b.properties=e;b.tweens=Y(b.animatables,b.properties);b.duration=Z(b.tweens)||a.duration;b.currentTime=0;b.progress=0;b.ended=!1;return b},n=[],x=0,ea=function(){var a=function(){x=requestAnimationFrame(b)},b=function(b){if(n.length){for(var e=0;e<n.length;e++)n[e].tick(b);a()}else cancelAnimationFrame(x),x=0};return a}(),k=function(a){var b=Q(a),c={};b.tick=function(a){b.ended=!1;c.start||(c.start=a);c.current=Math.min(Math.max(c.last+
a-c.start,0),b.duration);P(b,c.current);var d=b.settings;d.begin&&c.current>=d.delay&&(d.begin(b),d.begin=void 0);c.current>=b.duration&&(d.loop?(c.start=a,"alternate"===d.direction&&C(b,!0),f.num(d.loop)&&d.loop--):(b.ended=!0,b.pause(),d.complete&&d.complete(b)),c.last=0)};b.seek=function(a){P(b,a/100*b.duration)};b.pause=function(){ba(b);var a=n.indexOf(b);-1<a&&n.splice(a,1)};b.play=function(a){b.pause();a&&(b=v(Q(v(a,b.settings)),b));c.start=0;c.last=b.ended?0:b.currentTime;a=b.settings;"reverse"===
a.direction&&C(b);"alternate"!==a.direction||a.loop||(a.loop=1);aa(b);n.push(b);x||ea()};b.restart=function(){b.reversed&&C(b);b.pause();b.seek(0);b.play()};b.settings.autoplay&&b.play();return b};k.version="1.1.1";k.speed=1;k.list=n;k.remove=function(a){a=A(f.arr(a)?a.map(t):t(a));for(var b=n.length-1;0<=b;b--)for(var c=n[b],e=c.tweens,d=e.length-1;0<=d;d--)for(var g=e[d].animatables,k=g.length-1;0<=k;k--)G(a,g[k].target)&&(g.splice(k,1),g.length||e.splice(d,1),e.length||c.pause())};k.easings=D;
k.getValue=K;k.path=function(a){a=f.str(a)?F(a)[0]:a;return{path:a,value:a.getTotalLength()}};k.random=function(a,b){return Math.floor(Math.random()*(b-a+1))+a};return k});


function startLogoAnim(){

	$('#logoBox').css('opacity', '1');

	var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
	var ff = navigator.userAgent.indexOf('Firefox') > 0;
	var tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
	if (iOS) document.body.classList.add('iOS');

	var fireworks = (function() {

		var getFontSize = function() {
			return parseFloat(getComputedStyle(document.documentElement).fontSize);
		};

		var canvas = document.querySelector('.fireworks');
		var ctx = canvas.getContext('2d');
		var numberOfParticules = 24;
		var distance = 200;
		var x = 0;
		var y = 0;
		var animations = [];

		var setCanvasSize = function() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		var updateCoords = function(e) {
			x = e.clientX || e.touches[0].clientX;
			y = e.clientY || e.touches[0].clientY;
		};

		var colors = ['#FFFFFF', '#bbbbbb', '#888888', '#ffee00'];

		var createCircle = function(x,y) {
			var p = {};
			p.x = x;
			p.y = y;
			p.color = colors[anime.random(0, colors.length - 1)];
			p.color = '#FFF';
			p.radius = 0;
			p.alpha = 1;
			p.lineWidth = 6;
			p.draw = function() {
				ctx.globalAlpha = p.alpha;
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
				ctx.lineWidth = p.lineWidth;
				ctx.strokeStyle = p.color;
				ctx.stroke();
				ctx.globalAlpha = 1;
			};
			return p;
		};

		var createParticule = function(x,y) {
			var p = {};
			p.x = x;
			p.y = y;
			p.color = colors[anime.random(0, colors.length - 1)];
			p.radius = anime.random(getFontSize(), getFontSize() * 2);
			p.draw = function() {
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
				ctx.fillStyle = p.color;
				ctx.fill();
			};
			return p;
		};

		var createParticles = function(x,y) {
			var particules = [];
			for (var i = 0; i < numberOfParticules; i++) {
				var p = createParticule(x, y);
				particules.push(p);
			}
			return particules;
		};

		var removeAnimation = function(animation) {
			var index = animations.indexOf(animation);
			if (index > -1) animations.splice(index, 1);
		};

		var animateParticules = function(x, y) {
			setCanvasSize();
			var particules = createParticles(x, y);
			var circle = createCircle(x, y);
			var particulesAnimation = anime({
				targets: particules,
				x: function(p) { return p.x + anime.random(-distance, distance); },
				y: function(p) { return p.y + anime.random(-distance, distance); },
				radius: 0,
				duration: function() { return anime.random(1200, 1800); },
				easing: 'easeOutExpo',
				complete: removeAnimation
			});
			var circleAnimation = anime({
				targets: circle,
				radius: function() { return anime.random(getFontSize() * 8.75, getFontSize() * 11.25); },
				lineWidth: 0,
				alpha: {
					value: 0,
					easing: 'linear',
					duration: function() { return anime.random(400, 600); }
				},
				duration: function() { return anime.random(1200, 1800); },
				easing: 'easeOutExpo',
				complete: removeAnimation
			});
			animations.push(particulesAnimation);
			animations.push(circleAnimation);
		};

		var mainLoop = anime({
			duration: Infinity,
			update: function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				animations.forEach(function(anim) {
					anim.animatables.forEach(function(animatable) {
						animatable.target.draw();
					});
				});
			}
		});

		window.addEventListener('resize', setCanvasSize, false);

		return {
			boom: animateParticules
		};

	})();

	var logoAnimation = function() {

		document.body.classList.add('ready');

		var dot1 = anime({
			targets: '#O-dot-1',
			width: ['0', '9.21'],
			height: ['0', '9.21'],
			duration: 5000,
			elasticity: 600
		});
		var dot2 = anime({
			targets: '#O-dot-2',
			transform: ['scale(10 10)', 'scale(1 1)'],
			duration: 800,
			elasticity: 600
		});
		var dot3 = anime({
			targets: '#O-dot-3',
			transform: ['translate(1000 0)', 'translate(0 0)'],
			duration: 1500,
			elasticity: 600
		});

		var letterA = anime({
			targets: '#letter-A',
			transform: ['translate(0 -600)', 'translate(0 0)'],
			duration: 1500,
			elasticity: 600,
			delay:2000
		});

		var letterN = anime({
			targets: '#letter-N',
			transform: ['scale(3 3)', 'scale(1 1)'],
			duration: 800,
			delay:2000
		});

		var letterS = anime({
			targets: '#letter-S'
		});

		var letterP = anime({
			targets: '#beevaLogo path',
			transform: ['translate('+anime.random(0, 5000)+' '+anime.random(0, 5000)+')' , 'translate(-1662.12 -472.83)'],
			delay: function(t, i) { return 0 + (anime.random(0, 2000)); },
			duration: 2000,
			//direction: 'alternate',
			easing: 'easeOutExpo',
			complete: function() {
				anime({
					targets: '#letter-O',
					fill: '#ffdd00',
					duration: 500,
					complete: function(a) {
						var dot = letterN.animatables[0].target.getBoundingClientRect();
						var pos = {x: dot.left + (dot.width / 2), y: (dot.top + (dot.height / 2))-40};
						var dot2 = dot1.animatables[0].target.getBoundingClientRect();
						var pos2 = {x: dot2.left + (dot2.width / 2), y: dot2.top + (dot2.height / 2)};
						var dot3 = letterS.animatables[0].target.getBoundingClientRect();
						var pos3 = {x: dot3.left + (dot3.width / 2), y: dot3.top + (dot3.height / 2)};
						setTimeout(function(){
									fireworks.boom(pos.x, pos.y);
									fireworks.boom(pos2.x, pos2.y);
									fireworks.boom(pos3.x, pos3.y);
								}, 2000);
						anime({
							targets: '#logoBox',
							opacity: 0,
							duration: 600,
							delay: 2000,
							complete: function() {
								setTimeout(function(){
									$('#container').addClass('displayOn');
									//$('#loadingProgress').addClass('displayOn');
									$('#logoBox').css('display', 'none');
									$('#fireWorks').css('display', 'none');
									initRender();
									animate();
								}, 2000);
							}
						});
					}
				});
			}
		});

	};
	logoAnimation();
}