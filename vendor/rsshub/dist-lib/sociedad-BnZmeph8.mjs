import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as getItems } from "./items-processor-Xam83oUy.mjs";
import { load } from "cheerio";
//#region lib/routes/publico/sociedad.ts
const route = {
	path: "/sociedad/:subsection?",
	parameters: { subsection: { description: "Filter by subsection. Check the subsections available on the newspaper's website." } },
	categories: ["traditional-media"],
	example: "/publico/sociedad",
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["publico.es/sociedad"],
		target: "/sociedad"
	}],
	name: "Sociedad",
	maintainers: ["adrianrico97"],
	handler
};
async function handler(ctx) {
	const { subsection } = ctx.req.param();
	const rootUrl = "https://www.publico.es";
	const currentUrl = subsection ? `${rootUrl}/sociedad/${subsection}` : `${rootUrl}/sociedad`;
	return {
		title: "Medio Ambiente | Sociedad | Público",
		link: currentUrl,
		item: getItems(load((await got_default({
			method: "get",
			url: currentUrl
		})).data))
	};
}
//#endregion
export { route };
