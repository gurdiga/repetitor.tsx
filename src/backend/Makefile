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
	rm -rf build/* node_modules/ .db.*

run: build/cli.js
	node build/cli.js '$(SAMPLE_REQUEST)'

define SAMPLE_REQUEST
{ \
	"actionName": "TestAction" \
}
endef

db-init: .db.version-check

.db.version-check: .mysql-version .db.actual-version
	@diff $^
	@touch $@

.db.actual-version:
	@# Extract the version number from something like this:
	@# "mysql  Ver 14.14 Distrib 5.6.43, for osx10.14 (x86_64) using  EditLine wrapper"
	@mysql --version \
		| awk '{ print $$5 }' \
		| tr -d ',' \
		> $@
