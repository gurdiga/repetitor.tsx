.ONESHELL:

default: build/index.js

start: build/index.js
	@node $< 2>&1 > .log &
	echo $$! > .pid
	disown

stop: .pid
	@kill $$(<$<) && rm $<

restart: stop start

build/index.js: node_modules package.json tsconfig.json $(shell find src)
	@set -e
	tsc --skipLibCheck
	touch $@

build/cli.js: build/index.js

install: node_modules

node_modules: .nvmrc package.json
	@set -e
	npm install
	touch $@

clean:
	rm -rf build/* node_modules/ .db.*

run: build/cli.js
	node build/cli.js '$(SAMPLE_REQUEST)'

run-http:
	@curl \
		--header "Content-Type: application/json" \
		--request POST \
		--data '$(SAMPLE_REQUEST)' \
		localhost:$$BACKEND_HTTP_PORT
	echo ""

define SAMPLE_REQUEST
{ \
	"actionName": "TestAction" \
}
endef

MIGRATIONS_DIR=db/migrations
MIGRATIONS=$(shell ls -1 $(MIGRATIONS_DIR)/*.sql | sed 's/$$/.migrated/')

migrate: $(MIGRATIONS)

$(MIGRATIONS_DIR)/%.sql.migrated: $(MIGRATIONS_DIR)/%.sql
	@mysql \
		--user=$(APP_DB_USER) \
		$(if $(APP_DB_PASSWORD),--password=$$APP_DB_PASSWORD) \
		--database=$(APP_DB_NAME) \
		--host=$(APP_DB_HOST) \
		< $<
	touch $@
	echo $<
