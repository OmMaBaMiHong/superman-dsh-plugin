import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/bitget/announcement.ts
const handler = async (ctx) => {
	const baseUrl = "https://www.bitget.com";
	const announcementApiUrl = `${baseUrl}/v1/msg/push/stationLetterNew`;
	const { type, lang = "zh-CN" } = ctx.req.param();
	const languageCode = lang.replace("-", "_");
	const headers = {
		Referer: baseUrl,
		accept: "application/json, text/plain, */*",
		"content-type": "application/json;charset=UTF-8",
		language: languageCode,
		locale: languageCode
	};
	const pageSize = ctx.req.query("limit") ?? "10";
	const reqBody = {
		pageSize,
		openUnread: 0,
		stationLetterType: "0",
		isPre: false,
		lastEndId: null,
		languageType: 1
	};
	switch (type) {
		case "new-listing":
			reqBody.stationLetterType = "02";
			break;
		case "latest-activities":
			reqBody.stationLetterType = "01";
			break;
		case "new-announcement":
			reqBody.stationLetterType = "06";
			break;
		case "all":
			reqBody.stationLetterType = "0";
			reqBody.excludeStationLetterType = "00";
			break;
		default: throw new Error("Invalid type");
	}
	const response = await cache_default.tryGet(`bitget:announcement:${type}:${pageSize}:${lang}`, async () => {
		const result = await rofetch(announcementApiUrl, {
			method: "POST",
			body: reqBody,
			headers
		});
		if (result?.code !== "200") throw new Error("Failed to fetch announcements, error code: " + result?.code);
		return result;
	}, config.cache.routeExpire, false);
	if (!response) throw new Error("Failed to fetch announcements");
	const items = response.data.items;
	const data = await Promise.all(items.map((item) => cache_default.tryGet(`bitget:announcement:${item.id}:${pageSize}:${lang}`, async () => {
		const date = parseDate(Number(item.sendTime));
		const dataItem = {
			title: item.title ?? "",
			link: item.openUrl ?? "",
			pubDate: item.sendTime ? date : void 0,
			description: item.content ?? ""
		};
		if (item.imgUrl) dataItem.image = item.imgUrl;
		if (item.stationLetterType === "01" || item.stationLetterType === "06") try {
			const $ = load(await rofetch(item.openUrl ?? "", { headers }));
			const nextData = JSON.parse($("script#__NEXT_DATA__").text());
			dataItem.description = nextData.props.pageProps.details?.content || nextData.props.pageProps.pageInitInfo?.ruleContent || item.content || "";
		} catch (error) {
			if (error.name && [
				"HTTPError",
				"RequestError",
				"FetchError"
			].includes(error.name)) dataItem.description = item.content ?? "";
			else throw error;
		}
		return dataItem;
	})));
	return {
		title: `Bitget | ${findTypeLabel(type)}`,
		link: `https://www.bitget.com/${lang}/inmail`,
		item: data
	};
};
const findTypeLabel = (type) => {
	return {
		all: "All",
		"new-listing": "New Listing",
		"latest-activities": "Latest Activities",
		"new-announcement": "New Announcement"
	}[type];
};
const route = {
	path: "/announcement/:type/:lang?",
	categories: ["finance"],
	view: 0,
	example: "/bitget/announcement/all/zh-CN",
	parameters: {
		type: {
			description: "Bitget 通知类型",
			default: "all",
			options: [
				{
					value: "all",
					label: "全部通知"
				},
				{
					value: "new-listing",
					label: "新币上线"
				},
				{
					value: "latest-activities",
					label: "最新活动"
				},
				{
					value: "new-announcement",
					label: "最新公告"
				}
			]
		},
		lang: {
			description: "语言",
			default: "zh-CN",
			options: [
				{
					value: "zh-CN",
					label: "中文"
				},
				{
					value: "en-US",
					label: "English"
				},
				{
					value: "es-ES",
					label: "Español"
				},
				{
					value: "fr-FR",
					label: "Français"
				},
				{
					value: "de-DE",
					label: "Deutsch"
				},
				{
					value: "ja-JP",
					label: "日本語"
				},
				{
					value: "ru-RU",
					label: "Русский"
				},
				{
					value: "ar-SA",
					label: "العربية"
				}
			]
		}
	},
	radar: [{
		source: ["www.bitget.com/:lang/inmail"],
		target: "/announcement/all/:lang"
	}],
	name: "Announcement",
	description: `type:

| Type              | Description |
| ----------------- | ----------- |
| all               | 全部通知    |
| new-listing       | 新币上线    |
| latest-activities | 最新活动    |
| new-announcement  | 最新公告    |

lang:

| Lang  | Description |
| ----- | ----------- |
| zh-CN | 中文        |
| en-US | English     |
| es-ES | Español     |
| fr-FR | Français    |
| de-DE | Deutsch     |
| ja-JP | 日本語      |
| ru-RU | Русский     |
| ar-SA | العربية     |`,
	maintainers: ["YukiCoco"],
	handler
};
//#endregion
export { route };
