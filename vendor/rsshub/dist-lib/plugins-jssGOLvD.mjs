import { t as buildCommunityFeed } from "./utils-CN6pWN_8.mjs";
//#region lib/routes/obsidian/plugins.ts
const route = {
	path: "/plugins",
	name: "Plugins",
	maintainers: ["DIYgod"],
	categories: ["program-update"],
	example: "/obsidian/plugins",
	handler
};
function handler() {
	return buildCommunityFeed("plugin");
}
//#endregion
export { route };
