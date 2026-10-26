import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/atptour/news.ts
const route = {
	path: "/news/:lang?",
	categories: ["sport"],
	example: "/atptour/news/en",
	parameters: { lang: "en or es." },
	radar: [{ source: ["atptour.com"] }],
	name: "News",
	maintainers: ["LM1207"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://www.atptour.com";
	const favIcon = `${baseUrl}/assets/atptour/assets/favicon.ico`;
	const { lang = "en" } = ctx.req.param();
	const { data } = await got_default(`${baseUrl}/${lang}/-/tour/news/latest-filtered-results/0/${ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15}`, { headers: { "user-agent": config.trueUA } });
	return {
		title: lang === "en" ? "News" : "Noticias",
		link: `${baseUrl}/${lang}/news/news-filter-results`,
		description: lang === "en" ? "News from the official site of men's professional tennis." : "Noticias del sitio oficial del tenis profesional masculino.",
		language: lang,
		icon: favIcon,
		logo: favIcon,
		author: "ATP",
		item: data.content.map((item) => ({
			title: item.title,
			link: baseUrl + item.url,
			description: item.description,
			author: item.byline,
			category: item.category,
			pubDate: parseDate(item.authoredDate),
			image: baseUrl + item.image
		}))
	};
}
//#endregion
export { route };
