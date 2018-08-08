'use strict';

angular.module('cadastroRepublicaApp')
  .controller('MembrosListController', ['membrosFactory', 'pagerService', function (membrosFactory, pagerService) {

    var vm = this;
    vm.listaMembros = [];
    vm.listaMembrosFiltrada = [];
    vm.pager = {};
    vm.setPage = setPage;
    vm.pageItens = [];
    vm.atualizar = initController;

    vm.filtro = '';
    vm.filtroStatus = 'Todos';

    initController();

    function initController() {

      membrosFactory.query(
        function (response) {
          console.log(response);
          vm.listaMembros = response;
          vm.listaMembrosFiltrada = vm.listaMembros;
          vm.setPage(1);
        },
        function (response) {
          console.log('Erro ao obter a lista de membros!');
          console.log('Error: ' + response.status + ' ' + response.statusText);
        }
      );
    }

    function setPage(page) {
      if (page < 1) {
        return;
      }

      // get pager object from service
      vm.pager = pagerService.getPager(vm.listaMembrosFiltrada.length, page);

      // get current page of items
      vm.pageItens = vm.listaMembrosFiltrada.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    }

    vm.filterByStatus = function () {
      if (vm.filtroStatus === 'Todos') {
        vm.listaMembrosFiltrada = vm.listaMembros;
      } else {
        vm.listaMembrosFiltrada = vm.listaMembros.filter(function (membro) {
          return membro.status === vm.filtroStatus;
        });
      }
      console.debug(vm.listaMembrosFiltrada);
      vm.setPage(1);
    };

  }]);
