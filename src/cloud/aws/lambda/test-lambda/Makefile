include .env

NVM_NODE_BINARY=$(shell ls -1d /Users/vlad/.nvm/versions/node/v$$(<.nvmrc)*/bin/node | sort --version-sort | tail -1)

build: index.js
index.js: node_modules package.json tsconfig.json $(shell find src)
	tsc --skipLibCheck
	touch $@

zip: ../test-lambda.zip
../test-lambda.zip: .nvmrc package.json tsconfig.json index.js
	PROD_DEPENDENCIES=$$( \
		npm ls --parseable --only=production \
			| tail --lines=+2 \
			| xargs realpath --relative-to=`pwd` \
	) && \
	zip $@ -r $$PROD_DEPENDENCIES
	cd build && zip ../$@ -r *
	@du --apparent-size --human-readable $@

node_modules: .nvmrc package.json
	npm install
	touch $@

clean:
	rm -f index.js
	rm -rf ./node_modules/ ./App/

.nvmrc: ../../cloud-formation/main-stack.yml
	# take the version number out of something like "nodejs10.x"
	yq read $< Resources.LambdaFunction.Properties.Runtime \
		| grep -oP '\d+' \
		> .nvmrc

run: index.js
	$(NVM_NODE_BINARY) index.js '$(PLACEHOLDER_EVENT)'

define PLACEHOLDER_EVENT
{ \
	"httpMethod": "POST", \
	"path": "/", \
	"queryStringParameters": { \
		"actionName": "registerUser" \
	}, \
	"multiValueQueryStringParameters": null \
}
endef

update:
	npm outdated \
		| tail -n +2 \
		| cut -f1 -d' ' \
		| xargs -I{} npm install {}@latest \
		| ifne -n 'exit 1'
	make test

test: build
	$(NVM_NODE_BINARY) build/index.js '$(TEST_EVENT)'

define TEST_EVENT
{ \
	"httpMethod": "GET", \
	"path": "/", \
	"queryStringParameters": { \
		"actionName": "testAction" \
	}, \
	"multiValueQueryStringParameters": null \
}
endef
