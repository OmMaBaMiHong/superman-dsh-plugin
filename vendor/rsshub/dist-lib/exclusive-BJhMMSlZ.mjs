import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/163/templates/exclusive.tsx
const renderExclusiveDescription = ({ image, video, digest }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsx("img", { src: image }) : null,
	video ? /* @__PURE__ */ jsx("video", {
		controls: true,
		children: /* @__PURE__ */ jsx("source", {
			src: video,
			type: "video/mp4"
		})
	}) : null,
	digest ? /* @__PURE__ */ jsx("p", { children: digest }) : null
] }));
//#endregion
//#region lib/routes/163/exclusive.ts
const ids = {
	"": {
		id: "BAI5E21O",
		title: "首页"
	},
	qsyk: {
		id: "BD21K0DL",
		title: "轻松一刻"
	},
	cz: {
		id: "CICMICLU",
		title: "槽值"
	},
	rj: {
		id: "CICMOMBL",
		title: "人间"
	},
	dgxm: {
		id: "CICMPVC5",
		title: "大国小民"
	},
	ssyg: {
		id: "CICMLCOU",
		title: "三三有梗"
	},
	sd: {
		id: "D551V75C",
		title: "数读"
	},
	kk: {
		id: "D55253RH",
		title: "看客"
	},
	xhx: {
		id: "D553A53L",
		title: "下划线"
	},
	txs: {
		id: "D553PGHQ",
		title: "谈心社"
	},
	dd: {
		id: "CICMS5BI",
		title: "哒哒"
	},
	pbgl: {
		id: "CQ9UDVKO",
		title: "胖编怪聊"
	},
	qyd: {
		id: "CQ9UJIJN",
		title: "曲一刀"
	},
	jrzs: {
		id: "BD284UM8",
		title: "今日之声"
	},
	lc: {
		id: "CICMMGBH",
		title: "浪潮"
	},
	fd: {
		id: "D5543R68",
		title: "沸点"
	}
};
const route = {
	path: "/exclusive/:id?",
	categories: ["new-media"],
	example: "/163/exclusive/qsyk",
	parameters: { id: "栏目, 默认为首页" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["3g.163.com/touch/exclusive/sub/:id"] }],
	name: "栏目",
	maintainers: ["nczitzk"],
	handler,
	description: `| 分类     | 编号 |
| -------- | ---- |
| 首页     |      |
| 轻松一刻 | qsyk |
| 槽值     | cz   |
| 人间     | rj   |
| 大国小民 | dgxm |
| 三三有梗 | ssyg |
| 数读     | sd   |
| 看客     | kk   |
| 下划线   | xhx  |
| 谈心社   | txs  |
| 哒哒     | dd   |
| 胖编怪聊 | pbgl |
| 曲一刀   | qyd  |
| 今日之声 | jrzs |
| 浪潮     | lc   |
| 沸点     | fd   |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "";
	const rootUrl = "https://3g.163.com";
	const currentUrl = `${rootUrl}/touch/exclusive${id ? `/sub/${id}` : ""}`;
	const response = await got_default({
		method: "get",
		url: `${rootUrl}/touch/reconstruct/article/list/${ids[id].id}wangning/0-20.html`
	});
	let items = JSON.parse(response.data.match(/^artiList\((.*)\)$/)[1])[`${ids[id].id}wangning`].map((item) => ({
		title: item.title,
		author: item.source,
		link: item.skipURL || item.url || `${rootUrl}/dy/article/${item.docid}.html`,
		pubDate: timezone(parseDate(item.ptime), 8),
		videoId: item.skipType === "video" ? item.stitle : ""
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			if (item.videoId) {
				const detailResponse = await got_default({
					method: "get",
					url: `${rootUrl}/touch/video/detail/jsonp/VIA8K0PTB.html?callback=videoList`
				});
				const video = JSON.parse(detailResponse.data.match(/^videoList\((.*)\)$/)[1])?.mp4_url;
				item.description = renderExclusiveDescription({ video });
			} else {
				const content = load((await got_default({
					method: "get",
					url: item.link
				})).data);
				content(".m-linkCard").remove();
				content(".m-photo").each((_, el) => {
					content(el).html(renderExclusiveDescription({ image: content(el).find("img").attr("data-src") }));
				});
				item.description = content(".article-body").html();
			}
		} catch {}
		delete item.videoId;
		return item;
	})));
	return {
		title: `网易独家 - ${ids[id].title}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
