import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as header, r as processImage, t as getSignedHeader } from "./utils-BpoeGnFo.mjs";
//#region lib/routes/zhihu/answers.ts
const route = {
	path: "/people/answers/:id",
	categories: ["social-media"],
	example: "/zhihu/people/answers/diygod",
	parameters: { id: "作者 id，可在用户主页 URL 中找到" },
	features: {
		requireConfig: [{
			name: "ZHIHU_COOKIES",
			description: "",
			optional: true
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.zhihu.com/people/:id/answers"] }],
	name: "用户回答",
	maintainers: ["DIYgod", "prnake"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const apiPath = `/api/v4/members/${id}/answers?limit=7&include=data[*].is_normal,content`;
	const signedHeader = await getSignedHeader(`https://www.zhihu.com/people/${id}`, apiPath);
	const data = (await got_default(`https://www.zhihu.com${apiPath}`, { headers: {
		...header,
		...signedHeader,
		Referer: `https://www.zhihu.com/people/${id}/activities`
	} })).data.data;
	const items = data.map((item) => {
		const title = item.question.title;
		const url = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
		return {
			title,
			author: item.author.name,
			description: processImage(item.content),
			pubDate: parseDate(item.created_time * 1e3),
			link: url
		};
	});
	return {
		title: `${data[0].author.name}的知乎回答`,
		link: `https://www.zhihu.com/people/${id}/answers`,
		item: items
	};
}
//#endregion
export { route };
