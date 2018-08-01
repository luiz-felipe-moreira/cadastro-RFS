'use strict';

angular.module('cadastroRepublicaApp')
  .controller('MembrosListController', ['membrosFactory', 'pagerService',function (membrosFactory, pagerService) {

    var vm = this;
    vm.listaMembros = [];
    vm.pager = {};
    vm.setPage = setPage;
    vm.pageItens = [];

    vm.filtro = '';

    initController();

    function initController() {

      membrosFactory.query(
        function (response) {
          console.log(response);
          vm.listaMembros = response;
          vm.setPage(1);
        },
        function (response) {
          console.log('Erro ao obter a lista de membros!');
          console.log('Error: ' + response.status + ' ' + response.statusText);
        }
      );
    }

    function setPage(page) {
        if (page < 1 || page > vm.pager.totalPages) {
            return;
        }
 
        // get pager object from service
        vm.pager = pagerService.getPager(vm.listaMembros.length, page);
 
        // get current page of items
        vm.pageItens = vm.listaMembros.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    }

  }]);
