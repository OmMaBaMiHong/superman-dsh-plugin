import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sspai/topic.ts
const route = {
	path: "/topic/:id",
	categories: ["new-media"],
	example: "/sspai/topic/250",
	parameters: { id: "专题 id，可在专题主页URL中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sspai.com/topic/:id"] }],
	name: "专题内文章更新",
	maintainers: ["SunShinenny"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const list = (await got_default({
		method: "get",
		url: `https://sspai.com/api/v1/articles?offset=0&limit=20&topic_id=${id}&sort=created_at&include_total=false`
	})).data.list;
	let topic_title = "";
	let topic_link = "";
	let topic_des = "";
	const out = await Promise.all(list.map((item) => {
		const title = item.title;
		const date = item.created_at;
		const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`;
		const itemUrl = `https://sspai.com/post/${item.id}`;
		const author = item.author.nickname;
		if (topic_title === "") {
			topic_title = item.topics[0].title;
			topic_link = `https://sspai.com/topic/${id}`;
			topic_des = item.topics[0].intro;
		}
		return cache_default.tryGet(`sspai: ${item.id}`, async () => {
			const response = await got_default(link);
			let description = "";
			const articleData = response.data.data;
			const banner = articleData.promote_image;
			if (banner) description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
			description += articleData.body;
			return {
				title,
				link: itemUrl,
				author,
				description,
				pubDate: parseDate(date * 1e3)
			};
		});
	}));
	return {
		title: `少数派专题-${topic_title}`,
		link: topic_link,
		description: topic_des,
		item: out
	};
}
//#endregion
export { route };
