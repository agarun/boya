# boya themes
#
# Simple wrapper around scripts/oklch-shift.js. Edit
# scripts/oklch-shift.js for the underlying shifts; this Makefile just
# exposes a few convenient commands.
#
# Variables:
#   BG        base background color used by gray (default 090c10)
#   VARIANT   variant to build when no target is given (default all)
#   VIBRANCY  syntax chroma multiplier; 1.0 = unchanged (gray default),
#             1.6 = punchier (purple default).
#   DARKEN    OKLCH L subtraction for the purple base, 0..0.1 (default 0.02).
#   LIGHT     1 to also build the matching light variants (default 0)
#
# Examples:
#   make themes
#   make gray
#   make gray BG=0a0d12
#   make purple VIBRANCY=1.8 DARKEN=0.03
#   make themes BG=070a0e LIGHT=1

NODE      ?= node
SCRIPT    ?= scripts/oklch-shift.js
BG        ?= 090c10
VIBRANCY  ?=
DARKEN    ?=
LIGHT     ?=
VARIANT   ?=

# Convert "090c10" -> "#090c10" without forcing the user to type a #.
BG_ARG  = $(if $(BG),--bg $(BG),)
VIB_ARG = $(if $(VIBRANCY),--vibrancy $(VIBRANCY),)
DRK_ARG = $(if $(DARKEN),--darken $(DARKEN),)
LIGHT_TARGETS = $(if $(LIGHT),gray purple,)
DEFAULT_TARGETS = $(if $(VARIANT),$(VARIANT),gray purple)

.PHONY: themes gray purple all help clean

help: ## list targets
	@echo "Targets:"
	@echo "  make themes            - build all dark variants"
	@echo "  make gray|purple"
	@echo "  make all               - build every dark + light variant"
	@echo "Variables (override on the command line):"
	@echo "  BG=<hex>      background base for gray (default: 090c10)"
	@echo "  VIBRANCY=<n>  syntax chroma multiplier (default per variant)"
	@echo "  DARKEN=<n>    purple base L darkening (default: 0.02)"
	@echo "  LIGHT=1       include light variants"

themes: $(DEFAULT_TARGETS) ## build dark variants (override VARIANT=...)

gray: ## gray variant
	$(NODE) $(SCRIPT) gray $(BG_ARG) $(VIB_ARG) $(DRK_ARG)

purple: ## purple variant
	$(NODE) $(SCRIPT) purple $(BG_ARG) $(VIB_ARG) $(DRK_ARG)

all: gray purple ## build dark + light for every variant
	$(MAKE) themes LIGHT=1

clean: ## remove generated themes and schemes
	rm -f boya/themes/boya-gray-dark-color-theme.json \
	      boya/themes/boya-gray-light-color-theme.json \
	      boya/themes/boya-purple-dark-color-theme.json \
	      boya/themes/boya-purple-light-color-theme.json \
	      schemes/boya-gray-dark.json \
	      schemes/boya-gray-light.json \
	      schemes/boya-purple-dark.json \
	      schemes/boya-purple-light.json
