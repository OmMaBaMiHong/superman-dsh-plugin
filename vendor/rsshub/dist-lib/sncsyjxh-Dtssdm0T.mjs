import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tqyb/sncsyjxh.tsx
const rootUrl = "http://www.tqyb.com.cn";
const route = {
	path: "/sncsyjxh",
	categories: ["forecast"],
	example: "/tqyb/sncsyjxh",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.tqyb.com.cn/gz/weatherAlarm/otherCity/"] }],
	name: "广东省内城市预警信号",
	maintainers: ["Fatpandac"],
	handler,
	url: "www.tqyb.com.cn/gz/weatherAlarm/otherCity/"
};
async function handler() {
	const sncsyjxhJsUrl = `${rootUrl}/data/gzWeather/otherCityAlarm.js`;
	const response = await got_default.get(sncsyjxhJsUrl);
	const resData = JSON.parse(String(response.data.match(/Alarm = (.*?);/)[1]));
	const data = [];
	for (const i in resData) for (const j in resData[i]) data.push(resData[i][j]);
	return {
		title: "广东省内城市预警信号",
		link: "http://www.tqyb.com.cn/gz/weatherAlarm/otherCity/",
		item: data.map((item) => ({
			title: item.cname + " " + item.sigtypename,
			link: "http://www.tqyb.com.cn/gz/weatherAlarm/otherCity/",
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("text", { children: [
					"地区： ",
					item.cname,
					" "
				] }),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsxs("text", { children: [
					"等级： ",
					item.sigtypename,
					" "
				] }),
				/* @__PURE__ */ jsx("br", {}),
				/* @__PURE__ */ jsxs("text", { children: ["发布时间：", item.datetime] })
			] })),
			pubDate: timezone(parseDate(item.datetime, "YYYY年MM月DD日 HH:mm"), 8),
			guid: timezone(parseDate(item.datetime, "YYYY年MM月DD日 HH:mm"), 8) + item.cname + item.sigtypename
		}))
	};
}
//#endregion
export { route };
