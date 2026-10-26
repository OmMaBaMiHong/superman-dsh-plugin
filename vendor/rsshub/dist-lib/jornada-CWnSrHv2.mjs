import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/jornada/index.ts
const rootUrl = "https://www.jornada.com.mx";
const categories = {
	capital: "Capital",
	cartones: "Cartones",
	ciencia: "Ciencia-Y-Tecnologia",
	cultura: "Cultura",
	deportes: "Deportes",
	economia: "Economia",
	estados: "Estados",
	mundo: "Mundo",
	opinion: "Opinion",
	politica: "Politica",
	sociedad: "Sociedad"
};
const getDateForToday = () => {
	const date = new Date(Date.now());
	return date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
};
const route = {
	path: "/:date?/:category?",
	categories: ["traditional-media"],
	example: "/jornada/2022-10-12/capital",
	parameters: {
		date: "Date string, must be in format of `YYYY-MM-DD`. You can get today's news using `today`",
		category: "Category, refer to the table below"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["Thealf154"],
	handler,
	description: `Provides a way to get an specific rss feed by date and category over the official one.

| Category             | \`:category\` |
| -------------------- | ----------- |
| Capital              | capital     |
| Cartones             | cartones    |
| Ciencia y Tecnología | ciencia     |
| Cultura              | cultura     |
| Deportes             | deportes    |
| Economía             | economia    |
| Estados              | estados     |
| Mundo                | mundo       |
| Opinión              | opinion     |
| Política             | politica    |
| Sociedad             | sociedad    |`
};
async function handler(ctx) {
	const date = ctx.req.param("date") === "today" || ctx.req.param("date") === void 0 ? getDateForToday() : ctx.req.param("date");
	const category = ctx.req.param("category");
	const data = (await got_default(`${rootUrl}/jsonstorage/articles_${date}_.json`)).data;
	let items;
	if (category) items = data.filter((item) => item.category === categories[category]).map((item) => ({
		title: item.title,
		description: item.content,
		pubDate: parseDate(item.date),
		link: `${rootUrl}/${item.url}`
	}));
	else items = data.map((item) => ({
		title: item.title,
		description: item.content,
		pubDate: parseDate(item.date),
		link: `${rootUrl}/${item.url}`
	}));
	return {
		title: "La Jornada",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
