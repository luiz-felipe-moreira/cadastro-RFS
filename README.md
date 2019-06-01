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

## Testing

Running `grunt test` will run the unit tests with karma.

## Build & run

Execute `grunt` para o build. 

### Run locally

Execute `grunt serve` para fazer build e em seguida rodar apontando para o backend local. Será executado um servidor local e aberto o app no browser.
A URL dp app é https://localhost:9000. 

obs.: Para fazer requisições XHR para o backend local, é necessário que o browser confie no certificado do backend. Para isso acesse a url do backend (https://localhost:444) no browser e na tela de alerta escolha aceitar e confiar. Fazer o mesmo com a url do livereload (https://localhost:35729/).

Para rodar local apontando para o ambiente de produção execte `grunt serve:dist`.

## Deploy

Executar os seguintes comandos:  
`grunt build`  
`netlify deploy --dir=dist --prod`