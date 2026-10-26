import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as fetch } from "./fetch-article-kD_oaeJ3.mjs";
//#region lib/routes/twreporter/category.ts
const route = {
	path: "/category/:category",
	categories: ["new-media"],
	example: "/twreporter/category/world",
	parameters: { category: "Category" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["twreporter.org/:category"] }],
	name: "分類",
	maintainers: ["emdoe"],
	handler,
	url: "twreporter.org/"
};
const CATEGORIES = {
	world: {
		name: "國際兩岸",
		url_name: "world",
		category_id: "63206383207bf7c5f871622c"
	},
	humanrights: {
		name: "人權司法",
		url_name: "humanrights",
		category_id: "63206383207bf7c5f8716234"
	},
	politics_and_society: {
		name: "政治社會",
		url_name: "politics-and-society",
		category_id: "63206383207bf7c5f871623d"
	},
	health: {
		name: "醫療健康",
		url_name: "health",
		category_id: "63206383207bf7c5f8716245"
	},
	environment: {
		name: "環境永續",
		url_name: "environment",
		category_id: "63206383207bf7c5f871624d"
	},
	econ: {
		name: "經濟產業",
		url_name: "econ",
		category_id: "63206383207bf7c5f8716254"
	},
	culture: {
		name: "文化生活",
		url_name: "culture",
		category_id: "63206383207bf7c5f8716259"
	},
	education: {
		name: "教育校園",
		url_name: "education",
		category_id: "63206383207bf7c5f8716260"
	},
	podcast: {
		name: "Podcast",
		url_name: "podcast",
		category_id: "63206383207bf7c5f8716266"
	},
	opinion: {
		name: "評論",
		url_name: "opinion",
		category_id: "63206383207bf7c5f8716269"
	},
	photos_section: {
		name: "影像",
		url_name: "photography",
		category_id: "574d028748fa171000c45d48"
	}
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const url = `https://go-api.twreporter.org/v2/posts?category_id=${CATEGORIES[category].category_id}`;
	const home = `https://www.twreporter.org/categories/${CATEGORIES[category].url_name}`;
	const list = (await rofetch(url)).data.records;
	const out = await Promise.all(list.map((item) => {
		const title = item.title;
		return cache_default.tryGet(item.slug, async () => {
			const single = await fetch(item.slug);
			single.title = title;
			return single;
		});
	}));
	return {
		title: `報導者 | ${CATEGORIES[category].name}`,
		link: home,
		item: out
	};
}
//#endregion
export { route };
