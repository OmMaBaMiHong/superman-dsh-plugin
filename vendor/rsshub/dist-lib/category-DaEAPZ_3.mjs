import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as getXWLB } from "./xwlb-BXQhCHWN.mjs";
import path from "node:path";
import { load } from "cheerio";
//#region lib/routes/cctv/utils/mzzlbg.ts
const getMzzlbg = async () => {
	const data = (await got_default({
		method: "get",
		url: "https://api.cntv.cn/video/videolistById?serviceId=cbox&vsid=C10354&em=01&p=1&n=50"
	})).data;
	return {
		title: "每周质量报告",
		link: "https://tv.cctv.com/lm/mzzlbg/videoset/index.shtml",
		description: "《每周质量报告》是CCTV-新闻频道一档以消费者为核心收视人群的新闻专题栏目。创办于2003年，始终致力于产品质量和食品安全领域的调查报道，以打假除劣扶优，推动质量进步为第一诉求，是我国电视新闻界质量新闻领域的旗帜性节目。首播时间：CCTV-新闻周日12:35—12:55。",
		item: await Promise.all(data.video.map(async (video) => {
			const url = `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${video.vid}`;
			const item = {
				title: video.t,
				description: video.desc,
				link: video.url,
				pubDate: timezone(parseDate(video.ptime), 8)
			};
			const { data: videoDetail } = await got_default({
				method: "get",
				url
			});
			item.description += `<br><video src="${videoDetail.hls_url}" controls="controls" poster="${video.img.replaceAll(/\?.+/g, "")}" style="width: 100%"></video>`;
			return item;
		}))
	};
};
//#endregion
//#region lib/routes/cctv/utils/news.ts
const getNews = async (category) => {
	const response = await got_default({
		method: "get",
		url: `https://news.cctv.com/2019/07/gaiban/cmsdatainterface/page/${category}_1.jsonp`,
		headers: { Referer: `http://news.cctv.com/${category}` },
		headerGeneratorOptions: PRESETS.MODERN_IOS
	});
	const list = JSON.parse(response.data.slice(category.length + 1, -1)).data.list;
	const resultItem = await Promise.all(list.map(({ title, url, focus_date, image }) => cache_default.tryGet(`cctv-news: ${url}`, async () => {
		const item = {
			title,
			link: url,
			pubDate: timezone(parseDate(focus_date), 8)
		};
		const id = path.parse(url).name;
		const unknownTip = "未知类型，请点击<a href=\"https://github.com/DIYgod/RSSHub/issues\">链接</a>提交issue";
		let description;
		let api;
		let type;
		let author;
		if (id.startsWith("ART")) {
			api = `https://api.cntv.cn/Article/getXinwenNextArticleInfo?serviceId=sjnews&id=${id}&t=json`;
			type = "ART";
		} else if (id.startsWith("PHO")) {
			api = `https://api.cntv.cn/Article/contentinfo?id=${id}&serviceId=sjnews&t=json`;
			type = "PHO";
		} else if (id.startsWith("VIDE")) {
			api = `https://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${path.parse(image).name.split("-", 1)[0]}`;
			type = "VIDE";
		} else description = unknownTip;
		if (api) {
			const { data } = await got_default({
				method: "get",
				url: api,
				headerGeneratorOptions: PRESETS.MODERN_IOS
			});
			switch (type) {
				case "ART":
					description = data.article_content;
					author = data.article_source;
					break;
				case "PHO":
					description = "";
					for (const { photo_url, photo_name, photo_brief } of data.photo_album_list) description += `
                                    <img src=${photo_url} /><br>
                                    <strong>${photo_name}</strong><br>
                                    ${photo_brief}<br>
                                `;
					author = data.source;
					break;
				case "VIDE":
					description = `<video src="${data.hls_url}" controls="controls" poster="${image}" style="width: 100%"></video>`;
					author = data.article_source;
					break;
				default: description = unknownTip;
			}
		}
		item.description = description;
		item.author = author;
		return item;
	})));
	return {
		title: `央视新闻 ${category}`,
		link: `https://news.cctv.com/${category}`,
		description: `央视新闻 ${category}`,
		item: resultItem
	};
};
//#endregion
//#region lib/routes/cctv/utils/xinwen1j1.ts
async function loadContent(link) {
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const guid = ("" + $("script")).split("guid_Ad_VideoCode = \"", 2)[1].split("\";", 1)[0];
	const { data: videoDetail } = await got_default({
		method: "get",
		url: `http://vdn.apps.cntv.cn/api/getHttpVideoInfo.do?pid=${guid}`
	});
	return { description: `${$("meta[name=description]").attr("content")}<br><video src="${videoDetail.hls_url}" controls="controls"  style="width: 100%"></video>` };
}
const ProcessFeed = (data) => Promise.all(data.list.map(async (data) => {
	const title = data.title;
	const itemUrl = data.url;
	const single = {
		title,
		link: itemUrl,
		author: "央视新闻",
		guid: itemUrl,
		pubDate: parseDate(data.focus_date)
	};
	const other = await cache_default.tryGet(itemUrl, () => loadContent(itemUrl));
	return {
		...single,
		...other
	};
}));
const xinwen1j1 = async () => {
	const baseUrl = "https://api.cntv.cn/NewVideo/getVideoListByColumn?id=TOPC1451559066181661&n=20&sort=desc&p=1&mode=0&serviceId=tvcctv";
	const data = (await got_default({
		method: "get",
		url: baseUrl,
		headers: { Referer: "https://tv.cctv.com/lm/xinwen1j1/videoset/index.shtml#&Type=0" }
	})).data.data;
	return {
		title: "《新闻1+1》- 中央电视台新闻频道",
		link: baseUrl,
		description: "《新闻1+1》是中央电视台新闻频道的一档访谈类栏目。周一至周五，从时事政策、公共话题、突发事件等大型选题中选取当天最新、最热、最快的新闻话题，还原新闻全貌、解读事件真相，力求以精度、纯度和锐度为新闻导向，呈现最质朴的新闻。首播：CCTV-新闻：周一至周五21:30—21:55；重播：次日01:30，04:30。",
		item: await ProcessFeed(data)
	};
};
//#endregion
//#region lib/routes/cctv/category.ts
const route = {
	path: "/:category",
	categories: ["traditional-media"],
	example: "/cctv/world",
	parameters: { category: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.cctv.com/:category"] }],
	name: "专题",
	maintainers: ["idealclover", "xyqfer"],
	handler,
	description: `| 新闻 | 国内  | 国际  | 社会    | 法治 | 文娱 | 科技 | 生活 | 教育 | 每周质量报告 | 新闻 1+1  |
| ---- | ----- | ----- | ------- | ---- | ---- | ---- | ---- | ---- | ------------ | --------- |
| news | china | world | society | law  | ent  | tech | life | edu  | mzzlbg       | xinwen1j1 |`
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	switch (category) {
		case "mzzlbg": return await getMzzlbg();
		case "xinwen1j1": return await xinwen1j1();
		case "xwlb": return await getXWLB();
		default: return await getNews(category);
	}
}
//#endregion
export { route };
