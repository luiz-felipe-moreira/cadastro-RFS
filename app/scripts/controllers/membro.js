'use strict';

angular.module('cadastroRepublicaApp')
.controller('MembroController',['membrosFactory', '$scope', function(membrosFactory, $scope){

    var vm = this;
    vm.membro = {};

    membrosFactory.get({id: $scope.id},
        function (response) {
            console.log(response);
            vm.membro = response;
        },
        function (response){
            console.log('Erro ao obter dado do membro de id ' + $scope.id);
            console.log('Error: ' + response.status + ' ' + response.statusText);
        }
    );

}]);