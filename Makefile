.ONESHELL:
SHELL=bash

default:
	make --no-print-directory test-frontend FILES=frontend/tests/src/pages/LoginPageTest.tsx

test: test-backend test-frontend
t: test

test-backend: node_modules
	@set -e
	echo -e "\nRunning backend tests:"
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
	echo -e "\nRunning frontend tests:"
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

cc: clean build

watch: node_modules
	@~/.nvm/nvm-exec node_modules/.bin/tsc \
		--build \
		--watch \
		--preserveWatchOutput \
	| tee >( \
		while read line; do
			STATUS_LINE=`echo $$line | grep -Po 'Found \d+ errors?'`
			if [ ! "$$STATUS_LINE" ]; then continue; fi
			if [ "$$STATUS_LINE" = "Found 0 errors" ]; then
				osascript -e "display notification \"Compilation complete\" with title \"✅ repetitor.tsx\""
			else
				osascript -e "display notification \"Compilation failed: $$STATUS_LINE\" with title \"❌ repetitor.tsx\""
			fi
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
	npm --depth 9 update
	(cd backend && npm --depth 9 update)
	(cd frontend && npm --depth 9 update)

npm-outdated:
	npm outdated
	(cd backend && npm outdated)
	(cd frontend && npm outdated)

node_modules: package.json ~/.nvm $(NODE_BINARY_PATH) frontend/node_modules frontend/tests/node_modules backend/node_modules
backend/node_modules: backend/package.json
frontend/node_modules: frontend/package.json
frontend/tests/node_modules: frontend/tests/package.json
node_modules backend/node_modules frontend/node_modules frontend/tests/node_modules:
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
	rm -rf {.,backend,frontend,frontend/tests}/node_modules

NODE_BINARY_PATH=$(shell echo "~/.nvm/versions/node/`cat .nvmrc`/bin/node")
$(NODE_BINARY_PATH):
	~/.nvm/nvm-exec nvm install

~/.nvm:
	@echo "Install nvm from here: https://github.com/nvm-sh/nvm"
	exit 1

pre-commit:
	TEST_EMAIL_UTILS=yes \
	TEST_FILE_STORAGE=yes \
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
		--env $${NODE_ENV:-development} \
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

mcheck:
	@db-migrate $${DIRECTION:-up} \
		--check \
		--env $${NODE_ENV:-development} \
		--config backend/migrations/config.json \
		--migrations-dir backend/migrations

sql:
	@set -e
	if [ ! "$$NODE_ENV" ] || [ "$$NODE_ENV" == "development" ]; then source .env; else source .env.$$NODE_ENV; fi
	mysql --host $$APP_DB_HOST --user $$APP_DB_USER --password=$$APP_DB_PASSWORD $$APP_DB_NAME

pretty:
	git ls-tree -r master --name-only | xargs prettier --write

format: pretty

heroku-setup: h-expose-release-env h-env

h-env:
	sed 's/^export //' .env.production \
	| xargs heroku config:set \
		--app repetitor

h-tail:
	heroku logs --tail --app repetitor

h-expose-release-env:
	heroku labs:enable runtime-dyno-metadata --app repetitor
