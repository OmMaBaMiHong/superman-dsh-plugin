import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/bestofjs/monthly.tsx
const BASEURL = "https://bestofjs.org/rankings/monthly";
const route = {
	path: "/rankings/monthly",
	categories: ["programming"],
	example: "/bestofjs/rankings/monthly",
	view: 5,
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["bestofjs.org/rankings/monthly/:year/:month"],
		target: "/rankings/monthly"
	}],
	name: "Monthly Rankings",
	maintainers: ["ztkuaikuai"],
	url: "bestofjs.org/rankings/monthly",
	handler: async () => {
		const targetMonths = getLastSixMonths();
		const items = (await Promise.all(targetMonths.map((data) => {
			const [year, month] = data.split("-");
			return getMonthlyRankings(year, month);
		}))).flatMap((oneMonthlyRankings, i) => {
			const [year, month] = targetMonths[i].split("-");
			const description = renderToString(/* @__PURE__ */ jsx("ul", { children: oneMonthlyRankings.map((item, index) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("li", { children: [
				/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: `Rank ${index + 1}` }) }),
				item.logo ? /* @__PURE__ */ jsx("img", {
					src: `https://bestofjs.org${item.logo}`,
					alt: item.projectName,
					height: "32",
					width: "32"
				}) : null,
				item.projectName ? /* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Project:" }),
					" ",
					item.projectName
				] }) : null,
				item.description ? /* @__PURE__ */ jsx("p", { children: item.description }) : null,
				item.starCount ? /* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Stars:" }),
					" ",
					item.starCount
				] }) : null,
				item.additionalInfo ? /* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Additional Info:" }),
					" ",
					item.additionalInfo
				] }) : null,
				item.githubLink ? /* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "GitHub:" }),
					" ",
					/* @__PURE__ */ jsx("a", {
						href: item.githubLink,
						children: item.githubLink
					})
				] }) : null,
				item.homepageLink ? /* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Homepage:" }),
					" ",
					/* @__PURE__ */ jsx("a", {
						href: item.homepageLink,
						children: item.homepageLink
					})
				] }) : null,
				item.tags?.length ? /* @__PURE__ */ jsxs("p", { children: [
					/* @__PURE__ */ jsx("strong", { children: "Tags:" }),
					" ",
					item.tags.map((tag, tagIndex) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
						href: `/projects?tags=${tag.toLowerCase()}`,
						children: tag
					}), tagIndex < item.tags.length - 1 ? ", " : ""] }))
				] }) : null
			] }), /* @__PURE__ */ jsx("br", {})] })) }));
			return {
				title: `Best of JS Monthly Rankings - ${year}/${month}`,
				description,
				link: `${BASEURL}/${year}/${month}`,
				guid: `${BASEURL}/${year}/${month}`,
				author: "Best of JS"
			};
		});
		return {
			title: "Best of JS Monthly Rankings",
			link: BASEURL,
			description: "Monthly rankings of the most popular JavaScript projects on Best of JS",
			item: items,
			language: "en"
		};
	}
};
const getLastSixMonths = () => {
	const now = /* @__PURE__ */ new Date();
	const currentYear = now.getFullYear();
	const currentMonth = now.getMonth() + 1;
	return Array.from({ length: 6 }, (_, i) => {
		let month = currentMonth - (i + 1);
		let year = currentYear;
		if (month <= 0) {
			month += 12;
			year -= 1;
		}
		return `${year}-${month}`;
	});
};
const getMonthlyRankings = (year, month) => {
	const targetUrl = `${BASEURL}/${year}/${month}`;
	return cache_default.tryGet(targetUrl, async () => {
		const $ = load(await rofetch(targetUrl));
		return $("table.w-full tbody tr[data-testid=\"project-card\"]").toArray().map((el) => {
			const $tr = $(el);
			return {
				logo: $tr.find("td:first img").attr("src")?.replace(/.dark./, ".") || "",
				projectName: $tr.find("td:nth-child(2) a[href^=\"/projects/\"]").first().text().trim(),
				githubLink: $tr.find("td:nth-child(2) a[href*=\"github.com\"]").attr("href") || "",
				homepageLink: $tr.find("td:nth-child(2) a[href*=\"http\"]:not([href*=\"github.com\"])").attr("href") || "",
				description: $tr.find("td:nth-child(2) .font-serif").text().trim(),
				tags: $tr.find("td:nth-child(2) [href*=\"/projects?tags=\"]").toArray().map((tag) => $(tag).text().trim()),
				starCount: $tr.find("td:nth-child(4) span:last").text().trim() || $tr.find("td:nth-child(2) .inline-flex span:last-child").text().trim(),
				additionalInfo: $tr.find("td:nth-child(3) > div").toArray().slice(1).map((el) => $(el).text().trim()).join("; ")
			};
		});
	});
};
//#endregion
export { route };
