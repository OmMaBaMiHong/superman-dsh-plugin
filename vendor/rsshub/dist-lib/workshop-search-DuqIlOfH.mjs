import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/steam/workshop-search.tsx
const route = {
	path: "/workshopsearch/:appid?/:routeParams?",
	categories: ["game"],
	example: "/steam/workshopsearch/730",
	parameters: {
		appid: "Steam appid, can be found on the community hub page or store page URL, 730 by default.",
		routeParams: "Route parameters, can be found on the search result page URL. Route parameters located after the appid."
	},
	radar: [{
		title: "Workshop Search Results",
		source: ["steamcommunity.com/app/:appid/workshop/"],
		target: "/workshopsearch/:appid"
	}],
	description: `Steam Community Workshop Search Results.
The parameter 'l=language' changes the language of search results(if possible).
For example, route \`/workshopsearch/730/l=schinese\` will display the simplified Chinese descriptions of the entry.

Language Parameter:

| English | 简体中文 | 繁體中文 | 日本語   | 한국어  | ภาษาไทย | български | čeština | dansk  | Deutsch | español | latam | ελληνικά | français | italiano | Bahasa Indonesia | magyar    | Nederlands | norsk     | polski | português  | brasileiro | română   | русский | suomi   | svenska | Türkçe  | Tiếng Việt | українська |
| ------- | -------- | -------- | -------- | ------- | ------- | --------- | ------- | ------ | ------- | ------- | ----- | -------- | -------- | -------- | ---------------- | --------- | ---------- | --------- | ------ | ---------- | ---------- | -------- | ------- | ------- | ------- | ------- | ---------- | ---------- |
| english | schinese | tchinese | japanese | koreana | thai    | bulgarian | czech   | danish | german  | spanish | latam | greek    | french   | italian  | indonesian       | hungarian | dutch      | norwegian | polish | portuguese | brazilian  | romanian | russian | finnish | swedish | turkish | vietnamese | ukrainian  |`,
	name: "Community Workshop Search",
	maintainers: ["NyaaaDoge"],
	handler: async (ctx) => {
		const { appid = 730, routeParams } = ctx.req.param();
		const $ = load(await rofetch(`https://steamcommunity.com/workshop/browse/?appid=${appid}${routeParams ? `&${routeParams}` : ""}`));
		const appName = $("div.apphub_AppName").first().text();
		const workshopDescription = $("div.customBrowseText").first().text();
		const appIcon = $("div.apphub_AppIcon").children("img").attr("src");
		const items = $("div.workshopBrowseItems .workshopItem").toArray().map((item) => {
			item = $(item);
			const publishedFileId = item.find("a").first().attr("data-publishedfileid");
			const entryTitle = item.find(".workshopItemTitle").first().text();
			const authorNickName = item.find(".workshop_author_link").first().text();
			const previewImage = item.find(".workshopItemPreviewImage").first().attr("src");
			const ratingImage = item.find(".fileRating").first().attr("src");
			const checkMarkImages = [];
			$(item).find(".workshop_checkmark").each((index, element) => {
				const checkMarkElement = $(element);
				const style = checkMarkElement.attr("style");
				if (!style || !style.includes("display: none;")) checkMarkImages.push(checkMarkElement.attr("src") || "");
			});
			const match = item.next("script").text().match(/SharedFileBindMouseHover\(\s*"sharedfile_\d+",\s*(?:true|false),\s*(\{.*?\})\s*\);/);
			let entryDescription = "";
			if (match) {
				const jsonString = match[1];
				const data = JSON.parse(jsonString);
				if (data.id === publishedFileId) entryDescription = data.description;
			}
			return {
				title: entryTitle,
				link: `https://steamcommunity.com/sharedfiles/filedetails/?id=${publishedFileId}`,
				description: renderToString(/* @__PURE__ */ jsx(SteamWorkshopDescription, {
					image: previewImage,
					rating: ratingImage,
					checkmark: checkMarkImages,
					description: entryDescription
				})),
				author: authorNickName
			};
		});
		return {
			title: `${appName} Steam Workshop Content`,
			link: `https://steamcommunity.com/workshop/browse/?appid=${appid}${routeParams ? `&${routeParams}` : ""}`,
			item: items,
			icon: appIcon,
			description: workshopDescription
		};
	}
};
const SteamWorkshopDescription = ({ image, rating, checkmark, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	image ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), /* @__PURE__ */ jsx("br", {})] }) : null,
	rating ? /* @__PURE__ */ jsx("img", { src: rating }) : null,
	checkmark?.map((mark) => /* @__PURE__ */ jsx("img", { src: mark })),
	/* @__PURE__ */ jsx("p", { children: description })
] });
//#endregion
export { route };
