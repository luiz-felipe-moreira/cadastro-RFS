'use strict';

angular.module('cadastroRepublicaApp')
    .controller('ConfirmacaoController', ['authenticationService', '$state', function (authenticationService, $state) {

        var vm = this;
        vm.userId = authenticationService.user.id;

        vm.linkClick = function () {
            $state.go('membro', { id: vm.userId });
        };
    }]);