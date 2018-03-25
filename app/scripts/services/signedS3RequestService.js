'use strict';

angular.module('cadastroRepublicaApp')
.factory('signedS3RequestService', ['$http', 'API_URL', function ($http, API_URL) {

    return {
        getSignedS3Request: function (file) {
            url = API_URL + 'signed-s3-request';
            var config = {
                params: {
                    nomeArquivo: file.name,
                    tipoArquivo: file.type
                }
            };
            console.debug('Montando requisição para ' + url + ' com parametros ' + params);
            return $http.get(url, config);
        }
    };

}]);