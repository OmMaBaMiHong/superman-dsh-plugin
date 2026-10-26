import "./types-DNj6Etbg.mjs";
import { a as postFilter, n as generatePostDataItem, r as getClient, t as CONFIG_OPTIONS } from "./utils-DNBimnrT.mjs";
//#region lib/routes/mixi2/home.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "20");
	const client = getClient();
	const data = await client.getSubscribingFeeds({ limit });
	const personasData = await client.getPersonas({ personaIds: data?.feeds?.map((feed) => feed.post.personaId) ?? [] });
	return {
		title: "フォロー中",
		link: "https://mixi.social/home",
		image: "https://mixi.social/_next/static/media/image_logo.8bb36f11.svg",
		item: data?.feeds?.filter((feed) => postFilter(feed.post)).map((feed) => ({
			title: `@${personasData.personas.find((persona) => persona.personaId === feed.post.personaId)?.name}`,
			...generatePostDataItem(feed.post, personasData.personas)
		})) ?? []
	};
};
const route = {
	path: "/home",
	name: "フォロー中",
	categories: ["social-media"],
	example: "/mixi2/home",
	features: {
		requireConfig: CONFIG_OPTIONS,
		supportRadar: true
	},
	radar: [{
		source: ["mixi.social/home"],
		target: "/home",
		title: "フォロー中"
	}],
	view: 1,
	handler,
	maintainers: ["KarasuShin"]
};
//#endregion
export { route };
