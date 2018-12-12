'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:FormController
 * @description
 * # FormController
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('FormController', ['$rootScope', 'facebookAuthenticationService', 'facebookService', 'signedS3RequestService', 'meFactory', '$state', '$scope', '$window', function ($rootScope, facebookAuthenticationService, facebookService, signedS3RequestService, meFactory, $state, $scope, $window) {

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

    var promise = facebookService.getUserData();
    promise.then(function (response) {
      console.debug(JSON.stringify(response));
      vm.formData.email = response.email;
      vm.formData.id = response.id;
      vm.formData.nome = response.name;
      //a partir de agosto de 2018 o Facebook só retornará o gender para aplicações submetidas à analise 
      if (response.gender === 'male') {
        vm.formData.sexo = 'masculino';
      } else if (response.gender === 'female') {
        vm.formData.sexo = 'feminino';
      }
      vm.facebookPicture = response.picture.data;
    }, function (response) {
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

    vm.tiposPrancha = ['longboard', 'funboard', 'gun', 'shortboard (pranchinha)', 'fish', 'bodyboard', 'stand up paddle'];
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
      } else if (fileSizeMB > 5) {
        $window.alert('O tamanho do arquivo deve ser no máximo 5 MB! Selecione outra foto.');
        $scope.$apply(function () {
          vm.arquivoValido = false;
          vm.mensagemValidacaoArquivo = 'O tamanho do arquivo deve ser no máximo 5 MB! Selecione outra foto.';
          vm.imgSrcUpload = imagemSilhueta;
        });
      } else if (!fileTypePermitido) {
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

    $scope.cropped = {
      source: 'https://raw.githubusercontent.com/Foliotek/Croppie/master/demo/demo-1.jpg'
    };

    // Assign blob to component when selecting a image
    $scope.fileNameChanged2 = function (input) {
      // var input = this;

      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          // bind new Image to Component
          $scope.$apply(function () {
            $scope.cropped.source = e.target.result;
          });
        }

        reader.readAsDataURL(input.files[0]);
      }
    };

    vm.confirmarFoto = function () {
      var nomeArquivoS3 = vm.formData.id + '.jpg';

      var file = base64ImageToBlob($scope.cropped.image);
      console.debug(file);
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
    };

    function base64ImageToBlob(str) {
      // extract content type and base64 payload from original string
      var pos = str.indexOf(';base64,');
      var type = str.substring(5, pos);
      var b64 = str.substr(pos + 8);
    
      // decode base64
      var imageContent = atob(b64);
    
      // create an ArrayBuffer and a view (as unsigned 8-bit)
      var buffer = new ArrayBuffer(imageContent.length);
      var view = new Uint8Array(buffer);
    
      // fill the view, using the decoded base64
      for(var n = 0; n < imageContent.length; n++) {
        view[n] = imageContent.charCodeAt(n);
      }
    
      // convert ArrayBuffer to Blob
      var blob = new Blob([buffer], { type: type });
    
      return blob;
    }

 /*    vm.processForm = function () {

      if (vm.formData.fotoFacebook) {
        vm.formData.urlFoto = vm.facebookPicture.url;
        console.log('Alterando a url da foto para ' + vm.formData.urlFoto);
      }
      vm.formData.registrado = true;
      vm.formData.status = 'Aprovação pendente';
      meFactory.update(vm.formData)
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
    }; */

    //inicializa os campos referentes à data de nascimento com o dia atual
    vm.atualizarDataNascimento();

  }]);
