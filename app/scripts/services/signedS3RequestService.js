'use strict';

angular.module('cadastroRepublicaApp')
    .factory('signedS3RequestService', ['$http', 'API_URL', function ($http, API_URL) {

        return {
            getSignedS3Request: function (file, novoNomeArquivo) {
                var url = API_URL + 'sign-s3';
                var config = {
                    params: {
                        nomeArquivo: (novoNomeArquivo || file.name),
                        tipoArquivo: file.type
                    },
                    responseType: 'json'
                };

                console.debug('Montando requisição para ' + url + ' com parametros ' + JSON.stringify(config.params));
                return $http.get(url, config);
            },

            uploadFile: function (file, signedRequest) {

                console.debug('Fazendo upload do arquivo para o S3...');
                var config = {
                    headers: {
                        'Content-Type': file.type
                    },
                    responseType: 'json'
                };

                return $http.put(signedRequest, file, config);
            }
        };

    }]);