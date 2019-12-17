include .env

.ONESHELL:

default: cloud deploy-lambda-code test-lambda

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

cloud: \
		prepare-lambda-code \
		main-stack \
		deploy-lambda-code

prepare-lambda-code: \
		src/cloud/aws/lambda/code-bucket.created \
		src/cloud/aws/lambda/code-bucket.enabled-versioning \
		src/cloud/aws/lambda/test-lambda.zip \
		src/cloud/aws/lambda/test-lambda.zip.uploaded

src/cloud/aws/lambda/code-bucket.created:
	aws s3api get-bucket-acl \
		--bucket $(AWS_LAMBDA_BUCKET) \
	|| aws s3api create-bucket \
		--bucket $(AWS_LAMBDA_BUCKET) \
		--acl public-read \
		--create-bucket-configuration LocationConstraint=EU
	touch $@

src/cloud/aws/lambda/code-bucket.enabled-versioning:
	aws s3api put-bucket-versioning \
		--bucket $(AWS_LAMBDA_BUCKET) \
		--versioning-configuration Status=Enabled
	touch $@

deploy-lambda-code: \
	src/cloud/aws/lambda/test-lambda.zip \
	src/cloud/aws/lambda/test-lambda.zip.uploaded \
	src/cloud/aws/lambda/test-lambda.zip.deployed

src/cloud/aws/lambda/test-lambda.zip.uploaded: src/cloud/aws/lambda/test-lambda.zip
	aws s3 cp \
		src/cloud/aws/lambda/test-lambda.zip \
		s3://$(AWS_LAMBDA_BUCKET)/$(AWS_LAMBDA_ZIP_NAME)
	touch $@

src/cloud/aws/lambda/test-lambda.zip.deployed: src/cloud/aws/lambda/test-lambda.zip.uploaded
	aws lambda update-function-code \
		--function-name $(AWS_LAMBDA_NAME) \
		--s3-bucket $(AWS_LAMBDA_BUCKET) \
		--s3-key $(AWS_LAMBDA_ZIP_NAME) \
		> /dev/null
	touch $@

src/cloud/aws/lambda/test-lambda.zip: $(shell find src/cloud/aws/lambda/test-lambda)
	cd src/cloud/aws/lambda/test-lambda && make zip

t: test-lambda
test-lambda: /usr/local/bin/http src/cloud/aws/cloud-formation/main-stack.yml.id
	AWS_STACK_ID=$$(< src/cloud/aws/cloud-formation/main-stack.yml.id) \
		&& time http --check-status -v POST https://$${AWS_STACK_ID}.execute-api.$(AWS_DEFAULT_REGION).amazonaws.com/test/lambda \
		|| make get-las-lambda-log

get-las-lambda-log:
	@LAST_LOG_STREAM_NAME=$$( \
		aws logs describe-log-streams \
			--log-group-name /aws/lambda/test-lambda \
			--descending \
			--order-by LastEventTime\
			--page-size 1 \
			--max-items 1 \
			| jq '.logStreams[].logStreamName' -r \
	) && \
	aws logs get-log-events \
		--log-group-name /aws/lambda/test-lambda \
		--log-stream-name $$LAST_LOG_STREAM_NAME \
		| jq -r '.events[].message' \
		| sed 's/\r/\n/g'

src/cloud/aws/cloud-formation/main-stack.yml.id: src/cloud/aws/lambda/test-lambda.zip.deployed
	aws cloudformation describe-stacks \
		--stack-name $(AWS_MAIN_STACK_NAME) \
		| jq '.Stacks[0].Outputs[0].OutputValue' -r > $@

/usr/local/bin/http:
	@echo The http utility is not found. Maybe brew install httpie?

main-stack: \
		src/cloud/aws/cloud-formation/main-stack.yml.validated \
		src/cloud/aws/cloud-formation/main-stack.yml.deployed

src/cloud/aws/cloud-formation/main-stack.yml.deployed: src/cloud/aws/cloud-formation/main-stack.yml
	if \
		DEFAULT_SUBNET_IDS=$$(aws ec2 describe-subnets | jq --raw-output '.Subnets | map(.SubnetId) | join(",")') && \
		DEFAULT_SECURITY_GROUP_IDS=$$(aws ec2 describe-security-groups --filters Name=description,Values="default VPC security group" | jq --raw-output '.SecurityGroups[].GroupId') && \
		aws cloudformation deploy \
			--stack-name $(AWS_MAIN_STACK_NAME) \
			--template-file $< \
			--no-fail-on-empty-changeset \
			--parameter-overrides \
				LambdaFunctionName=$(AWS_LAMBDA_NAME) \
				LambdaCodeS3BucketName=$(AWS_LAMBDA_BUCKET) \
				LambdaCodeZipName=$(AWS_LAMBDA_ZIP_NAME) \
				DeployEnv=test \
				DBName=$(DB_NAME) \
				DBUser=$(DB_USER) \
				DBPassword=$$DB_PASSWORD \
				DefaultSubnetIds=$$DEFAULT_SUBNET_IDS \
				DefaultSecurityGroupIds=$$DEFAULT_SECURITY_GROUP_IDS \
			--capabilities CAPABILITY_IAM; \
	then \
		touch $@; \
	else \
		aws cloudformation describe-stack-events \
			--stack-name main-stack \
			| jq -r '.StackEvents[] | select(.ResourceStatusReason) | "\(.LogicalResourceId):\t\(.ResourceStatusReason)"'; \
		exit 1; \
	fi

src/cloud/aws/cloud-formation/main-stack.yml.validated: src/cloud/aws/cloud-formation/main-stack.yml
	aws cloudformation validate-template \
		--template-body file://$< \
		> /dev/null
	touch $<.validated

validate-main-stack: src/cloud/aws/cloud-formation/main-stack.yml.validated

delete-cloud: delete-main-stack

delete-main-stack:
	aws cloudformation delete-stack \
		--stack-name $(AWS_MAIN_STACK_NAME) \
	&& rm -vf src/cloud/aws/cloud-formation/main-stack.yml.*

update:
	npm outdated \
		| tail -n +2 \
		| cut -f1 -d' ' \
		| xargs -I{} npm install {}@latest \
		| ifne -n 'exit 1'
	make build
	git add package.json package-lock.json
	git commit -am 'NPM packages update'

clean:
	rm -vf \
		src/cloud/aws/lambda/test-lambda.zip* \
		src/cloud/aws/lambda/code-bucket.* \
		src/cloud/aws/cloud-formation/main-stack.yml.*
