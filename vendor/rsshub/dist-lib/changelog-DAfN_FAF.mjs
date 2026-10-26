import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/eagle/changelog.ts
const route = {
	path: "/changelog/:language?",
	categories: ["program-update"],
	example: "/eagle/changelog/en",
	parameters: { language: "Language, see list, default to be `cn`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Changelog",
	maintainers: ["tigercubden"],
	handler,
	description: `Language

| Simplified Chinese | Traditional Chinese | English |
| ------------------ | ------------------- | ------- |
| cn                 | tw                  | en      |`
};
async function handler(ctx) {
	let language = ctx.req.param("language");
	let changelog = "";
	if (language === void 0 || !(language === "tw" || language === "en")) {
		language = "cn";
		changelog = "更新日志";
	}
	if (language === "tw") changelog = "更新日誌";
	else if (language === "en") changelog = "Release Notes";
	const data = (await got_default({
		method: "get",
		url: `https://${language}.eagle.cool/changelog`,
		headers: { Referer: `https://${language}.eagle.cool/` }
	})).data;
	const $ = load(data);
	const list = $(".version");
	return {
		title: `Eagle ${changelog}`,
		link: `https://${language}.eagle.cool/changelog`,
		description: `Eagle ${changelog}`,
		item: list.toArray().map((item) => {
			item = $(item);
			function getDate() {
				const str = item.find(".date").text();
				let date = "";
				if (language === "cn" || language === "tw") {
					const patt = /\d+/g;
					let result;
					while ((result = patt.exec(str)) !== null) date += result + "-";
					date = date.replaceAll(/-$/g, "");
				} else if (language === "en") date = str.replaceAll("RELEASED", "");
				return date;
			}
			return {
				title: item.find(".ver").text(),
				description: item.find(".logs").html(),
				link: `https://${language}.eagle.cool/changelog`,
				pubDate: parseDate(getDate()),
				guid: item.find(".ver").text()
			};
		})
	};
}
//#endregion
export { route };
