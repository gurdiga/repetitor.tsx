.ONESHELL:

PAGE_MODULES=`find src/ -type d -name '*Page'`

.PHONY: build
build: umd_node_modules
	@for module_path in $(PAGE_MODULES); do \
		path_name=`grep -Po '(?<=// path name: )([a-z]+|/)' $$module_path/Main.tsx` || \
			{ echo "\nModule $$module_path does not have a path name.\n"; exit 1; }; \
		echo "$$module_path -> docs/$$path_name"; \
		cp docs/index-template.html docs/$$path_name/index.html; \
		tsconfig=$$module_path/`basename $$module_path`.tsconfig.json; \
		tsc-bundle $$tsconfig \
			--outFile docs/$$path_name/bundle.js \
			--importAs React=react \
			--importAs ReactDOM=react-dom \
			--importAs typestyle=typestyle \
			--exportAs repetitor \
			|| exit 1; \
	done

s: server
server: watch
	cd docs && ~/src/nginx-server/nginx-server.py

watch: umd_node_modules
	@for module_path in $(PAGE_MODULES); do \
		path_name=`grep -Po '(?<=// path name: )([a-z]+|/)' $$module_path/Main.tsx` || \
			{ echo "\nModule $$module_path does not have a path name.\n"; exit 1; }; \
		cp docs/index-template.html docs/$$path_name/index.html; \
		tsconfig=$$module_path/`basename $$module_path`.tsconfig.json; \
		tsc-bundle $$tsconfig \
			--outFile docs/$$path_name/bundle.js \
			--importAs React=react \
			--importAs ReactDOM=react-dom \
			--importAs typestyle=typestyle \
			--exportAs repetitor \
			--watch & \
	done

umd_node_modules: docs/umd_node_modules \
	docs/umd_node_modules/react.production.min.js \
	docs/umd_node_modules/react-dom.production.min.js \
	docs/umd_node_modules/typestyle.min.js

docs/umd_node_modules:
	mkdir -p docs/umd_node_modules

docs/umd_node_modules/react.production.min.js: node_modules/react/umd/react.production.min.js
	cp $? $@

docs/umd_node_modules/react-dom.production.min.js: node_modules/react-dom/umd/react-dom.production.min.js
	cp $? $@

docs/umd_node_modules/typestyle.min.js: node_modules/typestyle/umd/typestyle.min.js
	cp $? $@

o: open
open:
	open http://localhost:8000

e: edit
edit:
	code -n .

deploy: minify
	git commit docs -m 'Minified bundles'
	git push

minify:
	@find docs -name bundle.js \
	| while read bundle; do \
		echo "Minifying $$bundle..."; \
		uglifyjs --compress --mangle -- $$bundle > $$bundle.min \
		&& mv $$bundle.min $$bundle; \
	done
