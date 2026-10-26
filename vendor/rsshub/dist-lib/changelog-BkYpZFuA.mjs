import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/imagemagick/changelog.ts
const md = markdownit({ html: true });
const route = {
	path: "/changelog",
	categories: ["program-update"],
	example: "/imagemagick/changelog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"imagemagick.org/script/download.php",
		"imagemagick.org/script",
		"imagemagick.org/"
	] }],
	name: "Changelog",
	maintainers: ["nczitzk"],
	handler,
	url: "imagemagick.org/script/download.php"
};
async function handler() {
	const currentUrl = `https://imagemagick.org/script/download.php`;
	const logUrl = "https://github.com/ImageMagick/Website/blob/main/ChangeLog.md";
	const response = await got_default({
		method: "get",
		url: "https://raw.githubusercontent.com/ImageMagick/Website/main/ChangeLog.md"
	});
	const $ = load(md.render(response.data));
	return {
		title: "ImageMagick - ChangeLog",
		link: currentUrl,
		item: $("h2").toArray().map((item) => {
			item = $(item);
			const title = item.text();
			let description = "";
			item.nextUntil("h2").each((_, el) => {
				description += $(el).html();
			});
			return {
				title,
				description,
				link: `${logUrl}#${title.replaceAll(/\s+/g, "-").replaceAll(".", "")}`,
				pubDate: parseDate(title.match(/- (\d{4}-\d{2}-\d{2})/)[1])
			};
		})
	};
}
//#endregion
export { route };
