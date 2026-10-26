import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tqyb/tfxtq.tsx
const rootUrl = "http://www.tqyb.com.cn";
const route = {
	path: "/tfxtq",
	categories: ["forecast"],
	example: "/tqyb/tfxtq",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.tqyb.com.cn/gz/weatherAlarm/suddenWeather/"] }],
	name: "突发性天气提示",
	maintainers: ["Fatpandac"],
	handler,
	url: "www.tqyb.com.cn/gz/weatherAlarm/suddenWeather/"
};
async function handler() {
	const tfxtqJsUrl = `${rootUrl}/data/gzWeather/weatherTips.js`;
	const response = await got_default.get(tfxtqJsUrl);
	return {
		title: "突发性天气提示",
		link: "http://www.tqyb.com.cn/gz/weatherAlarm/suddenWeather/",
		item: JSON.parse(`[{${response.data.match(/Tips = \{(.*?)\}/)[1]}}]`).map((item) => ({
			title: item.title,
			link: "http://www.tqyb.com.cn/gz/weatherAlarm/suddenWeather/",
			author: item.issuer,
			description: renderToString(/* @__PURE__ */ jsx("p", { children: item.content })),
			pubDate: parseDate(item.ddate),
			guid: parseDate(item.ddate) + item.title
		}))
	};
}
//#endregion
export { route };
