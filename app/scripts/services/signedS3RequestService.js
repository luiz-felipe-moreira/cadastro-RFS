'use strict';

angular.module('cadastroRepublicaApp')
    .factory('signedS3RequestService', ['$http', 'API_URL', function ($http, API_URL) {

        return {
            getSignedS3Request: function (file) {
                var url = API_URL + 'sign-s3';
                var config = {
                    params: {
                        nomeArquivo: file.name,
                        tipoArquivo: file.type
                    },
                    responseType: 'json'
                };
                console.debug('Montando requisição para ' + url + ' com parametros ' + JSON.stringify(config.params));
                return $http.get(url, config);
            },

            uploadFile: function (file, signedRequest, url) {
                console.debug('Fazendo upload do arquivo para o S3...');
                //TODO fazer requisição PUT usando a signedREquest, enviando o arquivo
            }
        };

    }]);