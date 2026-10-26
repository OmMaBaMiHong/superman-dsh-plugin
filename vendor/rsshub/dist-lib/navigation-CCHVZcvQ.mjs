import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { i as processItems, r as getPostsBy, t as getBySlug } from "./utils-Bpk3tkLu.mjs";
//#region lib/routes/chikubi/navigation.ts
const route = {
	path: "/:keyword",
	categories: ["multimedia"],
	example: "/chikubi",
	parameters: { keyword: "導覽列，見下表，默認爲最新" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Navigation",
	maintainers: ["SnowAgar25"],
	handler,
	description: `| 殿堂 | 動畫  | VR | 漫畫  | 音聲  | CG・イラスト |
| ---- | ----- | -- | ----- | ----- | ------------ |
| best | video | vr | comic | voice | cg           |`
};
const navigationItems = {
	video: {
		url: "/nipple-video",
		title: "動畫"
	},
	vr: {
		url: "/nipple-video-category/cat-nipple-video-vr",
		title: "VR"
	},
	comic: {
		url: "/comic",
		title: "漫畫"
	},
	voice: {
		url: "/voice",
		title: "音聲"
	},
	cg: {
		url: "/cg",
		title: "CG"
	}
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword") ?? "";
	const baseUrl = "https://chikubi.jp";
	if (keyword === "best") {
		const { id } = await getBySlug("category", "nipple-best");
		const items = await getPostsBy("category", id);
		return {
			title: "殿堂 - chikubi.jp",
			link: `${baseUrl}/best-nipple-article`,
			item: items
		};
	}
	const { url, title } = navigationItems[keyword];
	const items = await processItems((await parser.parseURL(`${baseUrl}${url}/feed`)).items.map((item) => ({
		title: item.title,
		link: item.link
	})));
	return {
		title: `${title} - chikubi.jp`,
		link: `${baseUrl}${url}`,
		item: items
	};
}
//#endregion
export { route };
