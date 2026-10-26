import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import * as cheerio from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/imdb/chart.tsx
const render = ({ primaryImage, originalTitleText, certificate, ratingsSummary, plot }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	primaryImage?.url ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
		src: primaryImage.url,
		alt: primaryImage.caption?.plainText
	}), /* @__PURE__ */ jsx("figcaption", { children: primaryImage.caption?.plainText })] }), /* @__PURE__ */ jsx("br", {})] }) : null,
	`Original title: ${originalTitleText.text}`,
	/* @__PURE__ */ jsx("br", {}),
	certificate ? `${certificate.rating} ` : null,
	ratingsSummary?.aggregateRating ? `IMDb RATING: ${ratingsSummary.aggregateRating}/10 (${ratingsSummary.voteCount})` : null,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {}),
	plot?.plotText?.plainText
] }));
const route = {
	path: "/chart/:chart?",
	categories: ["multimedia"],
	view: 5,
	parameters: { chart: {
		description: "The chart to display, `top` by default",
		options: [
			{
				value: "top",
				label: "Top 250 Movies"
			},
			{
				value: "moviemeter",
				label: "Most Popular Movies"
			},
			{
				value: "toptv",
				label: "Top 250 TV Shows"
			},
			{
				value: "tvmeter",
				label: "Most Popular TV Shows"
			}
		],
		default: "top"
	} },
	example: "/imdb/chart",
	radar: [{ source: ["www.imdb.com/chart/:chart/"] }],
	name: "Charts",
	maintainers: ["TonyRL"],
	handler,
	url: "www.imdb.com/chart/top/",
	description: `| Top 250 Movies | Most Popular Movies | Top 250 TV Shows | Most Popular TV Shows |
| -------------- | ------------------- | ---------------- | --------------------- |
| top            | moviemeter          | toptv            | tvmeter               |`
};
async function handler(ctx) {
	const { chart = "top" } = ctx.req.param();
	const baseUrl = "https://www.imdb.com";
	const link = `${baseUrl}/chart/${chart}/`;
	const response = await rofetch(link);
	const $ = cheerio.load(response);
	const chartTitles = JSON.parse($("script#__NEXT_DATA__").text()).props.pageProps.pageData.chartTitles;
	const items = chartTitles.edges.map(({ currentRank, node }) => ({
		title: `${currentRank}. ${node.titleText.text} (${node.releaseYear.year}${node.releaseYear.endYear ? `-${node.releaseYear.endYear}` : ""})`,
		description: render({
			primaryImage: node.primaryImage,
			originalTitleText: node.originalTitleText,
			certificate: node.certificate,
			ratingsSummary: node.ratingsSummary,
			plot: node.plot
		}),
		link: `${baseUrl}/title/${node.id}`,
		category: node.titleGenres.genres.map((g) => chartTitles.genres.find((genre) => genre.filterId === g.genre.text)?.text)
	}));
	return {
		title: $("head title").text(),
		description: $("head meta[name=\"description\"]").attr("content"),
		link,
		item: items
	};
}
//#endregion
export { route };
