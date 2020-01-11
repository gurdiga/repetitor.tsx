.ONESHELL:

default: test

test: backend-test frontend-test

backend-test: install
	@cd backend && make test

frontend-test: install
	@cd frontend && make test

c: build
.PHONY: build
build: install
	tsc --build -v

watch: install
	tsc --build -v -w

start: install
	@set -e
	nodemon \
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
		| xargs -I{} npm install {}@latest \
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
			npm outdated; \
		done

install: pre-install node_modules frontend/node_modules backend/node_modules

node_modules: package.json
backend/node_modules: backend/package.json
frontend/node_modules: frontend/package.json
node_modules backend/node_modules frontend/node_modules:
	@set -e
	( cd `dirname $@`; npm install )
	touch $@

clean:
	rm -rf shared/build backend/build frontend/pages/*/build frontend/shared/build

pre-install: node

NODE_BINARY_PATH=$(shell echo "~/.nvm/versions/node/`cat .nvmrc`/bin/node")
node: ~/.nvm $(NODE_BINARY_PATH)
	source ~/.nvm/nvm.sh && \
	nvm install

~/.nvm:
	@echo "Install nvm from here: https://github.com/nvm-sh/nvm"

service:
	@set -e
	function throw { echo "$${1:-throwing with no message?}\n"; return 1; }
	START_COMMAND="make start"
	test -d /etc/systemd/user/ 			|| throw "/etc/systemd/user/ does not exist"
	test -f backend/systemd.service || throw "backend/systemd.service does not exist"
	test -f .env.production 				|| throw ".env.production does not exist"
	test -n "$$PWD" 								|| throw "PWD env var is not set"
	test -n "$$START_COMMAND" 			|| throw "START_COMMAND env var is not set"
	test -n "$$SERVICE_USER" 				|| throw "SERVICE_USER env var is not set"
	test -n "$$SERVICE_GROUP" 			|| throw "SERVICE_GROUP env var is not set"
	sed \
		-e "s|^ExecStart=$$|ExecStart=make start|" \
		-e "s|^WorkingDirectory=$$|WorkingDirectory=$$PWD|" \
		-e "s|^User=$$|User=$$SERVICE_USER|" \
		-e "s|^Group=$$|Group=$$SERVICE_GROUP|" \
		-e "s|^EnvironmentFile=$$|EnvironmentFile=$$PWD/.env.production|" \
		backend/systemd.service | \
	sudo tee /etc/systemd/user/express.service
