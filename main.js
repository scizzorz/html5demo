// MATH:dist | Calculates the hypotenuse of a triangle
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
	// Grabs the canvas element and the text fields
	this.canvas=document.getElementById("surface");
	this.left_txt = document.getElementById("left");
	this.right_txt = document.getElementById("right");

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

		// Start the engine
		this.step();
	} else {
		// BUMMER
		alert("No <canvas> support.");
	}
}

// SURFACE:step | Primary frame handler
Surface.prototype.step=function() {
	// Clear the whole drawing rectangle
	this.context.clearRect(0,0,this.width,this.height);

	// Set the line style to a 4px white line
	this.context.strokeStyle="#FFF";
	this.context.lineWidth=4;

	// Draw a white line down the center of the screen
	this.context.beginPath();
	this.context.moveTo(this.width/2,0);
	this.context.lineTo(this.width/2,this.height);
	this.context.stroke();

	this.left=0;
	this.right=0;
	
	// Loop through the elements
	for(var i=0;i<this.elements.length;i++) {
		var o=this.elements[i];

		// If it's a thing, has a step(), and has a draw()...
		if(o && o.step && o.draw) {
			// Step and draw it
			o.step();
			o.draw();
			if(o.x < this.width/2) this.left++;
			else this.right++;
		}
	}

	this.left_txt.innerHTML=this.left;
	this.right_txt.innerHTML=this.right;

	// Set a timeout to call this again in 10ms (pretty much whatever the fastest available interval is)
	setTimeout("surface.step()",10);
}

// SURFACE:moused | Called when the a mouse button is pressed
Surface.prototype.moused=function(e) {
	var clicked=false;

	// Loop through the elements
	for(var i=0;i<this.elements.length;i++) {
		var o=this.elements[i];

		// If it's a thing, has a hitTest(), has a mousePress, and is actually hitTesting...
		if(o && o.hitTest && o.mousePress && o.hitTest(this.mx,this.my)) {
			// Press the cursor on it
			o.mousePress();

			// Don't spawn a new ball
			clicked=true;
			
			// and don't look for a new ball, either
			break;
		}
	}

	// If we didn't click an existing ball, we should make a new one
	if(!clicked) {
		// Make a new random color along the color wheel
		var color=new HSL(Math.random()*360,1,0.5);

		// Make a new particle
		var e=new Particle(this,color,30);

		// Set its initial position to the cursor and start dragging immediately
		e.setPos(this.mx,this.my);
		e.mousePress();

		// Push it into the elements array
		this.elements.push(e);
	}
}

// SURFACE:mouseu | Called when the a mouse button is released
Surface.prototype.mouseu=function(e) {
	// Loop through the elements
	for(var i=0;i<this.elements.length;i++) {
		var o=this.elements[i];

		// If it's a thing, is being dragged, and has a mouseRelease...
		if(o && o.dragging && o.mouseRelease) {
			// Release the cursor on it
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

// PARTICLE | More detailed element with actual functionality
function Particle(_surface,_color,_radius) {
	this.surface=_surface;
	this.color=_color;
	this.radius=_radius;
	this.dragging=false;
}
Particle.prototype=new Element(); // inherit from Element

// PARTICLE:hitTest | Check if a point is in contact with the object
Particle.prototype.hitTest=function(_x,_y) {
	return (Math.dist(_x-this.x,_y-this.y)<=this.radius);
}

// PARTICLE:mousePress | Called when the mouse presses the object
Particle.prototype.mousePress=function() {
	this.dragging=true;
}

// PARTICLE:mouseRelease | Called when the mouse releases the object
Particle.prototype.mouseRelease=function() {
	this.dragging=false;
}

// PARTICLE:ELEMENT:step | Updates the position and acceleration every frame
Particle.prototype.step=function() {
	// If it's being dragged by the cursor...
	if(this.dragging) {
		this.x=this.surface.mx;
		this.y=this.surface.my;
	}
	
	// Boundary checks
	if(this.x<this.radius)
		this.x=this.radius;
	if(this.y<this.radius)
		this.y=this.radius;
	if(this.x>this.surface.width-this.radius)
		this.x=this.surface.width-this.radius;
	if(this.y>this.surface.height-this.radius)
		this.y=this.surface.height-this.radius;
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
