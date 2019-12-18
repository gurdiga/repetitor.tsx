index.js: node_modules package.json tsconfig.json $(shell find src)
	tsc --skipLibCheck

zip: ../test-lambda.zip
../test-lambda.zip: .nvmrc package.json tsconfig.json index.js
	PROD_DEPENDENCIES=$$( \
		npm ls --parseable --only=production \
			| tail --lines=+2 \
			| xargs realpath --relative-to=`pwd` \
	) && \
	zip $@ -r index.js App $$PROD_DEPENDENCIES
	@du --apparent-size --human-readable $@

node_modules: .nvmrc package.json
	npm install
	touch node_modules

clean:
	rm -f index.js
	rm -rf ./node_modules/ ./App/

.nvmrc: ../../cloud-formation/main-stack.yml
	# take the version number out of something like "nodejs10.x"
	yq read $< Resources.LambdaFunction.Properties.Runtime \
		| grep -oP '\d+' \
		> .nvmrc

run: index.js
	. ~/.nvm/nvm.sh && nvm run index.js <<< '$(PLACEHOLDER_EVENT)'

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
