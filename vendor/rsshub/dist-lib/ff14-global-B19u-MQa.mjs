import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { t as renderDescription } from "./description-CHA5UuRX.mjs";
//#region lib/routes/ff14/ff14-global.ts
const route = {
	path: ["/global/:lang/:type?", "/ff14_global/:lang/:type?"],
	categories: ["game"],
	example: "/ff14/global/na/all",
	parameters: {
		lang: "Region",
		type: "Category, `all` by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "FINAL FANTASY XIV (The Lodestone)",
	maintainers: ["kmod-midori"],
	handler,
	description: `Region

| North Ameria | Europe | France | Germany | Japan |
| ------------ | ------ | ------ | ------- | ----- |
| na           | eu     | fr     | de      | jp    |

Category

| all | topics | notices | maintenance | updates | status | developers |
| --- | ------ | ------- | ----------- | ------- | ------ | ---------- |`
};
async function handler(ctx) {
	const lang = ctx.req.param("lang");
	const type = ctx.req.param("type") ?? "all";
	if (!isValidHost(lang)) throw new InvalidParameterError("Invalid lang");
	const response = await got_default({
		method: "get",
		url: `https://lodestonenews.com/news/${type}?locale=${lang}`
	});
	let data;
	if (type === "all") {
		data = [];
		for (const arr of Object.values(response.data)) data = [...data, ...arr];
	} else data = response.data;
	return {
		title: `FFXIV Lodestone updates (${type})`,
		link: `https://${lang}.finalfantasyxiv.com/lodestone/news/`,
		item: data.map(({ id, url, title, time, description, image }) => ({
			title,
			link: url,
			description: renderDescription({
				image,
				description
			}),
			pubDate: parseDate(time),
			guid: id
		}))
	};
}
//#endregion
export { route };
