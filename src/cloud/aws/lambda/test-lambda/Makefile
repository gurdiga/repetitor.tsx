build/index.js: node_modules package.json tsconfig.json $(shell find src)
	tsc --skipLibCheck
	touch $@

zip: ../test-lambda.zip
../test-lambda.zip: .nvmrc package.json tsconfig.json build/index.js
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
	rm -f build/index.js
	rm -rf ./node_modules/ ./App/

.nvmrc: ../../cloud-formation/main-stack.yml
	# take the version number out of something like "nodejs10.x"
	yq read $< Resources.LambdaFunction.Properties.Runtime \
		| grep -oP '\d+' \
		> .nvmrc

run: init-db test

update:
	npm outdated \
		| tail -n +2 \
		| cut -f1 -d' ' \
		| xargs -I{} npm install {}@latest \
		| ifne -n 'exit 1'
	make test

test: build/index.js
	$(NVM_NODE_BINARY) $< '$(TEST_EVENT)'

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


init-db: .db.version-check .db.create-user .db.create-schema

.db.create-schema:
	@echo TODO: .db.create-schema

.db.create-user:
	mysql -e "CREATE USER $(APP_DB_USER)@$(APP_DB_HOST)"
	touch $@

.db.version-check: .db.required-version .db.actual-version
	diff $^
	touch $@

.db.actual-version:
	mysql -e 'show variables like "version"\G' \
		| tail -1 \
		| awk '{print $$2}' \
		| grep -oP '^\d+\.\d+' \
		> $@

.db.required-version: ../../cloud-formation/main-stack.yml
	# take the version number out of something like "5.6.10a"
	yq read $< Resources.DB.Properties.EngineVersion \
		| grep -oP '^\d+\.\d+' \
		> $@
