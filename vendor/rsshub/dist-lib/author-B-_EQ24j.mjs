import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as CommonDataProperties, r as CommonRouteProperties, s as getPostItems } from "./common-BRHXXVrU.mjs";
//#region lib/routes/voronoiapp/author.ts
const route = {
	...CommonRouteProperties,
	name: "Author Posts",
	path: "/author/:username",
	radar: [{
		source: ["www.voronoiapp.com/author/:username"],
		target: "/author/:username"
	}],
	example: "/voronoiapp/author/visualcapitalist",
	parameters: { username: "The username of the author" },
	handler: async (ctx) => {
		const { username } = ctx.req.param();
		const items = await getPostItems({
			order: "DESC",
			author: await getUidFromUsername(username)
		});
		return {
			...CommonDataProperties,
			title: `Voronoi Posts by ${username}`,
			link: `https://www.voronoiapp.com/author/${username}`,
			item: items
		};
	}
};
async function getUidFromUsername(username) {
	return await cache_default.tryGet(`voronoiapp-author-${username}`, async () => {
		const match = (await rofetch(`https://www.voronoiapp.com/author/${username}`)).match(/\\"uid\\":\\"([\w-]+)\\"/);
		if (!match) throw new Error(`No UID found for username: ${username}`);
		return match[1];
	});
}
//#endregion
export { route };
