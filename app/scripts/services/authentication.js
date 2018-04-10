'use strict';

angular.module('cadastroRepublicaApp')
  .service('authenticationService', ['$rootScope', '$state', '$document', 'facebookService', 'membrosFactory', function ($rootScope, $state, $document, facebookService, membrosFactory) {

    //TODO implementar onFBLoginCallBack()

    //TODO remover esta função
    this.obterStringTeste = function () {
      return 'string teste do serviço de autenticação';
    };

    this.setIsRegistered = function(valor){
      this.isRegistered = valor;
    }

    this.user = {
      email: '',
      id: ''
    };

    this.isLogged = false;
    this.isRegistered = false;

    this.watchAuthenticationStatusChange = function () {

      var _self = this;

      FB.Event.subscribe('auth.statusChange', function (response) {

        console.log('Recebendo status de login do FaceBook após a inicialização do SDK (ou após alteracao no status de login): ' + response.status);

        if (response.status === 'connected') {

          /*
          The user is already logged,
          is possible retrieve his personal info
          */
          // _self.getUserInfo();

          /*
          This is also the point where you should create a
          session for the current user.
          For this purpose you can use the data inside the
          response.authResponse object.
          */
          if ($state.current.name === 'login') {
            console.log('Escondendo o botão de login');
            document.getElementById('loginButton').style.display = 'none';
          }
          console.log('Setando o valor de isLogged para true');
          _self.isLogged = true;

          //TODO consultar o usuário no servidor para ver se ele está registrado
          facebookService.getUserData().then(function (response) {
            $rootScope.user.email = _self.user.email = response.email;
            $rootScope.user.id = _self.user.id = response.id;
            membrosFactory.get({
              id: _self.user.id
            })
              .$promise.then(
              function (response) {
                console.log(response);
                _self.isRegistered = true;
                if ($state.current != 'lista-membros') {
                  $rootScope.mensagemErro = 'Você já está cadastrado no República Free Surf';
                  // $state.go('erro');
                  $state.go('membro', {id: _self.user.id});
                }
              },
              function (response) {
                console.log('Error: ' + response.status + ' ' + response.statusText);
                _self.isRegistered = false;
                $state.go('form.geral');//
              }
              );
          });

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

    /*  this.getUserInfo = function(){

         var _self = this;

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

     this.logout = function() {

       var _self = this;

       FB.logout(function(response) {
         $rootScope.$apply(function() {
           $rootScope.user = _self.user = {};
         });
       });

     }; */

  }]);
