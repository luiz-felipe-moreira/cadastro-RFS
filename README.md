# cadastroRFS-frontend

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.16.0.

## Requirements

Para o desenvolvimento da aplicação, é necessário ter o bower e o grunt instalados. São instalados usando os comandos abaixo:
npm install -g bower
npm install -g grunt-cli

Para o deploy da aplicação no Netlify, é necessário instalar o Netlify CLI:
npm install netlify-cli -g


## Set up: Baixar módulos NodeJS e dependências do projeto

Na raiz do projeto, execute `npm install` e em seguida `bower install`

## Build & development

Execute `grunt` para o building e `grunt serve` e para rodar (executar um servidor local e abrir o app no browser) apontando para o backend local.
Para rodar local apontando para o ambiente de produção execte `grunt serve:dist`.

## Testing

Running `grunt test` will run the unit tests with karma.

## Build e Deploy

Executar os seguintes comandos:
grunt build
netlify deploy