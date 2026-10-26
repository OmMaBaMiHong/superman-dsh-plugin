import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import gPlay from "google-play-scraper";
//#region lib/routes/google/play.ts
const route = {
	name: "Play Store Update",
	path: "/play/:id/:lang?",
	categories: ["program-update"],
	example: "/google/play/net.dinglisch.android.taskerm",
	parameters: {
		id: "Package id, can be found in url",
		lang: {
			description: "language",
			options: [{
				value: "en-us",
				label: "English"
			}, {
				value: "zh-cn",
				label: "简体中文"
			}],
			default: "en-us"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["play.google.com/store/apps/details?id=:id"] }],
	maintainers: ["surwall"],
	handler
};
const keywords = {
	aboutThisAppButton: {
		"en-us": "See more information on About this app",
		"zh-cn": "查看“关于此应用”的更多相关信息"
	},
	whatsNew: {
		"en-us": "What’s new",
		"zh-cn": "新变化"
	},
	updatedOn: {
		"en-us": "Updated on",
		"zh-cn": "更新日期"
	},
	updatedOnFormat: {
		"en-us": ["MMM D, YYYY", "en"],
		"zh-cn": ["YYYY年M月D日"]
	},
	version: {
		"en-us": "Version",
		"zh-cn": "版本"
	},
	offeredBy: {
		"en-us": "Offered by",
		"zh-cn": "提供方"
	}
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const lang = ctx.req.param("lang") ?? "en-us";
	const baseurl = "https://play.google.com/store/apps";
	const hl = lang.split("-", 1)[0].toLowerCase();
	const gl = lang.split("-", 2)[1].toLowerCase();
	const link = `${baseurl}/details?id=${id}&hl=${hl}&gl=${gl}`;
	const appInfo = await gPlay.app({
		appId: id,
		lang: hl,
		country: gl
	});
	const appName = appInfo.title;
	const appImage = appInfo.icon;
	const version = appInfo.version;
	const offeredBy = appInfo.developer || appInfo.developerLegalName;
	const updatedDate = parseDate(appInfo.updated);
	const whatsNew = appInfo.recentChanges;
	const feedContent = `
            <h2>${keywords.whatsNew[lang]}</h2>
            <p>${whatsNew ?? "No release notes"}</p>
        `;
	return {
		title: appName + " - Google Play",
		link,
		image: appImage,
		item: [{
			title: formatVersion(version, updatedDate),
			description: feedContent,
			link,
			pubDate: updatedDate,
			guid: formatGuid(version, updatedDate),
			author: offeredBy
		}]
	};
}
function formatVersion(version, updatedDate) {
	return /^\d/.test(version) ? version : updatedDate.toISOString().slice(0, 10);
}
function formatGuid(version, updatedDate) {
	return updatedDate.getTime().toString() + "-" + version;
}
//#endregion
export { route };
