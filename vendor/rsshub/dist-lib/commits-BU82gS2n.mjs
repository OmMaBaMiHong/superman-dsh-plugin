import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/gitcode/repos/commits.ts
const md = markdownit({ html: true });
const route = {
	path: "/commits/:owner/:repo/:branch?",
	categories: ["programming"],
	example: "/gitcode/commits/openharmony-sig/flutter_flutter",
	parameters: {
		owner: "用户名/组织名",
		repo: "仓库名",
		branch: "分支名，可选，默认为主分支"
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
		source: ["gitcode.com/:owner/:repo/commits", "gitcode.com/:owner/:repo/commits/:branch"],
		target: (params) => `/gitcode/commits/${params.owner}/${params.repo}${params.branch ? `/${params.branch}` : ""}`
	}],
	name: "仓库提交",
	maintainers: ["JiZhi-Error"],
	handler
};
async function handler(ctx) {
	const { owner, repo, branch } = ctx.req.param();
	const { data: response } = await got_default(`https://web-api.gitcode.com/api/v2/projects/${encodeURIComponent(`${owner}/${repo}`)}/repository/commits`, { searchParams: {
		per_page: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100,
		ref_name: branch
	} });
	if (!response || !response.content) throw new Error("无法获取提交数据");
	const items = response.content.map((item) => ({
		title: md.renderInline(item.title),
		description: md.render(item.message),
		author: item.author_name,
		pubDate: parseDate(item.committed_date),
		guid: item.id,
		link: `https://gitcode.com/${owner}/${repo}/commit/${item.id}`
	}));
	return {
		title: `${owner}/${repo}/${branch ? ` (${branch})` : ""} - 提交记录`,
		link: `https://gitcode.com/${owner}/${repo}/commits/${branch || ""}`,
		item: items
	};
}
//#endregion
export { route };
