import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/commonhealth/index.tsx
const apiKey = "Cah2snYi52eJjpshbIfof1Tpx8ZhzXqh";
const route = {
	path: "/",
	name: "最新內容",
	url: "commonhealth.com.tw",
	maintainers: ["johan456789"],
	example: "/commonhealth",
	categories: ["traditional-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.commonhealth.com.tw/"],
		target: "/"
	}],
	handler
};
async function handler() {
	return {
		title: "康健",
		link: "https://www.commonhealth.com.tw",
		language: "zh-TW",
		item: (await rofetch("https://api-ch.commonhealth.com.tw/api/v3.0/latest_article/channel/focus/list", {
			headers: {
				accept: "application/json",
				"api-key": apiKey
			},
			query: { page: 1 }
		})).items.list.map((item) => {
			const description = renderDescription(item.image, item.preface);
			return {
				title: item.title,
				link: item.link,
				pubDate: parseDate(item.item_datetime),
				description
			};
		})
	};
}
const renderDescription = (image, preface) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", {
	src: image,
	alt: "article image"
}), /* @__PURE__ */ jsx("p", { children: preface })] }));
//#endregion
export { route };
