!function(){"use strict";function a(){EventEmitter2.apply(this),this.ros=new ROSLIB.Ros,this.ros.on("connection",this.onConnection.bind(this)),this.ros.on("close",this.onClose.bind(this)),this.ros.on("error",this.onError.bind(this)),this.on("status",function(a){switch(a){case"closed":setTimeout(this.connect.bind(this),c)}}),this.connect(),this.ed=new Ed(this),this.hardware=new Hardware(this),this.head=new Head(this),this.base=new Base(this)}var b="ws://"+window.location.hostname+":9090",c=5e3;a.prototype=Object.create(EventEmitter2.prototype),Object.defineProperty(a.prototype,"status",{get:function(){return this._status},set:function(a){this._status=a,this.emit("status",a)}}),a.prototype.connect=function(){console.log("connecting to "+b),this.ros.connect(b),this.status="connecting"},a.prototype.onConnection=function(){console.log("connection"),this.status="connected"},a.prototype.onClose=function(){console.log("connection closed"),this.status="closed"},a.prototype.onError=function(){this.status="error"},window.Robot=a}(),function(){"use strict";function a(a){EventEmitter2.apply(this);var b=a.ros;this.status=[],this.status_topic=b.Topic({name:"hardware_status",messageType:"diagnostic_msgs/DiagnosticArray",throttle_rate:500}),this.status_topic.subscribe(this.onStatus.bind(this)),this.models=[]}function b(a){var b=a.status.map(function(a){return{name:a.name,level:a.level,homed:"homed"===a.message}}),d=_.indexBy(b,"name");return _.defaults(d,g),_.mapValues(d,function(a){return a.actions=c(a),a}),d}function c(a){var b=e[a.name];if(b){var c=a?a.level:-1,f=a?a.homed:!1,g={};return b.homeable&&(g.home={enabled:c===d.IDLE,warning:f?"This part was already homed, Are you sure you want to redo homing?":!1}),g.start={enabled:c===d.IDLE&&(f||!b.homeable_mandatory),warning:b.homeable&&!f?"This part is not yet homed, Are you sure you want to proceed?":!1},g.stop={enabled:c===d.HOMING||c===d.OPERATIONAL},b.resetable&&(g.reset={enabled:c===d.ERROR}),g}}var d={STALE:0,IDLE:1,OPERATIONAL:2,HOMING:3,ERROR:4},e={all:[!0,!1,!0],base:[!1,!1,!0],spindle:[!0,!0,!0],left_arm:[!0,!1,!0],right_arm:[!0,!1,!0],head:[!1,!1,!1]};e=_.mapValues(e,function(a){return{homeable:a[0],homeable_mandatory:a[1],resetable:a[2]}});var f={all:0,base:1,spindle:2,left_arm:3,right_arm:4,head:5},g=_.mapValues(f,function(a,b){return{name:b,level:d.STALE,homed:!1}});a.prototype=Object.create(EventEmitter2.prototype),Object.defineProperty(a.prototype,"status",{get:function(){return this._status},set:function(a){this._status=a,this.emit("status",a)}}),a.prototype.onStatus=function(a){this.status=b(a)},window.Hardware=a}(),function(){"use strict";function a(a){EventEmitter2.apply(this);var b=a.ros;this.entities=[],this.meshes={},this.entities_topic=b.Topic({name:c,messageType:"ed_gui_server/EntityInfos",throttle_rate:5e3}),this.query_meshes_service=b.Service({name:d,serviceType:"ed_gui_server/QueryMeshes"}),this.snapshots={},this.snapshot_revision=0,this.snapshot_service=b.Service({name:e,serviceType:"ed_sensor_integration/GetSnapshots"}),this.delete_snapshot_queue=[],this.snapshots_timer_id=null,this.start_update_loop(),this.make_snapshot_service=b.Service({name:h,serviceType:"ed_sensor_integration/MakeSnapshot"}),this.models={},this.models_service=b.Service({name:f,serviceType:"ed_sensor_integration/GetModels"}),this.update_models(),this.fit_model_service=b.Service({name:g,serviceType:"ed_sensor_integration/FitModel"}),this.navigate_to_service=b.Service({name:i,serviceType:"ed_sensor_integration/NavigateTo"}),this.create_walls_service=b.Service({name:j,serviceType:"std_srvs/Empty"})}function b(a){var b={};return a.image_ids.forEach(function(c,d){var e=a.images[d],f=e.encoding;e.src="data:image/"+f+";base64,"+e.data,e.short_id=_.trunc(c,{length:8,omission:""}),e.id=c;var g=a.image_timestamps[d];e.timestamp=new Date(g.secs+1e-9*g.nsecs),b[c]=e}.bind(this)),b}var c="ed/gui/entities",d="ed/gui/query_meshes",e="ed/gui/get_snapshots",f="ed/gui/get_models",g="ed/gui/fit_model",h="ed/make_snapshot",i="ed/navigate_to",j="ed/create_walls";a.prototype=Object.create(EventEmitter2.prototype),Object.defineProperty(a.prototype,"entities",{get:function(){return this._entities},set:function(a){this._entities=a,this.emit("entities",a)}}),a.prototype.onEntities=function(a){console.log(a),this.entities=a.entities;var b=[];this.entities.forEach(function(a){this.meshes[a.id]&&this.meshes[a.id].revision===a.mesh_revision?console.log("correct revision"):b.push(a.id)}.bind(this)),console.log(b);var c={entity_ids:b};this.query_meshes_service.callService(c,function(a){var b=a.error_msg;b&&console.warn("query_meshes_service:",b),a.entity_ids.forEach(function(b,c){this.meshes[b]=a.meshes[c]}.bind(this))}.bind(this))},a.prototype.update_snapshots=function(a,c){a=a||_.noop,c=c||0;var d={revision:this.snapshot_revision,delete_ids:this.delete_snapshot_queue,max_num_revisions:c};this.delete_snapshot_queue.length&&(console.log("deleting snapshots:",this.delete_snapshot_queue),this.snapshots=_.omit(this.snapshots,this.delete_snapshot_queue),this.delete_snapshot_queue=[]);var e=new Date;this.snapshot_service.callService(d,function(c){var d=new Date-e;this.emit("update_time",d),(!c.new_revision&&_.size(this.snapshots)||c.new_revision<this.snapshot_revision)&&(console.warn("ed restart detected, reloading..."),this.snapshots={},this.update_models()),this.snapshot_revision=c.new_revision;var f=b(c);_.assign(this.snapshots,f),this.emit("snapshots",this.snapshots),a(null,f)}.bind(this),function(b){console.warn("update_snapshots failed:",b),a(b,null)}.bind(this))},a.prototype.delete_snapshot=function(a){this.delete_snapshot_queue.push(a),this.force_update()},a.prototype.start_update_loop=function(){this.snapshots_timer_id=null,this.update_snapshots(function a(b,c){var d=500;b?d=5e3:_.size(_.omit(c,"current"))&&(d=0),this.snapshots_timer_id=_.delay(function(a){this.snapshots_timer_id=null,this.update_snapshots(a)}.bind(this),d,a.bind(this))}.bind(this),1)},a.prototype.force_update=function(){this.snapshots_timer_id?(console.log("force update"),window.clearTimeout(this.snapshots_timer_id),this.snapshots_timer_id=null,this.start_update_loop()):console.log("update is already in progress")},a.prototype.make_snapshot=function(a){this.make_snapshot_service.callService(null,a),this.force_update()},a.prototype.update_models=function l(){var a={};this.models_service.callService(a,function(a){a.model_names.forEach(function(b,c){var d=a.model_images[c],e=d.encoding;d.src="data:image/"+e+";base64,"+d.data,this.models[b]=d}.bind(this)),this.emit("models",this.models)}.bind(this),function(a){console.warn("update_models failed:",a),_.delay(l.bind(this),5e3)}.bind(this))},a.prototype.fit_model=function(a,b,c,d){var e={model_name:a,image_id:b,click_x_ratio:c,click_y_ratio:d};this.fit_model_service.callService(e,function(a){this.force_update();var b=a.error_msg;b&&console.warn("fit model error:",b)}.bind(this))},a.prototype.undo_fit_model=function(a){var b={undo_latest_fit:!0};this.fit_model_service.callService(b,function(b){this.force_update();var c=b.error_msg;c?(console.warn("fit model error:",c),a(c)):a(null)}.bind(this),function(b){this.force_update(),console.warn("fit model error:",b),a(b)}.bind(this))};var k={NAVIGATE_TO_PIXEL:1,TURN_LEFT:2,TURN_RIGHT:3};a.prototype.navigate_to=function(a,b,c){this.navigate_to_service.callService({snapshot_id:c,navigation_type:k.NAVIGATE_TO_PIXEL,click_x_ratio:a,click_y_ratio:b},function(a){var b=a.error_msg;b&&console.warn(b)})},a.prototype.create_walls=function(a){a=a||_.noop,this.create_walls_service.callService({},function(b){a()})},window.Ed=a}(),function(){"use strict";function a(a){EventEmitter2.apply(this);a.ros;this.goal=null}a.prototype=Object.create(EventEmitter2.prototype),a.prototype.send_goal=function(){this.goal=new ROSLIB.Goal({actionClient:this.head_ac,goalMessage:{goal_type:null,priority:1,pan_vel:null,tilt_vel:null,target_point:null,pan:null,tilt:null,end_time:null}}),this.goal.on("feedback",function(a){console.log("Feedback:",a)}),this.goal.on("result",function(a){console.log("Result:",a)})},window.Head=a}(),function(){"use strict";function a(a){EventEmitter2.apply(this);var b=a.ros;this.cmd_vel_topic=b.Topic({name:"base/references",messageType:"geometry_msgs/Twist"}),this.local_planner_topic=b.Topic({name:"local_planner/action_server/goal",messageType:"cb_planner_msgs_srvs/LocalPlannerActionGoal"})}a.prototype=Object.create(EventEmitter2.prototype),a.prototype.sendTwist=function(a,b,c){var d=new ROSLIB.Message({angular:{x:0,y:0,z:c},linear:{x:a,y:b,z:0}});this.cmd_vel_topic.publish(d),console.log("sendTwist: "+a+","+b+","+c)},a.prototype.sendLocalPlannerGoal=function(a,b,c){var d=new ROSLIB.Message({goal:{plan:a,orientation_constraint:{frame:"/map",look_at:{x:b,y:c}}}});this.local_planner_topic.publish(d),console.log("sendGoal to local planner: "+d)},window.Base=a}(),angular.module("challengeOpenApp",["ngDraggable"]),angular.module("challengeOpenApp").run(function(){function a(a){for(;a!==document;){if(a.classList.contains("models"))return!0;a=a.parentNode}return!1}function b(a){for(;a!==document;){if(a.classList.contains("snapshots"))return!0;a=a.parentNode}return!1}FastClick.attach(document.body);var c=null;document.ontouchstart=function(a){c=a.pageY},document.ontouchend=function(a){c=null},document.ontouchcancel=function(a){c=null},document.ontouchmove=function(d){if(null!==c){if(!a(d.target)&&!b(d.target))return void d.preventDefault();var e=d.pageY-c,f=document.getElementsByClassName("models")[0];b(d.target)&&(abs(e)<3||d.preventDefault()),e>0&&f.scrollTop<=0?d.preventDefault():0>e&&f.scrollTop>=f.scrollHeight-f.clientHeight&&d.preventDefault()}}}),angular.module("challengeOpenApp").controller("MainCtrl",function(){this.awesomeThings=["HTML5 Boilerplate","AngularJS","Karma"]}),angular.module("challengeOpenApp").provider("robot",function(){this.setUrl=function(a){this.url=a},this.$get=function(){var a=window.r=new Robot;return a}}),angular.module("challengeOpenApp").controller("ConnectionCtrl",["$scope","robot",function(a,b){a.connection=b.status,b.on("status",function(b){console.log("new status",b),a.$apply(function(){a.connection=b})})}]),angular.module("challengeOpenApp").controller("ModellistCtrl",["$scope","robot",function(a,b){a.models=b.ed.models,b.ed.on("models",function(b){a.$apply(function(){a.models=_.mapValues(b,function(a,b){return a.name=_.last(_.words(b,/\w+/g)).replace("_"," "),a})})})}]),angular.module("challengeOpenApp").controller("SnapshotlistCtrl",["robot","$scope",function(a,b){function c(a){var c,d;if("contain"===b.backgroundSize){var e=640/480;a.offsetWidth/a.offsetHeight>e?(d=a.offsetHeight,c=e*a.offsetHeight):(c=a.offsetWidth,d=a.offsetWidth/e)}else d=a.offsetHeight,c=.71*a.offsetWidth;return{height:d,width:c}}b.snapshots=a.ed.snapshots,b.selected="current",b.select=function(a){b.selected=a},b["delete"]=function(b,c){a.ed.delete_snapshot(b),c.stopPropagation()},b.isUndoing=!1,b.undo=function(){b.isUndoing=!0,a.ed.undo_fit_model(function(){_.delay(function(){b.$apply(function(){b.isUndoing=!1})},1e3)})},b.isSnapshotting=!1,b.make_snapshot_or_play=function(){"current"!==b.selected?b.selected="current":(b.isSnapshotting=!0,a.ed.make_snapshot(function(){b.$apply(function(){b.isSnapshotting=!1})}))},b.backgroundSize="contain",b.stretch=function(){"contain"===b.backgroundSize?b.backgroundSize="71% 100%":b.backgroundSize="contain"},b.send_twist=function(b,c,d){a.base.sendTwist(b,c,d)},b.snapshot_click=function(d){var e=d.offsetX,f=d.offsetY,g=d.target,h=c(g),i=h.width,j=h.height,e=d.x,f=d.y-g.offsetTop,k=e/i,l=f/j;console.log("x_ratio and y_ratio in bg: "+(100*k).toFixed(1)+"% x "+(100*l).toFixed(1)+"%"),console.log("navigate to",b.selected),a.ed.navigate_to(k,l,b.selected)},a.ed.on("update_time",function(a){console.log(a),b.$apply(function(){b.update_time=a})}),a.ed.on("snapshots",function(a){b.$apply(function(){b.snapshots=a})}),b.onDragComplete=function(a,b){},b.onDropComplete=function(d,e){var f=e.element.parent()[0],g=c(f),h=g.width,i=g.height,j=e.x,k=e.y-f.offsetTop,l=j/h,m=k/i;return console.log("x_ratio and y_ratio in bg: "+(100*l).toFixed(1)+"% x "+(100*m).toFixed(1)+"%"),l>1||m>1?void console.log("skipping click"):(console.log("Fit model!"),void a.ed.fit_model(d,b.selected,l,m))}}]),angular.module("challengeOpenApp").controller("TriggerCtrl",["$scope","robot",function(a,b){var c=b.ros.Topic({name:"trigger",messageType:"std_msgs/String"});a.trigger=function(a){c.publish({data:a})},a.creating=!1,a.create_walls=function(){a.creating=!0,b.ed.create_walls(function(){_.delay(function(){a.$apply(function(){a.creating=!1})},1e3)})}}]),angular.module("challengeOpenApp").run(["$templateCache",function(a){"use strict";a.put("views/main.html",'<div class="container-fluid snapshot-model-editor"> <div class="row top-row"> <div ng-controller="ModellistCtrl" class="col-xs-12 models" ng-style="{ \'background-image\': \'url(\'+snapshots[selected].src+\')\', \'background-size\': backgroundSize}" ng-drop="true" ng-drop-success="onDropComplete($data,$event)" ng-click="snapshot_click($event)"> <button ng-repeat="(id, model) in models" type="button" class="btn btn-lg" ng-class="{ \'btn-primary\': selected == id, \'btn-default\': selected != id }" ng-drag="true" ng-center-anchor="true" ng-drag-data="id" ng-drag-success="onDragComplete($data,$event)"> <div class="model-name">{{model.name}}</div> <img class="img-responsive" src="{{model.src}}"> </button> </div> </div> <div class="row bottom-row"> <div class="col-xs-1 snapshot-controls"> <button type="submit" class="btn" ng-click="make_snapshot_or_play()" ng-class="{ active: isSnapshotting, \'btn-primary\': selected == \'current\', \'btn-success\': selected != \'current\' }"> <span ng-if="selected == \'current\'" class="glyphicon glyphicon-camera"></span> <span ng-if="selected != \'current\'" class="glyphicon glyphicon-play-circle"></span> </button> </div> <div class="col-xs-9 snapshots"> <button ng-repeat="(id, snapshot) in snapshots" ng-if="id != \'current\'" type="button" class="btn btn-lg" ng-class="{ \'btn-primary\': selected == id, \'btn-default\': selected != id }" ng-click="select(id)"> <img class="img-responsive" src="{{snapshot.src}}"> <div class="snapshot-delete" ng-click="delete(id, $event)"><span class="glyphicon glyphicon-remove"></span></div> </button> </div> <div class="col-xs-2 logo"> <button id="robot-base-left" ng-click="send_twist(0,0,0.3)" class="robot-base">Left</button> <button id="robot-base-right" ng-click="send_twist(0,0,-0.3)" class="robot-base">Right</button> <!-- We are going to draw a canvas here --> <!--       <canvas id="teleop-canvas">\n        Canvas not supported unfortunately.\n      </canvas> --> </div> </div> </div>')}]);