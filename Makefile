.ONESHELL:
SHELL=bash

default: test

test: backend-test frontend-test

backend-test: node_modules
	@cd backend && make test

frontend-test: node_modules
	@cd frontend && make test

c: build
.PHONY: build
build: node_modules
	~/.nvm/nvm-exec node_modules/.bin/tsc --build -v

watch: node_modules
	~/.nvm/nvm-exec node_modules/.bin/tsc --build -v -w

start: build
	@set -e
	source .env
	~/.nvm/nvm-exec node_modules/.bin/nodemon \
		--watch backend/src \
		--watch shared/src \
		--ext ts \
		--watch backend/tsconfig.json \
		--watch backend/package.json \
		--watch shared/tsconfig.json \
		--exec 'DEBUG=app:* node_modules/.bin/ts-node backend/src/index.ts'

e: edit
edit:
	code -n .

open:
	open http://localhost:$$BACKEND_HTTP_PORT

update:
	@set -e
	npm outdated \
	| tail -n +2 \
	| cut -f1 -d' ' \
	| xargs -I{} ~/.nvm/nvm-exec npm install {}@latest \
	| ifne -n 'exit 1'
	make build
	git add package.json package-lock.json
	git commit -am 'NPM packages update'

outdated:
	@set -e
	find . \
		! -path '*/node_modules/*' \
		-name package.json \
	| xargs dirname \
	| while read dir; do \
			echo "Checking for outdated packages in $$dir">>/dev/stderr; \
			cd $$dir; \
			~/.nvm/nvm-exec npm outdated; \
		done

node_modules: package.json ~/.nvm $(NODE_BINARY_PATH) frontend/node_modules backend/node_modules
backend/node_modules: backend/package.json
frontend/node_modules: frontend/package.json
node_modules backend/node_modules frontend/node_modules:
	@set -ex
	( cd $(@D) && ~/.nvm/nvm-exec npm install )
	touch $@

clean:
	rm -rf shared/build backend/build frontend/pages/*/build frontend/shared/build

uninstall: clean
	rm -rf {.,backend,frontend}/node_modules

NODE_BINARY_PATH=$(shell echo "~/.nvm/versions/node/`cat .nvmrc`/bin/node")
$(NODE_BINARY_PATH):
	~/.nvm/nvm-exec nvm install

~/.nvm:
	@echo "Install nvm from here: https://github.com/nvm-sh/nvm"
	exit 1

service:
	@echo -e "Here are the instructions to set up a Systemd service:\n\
	- tweak backend/repetitor.service\n\
	- copy it to /etc/systemd/user/\n\
	- run systemctl enable /etc/systemd/user/repetitor.service\n\
	- run systemctl start repetitor\n\
	- run systemctl status repetitor\n\
	"

deploy:
	@set -e
	test -n "$$TAG" || { echo "TAG env var is not set\n"; exit 1; }
	git archive \
		--format tgz \
		$(TAG) \
	| ssh root@forum.homeschooling.md "cd /var/www/repetitor && tar fxz -"

pre-commit: build
