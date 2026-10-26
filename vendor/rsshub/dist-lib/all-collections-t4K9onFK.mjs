import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as header } from "./utils-BpoeGnFo.mjs";
//#region lib/routes/zhihu/all-collections.ts
const route = {
	path: "/people/allCollections/:id",
	categories: ["social-media"],
	view: 0,
	example: "/zhihu/people/allCollections/87-44-49-67",
	parameters: { id: "作者 id，可在用户主页 URL 中找到" },
	features: {
		requireConfig: [{
			name: "ZHIHU_COOKIES",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.zhihu.com/people/:id"] }],
	name: "用户全部收藏内容",
	maintainers: ["Healthyyue"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const collections = (await got_default(`https://api.zhihu.com/people/${id}/collections`, { headers: {
		cookie: config.zhihu.cookies,
		Referer: `https://www.zhihu.com/people/${id}/collections`
	} })).data.data;
	const items = (await Promise.all(collections.map(async (collection) => {
		const { data: items, paging: { totals } } = (await got_default(`https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=0&limit=20`, { headers: {
			...header,
			cookie: config.zhihu.cookies,
			Referer: `https://www.zhihu.com/collection/${collection.id}`
		} })).data;
		if (totals > 20) {
			const offsetList = Array.from({ length: Math.ceil(totals / 20) - 1 }, (_, index) => (index + 1) * 20);
			const otherPages = await Promise.all(offsetList.map((offset) => cache_default.tryGet(`https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=${offset}&limit=20`, async () => {
				return (await got_default(`https://www.zhihu.com/api/v4/collections/${collection.id}/items?offset=${offset}&limit=20`, { headers: {
					...header,
					cookie: config.zhihu.cookies,
					Referer: `https://www.zhihu.com/collection/${collection.id}`
				} })).data.data;
			})));
			items.push(...otherPages.flat());
		}
		return {
			collectionId: collection.id,
			collectionTitle: collection.title,
			items
		};
	}))).flatMap((collection) => collection.items.map((item) => ({
		...item,
		collectionTitle: collection.collectionTitle
	})));
	return {
		title: `${collections[0].creator.name}的知乎收藏`,
		link: `https://www.zhihu.com/people/${id}/collections`,
		item: items.map((item) => {
			const content = item.content;
			return {
				title: content.type === "article" || content.type === "zvideo" ? content.title : content.question.title,
				link: content.url,
				description: content.type === "zvideo" ? `<img src=${content.video.url}/>` : content.content,
				pubDate: parseDate((content.type === "article" ? content.updated : content.updated_time) * 1e3),
				category: [item.collectionTitle]
			};
		})
	};
}
//#endregion
export { route };
