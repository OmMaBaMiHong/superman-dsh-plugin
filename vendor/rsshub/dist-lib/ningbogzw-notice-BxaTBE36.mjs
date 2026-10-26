import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/zj/ningbogzw-notice.ts
const route = {
	path: "/ningbogzw-notice/:colId?",
	categories: ["government"],
	example: "/gov/zj/ningbogzw-notice/1229116730",
	parameters: { colId: "公告分类id、详细信息点击源网站http://gzw.ningbo.gov.cn/请求中寻找" },
	radar: [{
		source: ["gzw.ningbo.gov.cn/col/col1229116730/index.html"],
		target: "/ningbogzw-notice/:colId?"
	}],
	name: "宁波市国资委-公告",
	url: "gzw.ningbo.gov.cn",
	maintainers: ["HaoyuLee"],
	description: `| 公告类别                           | colId      |
| ---------------------------------- | ---------- |
| 首页 - 市属国企招聘信息 - 招聘公告 | 1229116730 |`,
	async handler(ctx) {
		const { colId = "1229116730" } = ctx.req.param();
		const url = `http://gzw.ningbo.gov.cn/col/col${colId}/index.html`;
		const { data: response } = await got_default(url);
		const noticeCate = load(response)(".List-topic .text-tag").text().trim();
		return {
			title: "宁波市国资委",
			link: url,
			item: response.match(/<li><a href=".*" target="_blank">.*<\/li>/g).map((line) => {
				const $ = load(line);
				const title = $("a");
				return {
					title: `宁波市国资委-${noticeCate}:${title.text()}`,
					link: `http://gzw.ningbo.gov.cn${title.attr("href")}`,
					pubDate: parseDate($("p").text().replaceAll(/\[|\]/g, "")),
					author: "宁波市国资委",
					description: title.text()
				};
			})
		};
	}
};
//#endregion
export { route };
