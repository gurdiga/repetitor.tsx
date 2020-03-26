.ONESHELL:
SHELL=bash

default:
	make --no-print-directory test-backend FILES=backend/tests/src/ScenarioHandlers/EmailConfirmationTest.ts

test: test-backend test-frontend
t: test

test-backend: node_modules
	@set -e
	printf "\nRunning backend tests:\n"
	source .env.test
	DEBUG=app:none \
	TS_NODE_PROJECT=backend/tests/tsconfig.json \
	TS_NODE_TRANSPILE_ONLY=true \
	TS_NODE_SCOPE=true \
	~/.nvm/nvm-exec \
	node --no-deprecation `# avoid "DeprecationWarning: OutgoingMessage.prototype._headers is deprecated" caused by timed-out` \
	node_modules/.bin/mocha \
		--require ts-node/register \
		--require tsconfig-paths/register \
		--require amd-loader \
		--reporter dot \
		--file backend/tests/src/TestHelpers.ts \
		--exit `# this is related to chai-http hanging Mocha` \
		$${FILES:-'backend/tests/**/*Test.ts'}
tb: test-backend

test-frontend: node_modules
	@set -e
	printf "\nRunning frontend tests:\n"
	TS_NODE_PROJECT=frontend/tests/tsconfig.json \
	TS_NODE_TRANSPILE_ONLY=true \
	TS_NODE_SCOPE=true \
	~/.nvm/nvm-exec node_modules/.bin/mocha \
		--require ts-node/register \
		--require tsconfig-paths/register \
		--require amd-loader \
		--reporter dot \
		--file frontend/tests/src/TestHelpers.ts \
		$${FILES:-'frontend/tests/**/*Test.ts?'}
tf: test-frontend

c: build
build: node_modules
	~/.nvm/nvm-exec \
	node_modules/.bin/tsc --build -v

watch: node_modules
	@~/.nvm/nvm-exec node_modules/.bin/tsc --build -v -w \
	| tee >( \
		while read ln; do \
			if echo "$${ln}" | grep -q "Found 0 errors. Watching for file changes."; then \
				osascript -e 'display notification "Compilation complete" with title "Repetitor build"'; \
			fi; \
		done \
	)

start: build
	@set -e
	TS_NODE_PROJECT=backend/tsconfig.json \
	~/.nvm/nvm-exec node_modules/.bin/nodemon \
		--watch backend/src \
		--watch backend/tsconfig.json \
		--watch shared/src \
		--watch shared/tsconfig.json \
		--ext ts \
		--exec 'heroku local'

e: edit
edit:
	code -n .

open:
	open http://localhost:$(PORT)

npm-update:
	npm --depth 9999 update
	(cd backend && npm --depth 9999 update)
	(cd frontend && npm --depth 9999 update)

node_modules: package.json ~/.nvm $(NODE_BINARY_PATH) frontend/node_modules backend/node_modules
backend/node_modules: backend/package.json
frontend/node_modules: frontend/package.json
node_modules backend/node_modules frontend/node_modules:
	@set -e
	( cd $(@D) && ~/.nvm/nvm-exec npm install )
	touch $@

clean:
	rm -rf \
		shared/build/ \
		backend/build/ \
		backend/tests/build/ \
		frontend/shared/build/ \
		frontend/tests/build/ \
		frontend/pages/*/build/

uninstall: clean
	rm -rf {.,backend,frontend}/node_modules

NODE_BINARY_PATH=$(shell echo "~/.nvm/versions/node/`cat .nvmrc`/bin/node")
$(NODE_BINARY_PATH):
	~/.nvm/nvm-exec nvm install

~/.nvm:
	@echo "Install nvm from here: https://github.com/nvm-sh/nvm"
	exit 1

pre-commit:
	TEST_EMAIL_UTILS=yes \
	time make --no-print-directory lint clean build test
pc: pre-commit

lint:
	eslint . \
		--ignore-path .gitignore \
		--ext .ts,.tsx

l: lint

migrate:
	@set -e
	if [ ! "$$NODE_ENV" ] || [ "$$NODE_ENV" == "development" ]; then source .env; else source .env.$$NODE_ENV; fi
	db-migrate $${DIRECTION:-up} \
		--verbose \
		--env $$NODE_ENV \
		--config backend/migrations/config.json \
		--migrations-dir backend/migrations

mup:
	@make migrate --no-print-directory DIRECTION=up

mdown:
	@make migrate --no-print-directory DIRECTION=down

m mtry: mup mdown

migration:
	@set -e
	if [ ! "$$NODE_ENV" ] || [ "$$NODE_ENV" == "development" ]; then source .env; else source .env.$$NODE_ENV; fi
	read -p "Migration title: " MIGRATION_TITLE
	db-migrate create $$MIGRATION_TITLE \
		--env $${NODE_ENV:-development} \
		--config backend/migrations/config.json \
		--migrations-dir backend/migrations

sql:
	@set -e
	if [ ! "$$NODE_ENV" ] || [ "$$NODE_ENV" == "development" ]; then source .env; else source .env.$$NODE_ENV; fi
	mysql --host $$APP_DB_HOST --user $$APP_DB_USER --password=$$APP_DB_PASSWORD $$APP_DB_NAME

heroku-setup: h-expose-release-env h-env

h-env:
	heroku config:set \
		--app repetitor \
		` sed 's/^export //' .env.production \
			| paste -sd " " - \
		`

h-tail:
	heroku logs --tail --app repetitor

h-expose-release-env:
	heroku labs:enable runtime-dyno-metadata --app repetitor
