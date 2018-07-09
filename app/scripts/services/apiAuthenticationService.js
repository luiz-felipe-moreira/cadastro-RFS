'use strict';

angular.module('cadastroRepublicaApp')
    .factory('localStorage', ['$window', function ($window) {
        return {
            store: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            remove: function (key) {
                $window.localStorage.removeItem(key);
            },
            storeObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key, defaultValue) {
                return JSON.parse($window.localStorage[key] || defaultValue);
            }
        };
    }])

    .factory('apiAuthenticationFactory', ['$resource', '$http', 'localStorage', '$rootScope', '$window', 'API_URL', function ($resource, $http, localStorage, $rootScope, $window, API_URL) {

        var authFac = {};
        var TOKEN_KEY = 'Token';
        var isAuthenticated = false;
        var facebookId = '';
        var registrado = '';
        var aprovado = '';
        var admin = '';
        var authToken = {};

        function loadUserCredentials() {
            var credentials = localStorage.getObject(TOKEN_KEY, '{}');
            if (credentials.facebookId !== undefined) {
                useCredentials(credentials);
            }
        }

        authFac.storeUserCredentials = function (credentials) {
            console.log('Token armazenado no local storage: ' + JSON.stringify(credentials));
            localStorage.storeObject(TOKEN_KEY, credentials);
            useCredentials(credentials);
        };

        function useCredentials(credentials) {
            isAuthenticated = true;
            facebookId = credentials.facebookId;
            authToken = credentials.apiToken;
            registrado = credentials.registrado;
            aprovado = credentials.aprovado;
            admin = credentials.admin;

            // Set the token as header for your requests!
            $http.defaults.headers.common['x-auth-token'] = authToken;
        }

        function destroyUserCredentials() {
            authToken = undefined;
            facebookId = '';
            isAuthenticated = false;
            $http.defaults.headers.common['x-auth-token'] = authToken;
            localStorage.remove(TOKEN_KEY);
        }

        authFac.login = function (facebookToken) {

            console.log(facebookToken);

            var urlLogin = API_URL + 'login';
            var requestConfig = {
                headers: {
                    'access_token': facebookToken
                },
                responseType: 'json'
            };
            return $http.post(urlLogin, {}, requestConfig);


            /* $resource(API_URL + "users/login")
            .save(loginData,
               function(response) {
                  storeUserCredentials({facebookId:loginData.facebookId, token: response.token});
                  $rootScope.$broadcast('login:Successful');
               },
               function(response){
                  isAuthenticated = false;
                
                  var message = '\
                    <div class="ngdialog-message">\
                    <div><h3>Login Unsuccessful</h3></div>' +
                      '<div><p>' +  response.data.err.message + '</p><p>' +
                        response.data.err.name + '</p></div>' +
                    '<div class="ngdialog-buttons">\
                        <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                    </div>'
                
                    ngDialog.openConfirm({ template: message, plain: 'true'});
               }
            
            ); */

        };

        authFac.logout = function () {
            destroyUserCredentials();
        };

        /* authFac.register = function(registerData) {
            
            $resource(API_URL + "users/register")
            .save(registerData,
               function(response) {
                  authFac.login({facebookId:registerData.facebookId, password:registerData.password});
                if (registerData.rememberMe) {
                    localStorage.storeObject('userinfo',
                        {facebookId:registerData.facebookId, password:registerData.password});
                }
               
                  $rootScope.$broadcast('registration:Successful');
               },
               function(response){
                
                  var message = '\
                    <div class="ngdialog-message">\
                    <div><h3>Registration Unsuccessful</h3></div>' +
                      '<div><p>' +  response.data.err.message + 
                      '</p><p>' + response.data.err.name + '</p></div>';
    
                    ngDialog.openConfirm({ template: message, plain: 'true'});
    
               }
            
            );
        }; */

        authFac.getUserCredentials = function (response) {

            console.log('Sucesso no login. Armazenando token no local storage...');
            console.debug('Reposta do login: ' + JSON.stringify(response));
            var userCredentials = {
                facebookId: response.data.id,
                registrado: response.data.registrado,
                aprovado: response.data.aprovado,
                admin: response.data.admin,
                apiToken: response.data.token
            };
            return userCredentials;

/*             authFac.storeUserCredentials(
                {
                    facebookId: response.data.id,
                    registrado: response.data.registrado,
                    aprovado: response.data.aprovado,
                    admin: response.data.admin,
                    apiToken: response.data.token
                }); */
        };

        authFac.isAuthenticated = function () {
            return isAuthenticated;
        };

        authFac.getfacebookId = function () {
            return facebookId;
        };

        authFac.getAuthToken = function () {
            return authToken;
        }

        authFac.isRegistrado = function () {
            return registrado;
        };

        authFac.isAprovado = function () {
            return aprovado;
        };

        authFac.isAdmin = function () {
            return admin;
        };

        loadUserCredentials();

        return authFac;

    }])
    ;