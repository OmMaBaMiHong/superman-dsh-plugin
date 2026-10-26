import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/myfigurecollection/activity.tsx
const route = {
	path: "/activity/:category?/:language?/:latestAdditions?/:latestEdits?/:latestAlerts?/:latestPictures?",
	categories: ["shopping"],
	example: "/myfigurecollection/activity",
	parameters: {
		category: "Category, Figures by default",
		language: "Language, as above, `en` by default",
		latestAdditions: "Latest Additions, on as `1` by default, off as `0`",
		latestEdits: "Changes, on as `1` by default, off as `0`",
		latestAlerts: "Alerts, on as `1` by default, off as `0`",
		latestPictures: "Pictures, on as `1` by default, off as `0`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["zh.myfigurecollection.net/browse", "zh.myfigurecollection.net/"],
		target: "/:category?/:language?"
	}],
	name: "Activity",
	maintainers: ["nczitzk"],
	handler,
	url: "zh.myfigurecollection.net/browse",
	description: `Category

| Figures | Goods | Media |
| ------- | ----- | ----- |
| 0       | 1     | 2     |

Language

| Id | Language   |
| -- | ---------- |
|    | en         |
| de | Deutsch    |
| es | Español    |
| fi | Suomeksi   |
| fr | Français   |
| it | Italiano   |
| ja | 日本語     |
| nl | Nederlands |
| no | Norsk      |
| pl | Polski     |
| pt | Português  |
| ru | Русский    |
| sv | Svenska    |
| zh | 中文       |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "-1";
	const language = ctx.req.param("language") ?? "";
	const latestAdditions = ctx.req.param("latestAdditions") ?? "1";
	const latestEdits = ctx.req.param("latestEdits") ?? "1";
	const latestAlerts = ctx.req.param("latestAlerts") ?? "1";
	const latestPictures = ctx.req.param("latestPictures") ?? "1";
	if (language && !isValidHost(language)) throw new InvalidParameterError("Invalid language");
	const rootUrl = `https://${language === "en" || language === "" ? "" : `${language}.`}myfigurecollection.net`;
	const currentUrl = `${rootUrl}/browse.v4.php?mode=activity&latestAdditions=${latestAdditions}&latestEdits=${latestEdits}&latestAlerts=${latestAlerts}&latestPictures=${latestPictures}&rootId=${category}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $(".activity-wrapper").toArray().map((item) => {
		item = $(item);
		return {
			title: `${item.find(".activity-label").text().split(" • ", 1)[0]}: ${item.find(".stamp-anchor").text()}`,
			link: `${rootUrl}${item.find(".stamp-anchor .tbx-tooltip").attr("href")}`,
			pubDate: timezone(parseDate(item.find(".activity-time span").attr("title")), 0),
			author: item.find(".user-anchor").text(),
			description: renderDescription(item.find(".changelog").text(), item.find(".picture-icon").toArray().map((image) => $(image).html().match(/url\((.*)\)/)[1].replace(/\/thumbnails/, "")))
		};
	});
	return {
		title: $("title").text().replace(/ \(.*\)/, ""),
		link: currentUrl,
		item: items
	};
}
const renderDescription = (changelog, pictures) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [changelog ? /* @__PURE__ */ jsxs(Fragment, { children: ["Changed field: ", changelog] }) : null, pictures?.map((picture, index) => /* @__PURE__ */ jsx("img", { src: picture }, `${picture}-${index}`))] }));
//#endregion
export { route };
