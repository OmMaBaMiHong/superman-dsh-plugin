import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/maker.ts
const route = {
	path: "/videos/maker/:maker?/:language?/:mode?",
	categories: ["multimedia"],
	example: "/javlibrary/videos/maker/arlq/cn",
	parameters: {
		maker: "Maker, S1 NO.1 STYLE by default, as `arlq`",
		language: "Language, see below, Japanese by default, as `ja`",
		mode: "Mode, see below, videos with comments (by date) by default, as `1`"
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
	name: "Videos by makers",
	maintainers: [],
	handler,
	description: `| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |`
};
async function handler(ctx) {
	const mode = ctx.req.param("mode") ?? "1";
	const maker = ctx.req.param("maker") ?? "arlq";
	const language = ctx.req.param("language") ?? "ja";
	return await ProcessItems(language, `${rootUrl}/${language}/vl_maker.php?list&m=${maker}&mode=${mode}`);
}
//#endregion
export { route };
