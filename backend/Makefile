.ONESHELL:
SHELL=bash

CLI=build/backend/src/cli.js

# TODO: switch to ts-node
run: build
	node $(CLI) '$(SAMPLE_REQUEST)'

# TODO: switch to ts-node
run-action: build
	@if [ -z '$(ACTION)' ]; then
		echo '$@ requires the request JSON into the ACTION argument.\n'
		exit 1
	fi

	node $(CLI) '$(ACTION)'

run-action-http: $(CLI)
	@#  -vvv --trace-ascii -
	curl \
		--header "Content-Type: application/json" \
		--request POST \
		--data '$(ACTION)' \
		localhost:$$PORT
	echo ""

run-http:
	@curl \
		--header "Content-Type: application/json" \
		--request POST \
		--data '$(SAMPLE_REQUEST)' \
		localhost:$$PORT
	echo ""

define SAMPLE_REQUEST
{ \
	"scenarioName": "TestAction" \
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
