.ONESHELL:

default: build

c: build
.PHONY: build
build: install
	tsc --build -v
	( cd frontend/ && source .env && make --no-print-directory install; )

start: install
	@DEBUG=app:* ts-node backend/src/index.ts &> .log &
	echo $$! > .pid
	disown

stop: .pid
	@kill `cat .pid` && rm .pid

.pid:
	@echo "No .pid file. Probably not running.\n"
	exit 1

status: .pid
	@echo "Running as process $$(<$<) on port $$BACKEND_HTTP_PORT."

restart: stop start

log:
	tail -f .log

e: edit
edit:
	code -n .

open:
	open

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

install: node_modules frontend/node_modules backend/node_modules

node_modules: package.json
backend/node_modules: backend/package.json
frontend/node_modules: frontend/package.json
node_modules backend/node_modules frontend/node_modules:
	@set -e
	( cd `dirname $@`; npm install )
	touch $@

clean:
	tsc --build --clean
	rm -rf build frontend/pages/*/build
