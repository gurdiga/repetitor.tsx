.PHONY: build

BUILD_COMMAND=tsc-bundle tsconfig.json --importAs React=react --importAs ReactDOM=react-dom --exportAs repetitor
build:
	$(BUILD_COMMAND)

watch:
	$(BUILD_COMMAND) --watch
