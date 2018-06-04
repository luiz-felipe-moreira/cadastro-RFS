'use strict';

angular.module('cadastroRepublicaApp')
    .controller('MembroController', ['membrosFactory', '$stateParams', function (membrosFactory, $stateParams) {

        var vm = this;
        vm.membro = {};
        vm.dataAniversario = '';

        membrosFactory.get({ id: $stateParams.id },
            function (response) {
                console.log(response);
                vm.membro = response;
                var dataNascimento = new Date(vm.membro.dataNascimento);
                var options = { month: 'long', day: 'numeric' };
                vm.dataAniversario = dataNascimento.toLocaleDateString('pt-BR', options);
            },
            function (response) {
                console.log('Erro ao obter dado do membro de id ' + $stateParams.id);
                console.log('Error: ' + response.status + ' ' + response.statusText);
            }
        );

        vm.grupoDadosSelecionado = 'geral';
        vm.selecionarGrupoDados = function (grupoDados) {
            vm.grupoDadosSelecionado = grupoDados;
        };

        vm.estaSelecionado = function (grupoDados) {
            return (vm.grupoDadosSelecionado === grupoDados);
        };

    }]);