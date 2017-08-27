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
    'ui.mask'
  ])
  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
      // route to show our basic form (/form)
      .state('form', {
        url: '/form',
        templateUrl: 'views/form.html',
        controller: 'FormController',
        controllerAs: 'formController'
      })
      // nested states
      // each of these sections will have their own view
      // url will be nested (/form/geral)
      .state('form.geral', {
        url: '/geral',
        templateUrl: 'views/form-geral.html'
      })

      // url will be /form/saude
      .state('form.saude', {
        url: '/saude',
        templateUrl: 'views/form-saude.html'
      })

      // url will be /form/surfe
      .state('form.surfe', {
        url: '/surfe',
        templateUrl: 'views/form-surfe.html'
      })

      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        controllerAs: 'loginController'
      })

      .state('main', {
        url: '/main',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .state('cadastro_preexistente', {
        url: '/cadastro_preexistente',
        templateUrl: 'views/cadastro_preexistente.html',
      })
      .state('confirmacao', {
        url: '/confirmacao',
        templateUrl: 'views/confirmacao-cadastro.html',
      });

    $urlRouterProvider.otherwise('/form/geral');

  })
  .run(['$rootScope', '$window', 'authenticationService', '$state', function($rootScope, $window, authenticationService, $state) {

    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {


      console.log('Detectando mudança de state');

      if (toState.name === 'login') {
        return; // no need to redirect
      }

      console.log('Valor de authenticationService.isRegistered ' + authenticationService.isRegistered);
      console.log('Valor do authentication.isLogged: ' + authenticationService.isLogged);

      if (authenticationService.isLogged === false) {
        e.preventDefault(); // stop current execution
        $state.go('login'); // go to login
      }

      if ((toState.name === 'form.saude') && ($rootScope.passoGeralConcluido === false)) {
        console.log('Impedindo a mudança de página.');
        console.log('$rootScope.passoGeralConcluido: ' + $rootScope.passoGeralConcluido);
        e.preventDefault(); // stop current execution
        $state.go('form.geral'); // go to login
      }

      if ((toState.name === 'form.surfe') && ($rootScope.passoSaudeConcluido === false)) {
        console.log('Impedindo a mudança de página.');
        console.log('$rootScope.passoSaudeConcluido: ' + $rootScope.passoSaudeConcluido);
        e.preventDefault(); // stop current execution
        $state.go('form.saude'); // go to login
      }


    });

    $rootScope.$on('$stateChangeSuccess', function() {
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    });


    /** */

    //Referência: https://blog.brunoscopelliti.com/facebook-authentication-in-your-angularjs-web-app/

    $rootScope.user = {};

    $window.fbAsyncInit = function() {

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
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);

      // Trata erros no acesso ao Facebook e carregamento do seu SDK:
      (function result() {
        // var result;

        var resolve = function(outcome) {
          /* if (result !== undefined) {
             return result;
           };*/

          var message = [
            'Erro ao carregar o Facebook SDK',
            'Não conseguiu alcançar o servidor do Facebook ou este não está respondendo'
          ];

          $rootScope.$apply(function() {
            $rootScope.erroIntegracaoFacebook = message[outcome];
          });

        };

        js.onerror = function() {
          resolve(0);
        };

        // 10 seconds timeout, para sinalizar algum problema na conexão com o Facebook
        // se em trinta segundos o Facebook SDK não estiver carregado, o objeto FB estará undefined
        setTimeout(function() {
          if (typeof(FB) === 'undefined' || FB === null) {
            resolve(1);
          }
        }, 10000);
      }());

    }(document, 'script', 'facebook-jssdk'));

  }]);
