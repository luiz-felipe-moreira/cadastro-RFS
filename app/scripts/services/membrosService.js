'use strict';

angular.module('cadastroRepublicaApp')
.constant("baseURL", "http://localhost:3000/")
.factory('membrosFactory', ['$resource', 'baseURL', 'API_URL', function ($resource, baseURL, API_URL) {

        return $resource(API_URL + "membros/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}]);