index.js: node_modules package.json tsconfig.json $(shell find src)
	tsc --skipLibCheck

zip: ../test-lambda.zip
../test-lambda.zip: \
		index.js \
		$(shell npm ls --parseable --only=production \
			| tail --lines=+2 \
			| xargs realpath --relative-to=`pwd`)
	zip --filesync $@ -r $^
	@du --apparent-size --human-readable $@

node_modules: package.json
	npm install
	touch node_modules

clean:
	rm -f index.js
	rm -rf ./node_modules/
