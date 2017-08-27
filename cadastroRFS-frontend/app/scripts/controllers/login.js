'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:CadastroController
 * @description
 * # MainCtrl
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('LoginController', ['$window', '$scope', '$state', 'authenticationService', function ($window, $scope, $state, authenticationService) {

    var ctrl = this;

    $window.onFBLoginCallBack = function () {

      console.log('Valor do authentication.isRegistered: ' + authenticationService.isRegistered);
      console.log('Valor do authentication.isLogged: ' + authenticationService.isLogged);
      if ((authenticationService.isRegistered)) {
        $state.go('cadastro_preexistente');
      } else if ((authenticationService.isLogged)){
        $state.go('form.geral');
      }
      else {
        $state.go('login');
      };
      
    };


    $scope.facebook = {
      username: "",
      email: ""
    };

  }]);
