import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as render3DaysDescription } from "./util-DlGczgEh.mjs";
//#region lib/routes/qweather/3days.ts
const author = "QWeather";
const route = {
	path: "/3days/:location",
	categories: ["forecast"],
	example: "/qweather/3days/广州",
	parameters: { location: "N" },
	features: {
		requireConfig: [{
			name: "HEFENG_KEY",
			description: "QWeather API KEY"
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
	name: "近三天天气",
	maintainers: ["Rein-Ou", "la3rence"],
	handler,
	description: "获取订阅近三天天气预报"
};
async function handler(ctx) {
	if (!config.hefeng.key || !config.hefeng.apiHost) throw new ConfigNotFoundError("QWeather RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/zh/install/config#%E5%92%8C%E9%A3%8E%E5%A4%A9%E6%B0%94\">relevant config</a>");
	const WEATHER_API = `https://${config.hefeng.apiHost}/v7/weather/3d`;
	const AIR_QUALITY_API = `https://${config.hefeng.apiHost}/v7/air/5d`;
	const CIRY_LOOKUP_API = `https://${config.hefeng.apiHost}/geo/v2/city/lookup`;
	const id = await cache_default.tryGet("qweather:" + ctx.req.param("location") + ":id", async () => {
		return (await got_default(`${CIRY_LOOKUP_API}?location=${ctx.req.param("location")}&key=${config.hefeng.key}`)).data.location[0].id;
	});
	const weatherData = await cache_default.tryGet("qweather:" + ctx.req.param("location"), async () => {
		return (await got_default(`${WEATHER_API}?key=${config.hefeng.key}&location=${id}`)).data;
	}, config.cache.contentExpire, false);
	const airQualityData = await cache_default.tryGet(`qweather:air:${ctx.req.param("location")}`, async () => {
		return (await got_default(`${AIR_QUALITY_API}?location=${id}&key=${config.hefeng.key}`)).data;
	}, config.cache.contentExpire, false);
	const combined = {
		updateTime: weatherData.updateTime,
		fxLink: weatherData.fxLink,
		daily: weatherData.daily.map((weatherItem) => {
			const dailyAirQuality = airQualityData.daily.find((airQualityItem) => airQualityItem.fxDate === weatherItem.fxDate);
			if (dailyAirQuality) return {
				...weatherItem,
				aqi: dailyAirQuality.aqi,
				aqiLevel: dailyAirQuality.level,
				aqiCategory: dailyAirQuality.category,
				aqiPrimary: dailyAirQuality.primary
			};
			return weatherItem;
		})
	};
	const items = combined.daily.map((item) => ({
		title: `${item.fxDate}: ${item.textDay === item.textNight ? item.textDay : item.textDay + "转" + item.textNight} ${item.tempMin}~${item.tempMax}℃`,
		description: render3DaysDescription(item),
		pubDate: combined.updateTime,
		guid: "位置：" + ctx.req.param("location") + "--日期：" + item.fxDate,
		link: combined.fxLink,
		author
	}));
	return {
		title: ctx.req.param("location") + "未来三天天气",
		description: ctx.req.param("location") + "未来三天天气情况，使用和风彩云 API (包括空气质量)",
		item: items,
		link: combined.fxLink,
		author
	};
}
//#endregion
export { route };
