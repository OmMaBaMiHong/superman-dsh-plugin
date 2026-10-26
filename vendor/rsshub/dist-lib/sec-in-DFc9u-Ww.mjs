import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sec-in/index.ts
const route = {
	path: "/",
	name: "Unknown",
	maintainers: ["p7e4"],
	handler
};
async function handler() {
	const { data } = await got_default("https://sec-in.com/api/v1/Common/getArticleList?tabs=newest");
	return {
		title: "SecIN信息安全技术社区",
		link: "https://sec-in.com/",
		item: data.result.data.map((item) => ({
			title: item.article_title,
			link: `https://sec-in.com/article/${item.id}`,
			description: item.summary,
			pubDate: parseDate(item.passed_time),
			author: item.member_info.nickname,
			category: item.article_tag
		}))
	};
}
//#endregion
export { route };
