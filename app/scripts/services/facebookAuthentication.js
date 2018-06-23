'use strict';

angular.module('cadastroRepublicaApp')
  .service('facebookAuthenticationService', ['$rootScope', '$state', '$document', 'facebookService', 'apiAuthenticationFactory', 'membrosFactory', function ($rootScope, $state, $document, facebookService, apiAuthenticationFactory, membrosFactory) {

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
            apiAuthenticationFactory.storeUserCredentials(
              {
                facebookId: respostaApiLogin.id,
                registrado: respostaApiLogin.registrado,
                aprovado: respostaApiLogin.aprovado,
                admin: respostaApiLogin.admin,
                apiToken: respostaApiLogin.token
              }
            );

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
              console.error('O login na API falhou');
              console.error('Error Status: ' + response.status + ' ' + response.statusText);
              console.error('Error Payload: ' + JSON.stringify(response.data));
              console.error('Erro ao acessar servidor do República Free Surf');
              $rootScope.mensagemErro = 'Erro ao acessar servidor do República Free Surf :\(' + '\nTente novamente mais tarde.';
              $state.go('erro');

            });

        } else {
          // The person is not logged into vm app or we are unable to tell. 
        }
      }, { scope: 'public_profile,email' });
    };

    vm.watchAuthenticationStatusChange = function () {

      var _self = vm;

      FB.Event.subscribe('auth.statusChange', function (response) {

        console.log('Recebendo status de login do FaceBook após a inicialização do SDK (ou após alteracao no status de login): ' + response.status);

        if (response.status === 'connected') {

          /*
          The user is already logged,
          is possible retrieve his personal info
          */
          // _self.getUserInfo();

          /*
          vm is also the point where you should create a
          session for the current user.
          For vm purpose you can use the data inside the
          response.authResponse object.
          */

          console.debug('Objeto authResponse do facebook: ' + JSON.stringify(response.authResponse));
          _self.facebookUserToken = response.authResponse.accessToken;
          $rootScope.user.id = _self.user.id = response.authResponse.userID;

          apiAuthenticationFactory.login(_self.facebookUserToken).then(function (response) {
            var resposta = response.data;
            console.log('Sucesso no login. Armazenando token no local storage...');
            console.debug('Reposta do login: ' + JSON.stringify(response));o
            //o parametro passado para storeUserCredentiasl abaixo está errado
           // apiAuthenticationFactory.storeUserCredentials({ facebookId: resposta.id, apiToken: resposta.token });
            if (resposta.registrado) {
              membrosFactory.get({
                id: _self.user.id
              })
                .$promise.then(
                  //se for um membro cadastrado
                  function (response) {
                    console.log(response);
                    _self.isRegistered = true;
                    //apiAuthenticationFactory.login(_self.facebookUserToken);
                    if ($state.current !== 'lista-membros') {
                      $state.go('membro', { id: _self.user.id });
                    }
                  });
            } else {
              _self.isRegistered = false;
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

          /****/

          /*
          if ($state.current.name === 'login') {
            console.log('Escondendo o botão de login');
            document.getElementById('loginButton').style.display = 'none';
          }
          console.log('Setando o valor de isLogged para true');
          _self.isLogged = true;

           facebookService.getUserData().then(function (response) {
            console.debug('Resposta do facebook: ' + JSON.stringify(response));
            $rootScope.user.email = _self.user.email = response.email;
            $rootScope.user.id = _self.user.id = response.id;
            membrosFactory.get({
              id: _self.user.id
            })
              .$promise.then(
                //se for um membro cadastrado
                function (response) {
                  console.log(response);
                  _self.isRegistered = true;
                  //apiAuthenticationFactory.login(_self.facebookUserToken);
                  if ($state.current !== 'lista-membros') {
                    $state.go('membro', { id: _self.user.id });
                  }
                },
                function (response) {
                  //se não for um membro cadastrado
                  _self.isRegistered = false;
                  if (response.status === 404) {
                    console.log('Usuário não cadastrado. Direcionando para o formulário de cadastro...');
                    $state.go('form.geral');
                  }
                  else {
                    console.error('Erro ao acessar servidor do República Free Surf');
                    console.error('Error: ' + response.status + ' ' + response.statusText);
                    $rootScope.mensagemErro = 'Erro ao acessar servidor do República Free Surf :\(' + '\nTente novamente mais tarde.';
                    $state.go('erro');
                  }
                }
              );
          }); */

        }
        else {

          /*
          The user is not logged to the app, or into Facebook:
          destroy the session on the server.
          */
          console.log('Usuário não está mais logado');
          if ($state.current.name === 'login') {
            // Display the login button
            document.getElementById('loginButton').style.display = 'block';
          }
          _self.isLogged = false;
          _self.isRegistered = false;

        }

      });
    };

    /*  vm.getUserInfo = function(){

         var _self = vm;

         FB.api('/me', 'GET', {fields: 'email, first_name, name, id'}, function(response){
           $rootScope.$apply(function() {
           $rootScope.user = _self.user = response;
           console.log('Dados obtidos do Facebook:' + JSON.stringify(response));
           });
         });

         FB.api('/me/picture', 'GET', {width: 500}, function(response){
           $rootScope.$apply(function() {
           $rootScope.user.pictureUrl = _self.user.pictureUrl = response.data.url;
           console.log(response);
           });
         });


     };

     vm.logout = function() {

       var _self = vm;

       FB.logout(function(response) {
         $rootScope.$apply(function() {
           $rootScope.user = _self.user = {};
         });
       });

     }; */

  }]);
