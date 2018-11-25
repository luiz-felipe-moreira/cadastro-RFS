'use strict';

angular.module('cadastroRepublicaApp')
  .controller('MembrosListController', ['membrosFactory', 'pagerService', function (membrosFactory, pagerService) {

    var vm = this;
    vm.listaMembros = [];
    vm.listaMembrosFiltrada = [];
    vm.pager = {};
    vm.pageItens = [];

    vm.filtro = '';
    vm.filtroStatus = 'Todos';

    vm.setPage = function setPage(page) {
      if (page < 1) {
        return;
      }

      // get pager object from service
      vm.pager = pagerService.getPager(vm.listaMembrosFiltrada.length, page);

      // get current page of items
      vm.pageItens = vm.listaMembrosFiltrada.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
    };

    function initController() {

      vm.filtro = '';
      vm.filtroStatus = 'Todos';

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

    initController();

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

    vm.filtrar = function () {
      if (vm.filtroStatus === 'Todos') {
        vm.listaMembrosFiltrada = vm.listaMembros.filter(contemNomeOuApelido);
      } else {
        vm.listaMembrosFiltrada = vm.listaMembros.filter(function (membro) {
          return membro.status === vm.filtroStatus;
        }).filter(contemNomeOuApelido);
      }
      console.debug(vm.listaMembrosFiltrada);
      vm.setPage(1);
    };

    var contemNomeOuApelido = function (membro) {
      
      var filtroLowerCase = vm.filtro.toLowerCase();
      var encontradoNome = false;
      var encontradoApelido = false;
      
      if (membro.nome !== undefined) {
        var nomeLowerCase = membro.nome.toLowerCase();
        encontradoNome = (nomeLowerCase.indexOf(filtroLowerCase) >= 0);
      }
      if (membro.apelido !== undefined) {
        var apelidoLowerCase = membro.apelido.toLowerCase();
        encontradoApelido = (apelidoLowerCase.indexOf(filtroLowerCase) >= 0);
      }
      return ( encontradoNome || encontradoApelido);
    };

    vm.atualizar = initController;

  }]);
