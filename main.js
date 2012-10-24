// This code is by John Weachock (jweachock@gmail.com)
// Do what you want with it. Give me credit if you feel like it.
// Comments, criticism, questions, etc. are all welcome.

// Calculates the hypotenuse of a triangle
Math.dist=function(dx,dy) {
	return Math.sqrt(dx*dx+dy*dy);
}

// HSL | color generator
function HSL(h,s,l) {
	this.h=h;
	this.s=s;
	this.l=l;
	this.v="hsl("+Math.round(h)+","+Math.round(s*100)+"%,"+Math.round(l*100)+"%)";
}

// SURFACE | Handles the canvas and stuff
function Surface() {
	// Grabs the canvas element
	this.canvas=document.getElementById("surface");

	// If the browser supports it, let's hit that up!
	if(this.canvas.getContext) {
		// Grab the 2D context and scale the canvas to the full browser size
		this.context=this.canvas.getContext("2d");
		this.canvas.width=window.innerWidth;
		this.canvas.height=window.innerHeight;
		this.width=parseInt(this.canvas.width);
		this.height=parseInt(this.canvas.height);

		// Mouse position
		this.mx=0;
		this.my=0;

		// Number of particles and the base array of elements
		this.elements=[];

		/*
		// Populate the elements
		for(var a=0;a<this.parts;a++) {
			// Radian position of the current particle number
			var t=a/this.parts*Math.PI*2;

			// Get the destination position via the graph function
			// and scale it to be actually visible
			var z=f(t);
			z[0]*=10;
			z[0]+=this.width/2;
			z[1]*=10;
			z[1]+=this.height/2;

			// Get the smallest dimension of the browser
			var r=Math.min(this.height/2,this.width/2);

			// Make a new particle with a rainbow'd color and radius of 3px
			var e=new Particle(this,new HSL(a*360/this.parts,1,0.5),3);

			// Set its initial position in a circle around the center
			e.setPos(this.width/2 + r*Math.cos(t-Math.PI/2), this.height/2 + r*Math.sin(t-Math.PI/2));

			// Set its destination position to a point around the curve
			e.setTarget(z[0],z[1]);

			// Delay its release
			e.setDelay(a*2);

			// Push it into the elements array
			this.elements.push(e);
		}
		*/

		// Start the engine
		this.step();
	} else {
		// BUMMER
		alert("No <canvas> support.");
	}
}

// SURFACE:step | Primary frame handler
Surface.prototype.step=function() {
	// Draw a black alpha rectangle over the whole canvas to create "trails" behind each particle
	this.context.fillStyle="rgba(0,0,0,0.05)";
	this.context.fillRect(0,0,this.width,this.height);
	
	// Loop through the elements
	for(var i=0;i<this.elements.length;i++) {
		var o=this.elements[i];
		// If it's a thing, has a step(), and has a draw()...
		if(o && o.step && o.draw) {
			// Step and draw it
			o.step();
			o.draw();
		}
	}

	// Set a timeout to call this again in 10ms (pretty much whatever the fastest available interval is)
	setTimeout("surface.step()",10);
}

// SURFACE:moused | Called when the a mouse button is pressed
Surface.prototype.moused=function(e) {
	var clicked=false;
	for(var i=0;i<this.elements.length;i++) {
		var o=this.elements[i];
		if(o && o.hitTest && o.hitTest(this.mx,this.my)) {
			o.mousePress();
			clicked=true;
		}
	}
	if(!clicked) {
		// Make a new particle
		var e=new Particle(this,new HSL(Math.random()*360,1,0.5),30);

		// Set its initial position to the cursor
		e.setPos(this.mx,this.my);

		// Set its initial direction to random
		e.setDir(Math.random()*5-2.5,Math.random()*5-2.5);

		// Push it into the elements array
		this.elements.push(e);
	}
}

// SURFACE:mouseu | Called when the a mouse button is released
Surface.prototype.mouseu=function(e) {
	for(var i=0;i<this.elements.length;i++) {
		var o=this.elements[i];
		if(o && o.hitTest && o.hitTest(this.mx,this.my)) {
			o.mouseRelease();
		}
	}
}

// SURFACE:mousem | Called when the mouse moves on the page
//				  | Stores the mouses position to allow particle warping later
Surface.prototype.mousem=function(e) {
	this.mx=e.pageX;
	this.my=e.pageY;
}

// ELEMENT | Basic element to be drawn on the canvas
function Element(surface) {}
Element.prototype.draw=function() {} // Draws the element
Element.prototype.step=function() {} // Called every frame before drawing

// ELEMENT:setPos | Sets the x and y positions of this elements
Element.prototype.setPos=function(x,y) {
	this.x=x;
	this.y=y;
}

// PARTICLE | More detailed element with 
function Particle(_surface,_color,_radius) {
	this.surface=_surface;
	this.color=_color;
	this.radius=_radius;
	this.dx=0;
	this.dy=0;
}
Particle.prototype=new Element();

// PARTICLE:setDir   | Sets the direction of motion
Particle.prototype.setDir=function(_dx,_dy) {
	this.dx=_dx;
	this.dy=_dy;
}

// PARTICLE:ELEMENT:step | Updates the position and acceleration every frame
Particle.prototype.step=function() {
	// Adjust position based on acceleration
	this.x+=this.dx;
	this.y+=this.dy;
}

// PARTICLE:ELEMENT:draw | Draws the particle
Particle.prototype.draw=function() {
	this.surface.context.beginPath();
	this.surface.context.fillStyle=this.color.v;
	this.surface.context.arc(this.x,this.y,this.radius,0,Math.PI*2);
	this.surface.context.fill();
}

// jQuery to set everything up on page load
var surface;
$(function() {
	// Make a new Surface
	surface=new Surface();

	// Bind events
	surface.canvas.addEventListener("mousedown",function(e) {surface.moused(e)},true);
	surface.canvas.addEventListener("mousemove",function(e) {surface.mousem(e)},true);
	surface.canvas.addEventListener("mouseup",function(e) {surface.mouseu(e)},true);

	// Disable right clicks
	window.addEventListener("selectstart",function(e) {e.preventDefault()},true);
	window.addEventListener("contextmenu",function(e) {e.preventDefault()},true);
});
