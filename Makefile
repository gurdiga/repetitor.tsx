.ONESHELL:

default: test

test: backend-test frontend-test

backend-test: install
	@( cd backend && make test )

frontend-test: install
	@( cd frontend && make test )

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
		--exec 'node_modules/.bin/ts-node backend/src/index.ts'

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
	rm -rf build shared/build backend/build frontend/build frontend/pages/*/build frontend/shared/build
