import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/gitee/repos/commits.ts
const md = markdownit({ html: true });
const route = {
	path: "/commits/:owner/:repo",
	categories: ["programming"],
	example: "/gitee/commits/y_project/RuoYi",
	parameters: {
		owner: "用户名",
		repo: "仓库名"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["gitee.com/:owner/:repo/commits"] }],
	name: "仓库提交",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { owner, repo } = ctx.req.param();
	const apiUrl = `https://gitee.com/api/v5/repos/${owner}/${repo}/commits`;
	const items = (await cache_default.tryGet(apiUrl, async () => (await got_default(apiUrl, { searchParams: {
		access_token: config.gitee.access_token ?? void 0,
		per_page: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100,
		direction: "desc"
	} })).data)).map((item) => ({
		title: md.renderInline(item.commit.message),
		description: md.render(item.commit.message),
		author: item.author?.login || item.commit.author.name,
		pubDate: parseDate(item.commit.author.date),
		guid: item.sha,
		link: item.html_url
	}));
	return {
		title: `${owner}/${repo} - 提交`,
		link: `https://gitee.com/${owner}/${repo}/commits`,
		item: items
	};
}
//#endregion
export { route };
