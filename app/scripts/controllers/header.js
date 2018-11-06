'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:HeaderController
 * @description
 * # HeaderController
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('HeaderController', ['facebookAuthenticationService', 'apiAuthenticationFactory', function (facebookAuthenticationService, apiAuthenticationFactory) {

    var vm = this;

    vm.hideHeader = function () {
      console.debug('Executando a função hideHeader. Valor de facebookAuthenticationService.isRegistered: ' + facebookAuthenticationService.isRegistered);
      if (facebookAuthenticationService.isRegistered === false) {
        console.log('Usuário não cadastrado ou ainda não autenticado!!!');
        return true;
      } else {
        return false;
      }
    };

    vm.isAdminMember = function () {
      return apiAuthenticationFactory.isAdmin();
    };

    vm.isRegisteredMember = function () {
      return apiAuthenticationFactory.isRegistrado();
    };
  }]);
