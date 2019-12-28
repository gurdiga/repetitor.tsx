.ONESHELL:

default: build/index.js

test: build/index.js
	@set -e
	source .env.test
	mocha	--reporter dot build/**/*test.js

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
	rm -rf build/* node_modules/

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

# Needs the dev and test databases to exist, and the user to be granted the permissions.
migrate: $(MIGRATIONS)

$(MIGRATIONS_DIR)/%.sql.migrated: $(MIGRATIONS_DIR)/%.sql
	@set -e

	function runQueryWithEnv() {
		local env_file=$$1

		source $$env_file
		mysql \
			--user=$$APP_DB_USER \
			$$([ $$APP_DB_PASSWORD ] && echo "\--password=$$APP_DB_PASSWORD" || echo "") \
			--database=$$APP_DB_NAME \
			--host=$$APP_DB_HOST \
			< $<
	}

	runQueryWithEnv .env
	runQueryWithEnv .env.test

	touch $@
	echo $<

migration: # Create a new migration file
	@TIMESTAMP=$$(date '+%Y%m%d%H%M%S')
	FILE_NAME=$${TIMESTAMP}_$${NAME:-migration}.sql
	FILE_PATH=db/migrations/$$FILE_NAME
	touch $$FILE_PATH
	echo $$FILE_PATH
