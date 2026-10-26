import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as keys, n as handleDescription } from "./utils-DBaQ62o2.mjs";
//#region lib/routes/themoviedb/seasons.ts
const route = {
	path: "/tv/:id/seasons/:lang?",
	categories: ["multimedia"],
	view: 5,
	example: "/themoviedb/tv/70593/seasons/en-US",
	parameters: {
		id: "TV show ID",
		lang: "Language"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "TV Show Seasons",
	maintainers: ["x2cf"],
	handler
};
async function handler(ctx) {
	const { id, lang } = ctx.req.param();
	const { data } = await got_default(`https://api.themoviedb.org/3/tv/${id}`, { searchParams: {
		language: lang,
		api_key: keys()
	} });
	return {
		title: `${data.name} - Seasons — TMDB`,
		description: data.overview.trim(),
		image: `https://image.tmdb.org/t/p/original${data.poster_path}`,
		link: `https://www.themoviedb.org/tv/${data.id}/seasons`,
		item: data.seasons.map((item) => {
			item.vote_average = data.vote_average;
			item.vote_count = data.vote_count;
			return {
				title: item.name,
				link: `https://www.themoviedb.org/tv/${data.id}/season/${item.season_number}`,
				description: handleDescription(item),
				pubDate: item.air_date ? parseDate(item.air_date) : void 0
			};
		})
	};
}
//#endregion
export { route };
