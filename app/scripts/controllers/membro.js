'use strict';

angular.module('cadastroRepublicaApp')
.controller('MembroController',['membrosFactory', '$stateParams', function(membrosFactory, $stateParams){

    var vm = this;
    vm.membro = {};

    membrosFactory.get({id: $stateParams.id},
        function (response) {
            console.log(response);
            vm.membro = response;
        },
        function (response){
            console.log('Erro ao obter dado do membro de id ' + $stateParams.id);
            console.log('Error: ' + response.status + ' ' + response.statusText);
        }
    );

}]);