.ONESHELL:
SHELL=bash

default: test

test:
	@TS_NODE_PROJECT=tests/tsconfig.json ~/.nvm/nvm-exec node_modules/.bin/mocha \
		--require ts-node/register \
		--require tsconfig-paths/register \
		--reporter dot \
		--file tests/src/TestHelpers.ts \
		tests/**/*.test.ts? \

testw:
	~/.nvm/nvm-exec node_modules/.bin/nodemon \
		--ext ts \
		--ext tsx \
		--watch tests \
		--watch pages \
		--watch shared \
		--watch ../shared/src \
		--exec 'make test'
