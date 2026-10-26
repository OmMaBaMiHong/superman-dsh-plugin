import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/tencent/qq/sdk/changelog.ts
const route = {
	path: "/qq/sdk/changelog/:platform",
	categories: ["program-update"],
	example: "/tencent/qq/sdk/changelog/iOS",
	parameters: { platform: "平台，iOS / Android" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "更新日志",
	maintainers: ["nuomi1"],
	handler
};
async function handler(ctx) {
	const platform = ctx.req.param("platform");
	let title;
	let link;
	if (platform === "iOS") {
		title = "iOS SDK 历史变更";
		link = "https://wiki.connect.qq.com/ios_sdk历史变更";
	} else if (platform === "Android") {
		title = "Android SDK 历史变更";
		link = "https://wiki.connect.qq.com/android_sdk历史变更";
	} else throw new InvalidParameterError("not support platform");
	const $ = load((await got_default.get(link)).data);
	const contents = $(".wp-editor").children("p").filter((_, element) => $(element).text() !== "");
	const pList = [];
	const titleIndex = [];
	contents.each((index, element) => {
		if ($(element).find("strong").length) titleIndex.push(index);
		pList.push($(element).text().replace("\n", ""));
	});
	const changelogs = titleIndex.map((_, index) => {
		const section = pList.slice(titleIndex[index], titleIndex[index + 1]);
		return {
			title: section[0],
			description: section.slice(1).join("\n")
		};
	});
	return {
		title,
		link,
		item: changelogs
	};
}
//#endregion
export { route };
