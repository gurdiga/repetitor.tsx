.ONESHELL:

default: cloud

PAGE_MODULES=`find src/ -type d -name '*Page'`

.PHONY: build
build: umd_node_modules
	@for module_path in $(PAGE_MODULES); do \
		path_name=`grep -Po '(?<=// path name: )([a-z]+|/)' $$module_path/Main.tsx` || \
			{ echo "\nModule $$module_path does not have a path name.\n"; exit 1; }; \
		echo "$$module_path -> build/$$path_name"; \
		mkdir -p build/$$path_name; \
		cp src/page-template.html build/$$path_name/index.html; \
		tsconfig=$$module_path/`basename $$module_path`.tsconfig.json; \
		tsc-bundle $$tsconfig \
			--outFile build/$$path_name/bundle.js \
			--importAs React=react \
			--importAs ReactDOM=react-dom \
			--importAs typestyle=typestyle \
			--importAs csx=csx \
			--importAs csstips=csstips \
			--exportAs repetitor \
			|| exit 1; \
	done

s: server
server: watch
	http-server --silent -a 127.0.0.1 -p 8000 ./build

watch: umd_node_modules
	@for module_path in $(PAGE_MODULES); do \
		path_name=`grep -Po '(?<=// path name: )([a-z]+|/)' $$module_path/Main.tsx` || \
			{ echo "\nModule $$module_path does not have a path name.\n"; exit 1; }; \
		cp src/page-template.html build/$$path_name/index.html; \
		tsconfig=$$module_path/`basename $$module_path`.tsconfig.json; \
		tsc-bundle $$tsconfig \
			--outFile build/$$path_name/bundle.js \
			--importAs React=react \
			--importAs ReactDOM=react-dom \
			--importAs typestyle=typestyle \
			--importAs csx=csx \
			--importAs csstips=csstips \
			--exportAs repetitor \
			--watch & \
	done

umd_node_modules: build/umd_node_modules \
	build/umd_node_modules/react.production.min.js \
	build/umd_node_modules/react-dom.production.min.js \
	build/umd_node_modules/typestyle.min.js \
	build/umd_node_modules/csx.min.js \
	build/umd_node_modules/csstips.min.js

build/umd_node_modules:
	mkdir -p build/umd_node_modules

build/umd_node_modules/react.production.min.js: node_modules/react/umd/react.production.min.js
	cp $? $@

build/umd_node_modules/react-dom.production.min.js: node_modules/react-dom/umd/react-dom.production.min.js
	cp $? $@

build/umd_node_modules/typestyle.min.js: node_modules/typestyle/umd/typestyle.min.js
	cp $? $@

build/umd_node_modules/csx.min.js: node_modules/csx/umd/csx.min.js
	cp $? $@

build/umd_node_modules/csstips.min.js: node_modules/csstips/umd/csstips.min.js
	cp $? $@

o: open
open:
	open http://localhost:8000

e: edit
edit:
	code -n .

x:

