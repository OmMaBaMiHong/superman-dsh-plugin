import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/github/branches.ts
const route = {
	path: "/branches/:user/:repo",
	categories: ["programming"],
	example: "/github/branches/DIYgod/RSSHub",
	parameters: {
		user: "User name",
		repo: "Repo name"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["github.com/:user/:repo/branches", "github.com/:user/:repo"] }],
	name: "Repo Branches",
	maintainers: ["max-arnold"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const repo = ctx.req.param("repo");
	const host = `https://github.com/${user}/${repo}`;
	const url = `https://api.github.com/repos/${user}/${repo}/branches`;
	const headers = {};
	if (config.github && config.github.access_token) headers.Authorization = `token ${config.github.access_token}`;
	const data = (await got_default({
		method: "get",
		url,
		headers
	})).data;
	return {
		title: `${user}/${repo} Branches`,
		link: `${host}/branches/all`,
		item: data.map((item) => ({
			title: item.name,
			description: item.name,
			link: `${host}/commits/${item.name}`
		}))
	};
}
//#endregion
export { route };
