const drawCity = () => {
	const canvas = document.getElementById("citycanvas");
	const c2 = document.getElementById("lightingcanvas");

	canvas.height = canvas.width * canvas.offsetHeight / canvas.offsetWidth;

	const wid = canvas.width;
	const hgt = canvas.height;

	document.body.appendChild(canvas);

	const ctx=canvas.getContext("2d");

	let darkClr = "#434";
	let lightClr = "#675";
	let windowClr = "#ff4";
	let skyClrBase="rgb(255,23,95)";
	let skyClrMid="#483ba0";
	let skyClrTop="#281ba0";

	let scale = 0.1;

	let windowWidMin = 60;
	let windowWidMax = 300;
	let windowHeight = 70;
	let windowVertGap = 70;
	let windowHorGapMin = 20;
	let windowHorGapMax = 250;

	let lightPortion = 0.6;

	let darkwdmin = 400;
	let darkwdmax = 1200;

	let bldheightmin = 250;
	let bldheightmax = (hgt/scale)*0.5;

	let numbldgs = (20/10000)*wid/scale;
	let numstars = 0.05*wid




	const skyGradient = ctx.createLinearGradient(0, 0, 0, hgt);
	skyGradient.addColorStop(0, skyClrTop);
	skyGradient.addColorStop(0.8, skyClrMid);
	skyGradient.addColorStop(1, skyClrBase);

	ctx.fillStyle = skyGradient;
	ctx.fillRect(0, 0, wid, hgt);

	ctx.fillStyle = "#fff";
	for(let n = 0; n < numstars; n++){
		let x = Math.floor(Math.random()*(wid-2));
		let y = Math.floor(Math.random()*(hgt-2));

		ctx.fillRect(x, y, 2, 2);
	}

	windowWidMin *= scale;
	windowWidMax *= scale;
	windowHeight *= scale;
	windowVertGap *= scale;
	windowHorGapMin *= scale;
	windowHorGapMax *= scale;
	darkwdmin *= scale;
	darkwdmax *= scale;
	bldheightmin *= scale;
	bldheightmax *= scale;

	function getBuilding(){
		const ypos = hgt;

		let darkwd = Math.random() * (darkwdmax-darkwdmin) + darkwdmin;
		let lightwd = darkwd * lightPortion * (Math.random() * 0.8 + 0.6);
		const xpos = Math.random()*(wid-lightwd-darkwd);

		const totalwid = darkwd + lightwd;

		const bldheight = Math.random() * (bldheightmax-bldheightmin) + bldheightmin;

		ctx.fillStyle = darkClr;
		ctx.fillRect(xpos, hgt-bldheight, darkwd, bldheight);
		ctx.fillStyle = lightClr;
		ctx.fillRect(xpos+darkwd, hgt-bldheight, lightwd, bldheight);

		ctx.fillStyle = windowClr;

		for(let winy = windowVertGap; winy <= bldheight - windowHeight - windowVertGap; winy += windowVertGap + windowHeight){
			(() => {
				let currentwinx = windowHorGapMin + Math.random()*(windowHorGapMax-windowHorGapMin);
				const rightgap = Math.random()*(windowHorGapMax-windowHorGapMin)+windowHorGapMin;
				while(currentwinx < darkwd - windowWidMin - rightgap){
					let winwid = windowWidMin + Math.random() * (windowWidMax-windowWidMin);
					if(currentwinx + winwid > darkwd - rightgap){
						winwid = darkwd - rightgap - currentwinx;
					}

					ctx.fillRect(currentwinx + xpos, winy + hgt-bldheight, winwid, windowHeight);
					currentwinx += winwid + Math.random()*(windowHorGapMax-windowHorGapMin);
				}
			})();

			(() => {
				let currentwinx = windowHorGapMin + Math.random()*(windowHorGapMax-windowHorGapMin) * lightPortion;
				const rightgap = Math.random()*(windowHorGapMax-windowHorGapMin)+windowHorGapMin * lightPortion;
				while(currentwinx < lightwd - windowWidMin*lightPortion - rightgap){
					let winwid = (windowWidMin + Math.random() * (windowWidMax-windowWidMin)) * lightPortion;
					if(currentwinx + winwid > lightwd - rightgap){
						winwid = lightwd - rightgap - currentwinx;
					}

					ctx.fillRect(currentwinx + xpos + darkwd, winy + hgt-bldheight, winwid, windowHeight);
					currentwinx += winwid + Math.random()*(windowHorGapMax-windowHorGapMin);
				}
			})();
		}
	}

	for(let i = 0; i < numbldgs * 0.5; i++){
		getBuilding();
	}
	bldheightmin *= 0.25;
	bldheightmax *= 0.25;
	for(let i = 0; i < numbldgs * 0.5; i++){
		getBuilding();
	}

	let p1 = {
		x:-Math.random()*wid*0.5,
		y:hgt*0.25+Math.random()*hgt*0.5
	};
	if(Math.random() < 0.5) p1.x += wid*1.5;

	let t1 = 100; //Period of sin wave propegating from this point

	c2.width = wid;
	c2.height = hgt;


	const gl = c2.getContext("webgl");
	gl.clearColor(1, 1, 1, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);
	const vertexShaderSource = `
	attribute vec2 a_position;
	void main() {
	gl_Position = vec4(a_position, 0, 1);
	}
	`;

	const fragmentShaderSource = `
	precision mediump float;
	uniform vec2 u_resolution;
	uniform vec2 u_pointpos;
	uniform float u_t;

	void main() {
		float t = 120.0;

		vec2 fragCoord = vec2(gl_FragCoord.x, u_resolution.y-gl_FragCoord.y);
		fragCoord.x += sin(fragCoord.y*1.0)*u_resolution.x*0.1;
		vec2 d = abs(fragCoord.xy-u_pointpos);
		d.x *= sqrt(fragCoord.y/u_resolution.y);
		d.x = sqrt(d.x/250.0)*250.0;
		float len = length(d);

		float b = sin(3.141*len/t) * (4.0*t/(len+4.0*t))+0.7;
		if((mod((floor(fragCoord.x/4.0)), 2.0)!=mod((floor(fragCoord.y/4.0)),2.0))){
			b *= abs(b) * 0.6;
		}
		b *= fragCoord.y/u_resolution.y;
		vec3 clr = vec3(1.0, 0.18, 0.74);
		if(b < 0.0){
			b *= -1.0;
			//clr = vec3(0.6,0.18,1.0);
		}
		gl_FragColor = vec4(clr, b);
	}
	`;

	function compileShader(gl, source, type) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	return shader;
	}

	const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
	const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);

	const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
	const pointUniformLocation = gl.getUniformLocation(program, "u_pointpos");
	const periodUniformLocation = gl.getUniformLocation(program, "u_period");

	const positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
	gl.uniform2f(pointUniformLocation, p1.x, p1.y);
	gl.uniform1f(periodUniformLocation, t1);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};
drawCity();
window.addEventListener("resize", drawCity);