deploy:
	@git diff-index --quiet HEAD || \
		{ echo "\nGit is not clean.\n"; exit 1; };

	git checkout gh-pages
	git checkout master -- src/ tsconfig.json
	make build minify

	git reset
	git clean -fd

	cp -rf build/* .
	rm -rf build/

	git add .
	git commit -m "Deploy at `date`" && git push --force origin gh-pages || echo "\nNo changes to deploy.\n"
	git checkout master

minify:
	@find build/ -name bundle.js \
	| while read bundle; do \
		echo "Minifying $$bundle..."; \
		uglifyjs --compress --mangle -- $$bundle > $$bundle.min \
		&& mv $$bundle.min $$bundle; \
	done

AWS_MAIN_STACK_NAME=main-stack
AWS_LAMBDA_NAME=test-lambda
AWS_LAMBDA_BUCKET=gurdiga-lambda-code
AWS_LAMBDA_ZIP_NAME=test-lambda.zip
AWS_PROFILE_NAME=gurdiga-admin

cloud: \
		prepare-code-bucket \
		upload-code \
		deploy-main-stack

prepare-code-bucket: src/cloud/aws/cloud-formation/01-prepare-code-bucket.yml.deployed
src/cloud/aws/cloud-formation/01-prepare-code-bucket.yml.deployed: src/cloud/aws/cloud-formation/01-prepare-code-bucket.yml
	aws cloudformation deploy \
		--stack-name prepare-code-bucket \
		--template-file src/cloud/aws/cloud-formation/01-prepare-code-bucket.yml \
		--parameter-overrides \
			LambdaCodeS3BucketName=$(AWS_LAMBDA_BUCKET) \
		--no-fail-on-empty-changeset \
		--profile $(AWS_PROFILE_NAME) \
	&& touch $@

upload-code: src/cloud/aws/lambda/test-lambda.zip.uploaded
src/cloud/aws/lambda/test-lambda.zip.uploaded: src/cloud/aws/lambda/test-lambda.zip
	aws s3 cp \
		--profile $(AWS_PROFILE_NAME) \
		src/cloud/aws/lambda/test-lambda.zip \
		s3://$(AWS_LAMBDA_BUCKET)/$(AWS_LAMBDA_ZIP_NAME) \
	&& touch $@

deploy-code: src/cloud/aws/lambda/test-lambda.zip.deployed
src/cloud/aws/lambda/test-lambda.zip.deployed:
	aws lambda update-function-code \
		--function-name $(AWS_LAMBDA_NAME) \
		--s3-bucket $(AWS_LAMBDA_BUCKET) \
		--s3-key $(AWS_LAMBDA_ZIP_NAME) \
		--profile $(AWS_PROFILE_NAME) \
	&& touch $@

src/cloud/aws/lambda/test-lambda.zip: $(shell find src/cloud/aws/lambda/test-lambda)
	cd src/cloud/aws/lambda/test-lambda && zip -r ../test-lambda.zip .

deploy-main-stack: validate-main-stack src/cloud/aws/cloud-formation/02-main-stack.yml.deployed
src/cloud/aws/cloud-formation/02-main-stack.yml.deployed: src/cloud/aws/cloud-formation/02-main-stack.yml
	aws cloudformation deploy \
		--stack-name $(AWS_MAIN_STACK_NAME) \
		--template-file src/cloud/aws/cloud-formation/02-main-stack.yml \
		--parameter-overrides \
			LambdaFunctionName=$(AWS_LAMBDA_NAME) \
			LambdaCodeS3BucketName=$(AWS_LAMBDA_BUCKET) \
			LambdaCodeZipName=$(AWS_LAMBDA_ZIP_NAME) \
			DeployEnv=test \
		--capabilities CAPABILITY_IAM \
		--profile $(AWS_PROFILE_NAME) \
		--no-fail-on-empty-changeset \
	&& touch $@

validate-main-stack: src/cloud/aws/cloud-formation/02-main-stack.yml.validated
src/cloud/aws/cloud-formation/02-main-stack.yml.validated: src/cloud/aws/cloud-formation/02-main-stack.yml
	aws cloudformation validate-template \
		--template-body file://src/cloud/aws/cloud-formation/02-main-stack.yml \
		--profile $(AWS_PROFILE_NAME) \
	&& touch $@

test-lambda:
	aws cloudformation describe-stacks \
		--stack-name $(AWS_MAIN_STACK_NAME) \
		--profile $(AWS_PROFILE_NAME) \
		| jq '.Stacks[0].Outputs[0].OutputValue' -r \
		| xargs -I{} http -v POST https://{}.execute-api.us-east-1.amazonaws.com/test/lambda

t: test-lambda

delete-main-stack:
	aws cloudformation delete-stack \
		--stack-name $(AWS_MAIN_STACK_NAME) \
		--profile $(AWS_PROFILE_NAME) \
	&& rm -vf src/cloud/aws/cloud-formation/02-main-stack.yml.deployed

update:
	npm update
	make build && \
		git add package.json package-lock.json && \
		git commit -am 'NPM packages update'

clean:
	rm -v \
		src/cloud/aws/lambda/test-lambda.zip* \
		src/cloud/aws/cloud-formation/01-prepare-code-bucket.yml.deployed \
		src/cloud/aws/cloud-formation/02-main-stack.yml.validated \
		src/cloud/aws/cloud-formation/02-main-stack.yml.deployed \
