const wid = 1000;
const hgt = 1000;

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
let bldheightmax = 4000;

let numbldgs = (60/10000)*wid/scale;

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
	y:(Math.random()*hgt+hgt)*0.5
};
let p2 = {
	x:Math.random()*wid*0.5+wid,
	y:(Math.random()*hgt+hgt)*0.5
};

let t1 = 50; //Period of sin wave propegating from this point
let t2 = 50;

for(let x = 0; x < wid; x++){
	for(let y = 0; y < hgt; y++){
		let brightness = 0;
		let d1 = Math.sqrt((x-p1.x)*(x-p1.x)*0.25+(y-p1.y)*(y-p1.y));
		let d2 = Math.sqrt((x-p2.x)*(x-p2.x)*0.25+(y-p2.y)*(y-p2.y));

		brightness += Math.sin(Math.PI*d1/(t1)) * ((4*t1)/(d1+4*t1))+1;
		brightness += Math.sin(Math.PI*d2/(t2)) * ((4*t2)/(d2+4*t2))+1;
		brightness *= 0.25;
		if(brightness<0){brightness=0;}
		
		ctx.fillStyle = `rgba(255, 0, 0, ${brightness})`;
		//ctx.fillStyle = `rgb(${brightness255}, ${brightness255}, ${brightness255})`;
		ctx.fillRect(x, y, 1, 1);
	}
}

