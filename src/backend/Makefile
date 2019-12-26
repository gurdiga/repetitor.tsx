.ONESHELL:

default: build/index.js

start: build/index.js
	@node $< 2>&1 > .log &
	@echo $$! > .pid
	@disown

stop: .pid
	@kill $$(<$<) && rm $<

restart: stop start

build/index.js: node_modules package.json tsconfig.json $(shell find src)
	tsc --skipLibCheck
	@touch $@

build/cli.js: build/index.js

install: node_modules

node_modules: .nvmrc package.json
	npm install
	@touch $@

clean:
	rm -rf build/* node_modules/

run: build/cli.js
	node build/cli.js '$(SAMPLE_REQUEST)'

define SAMPLE_REQUEST
{ \
	"actionName": "TestAction" \
}
endef
