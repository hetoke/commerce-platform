.PHONY: dev

dev:
	npx concurrently \
		"npm --prefix frontend run dev" \
		"npm --prefix backend run dev"
