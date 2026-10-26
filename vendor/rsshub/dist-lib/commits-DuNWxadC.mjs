import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import queryString from "query-string";
//#region lib/routes/bitbucket/commits.ts
const route = {
	path: "/commits/:workspace/:repo_slug",
	categories: ["programming"],
	example: "/bitbucket/commits/blaze-lib/blaze",
	parameters: {
		workspace: "Workspace",
		repo_slug: "Repository"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bitbucket.com/commits/:workspace/:repo_slug"] }],
	name: "Commits",
	maintainers: ["AuroraDysis"],
	handler
};
async function handler(ctx) {
	const workspace = ctx.req.param("workspace");
	const repo_slug = ctx.req.param("repo_slug");
	const headers = { Accept: "application/json" };
	let auth = "";
	if (config.bitbucket && config.bitbucket.username && config.bitbucket.password) auth = config.bitbucket.username + ":" + config.bitbucket.password + "@";
	const data = (await got_default({
		method: "get",
		url: `https://${auth}api.bitbucket.org/2.0/repositories/${workspace}/${repo_slug}/commits/`,
		searchParams: queryString.stringify({ sort: "-target.date" }),
		headers
	})).data.values;
	return {
		allowEmpty: true,
		title: `Recent Commits to ${workspace}/${repo_slug}`,
		link: `https://bitbucket.org/${workspace}/${repo_slug}`,
		item: data && data.map((item) => ({
			title: item.message,
			author: item.author.raw,
			description: item.rendered.message.html || "No description",
			pubDate: parseDate(item.date),
			link: item.links.html.href
		}))
	};
}
//#endregion
export { route };
