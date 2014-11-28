'use strict';

angular.module('app', [
  'app.routes'
])

.run(['$rootScope', function($rootScope) {
  $rootScope.appTitle = 'Angular Starter';
  $rootScope.greeting = 'Hello World!';
}]);
