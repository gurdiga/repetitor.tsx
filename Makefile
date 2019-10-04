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

cloud: aws-cloud

aws-cloud: \
		aws-cloud-formation-stack.json \
		test-lambda.zip
	aws cloudformation deploy \
		--profile gurdiga \
		--stack-name testing \
		--template-file $< \
		--parameter-overrides \
			DeployEnv=stage

aws-cloud-formation-stack.json: src/cloud/aws/cloud-formation/stack.ts
	cloudform $< > $@
	# TODO: endure the output is not empty. ifne?

test-lambda.zip: src/cloud/aws/lambda/test-lambda
	zip -q -r $@ $<
