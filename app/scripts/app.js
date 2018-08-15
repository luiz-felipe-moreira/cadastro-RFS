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
    'config',
    'http-auth-interceptor',
    'angular-loading-bar'
  ])
  .config(function ($httpProvider, $stateProvider, $urlRouterProvider) {

    //registra interceptor do arquivo authenticationInterceptors.js para respostas HTTP com erro 401 Unauthorized
    // $httpProvider.interceptors.push('authInterceptor');

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
        views: {
          'header': {
            templateUrl: 'views/header.html'
          },
          'content': {
            templateUrl: 'views/lista-membros.html',
            controller: 'MembrosListController',
            controllerAs: 'membrosListController'
          }
        }
        /* templateUrl: 'views/lista-membros.html',
        controller: 'MembrosListController',
        controllerAs: 'membrosListController' */

      })

      .state('membro', {
        url: '/membro/:id',
        templateUrl: 'views/membro.html',
        controller: 'MembroController',
        controllerAs: 'membroController'
      })

      .state('me', {
        url: '/me',
        views: {
          'header': {
            templateUrl: 'views/header.html'
          },
          'content': {
            templateUrl: 'views/membro.html',
            controller: 'MembroController',
            controllerAs: 'membroController'
          }
        }
        /*  templateUrl: 'views/membro.html',
         controller: 'MembroController',
         controllerAs: 'membroController' */
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
        templateUrl: 'views/confirmacao-cadastro.html',
        controller: 'ConfirmacaoController',
        controllerAs: 'confirmacaoController'
      });

    $urlRouterProvider.otherwise('/login');

  })
  .run(['$rootScope', '$window', '$document', 'facebookAuthenticationService', 'apiAuthenticationFactory', '$state', 'authService', function ($rootScope, $window, $document, facebookAuthenticationService, apiAuthenticationFactory, $state, authService) {

    console.debug('executando o codigo em .run');

    $rootScope.$on('event:auth-forbidden', function () {
      console.error('angular-http-auth captured response code 403');
      console.error('The frontend tried to access a forbidden endpoint!');
    });

    $rootScope.$on('event:auth-loginCancelled', function (event, data) {
      console.log('Event: ' + event);
      console.log('Data: ' + data);
      $state.go('login');
    });

    //interceptador do coponente http-auth-interceptor dispara esse evento no caso de resposta HTTP Status 401
    $rootScope.$on('event:auth-loginRequired', function () {

      console.log('angular-http-auth captured response code 401');

      if (!$rootScope.facebookUserToken) {
        console.error('facebookUerToken is empty :(');
        $state.go('login');
        return;
      }

      //renew token, using the login endpoint
      apiAuthenticationFactory.login($rootScope.facebookUserToken).then(function (response) {

        var userCredentials = apiAuthenticationFactory.getUserCredentials(response);
        apiAuthenticationFactory.storeUserCredentials(userCredentials);

        authService.loginConfirmed('success', function (config) {
          config.headers['x-auth-token'] = apiAuthenticationFactory.getAuthToken();
          return config;
        });

      }, function (response) {
        console.debug('Erro ao obter novo token da API');
        console.debug('Error Status: ' + response.status + ' ' + response.statusText);
        console.debug('Error Message: ' + response.data.message);
        if (response.data.error.name === 'InternalOAuthError') {
          console.debug('Falha ao validar token do Facebook a partir do servidor do Republica');
          console.debug('O token do Facebook pode estar expirado ou o usuário não está mais logado no Facebook');
          console.debug('oauthError: ' + JSON.stringify(response.data.error.oauthError));

          console.log('Logging into no facebook to get new access token...');

          FB.login(function (response) {
            if (response.status === 'connected') {
              $rootScope.facebookUserToken = response.authResponse.accessToken;
              apiAuthenticationFactory.login($rootScope.facebookUserToken).then(function (response) {

                // apiAuthenticationFactory.processSuccessfulLoginResponse(response);
                var userCredentials = apiAuthenticationFactory.getUserCredentials(response);
                apiAuthenticationFactory.storeUserCredentials(userCredentials);

                authService.loginConfirmed('success', function (config) {
                  config.headers['x-auth-token'] = apiAuthenticationFactory.getAuthToken();
                  return config;
                });

              }, function (response) {
                console.error('Erro irrecuperavel. Não foi possivel o login na backend com token recém obtido.');
                console.error('Error response: ' + response);
              });
            } else {
              console.log('User cancelled login or did not fully authorize.');
              authService.loginCancelled('authentication failed', response);
            }
          }, {
            scope: 'public_profile,email'
          });
        }
      });

    });

    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
      /* jshint unused:vars */


      /* console.log('Detectando mudança de state');
    
      if ((toState.name === 'login') && (facebookAuthenticationService.isLogged)) {
        console.log('Impedindo a mudança de página.');
        console.log('Valor de facebookAuthenticationService.isLogged: ' + facebookAuthenticationService.isLogged);
        e.preventDefault();
      }
      if (((toState.name === 'form.geral') || (toState.name === 'form.saude') || (toState.name === 'form.surfe') || (toState.name === 'form.foto')) && facebookAuthenticationService.isRegistered) {
        console.log('Impedindo a mudança de página.');
        console.log('facebookAuthenticationService.isRegistered: ' + facebookAuthenticationService.isRegistered);
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
        console.log('Impedindo a mudança de página.');
        console.log('$rootScope.passoSurfeConcluido: ' + $rootScope.passoSurfeConcluido);
        e.preventDefault();
        $state.go('form.surfe');
      }
    
      if ((toState.name === 'lista-membros') && (!facebookAuthenticationService.isRegistered)) {
        console.log('Impedindo a mudança de página.');
        console.log('facebookAuthenticationService.isRegistered: ' + facebookAuthenticationService.isRegistered);
        console.log('Direcionando para a página de login...');
        e.preventDefault();
        $state.go('login');
      } */


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
        status: false, // check authentication status at the startup of the app
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true, // parse social plugins on this page
        version: 'v2.8' // use graph api version 2.8
      });

      //Se for usar o FB.Event.subscribe de 'auth.statusChange', setar status para false
      // Se for usar FB.getLoginStatus diretamente, setar status para true

      FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
          facebookAuthenticationService.processFacebookConnection(response);
        } else if (response.status === 'not_authorized') {
          console.debug('NOT AUTHORIZED BY FACEBOOK');
          $state.go('login');
        } else {
          // we are not logged in facebook
          console.debug('NOT LOGGED IN TO FACEBOOK');
          $state.go('login');
        }
      });

      // comentando em 13/06/2018 para tentar uma nova estratégia de login
      // facebookAuthenticationService.watchAuthenticationStatusChange();

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
