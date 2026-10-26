import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { n as renderNowDescription } from "./util-DlGczgEh.mjs";
//#region lib/routes/qweather/now.ts
const route = {
	path: "/now/:location",
	categories: ["forecast"],
	example: "/qweather/now/广州",
	parameters: { location: "N" },
	features: {
		requireConfig: [{
			name: "HEFENG_KEY",
			description: "访问 `https://www.qweather.com/` 注册开发 API Key。"
		}, {
			name: "HEFENG_API_HOST",
			description: "This is required after 2026/01/01: https://blog.qweather.com/announce/public-api-domain-change-to-api-host/"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "实时天气",
	maintainers: ["Rein-Ou"],
	handler
};
async function handler(ctx) {
	if (!config.hefeng.key || !config.hefeng.apiHost) throw new ConfigNotFoundError("QWeather RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/zh/install/config#%E5%92%8C%E9%A3%8E%E5%A4%A9%E6%B0%94\">relevant config</a>");
	const NOW_WEATHER_API = `https://${config.hefeng.apiHost}/v7/weather/now`;
	const CIRY_LOOKUP_API = `https://${config.hefeng.apiHost}/geo/v2/city/lookup`;
	const id = await cache_default.tryGet("qweather:" + ctx.req.param("location") + ":id", async () => {
		return (await got_default(`${CIRY_LOOKUP_API}?location=${ctx.req.param("location")}&key=${config.hefeng.key}`)).data.location.map((loc) => loc)[0].id;
	});
	const requestUrl = `${NOW_WEATHER_API}?key=${config.hefeng.key}&location=${id}`;
	const responseData = await cache_default.tryGet("qweather:" + ctx.req.param("location") + ":now", async () => {
		return (await got_default(requestUrl)).data;
	}, 3600, false);
	const data = [responseData.now];
	const timeObj = parseDate(responseData.updateTime);
	const time_show = timeObj.toLocaleString();
	return {
		title: ctx.req.param("location") + "实时天气",
		description: ctx.req.param("location") + "实时天气状况",
		item: data.map((item) => ({
			title: "观测时间：" + time_show,
			description: renderNowDescription(item),
			pubDate: timeObj,
			guid: "位置:" + ctx.req.param("location") + "--时间：" + time_show,
			link: responseData.fxLink
		})),
		link: responseData.fxLink
	};
}
//#endregion
export { route };
