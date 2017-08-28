'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:CadastroController
 * @description
 * # MainCtrl
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('LoginController', ['$window', '$scope', '$state', 'facebookService', 'membrosFactory', function ($window, $scope, $state, facebookService, membrosFactory) {

    var ctrl = this;
    this.user = {
      email: '',
      id: ''
    };

    ctrl.isRegistered = false;

    $window.onFBLoginCallBack = function () {

      console.log('Obtendo os dados do usuario no Facebook...')
      facebookService.getUserData().then(function(response) {
        ctrl.user.email = response.email;
        console.log('Email: ' + ctrl.user.email);
        ctrl.user.id = response.id;
        console.log('Facebook id: ' + ctrl.user.id);
        membrosFactory.get({
            id: ctrl.user.id
        })
        .$promise.then(
            function (response) {
              console.log('Resposta do membrosFactory.get :')
                console.log(response);
                ctrl.isRegistered = true;
                console.log('Setando valor do ctrl.isRegistered: ' + ctrl.isRegistered);
                $state.go('cadastro_preexistente');//
            },
            function (response) {
                console.log("Error: " + response.status + " " + response.statusText);
                ctrl.isRegistered = false;
                console.log('Setando valor do ctrl.isRegistered: ' + ctrl.isRegistered);
                $state.go('form.geral');//
            }
        );
      });

      // console.log('Valor do authentication.isLogged: ' + authenticationService.isLogged);
      /*if ((ctrl.isRegistered)) {
        $state.go('cadastro_preexistente');
        */
      // } else if ((authenticationService.isLogged)){
      /*} else {
        $state.go('form.geral');
      }*/
      // else {
      //   $state.go('login');
      // };
      
    };


    // $scope.facebook = {
    //   username: "",
    //   email: ""
    // };

  }]);
