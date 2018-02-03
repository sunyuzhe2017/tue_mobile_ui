"use strict";angular.module("challengeOpenApp",["ngDraggable"]),angular.module("challengeOpenApp").run(function(){function a(a){for(;a!==document;){if(a.classList.contains("models"))return!0;a=a.parentNode}return!1}function b(a){for(;a!==document;){if(a.classList.contains("snapshots"))return!0;a=a.parentNode}return!1}FastClick.attach(document.body);var c=null;document.ontouchstart=function(a){c=a.pageY},document.ontouchend=function(a){c=null},document.ontouchcancel=function(a){c=null},document.ontouchmove=function(d){if(null!==c){if(!a(d.target)&&!b(d.target))return void d.preventDefault();var e=d.pageY-c,f=document.getElementsByClassName("models")[0];b(d.target)&&(abs(e)<3||d.preventDefault()),e>0&&f.scrollTop<=0?d.preventDefault():0>e&&f.scrollTop>=f.scrollHeight-f.clientHeight&&d.preventDefault()}}}),angular.module("challengeOpenApp").controller("MainCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("challengeOpenApp").provider("robot",function(){this.setUrl=function(a){this.url=a},this.$get=function(){var a=window.r=new API.Robot({ed:!0,hardware:!0,head:!0,base:!0,body:!0,speech:!0,actionServer:!0});return a.connect(),a}}),angular.module("challengeOpenApp").controller("ConnectionCtrl",["$scope","robot",function(a,b){a.connection=b.status,b.on("status",function(b){console.log("new status",b),a.$apply(function(){a.connection=b})})}]),angular.module("challengeOpenApp").controller("ModellistCtrl",["$scope","robot",function(a,b){a.models=b.ed.models;var c=Number.parseInt(location.search.substr(1,location.search.length))||640;console.log("setting the resolution to",c,"pixels"),b.ed.on("models",function(d){function e(d){var f=d;66>d?f=66:d>500&&(f=500),_.delay(function(){b.head.getImage(c,function(b,c,d){a.$apply(function(){b&&(a.camera_src=b),e(d)})})},2*d)}a.$apply(function(){a.models=_.mapValues(d,function(a,b){return a.name=_.last(_.words(b,/\w+/g)).replace("_"," "),a})}),a.camera_src=null,e(200)})}]),angular.module("challengeOpenApp").controller("SnapshotlistCtrl",["robot","$scope",function(a,b){function c(a){var c,d;if("contain"===b.backgroundSize){var e=640/480;a.offsetWidth/a.offsetHeight>e?(d=a.offsetHeight,c=e*a.offsetHeight):(c=a.offsetWidth,d=a.offsetWidth/e)}else d=a.offsetHeight,c=.71*a.offsetWidth;return{height:d,width:c}}b.isUndoing=!1,b.undo=function(){b.isUndoing=!0,a.ed.undo_fit_model(function(){_.delay(function(){b.$apply(function(){b.isUndoing=!1})},1e3)})},b.backgroundSize="contain",b.stretch=function(){"contain"===b.backgroundSize?b.backgroundSize="71% 100%":b.backgroundSize="contain"},b.isAskingGPSR=!1,b.gpsr=function(){b.isAskingGPSR=!0,_.delay(function(){b.$apply(function(){b.isAskingGPSR=!1})},1e3)},b.send_twist=function(b,c,d){a.base.sendTwist(b,c,d)},b.camera_click=function(b){var d=b.offsetX,e=b.offsetY,f=b.target,g=c(f),h=g.width,i=g.height,d=b.x,e=b.y-f.offsetTop,j=d/h,k=e/i;console.log("x_ratio and y_ratio in bg: "+(100*j).toFixed(1)+"% x "+(100*k).toFixed(1)+"%"),a.ed.fit_model("NAVIGATE",j,k)},a.head.on("update_time",function(a){b.$apply(function(){b.update_time=a})}),b.onDragComplete=function(a,b){},b.onDropComplete=function(b,d){var e=d.element.parent()[0].parentElement,f=c(e),g=f.width,h=f.height,i=d.x,j=d.y-e.offsetTop,k=i/g,l=j/h;return console.log("x_ratio and y_ratio in bg: "+(100*k).toFixed(1)+"% x "+(100*l).toFixed(1)+"%"),k>1||l>1?void console.log("skipping click"):(console.log("Fit model!",b,k,l),void a.ed.fit_model(b,k,l))}}]),angular.module("challengeOpenApp").controller("TriggerCtrl",["$scope","robot",function(a,b){var c=b.ros.Topic({name:"trigger",messageType:"std_msgs/String"}),d=b.ros.Topic({name:"/amigo/trigger",messageType:"std_msgs/String"});a.trigger=function(a){console.log("trigger:",a),c.publish({data:a})},a.triggerAmigo=function(a){console.log("triggerAmigo:",a),d.publish({data:a})},a.creating=!1,a.create_walls=function(){a.creating=!0,b.ed.create_walls(function(){_.delay(function(){a.$apply(function(){a.creating=!1})},1e3)})}}]),angular.module("challengeOpenApp").controller("TeleopCtrl",["$scope","$timeout","robot",function(a,b,c){function d(){b(function(){c.head.getImage(230,function(b,c){a.kinect_image=b,d()})},1e3)}d(),a.teleopBase=function(a){c.base.sendTwist(.5*a.py,0,-a.px)},a.teleopHead=function(a){if(0==a.px&&0==a.py);else{var b=1.5;c.head.sendPanTiltGoal(-b*a.px,-b*a.py)}}}]),angular.module("challengeOpenApp").directive("ngTeleopCanvas",function(){return{restrict:"E",template:"<canvas></canvas>",scope:{percentageChanged:"&onPercentageChanged"},controllerAs:"vm",controller:function(){},link:function(a,b){function c(){j.width=l.prop("offsetWidth"),j.height=l.prop("offsetHeight")}function d(a,b){m={x:a,y:b},o=!0,g()}function e(a,b){m&&(n={x:a,y:b},g())}function f(){m=!1,n=!1,o=!1,g(),a.percentageChanged({px:0,py:0})}function g(){h(),i(m,n)}function h(){k.fillStyle="#4D4D4D",k.clearRect(0,0,j.width,j.height)}function i(a,b){var c,d;a&&(k.save(),k.translate(a.x,a.y),c=60,d=k.createRadialGradient(0,0,0,0,0,2*c),d.addColorStop(0,"rgba(0,0,0,0)"),d.addColorStop(.4,"rgba(0,0,0,0)"),d.addColorStop(.45,"rgba(0,0,0,1)"),d.addColorStop(.55,"rgba(0,0,0,1)"),d.addColorStop(.6,"rgba(0,0,0,0)"),d.addColorStop(1,"rgba(0,0,0,0)"),k.fillStyle=d,k.fillRect(-2*c,-2*c,4*c,4*c),k.restore()),b&&(k.save(),k.translate(b.x,b.y),c=45,d=k.createRadialGradient(0,0,0,0,0,c),d.addColorStop(0,"rgba(0,0,0,1)"),d.addColorStop(.9,"rgba(0,0,0,1)"),d.addColorStop(1,"rgba(0,0,0,0)"),k.fillStyle=d,k.fillRect(-c,-c,2*c,2*c),k.restore())}b.on("$destroy",function(){console.log("ngTeleopCanvas: element is destroyed")}),a.$on("$destroy",function(){console.log("ngTeleopCanvas: scope is destroyed")});var j=b.children()[0],k=j.getContext("2d"),l=b.parent();c(),window.addEventListener("resize",c,!1);var m,n,o=!1;setInterval(function(){if(o){if(!n||!m)return;var b=n.x-m.x,c=n.y-m.y,d=-c/j.height,e=b/j.width;a.percentageChanged({px:e,py:d})}},100),b.on("mousedown",function(a){d(a.offsetX,a.offsetY)}),b.on("touchstart",function(a){a.preventDefault();var b=l[0].getBoundingClientRect();d(a.touches[0].pageX-b.left,a.touches[0].pageY-b.top)}),b.on("mousemove",function(a){e(a.offsetX,a.offsetY)}),b.on("touchmove",function(a){a.preventDefault();var b=l[0].getBoundingClientRect();e(a.touches[0].pageX-b.left,a.touches[0].pageY-b.top)}),b.on("mouseup",function(a){f()}),b.on("mouseleave",function(a){f()}),b.on("touchend",function(a){f()})}}}),angular.module("challengeOpenApp").run(["$templateCache",function(a){a.put("views/main.html",'<div class="container-fluid snapshot-model-editor"> <div class="row top-row"> <div ng-controller="ModellistCtrl" class="col-xs-12 models" ng-style="{ \'background-image\': \'url(\'+camera_src+\')\', \'background-size\': backgroundSize}" ng-drop="true" ng-drop-success="onDropComplete($data,$event)" ng-click="camera_click($event)"> <div class="model-list-wrapper"> <button ng-repeat="(id, model) in models" type="button" class="btn btn-lg" ng-class="{ \'btn-primary\': selected == id, \'btn-default\': selected != id }" ng-drag="true" ng-center-anchor="true" ng-drag-data="id" ng-drag-success="onDragComplete($data,$event)"> <div class="model-name">{{model.name}}</div> <img class="img-responsive" src="{{model.src}}"> </button> </div> </div> </div> </div> <div class="footer teleop"> <div ng-controller="TeleopCtrl"> <div ng-include="\'views/tabs/base.html\'" class="tab"></div> </div> </div> <div class="footer head"> <div ng-controller="TeleopCtrl"> <div ng-include="\'views/tabs/head.html\'" class="tab"></div> </div> </div>'),a.put("views/tabs/base.html",'<ng-teleop-canvas on-percentage-changed="teleopBase({px: px, py: py})">'),a.put("views/tabs/head.html",'<ng-teleop-canvas on-percentage-changed="teleopHead({px: px, py: py})">')}]);