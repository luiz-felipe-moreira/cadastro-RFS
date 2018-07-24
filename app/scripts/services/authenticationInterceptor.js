'use strict';

angular.module('cadastroRepublicaApp')
.service('authInterceptor', ['$q', '$injector', function ($q, $injector) {
    var service = this;
    service.responseError = function (response) {
      if (response.status === 401) {
        console.log('Interceptor tratando o erro 401... Pode ser o token expirado');
        
        FB.logout(function(response) {
          // user is now logged out
          console.log('Interceptor fez o logout do facebook.');
          console.log('Resposta do logout do Facebook: ' + response);
        });
        console.log('Direcionando para a pagina de login...');
        $injector.get('$state').go('login');
      }
      return $q.reject(response);
    };
  }]);