import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/bestreviews.ts
const route = {
	path: "/bestreviews/:language?/:mode?",
	categories: ["multimedia"],
	example: "/javlibrary/bestreviews/en",
	parameters: {
		language: "Language, see below, Japanese by default, as `ja`",
		mode: "Mode, see below, Last Month by default, as `1`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Best Reviews",
	maintainers: ["nczitzk"],
	handler,
	description: `| Last Month | All Time |
| ---------- | -------- |
| 1          | 2        |`
};
async function handler(ctx) {
	const mode = ctx.req.param("mode") ?? "1";
	const language = ctx.req.param("language") ?? "ja";
	return await ProcessItems(language, `${rootUrl}/${language}/tl_bestreviews.php?list&mode=${mode}`);
}
//#endregion
export { route };
