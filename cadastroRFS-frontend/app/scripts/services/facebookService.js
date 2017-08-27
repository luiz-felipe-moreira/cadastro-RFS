'use strict';

angular.module('cadastroRepublicaApp').
factory('facebookService', function($q) {
    return {
        getUserData: function() {
            console.log('Obtendo email do usuario...');
            var deferred = $q.defer();
            FB.api('/me', {
                fields: 'email, id'
            }, function(response) {
                if (!response || response.error) {
                    deferred.reject('Error occured');
                } else {
                    deferred.resolve(response);
                }
            });
            return deferred.promise;
        }
    }
});