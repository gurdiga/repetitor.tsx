.ONESHELL:

.PHONY: build
build:
	tsc --build -v

c: build

clean:
	tsc --build --clean

start:
	@set +e
	( cd frontend/ && make --no-print-directory start; )
	( cd backend/ && make --no-print-directory start; )

stop:
	@set +e
	( cd frontend/ && make --no-print-directory stop; )
	( cd backend/ && make --no-print-directory stop; )
