import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pconline/focus.ts
const rootUrl = "https://www.pconline.com.cn";
const categories = {
	all: {
		title: "全部",
		path: ""
	},
	tech: {
		title: "科技",
		path: "tech/"
	},
	finance: {
		title: "财经",
		path: "finance/"
	},
	life: {
		title: "生活",
		path: "life/"
	},
	company: {
		title: "公司",
		path: "company/"
	},
	character: {
		title: "人物",
		path: "character/"
	}
};
const getContent = (item) => cache_default.tryGet(item.link, async () => {
	const detailResponse = await got_default({
		method: "get",
		url: `https:${item.link}`,
		responseType: "arrayBuffer"
	});
	item.description = load(new TextDecoder("GBK").decode(detailResponse.data))(".context-box .context-table tbody td").html();
	return item;
});
const handler = async (ctx) => {
	const { category = "all" } = ctx.req.param();
	const cate = categories[category] || categories.all;
	const currentUrl = `${rootUrl}/3g/other/focus/${cate.path}index.html`;
	const dataString = (await got_default({
		method: "get",
		url: currentUrl
	})).data.replace(/Module\.callback\((.*)\)/s, "$1").split("\n").filter((e) => e.indexOf("\"tags\":") !== 0).join("\n").replaceAll("'", "\"").replaceAll(/[\n\r]/g, "").replaceAll(",}", "}");
	const { articleList } = JSON.parse(dataString || "");
	const list = articleList.map((item) => ({
		id: item.id,
		title: item.title,
		author: [{
			name: item.authorname,
			avatar: item.authorImg
		}],
		pubDate: parseDate(item.pc_pubDate),
		link: item.url,
		description: item.summary,
		category: item.channelName,
		image: item.cover
	}));
	const items = await Promise.all(list.map((item) => getContent(item)));
	return {
		title: `太平洋科技-${cate.title}`,
		link: currentUrl,
		item: items
	};
};
const route = {
	path: "/focus/:category?",
	categories: ["new-media"],
	example: "/pconline/focus",
	parameters: { category: {
		description: "科技新闻的类别，获取最新的一页，分别：all, tech, finance, life, company, character",
		default: "all"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["pconline.com.cn/focus/", "pconline.com.cn/"],
		target: "/focus"
	}],
	name: "科技新闻",
	maintainers: ["CH563"],
	handler,
	description: `::: tip

| 全部 | 科技 | 财经    | 生活 | 公司    | 人物      |
| ---- | ---- | ------- | ---- | ------- | --------- |
| all  | tech | finance | life | company | character |

:::`
};
//#endregion
export { handler, route };
