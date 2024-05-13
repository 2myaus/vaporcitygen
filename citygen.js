const wid = 10000;
const hgt = 10000;

const svgstart = `<svg width="${wid}" height="${hgt}" viewBox="0 0 ${wid} ${hgt}" xmlns="http://www.w3.org/2000/svg">`;
const svgend = `</svg>`;

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

let scale = 1;

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
let bldheightmax = 4000;

let numbldgs = (120/10000)*wid;

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

	let g= `
	<g>
	<rect width="${darkwd}" height="${bldheight}" x="${xpos}" y="${hgt-bldheight}" fill="${darkClr}" />
	<rect width="${lightwd}" height="${bldheight}" x="${xpos+darkwd}" y="${hgt-bldheight}" fill="${lightClr}" />
	`;

	for(let winy = windowVertGap; winy <= bldheight - windowHeight - windowVertGap; winy += windowVertGap + windowHeight){
		(() => {
			let currentwinx = windowHorGapMin + Math.random()*(windowHorGapMax-windowHorGapMin);
			const rightgap = Math.random()*(windowHorGapMax-windowHorGapMin)+windowHorGapMin;
			while(currentwinx < darkwd - windowWidMin - rightgap){
				let winwid = windowWidMin + Math.random() * (windowWidMax-windowWidMin);
				if(currentwinx + winwid > darkwd - rightgap){
					winwid = darkwd - rightgap - currentwinx;
				}
				g += `
				<rect width="${winwid}" height="${windowHeight}" x="${currentwinx + xpos}" y="${winy + hgt-bldheight}" fill="${windowClr}" />`;
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
				g += `
				<rect width="${winwid}" height="${windowHeight}" x="${currentwinx + xpos + darkwd}" y="${winy + hgt-bldheight}" fill="${windowClr}" />`;
				currentwinx += winwid + Math.random()*(windowHorGapMax-windowHorGapMin);
			}
		})();
	}

	return g+`
	</g>`;
}

let svg = svgstart;
for(let i = 0; i < numbldgs * 0.5; i++){
	svg += getBuilding();
}
bldheightmin *= 0.25;
bldheightmax *= 0.25;
for(let i = 0; i < numbldgs * 0.5; i++){
	svg += getBuilding();
}
svg += svgend;

//document.body.innerHTML = svg;

const cityurl = URL.createObjectURL(new Blob([svg], {type: 'image/svg+xml'}));
const cityImg = new Image();
cityImg.src = cityurl;

document.body.onload=() => {
	ctx.drawImage(cityImg, 0, 0);
		
	document.body.style.backgroundColor = "#101028";
}
