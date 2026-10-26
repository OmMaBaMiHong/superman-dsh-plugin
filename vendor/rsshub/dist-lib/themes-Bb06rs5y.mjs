import { t as buildCommunityFeed } from "./utils-CN6pWN_8.mjs";
//#region lib/routes/obsidian/themes.ts
const route = {
	path: "/themes",
	name: "Themes",
	maintainers: ["DIYgod"],
	categories: ["program-update"],
	example: "/obsidian/themes",
	handler
};
function handler() {
	return buildCommunityFeed("theme");
}
//#endregion
export { route };
