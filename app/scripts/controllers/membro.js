'use strict';

angular.module('cadastroRepublicaApp')
  .controller('MembroController', ['membrosFactory', '$stateParams', '$state', 'meFactory', 'facebookAuthenticationService', '$scope', '$rootScope', function (membrosFactory, $stateParams, $state, meFactory, facebookAuthenticationService, $scope, $rootScope) {

    var vm = this;
    vm.membro = {};
    vm.dataAniversario = '';
    vm.diaNascimento = '';
    vm.mesNascimento = '';
    vm.anoNascimento = '';
    vm.tiposPrancha = ['longboard', 'funboard', 'gun', 'shortboard (pranchinha)', 'fish', 'bodyboard'];

    var successGetMemberCallback = function (response) {
      console.debug(response);
      vm.membro = response;
      var dataNascimento = new Date(vm.membro.dataNascimento);
      var options = {
        month: 'long',
        day: 'numeric'
      };
      vm.dataAniversario = dataNascimento.toLocaleDateString('pt-BR', options);
      vm.diaNascimento = dataNascimento.getDate();
      vm.mesNascimento = dataNascimento.getMonth().toString();
      vm.anoNascimento = dataNascimento.getFullYear();
    };

    if ($stateParams.id) {
      membrosFactory.get({
          id: $stateParams.id
        },
        successGetMemberCallback,
        function (response) {
          console.error('Erro ao obter dado do membro de id ' + $stateParams.id);
          console.error('Error: ' + response.status + ' ' + response.statusText);
        }
      );
    } else {
      meFactory.get(
        successGetMemberCallback,
        function (response) {
          console.error('Erro ao obter dado do membro');
          console.error('Error: ' + response.status + ' ' + response.statusText);
        }
      );
    }

    vm.grupoDadosSelecionado = 'geral';
    vm.selecionarGrupoDados = function (grupoDados) {
      vm.grupoDadosSelecionado = grupoDados;
    };

    vm.estaSelecionado = function (grupoDados) {
      return (vm.grupoDadosSelecionado === grupoDados);
    };

    vm.atualizarDataNascimento = function () {
      vm.dataNascimento = new Date(vm.anoNascimento, vm.mesNascimento, vm.diaNascimento);
    };


    vm.toggleTipoPrancha = function (tipoPrancha) {

      $scope.form.$setDirty();
      var index = vm.membro.tiposPrancha.indexOf(tipoPrancha);

      if (index > -1) {
        vm.membro.tiposPrancha.splice(index, 1);
      } else {
        vm.membro.tiposPrancha.push(tipoPrancha);
      }
    };

    vm.dataBelongsToCurrenteUser = function () {
      return facebookAuthenticationService.user.id === vm.membro.id;
    };

    vm.atualizarPerfil = function () {
      meFactory.update(vm.membro)
        .$promise.then(
          function (response) {
            console.debug(response);
            $state.go('me');
          },
          function (response) {
            console.error('Erro ao atualizar cadastro :\(');
            console.error('Error: ' + response.status + ' ' + response.statusText);
            $rootScope.mensagemErro = 'Erro ao realizar operação :\(' + '\nTente novamente mais tarde.';
            $state.go('erro');
          }
        );
    };

    vm.aprovarMembro = function () {
      
      vm.membro.aprovado = true;
      vm.membro.status = 'Ativo';

      membrosFactory.update({id: vm.membro.id}, vm.membro)
      .$promise.then(
        function (response) {
          console.debug(response);
          $state.go('lista-membros');
        },
        function (response) {
          console.error('Erro ao aprovar membro :\(');
          console.error('Error: ' + response.status + ' ' + response.statusText);
          $rootScope.mensagemErro = 'Erro ao realizar operação :\(' + '\nTente novamente mais tarde.';
          $state.go('erro');
        }
      );
    };

  }]);
