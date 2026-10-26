import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/juejin/pins.ts
const route = {
	path: "/pins/:type?",
	categories: ["programming"],
	example: "/juejin/pins/6824710202487472141",
	parameters: { type: "默认为 recommend，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "沸点",
	maintainers: ["xyqfer", "laampui"],
	handler,
	description: `| 推荐      | 热门 | 上班摸鱼            | 内推招聘            | 一图胜千言          | 今天学到了          | 每天一道算法题      | 开发工具推荐        | 树洞一下            |
| --------- | ---- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- | ------------------- |
| recommend | hot  | 6824710203301167112 | 6819970850532360206 | 6824710202487472141 | 6824710202562969614 | 6824710202378436621 | 6824710202000932877 | 6824710203112423437 |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "recommend";
	const title = {
		recommend: "推荐",
		hot: "热门",
		"6824710203301167112": "上班摸鱼",
		"6819970850532360206": "内推招聘",
		"6824710202487472141": "一图胜千言",
		"6824710202562969614": "今天学到了",
		"6824710202378436621": "每天一道算法题",
		"6824710202000932877": "开发工具推荐",
		"6824710203112423437": "树洞一下"
	};
	let url;
	let json;
	if (/^\d+$/.test(type)) {
		url = "https://api.juejin.cn/recommend_api/v1/short_msg/topic";
		json = {
			id_type: 4,
			sort_type: 500,
			cursor: "0",
			limit: 20,
			topic_id: type
		};
	} else {
		url = `https://api.juejin.cn/recommend_api/v1/short_msg/${type}`;
		json = {
			id_type: 4,
			sort_type: 200,
			cursor: "0",
			limit: 20
		};
	}
	const items = (await rofetch(url, {
		method: "POST",
		body: json
	})).data.data.map((item) => {
		const content = item.msg_Info.content;
		const title = content;
		const guid = item.msg_id;
		const link = `https://juejin.cn/pin/${guid}`;
		const pubDate = parseDate(item.msg_Info.ctime * 1e3);
		const author = item.author_user_info.user_name;
		let imgs = "";
		for (const img of item.msg_Info.pic_list) imgs += `<img src="${img}"><br>`;
		return {
			title,
			link,
			description: `
            ${content.replaceAll("\n", "<br>")}<br>
            ${imgs}<br>
        `,
			guid,
			pubDate,
			author
		};
	});
	return {
		title: `沸点 - ${title[type]}`,
		link: "https://juejin.cn/pins/recommended",
		item: items
	};
}
//#endregion
export { route };
