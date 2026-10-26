import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/thepetcity/terms-map.ts
const termsMap = {
	"": {
		title: "PetCity 毛孩日常 | 飼養竉物、竉物用品、萌寵趣聞",
		slug: "/"
	},
	1: {
		title: "Pet Staff 毛孩好物",
		slug: "/category/cute-item"
	},
	2: {
		title: "Funny News毛孩趣聞",
		slug: "/category/funny-news"
	},
	3: {
		title: "Knowledge飼養大全",
		slug: "/category/knowledge"
	},
	4: {
		title: "Hot Spot 毛孩打卡點",
		slug: "/category/hot-spot"
	},
	5: {
		title: "Raise Pets 養寵物新手",
		slug: "/category/raise-cats"
	}
};
//#endregion
//#region lib/routes/thepetcity/index.ts
const baseUrl = "https://thepetcity.co";
const route = {
	path: "/:term?",
	categories: ["new-media"],
	example: "/thepetcity",
	parameters: { term: "見下表，留空為全部文章" },
	radar: Object.entries(termsMap).map(([key, value]) => ({
		title: value.title,
		source: [.../* @__PURE__ */ new Set([`thepetcity.co${value.slug}`, "thepetcity.co/"])],
		target: key ? `/${key}` : ""
	})),
	name: "分類",
	maintainers: ["TonyRL", "bigfei"],
	handler,
	url: "thepetcity.co/",
	description: `| Column Name           | TermID |
| --------------------- | ------ |
| Knowledge 飼養大全    | 3      |
| Funny News 毛孩趣聞   | 2      |
| Raise Pets 養寵物新手 | 5      |
| Hot Spot 毛孩打卡點   | 4      |
| Pet Staff 毛孩好物    | 1      |`
};
async function handler(ctx) {
	const term = ctx.req.param("term");
	const list = (await rofetch(`${baseUrl}/node_api/v1/articles/posts`, { query: { ...term ? {
		pageId: 977080509047743,
		term
	} : { pageId: 977080509047743 } } })).data.posts.map((post) => ({
		title: post.title,
		description: post.description,
		link: `${baseUrl}${post.url}`,
		pubDate: parseDate(post.post_date),
		guid: post.guid,
		api: `${baseUrl}/node_api/v1/articles/${post.id}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.guid, async () => {
		const data = await rofetch(item.api, { query: { pageId: 977080509047743 } });
		item.description = data.data.post_content;
		item.category = [.../* @__PURE__ */ new Set([...data.data.tags.map((t) => t.name), ...data.data.categories.map((c) => c.name)])];
		item.author = data.data.author.display_name;
		return item;
	})));
	return {
		title: Object.hasOwn(termsMap, term) ? termsMap[term].title : termsMap[""].title,
		description: "專屬毛孩愛好者的資訊平台，不論你是貓奴、狗奴，還是其他動物控，一起發掘最新的萌寵趣聞、有趣的寵物飼養知識、訓練動物、竉物用品推介、豐富多樣的寵物可愛影片。",
		link: baseUrl,
		image: "https://assets.presslogic.com/presslogic-hk-pc/static/favicon.ico",
		item: items
	};
}
//#endregion
export { route };
