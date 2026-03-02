TAG := $(shell date +%m%d%H%M)
COMMIT_SHA := $(shell git rev-parse HEAD || echo unknown)
GIT_DATE := $(shell git log -1 --format=%cd || echo unknown)

image:
	docker buildx build --platform linux/amd64 --build-arg COMMIT_SHA=$(COMMIT_SHA) --build-arg GIT_DATE="$(GIT_DATE)" --build-arg USE_CHINA_NPM_REGISTRY=1 --build-arg PUPPETEER_SKIP_DOWNLOAD=0 -t rsshub:$(TAG) . --output type=docker,dest=./rsshub.tar

send: image-slim
	scp ./rsshub-slim.tar.gz huo3:/tmp/

image-slim:
	docker buildx build --platform linux/amd64 --build-arg COMMIT_SHA=$(COMMIT_SHA) --build-arg GIT_DATE="$(GIT_DATE)" --build-arg USE_CHINA_NPM_REGISTRY=1 --build-arg PUPPETEER_SKIP_DOWNLOAD=1 -t rsshub:$(TAG)-slim . --output type=docker,dest=- | gzip -9 > ./rsshub-slim.tar.gz
