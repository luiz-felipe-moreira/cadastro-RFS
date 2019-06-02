'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('LoginController', ['facebookAuthenticationService', function (facebookAuthenticationService) {

    var vm = this;

    vm.user = {
      email: '',
      id: ''
    };

    vm.isRegistered = false;

    vm.login = function () {
      facebookAuthenticationService.login();
    };

  }]);
