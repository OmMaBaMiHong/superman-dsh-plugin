import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-CMHIYLf3.mjs";
import { load } from "cheerio";
//#region lib/routes/cde/index.ts
const channelLinkMap = {
	news: "https://www.cde.org.cn/main/news/listpage/545cf855a50574699b46b26bcb165f32",
	policy: "https://www.cde.org.cn/main/policy/listpage/9f9c74c73e0f8f56a8bfbc646055026d"
};
const cateUrlMap = {
	news: {
		zwxw: "getList",
		ywdd: "getHotNewsList",
		tpxw: "getPictureNewsList",
		gzdt: "getWorkList"
	},
	policy: {
		flfg: "getPolicyList",
		zxgz: "getRuleList"
	}
};
const cateTitleMap = {
	news: {
		zwxw: "政务新闻",
		ywdd: "要闻导读",
		tpxw: "图片新闻",
		gzdt: "工作动态"
	},
	policy: {
		flfg: "法律法规",
		zxgz: "政策规章"
	}
};
const requestData = {
	news: {
		zwxw: {
			pageSize: 25,
			pageNum: 1,
			classId: "545cf855a50574699b46b26bcb165f32"
		},
		ywdd: {
			pageSize: 25,
			pageNum: 1,
			ishot: 1
		},
		tpxw: {
			pageSize: 25,
			pageNum: 1
		},
		gzdt: {
			pageSize: 25,
			pageNum: 1,
			classId: "8dc6aac86eb083759b1e01615617a347"
		}
	},
	policy: {
		flfg: {
			pageNum: 1,
			pageSize: 25,
			fclass: 0,
			keyName: "TITLE",
			logicC: "bh"
		},
		zxgz: {
			pageNum: 1,
			pageSize: 25,
			fclass: 0,
			keyName: "TITLE",
			logicC: "bh"
		}
	}
};
const route = {
	path: "/:channel/:category",
	categories: ["government"],
	example: "/cde/news/gzdt",
	parameters: {
		channel: "频道",
		category: "类别"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "首页",
	maintainers: ["Fatpandac"],
	handler,
	description: `- 频道

| 新闻中心 | 政策法规 |
| :------: | :------: |
|   news   |  policy  |

- 类别

| 新闻中心 | 政务新闻 | 要闻导读 | 图片新闻 | 工作动态 |
| :------: | :------: | :------: | :------: | :------: |
|          |   zwxw   |   ywdd   |   tpxw   |   gzdt   |

| 政策法规 | 法律法规 | 中心规章 |
| :------: | :------: | :------: |
|          |   flfg   |   zxgz   |`
};
async function handler(ctx) {
	const channel = ctx.req.param("channel");
	const cate = ctx.req.param("category");
	requestData[channel][cate].pageSize = ctx.req.param("limit") ?? 25;
	const list = (await got_default({
		method: "post",
		url: `${utils_default.rootUrl}/main/${channel}/${cateUrlMap[channel][cate]}`,
		headers: { cookie: await utils_default.getCookie(ctx) },
		form: requestData[channel][cate]
	})).data.data.records.map((item) => {
		const linkMap = {
			news: `${utils_default.rootUrl}/main/${item.isPic ? "newspic/view/" : "news/viewInfoCommon/"}${item.newsIdCode}`,
			policy: `${utils_default.rootUrl}/main/${item.regulatIdCODE ? `policy/regulatview/${item.regulatIdCODE}` : `policy/view/${item.policyIdCODE}`}`
		};
		return {
			title: item.title,
			link: linkMap[channel]
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link, { headers: { cookie: await utils_default.getCookie(ctx) } })).data);
		item.pubDate = parseDate($("div.news_detail_date").text(), "YYYYMMDD");
		item.description = $("div.news_detail_box").find("div.news_detail_title").remove().end().find("div.news_detail_date").remove().end().find("img").remove().end().html();
		return item;
	})));
	return {
		title: `${utils_default.title} - ${cateTitleMap[channel][cate]}`,
		link: channelLinkMap[channel],
		item: items
	};
}
//#endregion
export { route };
