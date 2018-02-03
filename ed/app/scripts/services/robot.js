import {Robot} from 'robot-api';

angular.module('EdGuiApp')
  .provider('robot', function () {

    // Public API for configuration
    this.setUrl = function (url) {
      this.url = url;
    };

    // Method for instantiating
    this.$get = function () {
      var robot = window.r = new Robot({
        'ed': true,
        'hardware': true,
        'head': true,
        'base': true,
        'body': true,
        'speech': true,
        'actionServer': true});
      robot.connect();
      return robot;
    };
  });
