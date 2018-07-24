'use strict';

angular.module('cadastroRepublicaApp')
.factory('meFactory', ['$resource', 'API_URL', function ($resource, API_URL) {

        return $resource(API_URL + 'me', null, {
            'update': {
                method: 'PUT'
            }
        });

}]);