import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/github/repos.ts
const route = {
	path: "/repos/:user/:type?/:sort?",
	categories: ["programming"],
	example: "/github/repos/DIYgod",
	parameters: {
		user: "GitHub username",
		type: "Type of repository, can be `all`, `owner`, `member`, `public`, `private`, `forks`, `sources`",
		sort: "Sort by `created`, `updated`, `pushed`, `full_name`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["github.com/:user"] }],
	name: "User Repo",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const type = ctx.req.param("type") || "all";
	const sort = ctx.req.param("sort") || "created";
	let headers = {};
	if (config.github && config.github.access_token) headers = {
		...headers,
		Authorization: `token ${config.github.access_token}`
	};
	const item = (await got_default({
		method: "get",
		url: `https://api.github.com/users/${user}/repos`,
		searchParams: {
			type,
			sort
		},
		headers
	})).data.filter((item) => {
		switch (type) {
			case "all": return true;
			case "owner": return item.owner.login === user;
			case "member": return item.owner.login !== user;
			case "public": return item.private === false;
			case "private": return item.private === true;
			case "forks": return item.fork === true;
			case "sources": return item.fork === false;
			default: return true;
		}
	}).map((item) => {
		let pubDate = parseDate(item.created_at);
		if (sort === "updated" && item.updated_at) pubDate = parseDate(item.updated_at);
		else if (sort === "pushed" && item.pushed_at) pubDate = parseDate(item.pushed_at);
		return {
			title: item.name,
			description: item.description || "No description",
			pubDate,
			updated: parseDate(item.updated_at),
			link: item.html_url
		};
	});
	return {
		allowEmpty: true,
		title: `${user}'s GitHub repositories`,
		link: `https://github.com/${user}`,
		item
	};
}
//#endregion
export { route };
