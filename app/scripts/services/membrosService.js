angular.module('cadastroRepublicaApp')
.constant("baseURL", "http://localhost:3000/")
.factory('membrosFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "membros/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])