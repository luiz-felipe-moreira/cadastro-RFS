'use strict';

angular.module('cadastroRepublicaApp').
factory('facebookService', ['$q', function($q) {
    return {
        getUserData: function() {
            console.log('Obtendo dados e foto do usuario...');
            var deferred = $q.defer();
            FB.api('/me', {
                fields: 'email, id, name, gender, picture.width(400)'
            }, function(response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                } else {
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        }
    };
}]);