import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/issuehunt/funded.ts
const route = {
	path: "/funded/:username/:repo",
	categories: ["programming"],
	example: "/issuehunt/funded/DIYgod/RSSHub",
	parameters: {
		username: "Github user/org",
		repo: "Repository name"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Project Funded",
	maintainers: ["running-grass"],
	handler
};
async function handler(ctx) {
	const { username, repo } = ctx.req.param();
	const { issues } = (await got_default(`https://issuehunt.io/apis/pages/repos/show?repositoryOwnerName=${username}&repositoryName=${repo}`)).data;
	if (issues === void 0) throw new Error("没有获取到数据");
	const md = markdownit({ html: true });
	return {
		title: `Issue Hunt 的悬赏 -- ${username}/${repo}`,
		link: `https://issuehunt.io/r/${username}/${repo}`,
		description: "",
		item: issues.map((item) => ({
			title: item.title,
			description: md.render(item.body),
			pubDate: item.fundedAt,
			link: `https://issuehunt.io/r/${username}/${repo}/issues/${item.number}`,
			author: item.userName
		}))
	};
}
//#endregion
export { route };
