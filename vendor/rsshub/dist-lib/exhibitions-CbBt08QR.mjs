import { t as buildData } from "./common-config-072DXp-h.mjs";
//#region lib/routes/newmuseum/exhibitions.ts
const route = {
	path: "/exhibitions",
	categories: ["travel"],
	example: "/newmuseum/exhibitions",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Exhibitions",
	maintainers: ["chazeon"],
	handler
};
async function handler(ctx) {
	let link;
	const state = ctx.req.query("state");
	switch (state) {
		case void 0:
		case "current":
			link = "https://www.newmuseum.org/exhibitions/";
			break;
		default: link = `https://www.newmuseum.org/exhibitions/${state}`;
	}
	return await buildData({
		link,
		url: link,
		title: "New Museum - Exhibitions",
		item: {
			item: ".exh",
			title: `$('.exh .title').text()`,
			link: `$('.exh > a').attr('href')`,
			description: `$('.exh .body-reveal').text()`
		}
	});
}
//#endregion
export { route };
