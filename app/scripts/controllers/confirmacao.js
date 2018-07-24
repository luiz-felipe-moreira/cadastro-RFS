'use strict';

angular.module('cadastroRepublicaApp')
  .controller('ConfirmacaoController', ['facebookAuthenticationService', '$state', function (facebookAuthenticationService, $state) {

    var vm = this;
    vm.userId = facebookAuthenticationService.user.id;

    vm.linkClick = function () {
      $state.go('me');
    };
  }]);
