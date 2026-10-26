import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import markdownit from "markdown-it";
//#region lib/routes/github/pulls.ts
const md = markdownit({
	html: true,
	linkify: true
});
const route = {
	path: "/pull/:user/:repo/:state?/:labels?",
	categories: ["programming"],
	example: "/github/pull/DIYgod/RSSHub",
	parameters: {
		user: "GitHub username",
		repo: "GitHub repo name",
		state: {
			description: "the state of pull requests.",
			default: "open",
			options: [
				{
					label: "Open",
					value: "open"
				},
				{
					label: "Closed",
					value: "closed"
				},
				{
					label: "All",
					value: "all"
				}
			]
		},
		labels: "a list of comma separated label names"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: [
			"github.com/:user/:repo/pulls",
			"github.com/:user/:repo/pulls/:id",
			"github.com/:user/:repo"
		],
		target: "/pull/:user/:repo"
	}],
	name: "Repo Pull Requests",
	maintainers: ["hashman", "TonyRL"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const repo = ctx.req.param("repo");
	const state = ctx.req.param("state") ?? "open";
	const labels = ctx.req.param("labels");
	const host = `https://github.com/${user}/${repo}/pulls`;
	const url = `https://api.github.com/repos/${user}/${repo}/issues`;
	const headers = { Accept: "application/vnd.github.v3+json" };
	if (config.github && config.github.access_token) headers.Authorization = `token ${config.github.access_token}`;
	const limit = ctx.req.query("limit");
	const data = (await rofetch(url, {
		query: {
			state,
			labels,
			sort: "created",
			direction: "desc",
			per_page: limit ? Number.parseInt(limit) : 100
		},
		headers
	})).filter((item) => item.pull_request);
	return {
		allowEmpty: true,
		title: `${user}/${repo} ${state.replace(/^\S/, (s) => s.toUpperCase())} Pull Requests${labels ? " - " + labels : ""}`,
		link: host,
		item: data.map((item) => ({
			title: item.title,
			author: item.user.login,
			description: item.body ? md.render(item.body) : "No description",
			pubDate: parseDate(item.created_at),
			link: item.html_url
		}))
	};
}
//#endregion
export { route };
