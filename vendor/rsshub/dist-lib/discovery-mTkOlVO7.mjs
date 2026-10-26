import "./types-DNj6Etbg.mjs";
import { a as postFilter, n as generatePostDataItem, r as getClient, t as CONFIG_OPTIONS } from "./utils-DNBimnrT.mjs";
//#region lib/routes/mixi2/discovery.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "20");
	const client = getClient();
	const data = await client.getRecommendedTimeline({ limit });
	const personasData = await client.getPersonas({ personaIds: data?.posts?.map((post) => post.personaId) ?? [] });
	return {
		title: "発見",
		link: "https://mixi.social/home/discovery",
		image: "https://mixi.social/_next/static/media/image_logo.8bb36f11.svg",
		item: data?.posts?.filter(postFilter).map((post) => {
			return {
				title: `@${personasData.personas.find((persona) => persona.personaId === post.personaId)?.name}`,
				...generatePostDataItem(post, personasData.personas)
			};
		}) ?? []
	};
};
const route = {
	path: "/discovery",
	name: "発見",
	categories: ["social-media"],
	example: "/mixi2/discovery",
	features: {
		supportRadar: true,
		requireConfig: CONFIG_OPTIONS
	},
	radar: [{
		source: ["mixi.social/home/discovery"],
		target: "/discovery",
		title: "発見"
	}],
	view: 1,
	handler,
	maintainers: ["KarasuShin"]
};
//#endregion
export { route };
