'use strict';

angular.module('cadastroRepublicaApp')
.controller('MembrosListController',['membrosFactory', function(membrosFactory){

    var vm = this;
    vm.listaMembros = [];

    vm.filtro = '';

    membrosFactory.query(
        function (response) {
            console.log(response);
            vm.listaMembros = response;
        },
        function (response){
            console.log('Erro ao obter a lista de membros!');
            console.log('Error: ' + response.status + ' ' + response.statusText);
        }
    );

}]);