'use strict';

/**
 * @ngdoc function
 * @name cadastroRepublicaApp.controller:CadastroController
 * @description
 * # MainCtrl
 * Controller of the cadastroRepublicaApp
 */
angular.module('cadastroRepublicaApp')
  .controller('CadastroController', [function () {
    
    this.dadosCadastrais = {nome:"", apelido:"", email:"", telefoneCelular:"",
                         telefoneFixo:false, profissao:"", dataNascimento:"", sexo:"" };

    this.enviar = function() {
      console.log("Nome: " + this.dadosCadastrais.nome);
    };


  }]);
