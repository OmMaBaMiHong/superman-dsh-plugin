import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/kakuyomu/works.ts
const route = {
	name: "投稿",
	categories: ["reading"],
	path: "/works/:id",
	example: "/kakuyomu/works/1177354054894027232",
	parameters: { id: "投稿 ID" },
	maintainers: ["KarasuShin"],
	handler,
	features: { supportRadar: true },
	radar: [{
		source: ["kakuyomu.jp/works/:id"],
		target: "/works/:id"
	}]
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const url = `https://kakuyomu.jp/works/${id}`;
	const limit = Number.parseInt(ctx.req.query("limit") || "10");
	const $ = load(await rofetch(url));
	const { props: { pageProps } } = JSON.parse($("#__NEXT_DATA__").text());
	const { __APOLLO_STATE__ } = pageProps;
	const { title, catchphrase } = __APOLLO_STATE__[`Work:${id}`];
	const episodes = Object.values(__APOLLO_STATE__).filter((value) => value.__typename === "Episode");
	return {
		title,
		link: url,
		description: catchphrase,
		item: await Promise.all(episodes.toSorted((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit).map((item) => {
			const episodeUrl = `https://kakuyomu.jp/works/${id}/episodes/${item.id}`;
			return cache_default.tryGet(episodeUrl, async () => {
				const description = load(await rofetch(episodeUrl))(".widget-episodeBody").html();
				return {
					title: item.title,
					link: episodeUrl,
					description,
					pubDate: parseDate(item.publishedAt),
					guid: item.id
				};
			});
		}))
	};
}
//#endregion
export { route };
