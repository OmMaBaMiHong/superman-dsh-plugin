import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { load } from "cheerio";
//#region lib/routes/rsshub/transform/sitemap.ts
const route = {
	path: "/transform/sitemap/:url/:routeParams?",
	name: "Unknown",
	maintainers: ["flrngel"],
	handler
};
async function handler(ctx) {
	if (!config.feature.allow_user_supply_unsafe_domain) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
	const url = ctx.req.param("url");
	const response = await got_default({
		method: "get",
		url
	});
	const routeParams = new URLSearchParams(ctx.req.param("routeParams"));
	const $ = load(response.data, { xmlMode: true });
	const rssTitle = routeParams.get("title") || ($("urlset url").length && $("urlset url").first().find("loc").text() ? $("urlset url").first().find("loc").text() : "Sitemap");
	const urls = $("urlset url").toArray();
	const items = urls && urls.length ? urls.map((item) => {
		try {
			return {
				title: $(item).find("loc").text() || "",
				link: $(item).find("loc").text() || "",
				description: $(item).find("loc").text() || "",
				pubDate: $(item).find("lastmod").text() || void 0
			};
		} catch {
			return null;
		}
	}).filter(Boolean) : [];
	return {
		title: rssTitle,
		link: url,
		description: `Proxy ${url}`,
		item: items
	};
}
//#endregion
export { route };
