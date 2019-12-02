index.js: node_modules $(shell find src/ node_modules/)
	tsc

zip: ../test-lambda.zip
../test-lambda.zip: \
		index.js \
		$(shell npm ls --parseable --only=production \
			| tail --lines=+2 \
			| xargs realpath --relative-to=`pwd`)
	zip --filesync $@ -r $^
	@du --apparent-size --human-readable $@

node_modules:
	npm install

clean:
	rm -f index.js
	rm -rf ./node_modules/
