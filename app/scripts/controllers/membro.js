'use strict';

angular.module('cadastroRepublicaApp')
  .controller('MembroController', ['membrosFactory', '$stateParams', '$state', 'meFactory', 'facebookAuthenticationService', function (membrosFactory, $stateParams, $state, meFactory, facebookAuthenticationService) {

    var vm = this;
    vm.membro = {};
    vm.dataAniversario = '';
    vm.diaNascimento = '';
    vm.mesNascimento = '';
    vm.anoNascimento = '';
    vm.tiposPranchaSelecionados = [];

    if ($stateParams.id) {
      membrosFactory.get({
          id: $stateParams.id
        },
        function (response) {
          console.log(response);
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
          vm.tiposPranchaSelecionados = vm.membro.tiposPrancha;
        },
        function (response) {
          console.log('Erro ao obter dado do membro de id ' + $stateParams.id);
          console.log('Error: ' + response.status + ' ' + response.statusText);
        }
      );
    } else {
      meFactory.get(
        function (response) {
          console.log(response);
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
        },
        function (response) {
          console.log('Erro ao obter dado do membro de id ' + $stateParams.id);
          console.log('Error: ' + response.status + ' ' + response.statusText);
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

    vm.tiposPrancha = ['longboard', 'funboard', 'gun', 'shortboard (pranchinha)', 'fish', 'bodyboard'];

    //TODO verificar se não dá para eliminar a variável tiposPranchaSelecionados (este codigo foi copiado de form.js)

    vm.toggleTipoPrancha = function (tipoPrancha) {
      var index = vm.tiposPranchaSelecionados.indexOf(tipoPrancha);

      if (index > -1) {
        vm.tiposPranchaSelecionados.splice(index, 1);
      } else {
        vm.tiposPranchaSelecionados.push(tipoPrancha);
      }
      vm.membro.tiposPrancha = vm.tiposPranchaSelecionados;
    };

    vm.dataBelongsToCurrenteUser = function () {
      return facebookAuthenticationService.user.id === vm.membro.id;
    };

    vm.atualizarPerfil = function () {
      meFactory.update(vm.membro)
        .$promise.then(
          function (response) {
            console.log(response);
            $state.go('me');
          },
          function (response) {
            console.log('Erro ao realizar cadastro :\(');
            console.log('Error: ' + response.status + ' ' + response.statusText);
            $rootScope.mensagemErro = 'Erro ao realizar operação :\(' + '\nTente novamente mais tarde.';
            $state.go('erro');
          }
        );
    };

  }]);
