'use strict';

angular.module('cadastroRepublicaApp')
.factory('membrosFactory', ['$resource', 'API_URL', function ($resource, API_URL) {

        return $resource(API_URL + "membros/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}]);