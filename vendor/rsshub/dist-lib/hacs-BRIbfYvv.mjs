import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/home-assistant/hacs.ts
const route = {
	path: "/hacs/repositories",
	name: "HACS Repositories",
	maintainers: ["DIYgod"],
	categories: ["program-update"],
	example: "/home-assistant/hacs/repositories",
	handler
};
async function handler() {
	return {
		title: "HACS Repositories",
		link: "https://www.hacs.xyz/",
		item: (await Promise.all([
			"appdaemon",
			"critical",
			"integration",
			"theme",
			"python_script",
			"plugin"
		].map(async (section) => {
			const response = await rofetch(`https://data-v2.hacs.xyz/${section}/data.json`);
			return Object.values(response);
		}))).flat().map((item) => ({
			title: item.manifest_name || item.manifest?.name || item.full_name,
			description: `${item.domain ? `<img src="https://brands.home-assistant.io/_/${item.domain}/icon.png" />` : ""}<br>${item.description}<br><br>Last updated: ${item.last_updated}<br>Stars: ${item.stargazers_count}<br>Topics: ${item.topics?.join(", ")}`,
			link: `https://github.com/${item.full_name}`,
			guid: item.domain || item.full_name,
			tags: item.topics,
			pubDate: /* @__PURE__ */ new Date(item.last_fetched * 1e3)
		}))
	};
}
//#endregion
export { route };
