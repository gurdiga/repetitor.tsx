.ONESHELL:

default: build

.PHONY: build
c: build
build: umd_node_modules
	@set -e
	for page_module_path in pages/*/src/Main.tsx; do
		page_path_name=`grep -Po '(?<=// path name: )([a-z]+|/)' $$page_module_path` || \
			{ echo "\nModule $$page_module_path does not have a path name.\n"; exit 1; }

		page_module_path_no_extension=$${page_module_path/.tsx}
		page_base_dir=$${page_module_path/\/src\/Main.tsx}

		dest_dir=$$(
			if [ $$page_path_name == "/" ]; then
				echo "build"
			else
				echo "build/$$page_path_name"
			fi
		)

		mkdir -p $$dest_dir

		if [ $$dest_dir/bundle.min.js -ot $$page_base_dir/build/bundle.js ]; then
			uglifyjs < $$page_base_dir/build/bundle.js > $$dest_dir/bundle.min.js
		fi

		sed "s|MAIN_MODULE_PATH|frontend/$$page_module_path_no_extension|" index.html > $$dest_dir/index.html
	done

umd_node_modules: build/umd_node_modules \
	build/umd_node_modules/require.min.js \
	build/umd_node_modules/react.production.min.js \
	build/umd_node_modules/react-dom.production.min.js \
	build/umd_node_modules/typestyle.min.js \
	build/umd_node_modules/csx.min.js \
	build/umd_node_modules/csstips.min.js

build/umd_node_modules:
	@mkdir -p build/umd_node_modules

build/umd_node_modules/react.production.min.js: node_modules/react/umd/react.production.min.js
build/umd_node_modules/react-dom.production.min.js: node_modules/react-dom/umd/react-dom.production.min.js
build/umd_node_modules/typestyle.min.js: node_modules/typestyle/umd/typestyle.min.js
build/umd_node_modules/csx.min.js: node_modules/csx/umd/csx.min.js
build/umd_node_modules/csstips.min.js: node_modules/csstips/umd/csstips.min.js

build/umd_node_modules/%:
	@cp $? $@

build/umd_node_modules/require.min.js: node_modules/requirejs/require.js
	@uglifyjs < $? > $@

o: open
open:
	open http://localhost:8000

e: edit
edit:
	code -n .

minify:
	@set -e
	find build/ -name bundle.js \
	| while read bundle; do \
		echo "Minifying $$bundle..."; \
		uglifyjs --compress --mangle -- $$bundle > $$bundle.min \
		&& mv $$bundle.min $$bundle; \
	done

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
	@find . \
		! -path '*/node_modules/*' \
		-name package.json \
	| xargs dirname \
	| while read dir; do \
			echo "Checking for outdated packages in $$dir">>/dev/stderr; \
			cd $$dir; \
			npm outdated; \
		done

clean:
	rm -rf build/

node_modules/%:
	npm install

start: server
s: server
server:
	@set -e
	http-server --silent -a 127.0.0.1 -p 8000 ./build 2>&1 > .log &
	echo $$! > .pid
	disown

stop: .pid
	@kill `cat .pid` && rm .pid

.pid:
	@echo "No .pid file. Probably not running.\n"
	exit 1

status: .pid
	@echo "Running as process `cat .pid` on port $$BACKEND_HTTP_PORT."

restart: stop start
