'use strict';

angular.module('cadastroRepublicaApp')
  .service('facebookAuthenticationService', ['$rootScope', '$state', 'apiAuthenticationFactory', 'meFactory', function ($rootScope, $state, apiAuthenticationFactory, meFactory) {

    var vm = this;

    vm.user = {
      email: '',
      id: ''
    };

    vm.isLogged = false;
    vm.isRegistered = false;

    vm.setIsRegistered = function (valor) {
      vm.isRegistered = valor;
    };

    vm.login = function () {

      console.debug('Logging into no facebook...');

      FB.login(function (response) {
        if (response.status === 'connected') {
          vm.processFacebookConnection(response);
        } else {
          // The person is not logged into vm app or we are unable to tell. 
        }
      }, {
          scope: 'public_profile,email'
        });
    };

    vm.processFacebookConnection = function (response) {
      vm.isLogged = true;
      console.debug('Logged into Facebook.');
      console.debug('Logging into the backend API...');
      console.debug('Objeto authResponse do facebook: ' + JSON.stringify(response.authResponse));
      $rootScope.facebookUserToken = vm.facebookUserToken = response.authResponse.accessToken;
      $rootScope.user.id = vm.user.id = response.authResponse.userID;

      apiAuthenticationFactory.login(vm.facebookUserToken).then(function (response) {

        var respostaApiLogin = response.data;
        console.log('Sucesso no login. Armazenando token no local storage...');
        console.debug('Reposta do login: ' + JSON.stringify(response));
        var userCredentials = apiAuthenticationFactory.getUserCredentials(response);
        apiAuthenticationFactory.storeUserCredentials(userCredentials);

        if (respostaApiLogin.registrado) {
          meFactory.get().$promise.then(
            //se for um membro registrado (isto é, com cadastro completo)
            function (response) {
              console.log(response);
              vm.isRegistered = true;
              if ($state.current !== 'lista-membros') {
                $state.go('me');
              }
            });
        } else {
          vm.isRegistered = false;
          console.log('Usuário não cadastrado. Direcionando para o formulário de cadastro...');
          $state.go('regras');
        }
      },
        function (response) {
          console.error('O login na API falhou');
          console.error('Error Status: ' + response.status + ' ' + response.statusText);
          console.error('Error Payload: ' + JSON.stringify(response.data));
          console.error('Erro ao acessar servidor do República Free Surf');
          $rootScope.mensagemErro = 'Erro ao acessar servidor do República Free Surf :\(' + '\nTente novamente mais tarde.';
          $state.go('erro');

        });

    };

  }]);
