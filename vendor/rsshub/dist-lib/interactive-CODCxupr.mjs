import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as logo } from "./util-Dj1XsSB_.mjs";
//#region lib/routes/zaobao/interactive.ts
const route = {
	path: "/interactive-graphics",
	categories: ["traditional-media"],
	example: "/zaobao/interactive-graphics",
	name: "互动新闻",
	maintainers: ["shunf4"],
	handler
};
async function handler() {
	const baseUrl = "https://www.zaobao.com.sg";
	const response = await rofetch(`${baseUrl}/_plat/api/v2/page-content/interactive-graphics`);
	const items = response.response.articles.map((i) => ({
		title: i.title,
		description: i.summary,
		link: new URL(i.href, baseUrl).href,
		pubDate: parseDate(i.timestamp, "X"),
		image: i.thumbnail
	}));
	return {
		title: response.seoMetaInfo.seoTitle,
		link: "https://www.zaobao.com.sg/interactive-graphics",
		description: response.seoMetaInfo.seoDescription,
		image: logo,
		item: items
	};
}
//#endregion
export { route };
