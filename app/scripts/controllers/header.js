'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:HeaderController
 * @description
 * # HeaderController
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('HeaderController', ['facebookAuthenticationService', function (facebookAuthenticationService) {
    
    this.dadosCadastrais = {nome:'', apelido:'', email:'', telefoneCelular:'',
                         telefoneFixo:false, profissao:'', dataNascimento:'', sexo:'' };

    this.hideHeader = function() {
      console.debug('Executando a função hideHeader. Valor de facebookAuthenticationService.isRegistered: ' + facebookAuthenticationService.isRegistered);
      if (facebookAuthenticationService.isRegistered === false){
        console.log('Usuário não cadastrado ou ainda não autenticado!!!');
        return true;
      } else{
        return false;
      }
    };


  }]);
