import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/gitee/repos/releases.ts
const md = markdownit({ html: true });
const route = {
	path: "/releases/:owner/:repo",
	categories: ["programming"],
	example: "/gitee/releases/y_project/RuoYi",
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
	radar: [{ source: ["gitee.com/:owner/:repo/releases"] }],
	name: "仓库 Releases",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { owner, repo } = ctx.req.param();
	const items = (await got_default(`https://gitee.com/api/v5/repos/${owner}/${repo}/releases`, { searchParams: {
		access_token: config.gitee.access_token ?? void 0,
		per_page: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100,
		direction: "desc"
	} })).data.map((item) => ({
		title: item.tag_name,
		description: md.render(item.body),
		author: item.author.login,
		pubDate: parseDate(item.created_at),
		guid: item.target_commitish,
		link: `https://gitee.com/${owner}/${repo}/releases/${item.tag_name}`
	}));
	return {
		title: `${owner}/${repo} - 发行版`,
		link: `https://gitee.com/${owner}/${repo}/releases`,
		item: items
	};
}
//#endregion
export { route };
