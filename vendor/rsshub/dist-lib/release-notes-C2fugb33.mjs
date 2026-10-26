import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/postman/release-notes.ts
const md = markdownit({ html: true });
const route = {
	path: "/release-notes",
	categories: ["program-update"],
	example: "/postman/release-notes",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["postman.com/downloads/release-notes", "postman.com/"] }],
	name: "Release Notes",
	maintainers: ["nczitzk"],
	handler,
	url: "postman.com/downloads/release-notes"
};
async function handler() {
	const rootUrl = "https://www.postman.com";
	const apiUrl = `${rootUrl}/mkapi/release.json`;
	const currentUrl = `${rootUrl}/downloads/release-notes`;
	return {
		title: "Release Notes | Postman",
		link: currentUrl,
		item: (await got_default({
			method: "get",
			url: apiUrl
		})).data.notes.map((item) => ({
			title: item.version,
			link: `${currentUrl}#${item.version}`,
			description: md.render(item.content)
		}))
	};
}
//#endregion
export { route };
