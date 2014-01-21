/**
* Control pad like interface for TeleOp via HTML5 Canvas
*
* this package:
* - initializes a TeleOp
**/

/*global $:false */

// global variables
var canvas, ctx;

var hammertime;
var teleop;

var offset; // position of the canvas relative to the document

// code wrapper
(function () {
"use strict";

// private variables
var startPos;
var currentPos;

var buttonReconnect, modalReconnect;

function initTeleop() {

  // Connecting to ROS.
  ros = new ROSLIB.Ros({
    url : rosUrl
  });

  // Initialize the teleop.
  teleop = new TELEOP.Teleop({
    ros : ros,
    topic : '/amigo/base/references'
  });
}

// used to initialize classes and bind events
function init() {

  // initialize canvas stuff
  canvas = $('#teleop-canvas')[0];
  ctx = canvas.getContext("2d");

  $(window).resize(resizeCanvas)
    .resize();

  // initialize hammer.js
  hammertime = $(canvas).hammer({
    drag_max_touches: 1,
    prevent_default: true
  });

  // first touch start event
  hammertime.on("touch", function(e) {
    e.gesture.preventDefault(); // stop scrolling

    var pos = e.gesture.center;
    startPos = convertPageXY(pos.pageX, pos.pageY);

    publishing = true;

    updateNavigation();
  });

  // touch event's while dragging
  hammertime.on("drag", function(e) {
    var pos = e.gesture.center;
    currentPos = convertPageXY(pos.pageX, pos.pageY);

    updateNavigation();
  });

  hammertime.on("release", function(e) {
    startPos   = false;
    currentPos = false;

    publishing = false;
    teleop.sendTwist(0, 0, 0);

    updateNavigation();
  });

  initTeleop();

  window.setInterval(updateVelocity, 100);
}

function debugCorners() {
  ctx.fillRect(0,0,10,10)
}

function resizeCanvas() {
 
  offset = $(canvas).offset();

  canvas.width = $(window).width();
  canvas.height = $(window).height() - 50; // for the nav bar

  window.scrollTo(0, 1);

  //draw();
}

function convertPageXY(x, y) {
  return {x: x, y: y - 50};
}

function drawController(pos, thumbPos)
{
  var r, radgrad;

  if (pos)
  {
    ctx.save(); // save original state
    ctx.translate(pos.x, pos.y);

    r = 60;

    radgrad = ctx.createRadialGradient(0,0,0,0,0,2*r);
    radgrad.addColorStop(0   , 'rgba(0,0,0,0)');
    radgrad.addColorStop(0.4 , 'rgba(0,0,0,0)');
    radgrad.addColorStop(0.45, 'rgba(0,0,0,1)');
    radgrad.addColorStop(0.55, 'rgba(0,0,0,1)');
    radgrad.addColorStop(0.6 , 'rgba(0,0,0,0)');
    radgrad.addColorStop(1   , 'rgba(0,0,0,0)');

    // draw shape
    ctx.fillStyle = radgrad;
    ctx.fillRect(-2*r, -2*r, 4*r, 4*r);

    ctx.restore(); // restore original state
  }

  if (thumbPos)
  {
    ctx.save(); // save original state
    ctx.translate(thumbPos.x, thumbPos.y);

    r = 45;

    radgrad = ctx.createRadialGradient(0,0,0,0,0,r);
    radgrad.addColorStop(0   , 'rgba(0,0,0,1)');
    radgrad.addColorStop(0.9 , 'rgba(0,0,0,1)');
    radgrad.addColorStop(1   , 'rgba(0,0,0,0)');

    // draw shape
    ctx.fillStyle = radgrad;
    ctx.fillRect(-r, -r, 2*r, 2*r);

    ctx.restore(); // restore original state
  }
}

function draw() {
  //drawCircle(startPos.x  , startPos.y  , 50, "rgba(0,0,255,.5)");
  //drawCircle(currentPos.x, currentPos.y, 50, "#00FF00A");

  drawController(startPos, currentPos);
}

function clearCanvas() {
  ctx.fillStyle = '#4D4D4D'
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function sendCmdVel() {

  if (!currentPos || !startPos) {
    return;
  }

  var dx = currentPos.x - startPos.x;
  var dy = currentPos.y - startPos.y;

  speed = -dy/canvas.height;
  theta = -dx/canvas.width;

  teleop.sendTwist(speed, 0, theta);
}

var publishing = false;
var speed, theta;
function updateVelocity() {
    if (publishing) {
        sendCmdVel()
    }
}

function updateNavigation() {
  clearCanvas();
  draw();
}

// when the dom is ready, start the code
$(document).ready(init);

// end wrapper
}());