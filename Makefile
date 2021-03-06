.ONESHELL:
SHELL=bash

default:
	make --no-print-directory test-frontend FILES=frontend/tests/src/pages/EmailChangePageTest.tsx

h:
	make --no-print-directory build PROJECT=frontend/pages/home

hw:
	make --no-print-directory watch PROJECT=frontend/pages/home

fonts: frontend/shared/fonts/fonts.css
frontend/shared/fonts/fonts.css:
	set -e
	rm -rf $(@D)
	mkdir -p $(@D)
	( \
		echo 'https://fonts.googleapis.com/css2?family=Vollkorn:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'; \
		echo 'https://fonts.googleapis.com/css2?family=Inria+Sans:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap'; \
	) \
	| while read url; do \
		curl \
			-H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:69.0) Gecko/20100101 Firefox/69.0' \
			--fail "$$url" >> $@; \
	done
	grep -Po 'https://fonts.gstatic.com\S+.woff2' $@ | xargs wget --continue --directory-prefix=$(@D)/
	sed -i 's|https://fonts.gstatic.com/.*/|fonts/|' $@

cf: clean-fonts fonts
clean-fonts:
	rm -rf frontend/shared/fonts

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
build: node_modules fonts
	~/.nvm/nvm-exec \
	node_modules/.bin/tsc --build -v $(PROJECT)

cc: clean build

watch: node_modules
	@~/.nvm/nvm-exec node_modules/.bin/tsc \
		--build \
		--watch \
		--preserveWatchOutput \
		$(PROJECT) \
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
o: open

NPM_MODULES=. backend frontend

npm-update:
	@set -x
	for dir in $(NPM_MODULES); do
		(cd $$dir; npm --depth 999 update)
	done

audit:
	@set -x
	for dir in $(NPM_MODULES); do
		(cd $$dir; npm audit)
	done

node_modules: package.json ~/.nvm $(NODE_BINARY_PATH) frontend/node_modules backend/node_modules
backend/node_modules: backend/package.json
frontend/node_modules: frontend/package.json
node_modules backend/node_modules frontend/node_modules:
	@set -e
	(cd $(@D) && ~/.nvm/nvm-exec npm install)
	touch $@

clean:
	rm -rf \
		shared/build/ \
		backend/build/ \
		backend/tests/build/ \
		frontend/shared/build/ \
		frontend/pages/*/build/

uninstall: clean
	rm -rf {.,backend,frontend}/node_modules

NODE_BINARY_PATH=$(shell echo "~/.nvm/versions/node/`cat .nvmrc`/bin/node")
$(NODE_BINARY_PATH):
	~/.nvm/nvm-exec nvm install

~/.nvm:
	@echo "Install nvm from here: https://github.com/nvm-sh/nvm"
	exit 1

pre-commit: check-for-only
	time make --no-print-directory lint clean build pre-commit-test
pc: pre-commit

pre-commit-test:
	TEST_EMAIL_UTILS=yes \
	TEST_FILE_STORAGE=yes \
	time make --no-print-directory test
pct: pre-commit-test

check-for-only:
	@grep -nRP '.(only|skip)\(' {frontend,backend}/tests/src \
	&& {
		echo -e "\nSome Mocha tests are .only or .skip.\n"
		exit 1
	} \
	|| exit 0

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
