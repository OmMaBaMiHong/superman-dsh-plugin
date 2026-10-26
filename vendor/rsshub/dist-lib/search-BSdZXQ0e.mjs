import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/notefolio/search.tsx
const categoryMap = [
	{
		keywords: "video-motiongraphic",
		category: "portfolio.category.trevorbenitez"
	},
	{
		keywords: "graphic-design",
		category: "portfolio.category.lynnrogers"
	},
	{
		keywords: "branding-editorial",
		category: "portfolio.category.katiethompson"
	},
	{
		keywords: "UI-UX",
		category: "portfolio.category.brittneyhall"
	},
	{
		keywords: "illustration",
		category: "portfolio.category.margaretbullock"
	},
	{
		keywords: "digital-art",
		category: "portfolio.category.amandahoward"
	},
	{
		keywords: "character-design",
		category: "portfolio.category.rachelsharp"
	},
	{
		keywords: "product-package-design",
		category: "portfolio.category.vanessacohen"
	},
	{
		keywords: "photography",
		category: "portfolio.category.johnmurray"
	},
	{
		keywords: "typography",
		category: "portfolio.category.timothysmith"
	},
	{
		keywords: "crafts",
		category: "portfolio.category.jessicaking"
	},
	{
		keywords: "fine-art",
		category: "portfolio.category.johnmedina"
	}
];
const renderContentItem = (item) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: item.type === "Image" ? item.files?.map((file) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
	src: file.url,
	alt: "",
	style: "max-width: 100%; height: auto;"
}), /* @__PURE__ */ jsx("br", {})] })) : item.type === "Text" ? /* @__PURE__ */ jsxs(Fragment, { children: [raw(item.content ?? ""), /* @__PURE__ */ jsx("br", {})] }) : null }));
/**
* @param category 分类
* @param order 排序 [like, pick, published]
* @param time 时间范围 ['one-day', 'week', 'month', 'three-month']
* @param query 搜索词
* @query limit 分页，默认20
*/
const route = {
	path: "/search/:category?/:order?/:time?/:query?",
	categories: ["design"],
	view: 2,
	example: "/notefolio/search/1/pick/all/life",
	parameters: {
		category: {
			description: "Category, see below",
			options: [
				{
					value: "all",
					label: "All (전체)"
				},
				{
					value: "1",
					label: "Video / Motion Graphics (영상/모션그래픽)"
				},
				{
					value: "2",
					label: "Graphic Design (그래픽 디자인)"
				},
				{
					value: "3",
					label: "Branding / Editing (브랜딩/편집)"
				},
				{
					value: "4",
					label: "UI/UX (UI/UX)"
				},
				{
					value: "5",
					label: "Illustration (일러스트레이션)"
				},
				{
					value: "6",
					label: "Digital Art (디지털 아트)"
				},
				{
					value: "7",
					label: "Character Design (캐릭터 디자인)"
				},
				{
					value: "8",
					label: "Product Package Design (제품/패키지 디자인)"
				},
				{
					value: "9",
					label: "Photography (포토그래피)"
				},
				{
					value: "10",
					label: "Typography (타이포그래피)"
				},
				{
					value: "11",
					label: "Crafts (공예)"
				},
				{
					value: "12",
					label: "Fine Art (파인아트)"
				}
			],
			default: "all"
		},
		order: {
			description: "Order, `pick` as Notefolio Pick, `published` as Newest, `like` as like, `pick` by default",
			options: [
				{
					value: "pick",
					label: "Notefolio Pick"
				},
				{
					value: "published",
					label: "Newest"
				},
				{
					value: "like",
					label: "Like"
				}
			],
			default: "pick"
		},
		time: {
			description: "Time",
			options: [
				{
					value: "all",
					label: "All the time"
				},
				{
					value: "one-day",
					label: "Latest 24 hours"
				},
				{
					value: "week",
					label: "Latest week"
				},
				{
					value: "month",
					label: "Latest month"
				},
				{
					value: "three-month",
					label: "Latest 3 months"
				}
			],
			default: "all"
		},
		query: "Keyword, empty by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["notefolio.net/search"] }],
	name: "Works",
	maintainers: ["BianTan"],
	handler,
	url: "notefolio.net/search",
	description: `| Category | Name in Korean     | Name in English         |
| -------- | ------------------ | ----------------------- |
| all      | 전체               | All                     |
| 1        | 영상/모션그래픽    | Video / Motion Graphics |
| 2        | 그래픽 디자인      | Graphic Design          |
| 3        | 브랜딩/편집        | Branding / Editing      |
| 4        | UI/UX              | UI/UX                   |
| 5        | 일러스트레이션     | Illustration            |
| 6        | 디지털 아트        | Digital Art             |
| 7        | 캐릭터 디자인      | Character Design        |
| 8        | 제품/패키지 디자인 | Product Package Design  |
| 9        | 포토그래피         | Photography             |
| 10       | 타이포그래피       | Typography              |
| 11       | 공예               | Crafts                  |
| 12       | 파인아트           | Fine Art                |`
};
async function handler(ctx) {
	const { category = "all", order = "pick", time = "all", query = "" } = ctx.req.param();
	const { limit } = ctx.req.query();
	let searchUrl = `https://api.stunning.kr/api/v1/dantats/portfolio?state=Public&limit=${limit ? Number(limit) : 20}&search=${query}&orderBy=${order}`;
	const index = (Number(category) || 0) - 1;
	const matchedCategory = categoryMap[index];
	if (index >= 0 && matchedCategory) searchUrl += `&category=${matchedCategory.category}`;
	if (time !== "all" && [
		"one-day",
		"week",
		"month",
		"three-month"
	].includes(time)) {
		let startTime;
		const endTime = dayjs().endOf("d").format("YYYY-MM-DDTHH:mm:ss.SSS");
		switch (time) {
			case "one-day":
				startTime = dayjs().subtract(1, "d").format("YYYY-MM-DDTHH:mm:ss.SSS");
				break;
			case "week":
				startTime = dayjs().subtract(7, "d").startOf("d").format("YYYY-MM-DDTHH:mm:ss.SSS");
				break;
			case "month":
				startTime = dayjs().subtract(30, "d").startOf("d").format("YYYY-MM-DDTHH:mm:ss.SSS");
				break;
			case "three-month":
				startTime = dayjs().subtract(90, "d").startOf("d").format("YYYY-MM-DDTHH:mm:ss.SSS");
				break;
			default: throw new Error(`Unknown time: ${time}`);
		}
		searchUrl += `&publishedAt=${startTime}Z&publishedAt=${endTime}Z`;
	}
	const { data } = await got_default(searchUrl, { headers: { Origin: "https://notefolio.net" } });
	const items = data?.resultData.map((item) => {
		const { id, title, user, createdAt, categories = [], contents = [] } = item;
		const description = contents.map((item) => renderContentItem(item)).join(" ");
		return {
			title,
			link: `https://notefolio.net/${user.url}/${id}`,
			description,
			pubDate: parseDate(createdAt),
			author: user.nick,
			category: categories.map((label) => label.replace("portfolio.category.", ""))
		};
	}) || [];
	return {
		title: `${category}/${order}/${time}/${query} search`,
		item: items
	};
}
//#endregion
export { route };
