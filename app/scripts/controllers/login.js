'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:LoginController
 * @description
 * # LoginController
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('LoginController', ['authenticationService', 'apiAuthenticationFactory', 'membrosFactory', '$state', '$rootScope', function (authenticationService, apiAuthenticationFactory, membrosFactory, $state, $rootScope) {
    // .controller('LoginController', ['$window', '$rootScope', '$state', 'facebookService', 'membrosFactory', function ($window, $rootScope, $state, facebookService, membrosFactory) {

    var vm = this;

    vm.user = {
      email: '',
      id: ''
    };

    vm.isRegistered = false;

    vm.login = function () {

      authenticationService.login();

     /*  FB.login(function (response) {
        if (response.status === 'connected') {
          console.debug('Logged into Facebook.');
          console.debug('Logging into the backend API...');
          console.debug('Objeto authResponse do facebook: ' + JSON.stringify(response.authResponse));
          vm.facebookUserToken = response.authResponse.accessToken;
          $rootScope.user.id = vm.user.id = response.authResponse.userID;

          apiAuthenticationFactory.login(vm.facebookUserToken).then(function (response) {
            
            var respostaApiLogin = response.data;
            console.log('Sucesso no login. Armazenando token no local storage...');
            console.debug('Reposta do login: ' + JSON.stringify(response));
            apiAuthenticationFactory.storeUserCredentials({ facebookId: respostaApiLogin.id, apiToken: respostaApiLogin.token });
            
            if (respostaApiLogin.registrado) {
              membrosFactory.get({ id: vm.user.id }).$promise.then(
                //se for um membro registrado (isto é, com cadastro completo)
                function (response) {
                  console.log(response);
                  vm.isRegistered = true;
                  if ($state.current !== 'lista-membros') {
                    $state.go('membro', { id: vm.user.id });
                  }
                });
            } else {
              vm.isRegistered = false;
              console.log('Usuário não cadastrado. Direcionando para o formulário de cadastro...');
              $state.go('form.geral');
            }
          },
            function (response) {
              console.error('O login falhou');
              console.error('Error: ' + response.status + ' ' + response.statusText);
              if (response.status === 401) {
                console.log('Usuário não cadastrado. Direcionando para o formulário de cadastro...');
                $state.go('form.geral');
              } else {
                console.error('Erro ao acessar servidor do República Free Surf');
                $rootScope.mensagemErro = 'Erro ao acessar servidor do República Free Surf :\(' + '\nTente novamente mais tarde.';
                $state.go('erro');
              }

            });

        } else {
          // The person is not logged into this app or we are unable to tell. 
        }
      }, { scope: 'public_profile,email' });
    }; */


    /*
    
        $window.onFBLoginCallBack = function () {
          
                console.log('Obtendo os dados do usuario no Facebook...');
                facebookService.getUserData().then(function (response) {
                  vm.user.email = response.email;
                  console.log('Email: ' + vm.user.email);
                  vm.user.id = response.id;
                  console.log('Facebook id: ' + vm.user.id);
                  membrosFactory.get({
                    id: vm.user.id
                  })
                    .$promise.then(
                    function (response) {
                      console.log('respostaApiLogin do membrosFactory.get :');
                      console.log(response);
                      $rootScope.isRegistered = true;
                      console.log('Setando valor do vm.isRegistered: ' + vm.isRegistered);
                      $state.go('cadastro_preexistente');//
                    },
                    function (response) {
                      console.log("Error: " + response.status + " " + response.statusText);
                      $rootScope.isRegistered = false;
                      console.log('Setando valor do vm.isRegistered: ' + vm.isRegistered);
                      $state.go('form.geral');//
                    }
                    );
                });
                
                */
        };
  }]);
