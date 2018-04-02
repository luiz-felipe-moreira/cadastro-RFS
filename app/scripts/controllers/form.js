'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:FormController
 * @description
 * # FormController
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('FormController', ['$rootScope', 'facebookService', 'signedS3RequestService', 'membrosFactory', '$state', '$scope', function ($rootScope, facebookService, signedS3RequestService, membrosFactory, $state, $scope) {

    $scope.fileNameChanged = function (fileInputElement) {
      var files = fileInputElement.files;
      var file = files[0];
      if (file == null) {
        alert("Selecione o arquivo");
      } else {
        //TODO fazer chamda ao backend
        console.log('Nome do arquivo: ' + file.name);
        signedS3RequestService.getSignedS3Request(file).then(function(response) {
          console.log('Response status: ' + response.status);
          console.log('Response data: ' + response.data);
          var signedRequest = response.data.signedRequest; //TODO verificar se nâo é response.signedRequest
          var url = response.data.url;
          signedS3RequestService.uploadFile(file, signedRequest, url).then(function(response) {
            
          }, function(errorResponse){

          });
        }, function(response) {
          $scope.data = response.data || 'Request failed';
          console.log('Response status: ' + response.status);
      });
      }

    };

    var vm = this;

    vm.formData = {
      dataNascimento: '',
      email: '',
      id: '',
      nome: '',
      sexo: ''
    };

    vm.facebookPicture = {};

    vm.useFacebookPicture = true;

    console.log('Valor do $rootScope.user no controller: ' + JSON.stringify($rootScope.user));

    facebookService.getUserData().then(function (response) {
      vm.formData.email = response.email;
      vm.formData.id = response.id;
      vm.formData.nome = response.name;
      if (response.gender === 'male') {
        vm.formData.sexo = 'M';
      } else if (response.gender === 'female') {
        vm.formData.sexo = 'F';
      }
      vm.facebookPicture = response.picture;
      //Enquanto não há a opção de escolher uma foto (upload), será sempre passado para o backend a URL da foto do perfil do Facebook
      vm.formData.urlFoto = vm.facebookPicture.data.url;
    }
    )
      .catch(function (response) {
        console.log('Erro ao obter dados do usuário no Facebook');
        // $rootScope.mensagemErro = 'Não foi possível obter seus dados no Facebook. Tente novamente mais tarde.';
        // $state.go('erro');
        console.log('Direcionando para a pagina de login...');
        $state.go('login');
      });

    vm.diaNascimento = null;
    vm.mesNascimento = null;
    vm.anoNascimento = null;

    $rootScope.passoGeralConcluido = false;
    $rootScope.passoSaudeConcluido = false;
    $rootScope.passoSurfeConcluido = false;

    vm.tiposPrancha = ['longboard', 'funboard', 'gun', 'shortboard (pranchinha)', 'fish', 'bodyboard'];
    vm.tiposPranchaSelecionados = [];

    vm.atualizarDataNascimento = function () {
      vm.formData.dataNascimento = new Date(vm.anoNascimento, vm.mesNascimento, vm.diaNascimento);
    };

    vm.marcarPassoGeralComoConcluido = function () {
      $rootScope.passoGeralConcluido = true;
    };

    vm.marcarPassoSaudeComoConcluido = function () {
      $rootScope.passoSaudeConcluido = true;
    };

    vm.marcarPassoSurfeComoConcluido = function () {
      $rootScope.passoSurfeConcluido = true;
    };



    vm.toggleTipoPrancha = function (tipoPrancha) {
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
          console.log(response);
          //TODO direcionar para a página de sucesso e inserir foto nessa página
          $state.go('confirmacao');
        },
        function (response) {
          console.log('Erro ao realizar cadastro :\(');
          console.log('Error: ' + response.status + ' ' + response.statusText);
          $rootScope.mensagemErro = 'Erro ao realizar cadastro :\(' + '\nTente novamente mais tarde.';
          $state.go('erro');
        }
      );
    };

    //inicializa os campos referentes à data de nascimento com o dia atual
    vm.atualizarDataNascimento();

  }]);
