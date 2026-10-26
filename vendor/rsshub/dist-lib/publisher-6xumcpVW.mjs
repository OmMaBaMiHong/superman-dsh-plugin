import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseItems, r as parseList, t as baseUrl } from "./utils-NhizIc1j.mjs";
//#region lib/routes/line/publisher.ts
const route = {
	path: "/today/:edition/publisher/:id",
	categories: ["new-media"],
	example: "/line/today/th/publisher/101048",
	parameters: {
		edition: "Edition, see table above",
		id: "Channel ID, can be found in URL"
	},
	radar: [{ source: ["today.line.me/:edition/v2/publisher/:id"] }],
	name: "TODAY - Channel",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { edition, id } = ctx.req.param();
	const publisherInfo = await rofetch(`${baseUrl}/webapi/portal/page/setting`, { query: {
		entityId: id,
		country: edition,
		pageType: "CP"
	} });
	let thaiData;
	if (edition === "th") thaiData = await rofetch(`${baseUrl}/webapi/portal/embedded/page/cplatest`, { query: {
		entityId: id,
		pageType: "CP",
		country: edition
	} });
	const mod = (edition === "th" ? thaiData.modules : publisherInfo.modules).find((item) => item.source === "CP_LATEST");
	const listing = mod.listings[0];
	const items = await parseItems(parseList((await rofetch(`${baseUrl}/webapi/trending/cp/latest/listings/${mod.id}`, { query: {
		offset: listing.offset,
		length: listing.length,
		country: edition,
		targetContent: listing.params?.targetContent,
		cps: listing.params?.cps,
		publishedWithin: listing.params?.publishedWithin
	} })).items));
	return {
		title: `${publisherInfo.data.name} - Line Today`,
		description: publisherInfo.data.introduction,
		image: publisherInfo.data.icon ? `https://obs.line-scdn.net/${publisherInfo.data.icon.hash}` : void 0,
		link: `${baseUrl}/${edition}/v2/publisher/${id}`,
		item: items
	};
}
//#endregion
export { route };
