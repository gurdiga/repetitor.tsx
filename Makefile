.ONESHELL:
SHELL=bash

include .env

default: test-frontend

test: test-backend test-frontend

test-backend: node_modules
	@cd backend && make --no-print-directory test

test-frontend: node_modules
	@TS_NODE_PROJECT=frontend/tests/tsconfig.json \
	TS_NODE_TRANSPILE_ONLY=true \
	command time \
	~/.nvm/nvm-exec frontend/node_modules/.bin/mocha \
		--require ts-node/register \
		--require tsconfig-paths/register \
		--reporter dot \
		--file frontend/tests/src/TestHelpers.ts \
		frontend/tests/**/*.ts?

c: build
.PHONY: build
build: node_modules
	~/.nvm/nvm-exec \
	command time \
	node_modules/.bin/tsc --build

watch: node_modules
	~/.nvm/nvm-exec node_modules/.bin/tsc --build -v -w

start: build
	@set -e
	~/.nvm/nvm-exec node_modules/.bin/nodemon \
		--watch backend/src \
		--watch shared/src \
		--ext ts \
		--watch backend/tsconfig.json \
		--watch backend/package.json \
		--watch shared/tsconfig.json \
		--exec '\
			DEBUG=app:* \
			TS_NODE_PROJECT=backend/tsconfig.json \
			node \
				--require ts-node/register \
				--require tsconfig-paths/register \
				backend/src/index.ts \
		'

e: edit
edit:
	code -n .

open:
	open http://localhost:$(BACKEND_HTTP_PORT)

update:
	@set -e
	make --no-print-directory package.json-dirs \
	| while read dir; do ( \
		cd $$dir; \
		~/.nvm/nvm-exec npm outdated \
		| tail -n +2 \
		| cut -f1 -d' ' \
		| xargs -I{} ~/.nvm/nvm-exec npm install {}@latest; \
	) done
	make clean build test
	echo -e "
		Maybe do this:\n
		git add package.json package-lock.json
		git commit -am 'NPM packages update'
	"

outdated:
	@set -e
	make --no-print-directory package.json-dirs \
	| while read dir; do ( \
			echo "Checking for outdated packages in $$dir">>/dev/stderr; \
			cd $$dir; \
			~/.nvm/nvm-exec npm outdated; \
	) done

package.json-dirs:
	@set -e
	find . \
		! -path '*/node_modules/*' \
		-name package.json \
	| xargs dirname

node_modules: package.json ~/.nvm $(NODE_BINARY_PATH) frontend/node_modules backend/node_modules
backend/node_modules: backend/package.json
frontend/node_modules: frontend/package.json
node_modules backend/node_modules frontend/node_modules:
	@set -ex
	( cd $(@D) && ~/.nvm/nvm-exec npm install )
	touch $@

clean:
	tsc --build --clean

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

pre-commit: build test
