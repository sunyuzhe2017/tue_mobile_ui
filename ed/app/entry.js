// import css
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-slider/dist/css/bootstrap-slider.css";
import "bootstrap/dist/css/bootstrap.css";
import "angular-circular-navigation/angular-circular-navigation.css";
import "font-awesome/css/font-awesome.min.css";
import './styles/main.css';

// import js

import 'angular-circular-navigation/angular-circular-navigation.js'
import 'angular-bootstrap-slider';

import './scripts/app'
import './scripts/controllers/circularmenu'
import './scripts/controllers/connection'
import './scripts/controllers/main'
import './scripts/controllers/sidebar'
import './scripts/controllers/teleop'
import './scripts/directives/ngteleopcanvas'
import './scripts/directives/ngwebgl'
import './scripts/orbitControls'
import './scripts/run'
import './scripts/services/robot'

// preload html

angular
.module('EdGuiApp')
.run(['$templateCache', function($templateCache) {
    $templateCache.put('views/main.html', require('./views/main.html'));
    $templateCache.put('views/scene.html', require('./views/scene.html'));
    $templateCache.put('views/tabs/teleop_tabs/base.html', require('./views/tabs/teleop_tabs/base.html'));
    $templateCache.put('views/tabs/teleop_tabs/head.html', require('./views/tabs/teleop_tabs/head.html'));
    $templateCache.put('views/tabs/teleop_tabs/speech.html', require('./views/tabs/teleop_tabs/speech.html'));
    $templateCache.put('views/tabs/teleop_tabs/body.html', require('./views/tabs/teleop_tabs/body.html'));
    $templateCache.put('views/tabs/teleop_tabs/ears.html', require('./views/tabs/teleop_tabs/ears.html'));
    $templateCache.put('views/tabs/teleop.html', require('./views/tabs/teleop.html'));
    $templateCache.put('views/tabs/editor.html', require('./views/tabs/editor.html'));
    $templateCache.put('views/main.html', require('./views/main.html'));
}]);