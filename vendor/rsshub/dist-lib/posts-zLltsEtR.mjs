import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/hedwig/posts.ts
const md = markdownit({ html: true });
const route = {
	path: "/posts/:site",
	categories: ["blog"],
	example: "/hedwig/posts/walnut",
	parameters: { site: "站点名，原则上只要是 `{site}.hedwig.pub` 都可以匹配" },
	features: { supportRadar: false },
	name: "Posts",
	url: "hedwig.pub",
	maintainers: ["zwithz", "GetToSet"],
	view: 0,
	handler: async (ctx) => {
		const { site } = ctx.req.param();
		if (!isValidHost(site)) throw new InvalidParameterError("Invalid site");
		const baseUrl = `https://${site}.hedwig.pub`;
		const text = load(await rofetch(baseUrl))("script#__NEXT_DATA__").text();
		const pageProps = JSON.parse(text).props.pageProps;
		const list = pageProps.issuesByNewsletter.map((item) => {
			const description = item.blocks.map((block) => md.render(block.markdown.text)).join("");
			return {
				title: item.subject,
				description,
				pubDate: timezone(parseDate(item.publishAt, "YYYY-MM-DDTHH:mm:ss.SSS[Z]"), 0),
				link: `${baseUrl}/i/${item.urlFriendlyName}`
			};
		});
		return {
			title: pageProps.newsletter.name,
			description: pageProps.newsletter.about,
			link: baseUrl,
			item: list
		};
	}
};
//#endregion
export { route };
