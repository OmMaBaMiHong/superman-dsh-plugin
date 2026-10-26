import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nymity/censorbib.ts
const url = "https://censorbib.nymity.ch/";
const route = {
	path: "/censorbib",
	categories: ["journal"],
	example: "/nymity/censorbib",
	radar: [{ source: ["censorbib.nymity.ch/"] }],
	name: "CensorBib Updates",
	maintainers: ["xtexChooser"],
	handler,
	url: "censorbib.nymity.ch/"
};
async function handler() {
	const $ = load((await got_default.get(url)).data);
	const items = $("#container ul li").toArray().map((item) => {
		const c = $(item);
		const id = c.attr("id");
		const title = c.find("span.paper").text().trim();
		const author = c.find("span.author").text().trim();
		const other = c.find("span.other").text().trim();
		const download = c.find("img.icon[title='Download paper']").parent().attr("href");
		const downloadBibTex = c.find("img.icon[title='Download BibTeX']").parent().attr("href");
		const linkToPaper = c.find("img.icon[title='Link to paper']").parent().attr("href");
		return {
			title,
			description: `${other}<br/><br/><a href='${download}'>Download</a><br/><a href='${downloadBibTex}'>Download BibTex</a>`,
			author,
			guid: id,
			link: linkToPaper
		};
	});
	return {
		title: "CensorBib",
		link: url,
		description: "CensorBib Updates",
		item: items
	};
}
//#endregion
export { route };
