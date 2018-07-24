'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:FormController
 * @description
 * # FormController
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('FormController', ['$rootScope', 'facebookAuthenticationService', 'facebookService', 'signedS3RequestService', 'membrosFactory', '$state', '$scope', '$window', function ($rootScope, facebookAuthenticationService, facebookService, signedS3RequestService, membrosFactory, $state, $scope, $window) {

    var vm = this;

    vm.formData = {
      dataNascimento: '',
      email: '',
      id: '',
      nome: '',
      sexo: '',
      fotoFacebook: false,
      urlFoto: ''
    };

    vm.facebookPicture = {};

    var imagemSilhueta = './images/avatar-default.png';
    var imagemLoading = './images/loading.gif';

    vm.imgSrcUpload = imagemSilhueta;
    vm.arquivoArmazenadoComSucesso = false;
    vm.mensagemValidacaoArquivo = '';
    vm.arquivoValido = true;

    console.log('Valor do $rootScope.user no controller: ' + JSON.stringify($rootScope.user));

    facebookService.getUserData().then(function (response) {
      vm.formData.email = response.email;
      vm.formData.id = response.id;
      vm.formData.nome = response.name;
      if (response.gender === 'male') {
        vm.formData.sexo = 'masculino';
      } else if (response.gender === 'female') {
        vm.formData.sexo = 'feminino';
      }
      vm.facebookPicture = response.picture.data;
    }
    )
      .catch(function (response) {
        console.error('Erro ao obter dados do usuário no Facebook');
        console.error('Resposta do Facebook: ' + response);
        console.error('Direcionando para a pagina de login...');
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

    $scope.fileNameChanged = function (fileInputElement) {
      $scope.$apply(function () {
        vm.mensagemValidacaoArquivo = '';
        vm.arquivoValido = true;
      });

      vm.arquivoArmazenadoComSucesso = false;
      var files = fileInputElement.files;
      var file = files[0];
      var fileSizeMB = ((file.size / 1024) / 1024).toFixed(4);
      var fileTypePermitido = (file.type === 'image/jpeg');

      if (file === null) {
        $window.alert('Selecione o arquivo');
        $scope.$apply(function () {
          vm.arquivoValido = false;
          vm.mensagemValidacaoArquivo = 'Selecione o arquivo.';
          vm.imgSrcUpload = imagemSilhueta;
        });
      }
      else if (fileSizeMB > 5) {
        $window.alert('O tamanho do arquivo deve ser no máximo 5 MB! Selecione outra foto.');
        $scope.$apply(function () {
          vm.arquivoValido = false;
          vm.mensagemValidacaoArquivo = 'O tamanho do arquivo deve ser no máximo 5 MB! Selecione outra foto.';
          vm.imgSrcUpload = imagemSilhueta;
        });
      }
      else if (!fileTypePermitido) {
        $window.alert('O formato do arquivo deve ser JPEG! Selecione outra foto.');
        $scope.$apply(function () {
          vm.arquivoValido = false;
          vm.mensagemValidacaoArquivo = 'O formato do arquivo deve ser JPEG! Selecione outra foto.';
          vm.imgSrcUpload = imagemSilhueta;
        });
      } else {
        $scope.$apply(function () {
          vm.imgSrcUpload = imagemLoading;
        });
        var nomeArquivoS3 = vm.formData.id + '.jpg';

        signedS3RequestService.getSignedS3Request(file, nomeArquivoS3).then(function (response) {

          var signedRequest = response.data.signedRequest;
          var urlFileS3 = response.data.url;

          signedS3RequestService.uploadFile(file, signedRequest, urlFileS3).then(function (response) {
            console.log('Foto do usuario enviada para o bucket S3!');
            console.debug('Response status: ' + response.status);
            //adiciona um numero aleatorio ao final da url da imagem para evitar que o browser use a imagem do cache
            vm.imgSrcUpload = urlFileS3 + '?' + Date.now();
            vm.formData.urlFoto = urlFileS3;
            console.log('Alterando a url da foto para ' + vm.formData.urlFoto);
            vm.arquivoArmazenadoComSucesso = true;
          }, function (errorResponse) {
            console.log('Erro ao enviar foto para o bucket S3!');
            console.debug('Response status: ' + errorResponse.status);
            $scope.$apply(function () {
              vm.imgSrcUpload = imagemSilhueta;
            });
          });

        }, function (response) {
          $scope.data = response.data || 'Request failed';
          console.log('Response status: ' + response.status);
        });
      }

    };

    vm.processForm = function () {

      if (vm.formData.fotoFacebook) {
        vm.formData.urlFoto = vm.facebookPicture;
        console.log('Alterando a url da foto para ' + vm.formData.urlFoto);
      }
      vm.formData.registrado = true;
      vm.formData.status = 'Aprovação pendente';

      membrosFactory.update({
        //TODO pegar id do apiAuthenticationFactory ao inves do rootScope
        id: $rootScope.user.id
      },vm.formData)
        .$promise.then(
          function (response) {
            console.log(response);
            facebookAuthenticationService.setIsRegistered(true);
            $state.go('confirmacao');
          },
          function (response) {
            console.log('Erro ao realizar cadastro :\(');
            console.log('Error: ' + response.status + ' ' + response.statusText);
            $rootScope.mensagemErro = 'Erro ao realizar cadastro :\(' + '\nTente novamente mais tarde.';
            $state.go('erro');
          }
        );


      /* membrosFactory.save(vm.formData,
        function (response) {
          console.log(response);
          facebookAuthenticationService.setIsRegistered(true);
          $state.go('confirmacao');
        },
        function (response) {
          console.log('Erro ao realizar cadastro :\(');
          console.log('Error: ' + response.status + ' ' + response.statusText);
          $rootScope.mensagemErro = 'Erro ao realizar cadastro :\(' + '\nTente novamente mais tarde.';
          $state.go('erro');
        }
      ); */
    };

    //inicializa os campos referentes à data de nascimento com o dia atual
    vm.atualizarDataNascimento();

  }]);
