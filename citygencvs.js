const wid = window.innerWidth;
const hgt = window.innerHeight;

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.style.height="90vh";
canvas.style.position = "absolute";
canvas.width = wid;
canvas.height = hgt;

const ctx=canvas.getContext("2d");

let darkClr = "#444";
let lightClr = "#666";
let windowClr = "#ff4";

let scale = 0.05;

let windowWidMin = 40;
let windowWidMax = 250;
let windowHeight = 50;
let windowVertGap = 50;
let windowHorGapMin = 20;
let windowHorGapMax = 250;

let lightPortion = 0.6;

let darkwdmin = 400;
let darkwdmax = 600;

let bldheightmin = 500;
let bldheightmax = 8000;

let numbldgs = (60/10000)*wid/scale;
let numstars = 0.1*wid




const skyGradient = ctx.createLinearGradient(0, 0, 0, hgt);
skyGradient.addColorStop(0, '#282b8e');
skyGradient.addColorStop(0.8, '#585bae');
skyGradient.addColorStop(1, 'rgb(255, 23, 95)');

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

const c2 = document.createElement("canvas");
c2.width = wid;
c2.height = hgt;

document.body.appendChild(c2);
c2.style = "position:absolute;height:90vh;mix-blend-mode:color;";


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
    float t = 100.0;

	vec2 fragCoord = vec2(gl_FragCoord.x, u_resolution.y-gl_FragCoord.y);

    vec2 d = abs(fragCoord.xy-u_pointpos);
    d.x *= sqrt(fragCoord.y/u_resolution.y);
    d.x = sqrt(d.x/250.0)*250.0;
    float len = length(d);

    float b = sin(3.141*len/t) * (4.0*t/(len+4.0*t))+0.5;
    if((mod((floor(fragCoord.x/4.0)), 2.0)!=mod((floor(fragCoord.y/4.0)),2.0))){
        b *= b;
    }
    b *= fragCoord.y/u_resolution.y;
	if(b < 0.0){
		b = 0.0;
	}
    gl_FragColor = vec4(1, 0.18, 0.74, b);
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

//ctx.clearRect(0, 0, wid, hgt);

/*
const ctx2 = c2.getContext("2d");
for(let x = 0; x < wid; x++){
	for(let y = 0; y < hgt; y++){
		let brightness = 0;
		let dx = Math.abs(x-p1.x);
		let dy = Math.abs(y-p1.y);

		dx *= Math.pow(y/hgt, 0.5);

		dx = Math.pow(dx/250, 0.5)*250;

		let d1 = Math.pow(dx*dx+dy*dy, 0.5);

		brightness = Math.sin(Math.PI*d1/(t1)) * ((4*t1)/(d1+4*t1))+0.5;
		if((Math.floor(x/4) % 2)^(Math.floor(y/4) % 2)) brightness *= brightness;

		brightness *= 1;
		brightness *= Math.pow(y/hgt, 1.5);
		if(brightness<0){brightness=0;}

		ctx2.fillStyle = `rgba(255, 46, 189, ${brightness})`;
		ctx2.fillRect(x, y, 1, 1);
	}
}
*/
