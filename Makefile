.ONESHELL:
SHELL=bash

default: test-backend

test:
	make test-backend
	make test-frontend
t: test

test-backend: node_modules
	@set -e
	source .env.test
	DEBUG=app:none \
	TS_NODE_PROJECT=backend/tests/tsconfig.json \
	TS_NODE_TRANSPILE_ONLY=true \
	~/.nvm/nvm-exec \
	node --no-deprecation `# avoid "DeprecationWarning: OutgoingMessage.prototype._headers is deprecated" caused by timed-out` \
	node_modules/.bin/mocha \
		--require ts-node/register \
		--require tsconfig-paths/register \
		--reporter dot \
		--file backend/tests/src/TestHelpers.ts \
		--exit `# this is related to chai-http hanging Mocha` \
		$${FILES:-'backend/tests/**/*Test.ts'}
tb: test-backend

test-frontend: node_modules
	@set -e
	TS_NODE_PROJECT=frontend/tests/tsconfig.json \
	TS_NODE_TRANSPILE_ONLY=true \
	~/.nvm/nvm-exec node_modules/.bin/mocha \
		--require ts-node/register \
		--require tsconfig-paths/register \
		--reporter dot \
		--file frontend/tests/src/TestHelpers.ts \
		$${FILES:-'frontend/tests/**/*Test.ts?'}
tf: test-frontend

c: build
.PHONY: build
build: node_modules
	~/.nvm/nvm-exec \
	node_modules/.bin/tsc --build -v

watch: node_modules
	~/.nvm/nvm-exec node_modules/.bin/tsc --build -v -w \
	| tee >( \
		while read ln; do \
			if echo "$${ln}" | grep -q "Found 0 errors. Watching for file changes."; then \
				osascript -e 'display notification "Compilation complete" with title "Repetitor build"'; \
			fi; \
		done \
	)

start: build
	@set -e
	~/.nvm/nvm-exec node_modules/.bin/nodemon \
		--watch backend/src \
		--watch shared/src \
		--ext ts \
		--watch backend/tsconfig.json \
		--watch backend/package.json \
		--watch shared/tsconfig.json \
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

service:
	@echo -e "
		Here are the instructions to set up a Systemd service:\n
		* tweak backend/repetitor.service
		* copy it to /etc/systemd/user/
		* run systemctl enable /etc/systemd/user/repetitor.service
		* run systemctl start repetitor
		* run systemctl status repetitor
	"

deploy:
	@set -e
	test -n "$$TAG" || { echo "TAG env var is not set\n"; exit 1; }
	git archive \
		--format tgz \
		$(TAG) \
	| ssh root@forum.homeschooling.md "cd /var/www/repetitor && tar fxz -"

pre-commit: lint clean build test
pc: pre-commit

lint:
	eslint . \
		--ignore-path .gitignore \
		--ext .ts,.tsx

l: lint

migrate:
	@set -ex
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

migration:
	@set -e
	if [ ! "$$NODE_ENV" ] || [ "$$NODE_ENV" == "development" ]; then source .env; else source .env.$$NODE_ENV; fi
	read -p "Migration title: " MIGRATION_TITLE
	db-migrate create $$MIGRATION_TITLE \
		--env $${NODE_ENV:-development} \
		--config backend/migrations/config.json \
		--migrations-dir backend/migrations

mnew: migration

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
