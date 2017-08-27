'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:FormController
 * @description
 * # FormController
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('FormController', ['$rootScope', 'facebookService',  'membrosFactory', function($rootScope, facebookService, membrosFactory) {

    var vm = this;

    vm.formData = {
      dataNascimento: '',
      email: '',
      id: ''
    };
    console.log('Valor do $rootScope.user no controller: ' + JSON.stringify($rootScope.user));

    facebookService.getUserData().then(function(response) {
       vm.formData.email = response.email;
       vm.formData.id = response.id;
     }
   );

    vm.diaNascimento = null;
    vm.mesNascimento = null;
    vm.anoNascimento = null;

    $rootScope.passoGeralConcluido = false;
    $rootScope.passoSaudeConcluido = false;

    vm.tiposPrancha = ['longboard', 'funboard', 'gun', 'shortboard (pranchinha)', 'fish', 'bodyboard'];
    vm.tiposPranchaSelecionados = [];

    vm.atualizarDataNascimento = function() {
      vm.formData.dataNascimento = new Date(vm.anoNascimento, vm.mesNascimento, vm.diaNascimento);
    };

    vm.marcarPassoGeralComoConcluido = function() {
      $rootScope.passoGeralConcluido = true;
    };

    vm.marcarPassoSaudeComoConcluido = function() {
      $rootScope.passoSaudeConcluido = true;
    };

    vm.toggleTipoPrancha = function(tipoPrancha) {
      var index = vm.tiposPranchaSelecionados.indexOf(tipoPrancha);

      if (index > -1) {
        vm.tiposPranchaSelecionados.splice(index, 1);
      } else {
        vm.tiposPranchaSelecionados.push(tipoPrancha);
      }
      vm.formData.tiposPrancha = vm.tiposPranchaSelecionados;
    };

    // function to process the form
    vm.processForm = function () {

      membrosFactory.save(vm.formData, 
          function (response) {
                alert('Cadastro realizado!');
              console.log(response);
          },
          function (response) {
              alert('Erro ao realizar cadastro :(');
              console.log("Error: " + response.status + " " + response.statusText);
          }
      );
    };

    //inicializa os campos referentes à data de nascimento com o dia atual
    vm.atualizarDataNascimento();

  }]);
