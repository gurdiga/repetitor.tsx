include .env

.ONESHELL:
NVM_NODE_BINARY=$(shell ls -1d /Users/vlad/.nvm/versions/node/$$(<.nvmrc)*/bin/node | sort --version-sort | tail -1)

default: build/index.js

start: build/index.js
	@$(NVM_NODE_BINARY) $< 2>&1 > .log &
	@echo $$! > .pid
	@disown

stop: .pid
	@kill $$(<$<) && rm $<

restart: stop start

build/index.js: node_modules package.json tsconfig.json $(shell find src)
	tsc --skipLibCheck
	@touch $@

install: node_modules

node_modules: .nvmrc package.json
	npm install
	@touch $@

clean:
	rm -rf build/* node_modules/

poke:
	curl "localhost:$$BACKEND_HTTP_PORT?actionName=testAction"
