'use strict';

/**
 * @ngdoc overview
 * @name cadastroRepublicaApp
 * @description
 * # cadastroRepublicaApp
 *
 * Main module of the application.
 */
angular
  .module('cadastroRepublicaApp', [
    'ngResource',
    'ui.router',
    'ui.mask',
    'angular-loading-bar',
    'config'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      // route to show our basic form (/form)
      .state('form', {
        url: '/form',
        templateUrl: 'views/form.html',
        controller: 'FormController',
        controllerAs: 'formController'
      })
      // nested states, each of these sections will have their own view
      // url will be nested (/form/geral)
      .state('form.geral', {
        url: '/geral',
        templateUrl: 'views/form-geral.html'
      })

      .state('form.saude', {
        url: '/saude',
        templateUrl: 'views/form-saude.html'
      })

      .state('form.surfe', {
        url: '/surfe',
        templateUrl: 'views/form-surfe.html'
      })

      .state('form.foto', {
        url: '/foto',
        templateUrl: 'views/form-foto.html'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        controllerAs: 'loginController'
      })

      .state('lista-membros', {
        url: '/lista-membros',
        templateUrl: 'views/lista-membros.html',
        controller: 'MembrosListController',
        controllerAs: 'membrosListController'
        
      })

      .state('membro', {
        url: '/membro/:id',
        templateUrl: 'views/membro.html',
        controller: 'MembroController',
        controllerAs: 'membroController'
      })

      .state('main', {
        url: '/main',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .state('erro', {
        url: '/erro',
        templateUrl: 'views/erro.html',
      })
      .state('confirmacao', {
        url: '/confirmacao',
        templateUrl: 'views/confirmacao-cadastro.html'
      });

    $urlRouterProvider.otherwise('/login');

  })
  .run(['$rootScope', '$window', '$document','authenticationService', '$state', function ($rootScope, $window, $document, authenticationService, $state) {

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {


      console.log('Detectando mudança de state');

      if ((toState.name === 'login') && (authenticationService.isLogged)) {
        console.log('Impedindo a mudança de página.');
        console.log('Valor de authenticationService.isLogged: ' + authenticationService.isLogged);
        e.preventDefault();
      }
      if (((toState.name === 'form.geral') || (toState.name === 'form.saude') || (toState.name === 'form.saude')) && authenticationService.isRegistered) {
        console.log('Impedindo a mudança de página.');
        console.log('authenticationService.isRegistered: ' + authenticationService.isRegistered);
        e.preventDefault();
      } else if ((toState.name === 'form.saude') && ($rootScope.passoGeralConcluido === false)) {
        console.log('Impedindo a mudança de página.');
        console.log('$rootScope.passoGeralConcluido: ' + $rootScope.passoGeralConcluido);
        e.preventDefault();
        $state.go('form.geral');
      } else if ((toState.name === 'form.surfe') && ($rootScope.passoSaudeConcluido === false)) {
        console.log('Impedindo a mudança de página.');
        console.log('$rootScope.passoSaudeConcluido: ' + $rootScope.passoSaudeConcluido);
        e.preventDefault();
        $state.go('form.saude');
      } else if ((toState.name === 'form.foto') && ($rootScope.passoSurfeConcluido === false)) {
        // console.log('Impedindo a mudança de página.');
        // console.log('$rootScope.passoSurfeConcluido: ' + $rootScope.passoSurfeConcluido);
        // e.preventDefault();
        $state.go('form.surfe');
      }

      if ((toState.name === 'lista-membros') && (!authenticationService.isRegistered)) {
        console.log('Impedindo a mudança de página.');
        console.log('authenticationService.isRegistered: ' + authenticationService.isRegistered);
        console.log('Direcionando para a página de login...');
        e.preventDefault();
        $state.go('login');
      }


    });

    $rootScope.$on('$stateChangeSuccess', function () {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });


    /** */

    //Referência: https://blog.brunoscopelliti.com/facebook-authentication-in-your-angularjs-web-app/

    $rootScope.user = {};

    $window.fbAsyncInit = function () {

      FB.init({
        appId: '386727121713923',
        status: true, // check authentication status at the startup of the app
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true, // parse social plugins on this page
        version: 'v2.8' // use graph api version 2.8
      });

      /*
            FB.getLoginStatus(function(response) {
              if (response.status === 'connected') {
                //we are connected
                console.debug("CONNECTED TO FACEBOOK");
                authenticationService.isLogged = true;
                $state.go('form.geral');
              } else if (response.status === 'not_authorized') {
                console.debug("NOT AUTHORIZED BY FACEBOOK");
                $state.go('login');
              } else {
                // we are not logged in facebook
                console.debug("NOT LOGGED IN TO FACEBOOK");
                $state.go('login');
              }
            });
            */

      authenticationService.watchAuthenticationStatusChange();

    };

    // Load the SDK asynchronously
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);

      // Trata erros no acesso ao Facebook e carregamento do seu SDK:
      (function result() {

        var resolve = function (outcome) {

          var message = [
            'Erro ao carregar o Facebook SDK',
            'Não conseguiu alcançar o servidor do Facebook ou este não está respondendo'
          ];

          $rootScope.$apply(function () {
            $rootScope.erroIntegracaoFacebook = message[outcome];
          });

        };

        js.onerror = function () {
          resolve(0);
        };

        // 10 seconds timeout, para sinalizar algum problema na conexão com o Facebook
        // se em trinta segundos o Facebook SDK não estiver carregado, o objeto FB estará undefined
        setTimeout(function () {
          if (typeof (FB) === 'undefined' || FB === null) {
            resolve(1);
          }
        }, 10000);
      }());

    }(document, 'script', 'facebook-jssdk'));

  }]);
