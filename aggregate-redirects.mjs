import { readFileSync, writeFileSync, globSync } from "node:fs";

let { workspaces = [] } = JSON.parse(readFileSync("package.json", "utf-8"));

let rules = workspaces
	.flatMap((p) => globSync(p))
	.map((dir) => {
		let rules;
		try {
			rules = readFileSync(`${dir}/_redirects`, "utf-8").trim();
		} catch {
			return;
		}

		// /client_modules/foo/* … → /child/client_modules/foo/* …
		return rules && rules.replace(/(^|\s)\//gm, `$1/${dir}/`);
	})
	.filter(Boolean)
	.join("\n");

if (rules) {
	writeFileSync("_redirects", rules + "\n");
}
