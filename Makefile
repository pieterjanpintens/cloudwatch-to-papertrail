
all: deps create-zip

deps:
	rm -rf node_modules
	npm install

create-zip:
	rm -f code.zip
	zip code.zip -r index.js env.json node_modules

clean:
	rm -rf node_modules code.zip