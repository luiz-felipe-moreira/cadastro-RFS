'use strict';

angular.module('cadastroRepublicaApp')
  .controller('MembroController', ['membrosFactory', '$stateParams', '$state', 'meFactory', 'facebookAuthenticationService', 'apiAuthenticationFactory', 'signedS3RequestService', '$scope', '$rootScope', 'modalConfirmService', function (membrosFactory, $stateParams, $state, meFactory, facebookAuthenticationService, apiAuthenticationFactory, signedS3RequestService, $scope, $rootScope, modalConfirmService) {

    var vm = this;
    vm.membro = {};
    vm.dataAniversario = '';
    vm.diaNascimento = '';
    vm.mesNascimento = '';
    vm.anoNascimento = '';
    vm.tiposPrancha = ['longboard', 'funboard', 'gun', 'shortboard (pranchinha)', 'fish', 'bodyboard', 'stand up paddle'];

    var imagemSilhueta = './images/avatar-default.png';

    vm.imgSrcUpload = imagemSilhueta;
    vm.arquivoFotoSelecionado = false;
    vm.recorteFotoConfirmado = false;
    vm.arquivoArmazenadoComSucesso = false;
    vm.arquivoValido = true;

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

    $scope.cropped = {
      source: imagemSilhueta
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

    // Assign blob to component when selecting a image
    $scope.fileNameChanged = function (input) {
      // var input = this;
      vm.arquivoFotoSelecionado = true;
      vm.recorteFotoConfirmado = false;
      vm.arquivoArmazenadoComSucesso = false;

      if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
          // bind new Image to Component
          $scope.$apply(function () {
            $scope.cropped.source = e.target.result;
          });
        };

        reader.readAsDataURL(input.files[0]);
      }
    };

    vm.confirmarFoto = function () {

      vm.recorteFotoConfirmado = true;
      var nomeArquivoS3 = vm.membro.id + '-' + Date.now() + '.png';

      var file = base64ImageToBlob($scope.cropped.image);
      console.debug(file);
      signedS3RequestService.getSignedS3Request(file, nomeArquivoS3).then(function (response) {

        var signedRequest = response.data.signedRequest;
        var urlFileS3 = response.data.url;

        signedS3RequestService.uploadFile(file, signedRequest, urlFileS3).then(function (response) {
          console.log('Foto do usuario enviada para o bucket S3!');
          console.debug('Response status: ' + response.status);
          //adiciona um numero aleatorio ao final da url da imagem para evitar que o browser use a imagem do cache
          vm.imgSrcUpload = urlFileS3;
          vm.membro.urlFoto = urlFileS3;
          //alteracao de foto não permite escolher foto do Facebook
          vm.membro.fotoFacebook = false;
          console.log('Alterando a url da foto para ' + vm.membro.urlFoto);
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
      for (var n = 0; n < imageContent.length; n++) {
        view[n] = imageContent.charCodeAt(n);
      }

      // convert ArrayBuffer to Blob
      var blob = new Blob([buffer], { type: type });

      return blob;
    }

    vm.dataBelongsToCurrenteUser = function () {
      return facebookAuthenticationService.user.id === vm.membro.id;
    };

    vm.isCurrentUserAdmin = function () {
      return apiAuthenticationFactory.isAdmin();
    };

    //Atualiza os dados, com exceção da foto
    vm.atualizarPerfil = function () {

      delete vm.membro.fotoFacebook;
      delete vm.membro.urlFoto;

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

    vm.atualizarFoto = function () {

      var alteracao = {
        fotoFacebook: vm.membro.fotoFacebook,
        urlFoto: vm.membro.urlFoto
      };

      meFactory.update(alteracao)
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

      membrosFactory.update({ id: vm.membro.id }, vm.membro)
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

    vm.excluirMembro = function () {
      var options = {
        closeButtonText: 'Cancelar',
        actionButtonText: 'Sim',
        headerText: 'Exclusão de membro',
        bodyText: 'Tem certeza que deseja excluir ' + vm.membro.nome + ' ?'
      };

      modalConfirmService.showModal({}, options).then(
        function (result) {
          console.debug(result);
          console.log('Excluindo membro de id' + vm.membro.id + ' e nome ' + vm.membro.nome);
          membrosFactory.delete({
            id: vm.membro.id
          },
            function (response) {
              var membroExcluido = response;
              console.log('Membro ' + membroExcluido.nome + ' excluído com sucesso!');
              $state.go('lista-membros');
            },
            function (response) {
              console.error('Erro ao excluir membro de id ' + vm.membro.id);
              console.error('Error: ' + response.status + ' ' + response.statusText);
            }
          );
        },
        function () {
          console.log('Modal dismissed. Usuário cancelou a operação.');
        });
    };

  }]);
