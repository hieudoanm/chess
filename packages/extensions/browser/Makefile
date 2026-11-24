BUILD = .build
V2 = dist/v2
V3 = dist/v3
ARTIFACTS = download
NAME = chess-unlocked
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
  CHROME := google-chrome
else
  CHROME := "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
endif

.PHONY: build package zip xpi crx lint typecheck test clean

# Build content/background/ui bundles with Vite, then assemble dist/v2 + dist/v3.
build: typecheck
	pnpm exec rimraf $(BUILD) $(V2) $(V3)
	ENTRY=content pnpm exec vite build
	ENTRY=background pnpm exec vite build
	pnpm exec vite build
	# --- MV3 ---
	mkdir -p $(V3)
	cp $(BUILD)/content/index.js $(V3)/content.js
	cp $(BUILD)/background/index.js $(V3)/background.js
	cp $(BUILD)/ui/popup.html $(BUILD)/ui/options.html $(V3)/
	cp -R $(BUILD)/ui/assets $(V3)/
	cp public/manifest/v3/manifest.json $(V3)/manifest.json
	cp -R public/icons $(V3)/
	# --- MV2 ---
	mkdir -p $(V2)
	cp $(BUILD)/content/index.js $(V2)/content.js
	cp $(BUILD)/background/index.js $(V2)/background.js
	cp $(BUILD)/ui/popup.html $(BUILD)/ui/options.html $(V2)/
	cp -R $(BUILD)/ui/assets $(V2)/
	cp public/manifest/v2/manifest.json $(V2)/manifest.json
	cp -R public/icons $(V2)/

# Package both variants as .zip, .xpi and .crx into download/.
package: build zip xpi crx

zip:
	mkdir -p $(ARTIFACTS)
	rm -f $(ARTIFACTS)/$(NAME)-v2.zip $(ARTIFACTS)/$(NAME)-v3.zip
	cd $(V2) && zip -r $(CURDIR)/$(ARTIFACTS)/$(NAME)-v2.zip .
	cd $(V3) && zip -r $(CURDIR)/$(ARTIFACTS)/$(NAME)-v3.zip .

xpi:
	mkdir -p $(ARTIFACTS)
	pnpm exec web-ext build --source-dir $(V2) --artifacts-dir $(ARTIFACTS) --filename $(NAME)-v2.xpi --overwrite-dest
	pnpm exec web-ext build --source-dir $(V3) --artifacts-dir $(ARTIFACTS) --filename $(NAME)-v3.xpi --overwrite-dest

crx:
	@if command -v $(CHROME) >/dev/null 2>&1; then \
		mkdir -p $(ARTIFACTS); \
		$(CHROME) --pack-extension=$(CURDIR)/$(V2); \
		mv $(V2).crx $(ARTIFACTS)/$(NAME)-v2.crx; \
		$(CHROME) --pack-extension=$(CURDIR)/$(V3); \
		mv $(V3).crx $(ARTIFACTS)/$(NAME)-v3.crx; \
		rm -f $(V2).pem $(V3).pem; \
	else \
		echo "Warning: Chrome not found at $(CHROME). Skipping CRX packaging."; \
	fi

lint:
	pnpm exec eslint . --fix

lint-check:
	pnpm exec eslint .

typecheck:
	pnpm exec tsc -p tsconfig.json --noEmit

test:
	pnpm exec vitest run

test-coverage:
	pnpm exec vitest run --coverage

format:
	pnpm exec prettier --cache --write .

format-check:
	pnpm exec prettier --cache --check .

clean:
	pnpm exec rimraf $(BUILD) $(V2) $(V3) $(ARTIFACTS)
