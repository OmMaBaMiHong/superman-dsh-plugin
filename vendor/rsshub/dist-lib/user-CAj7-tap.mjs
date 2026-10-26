import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { a as postFilter, i as parsePost, r as getClient, t as CONFIG_OPTIONS } from "./utils-DNBimnrT.mjs";
//#region lib/routes/mixi2/user.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "20");
	const name = ctx.req.param("name");
	const mediaOnly = ctx.req.param("media") === "media";
	if (!name.startsWith("@")) throw new InvalidParameterError("ユーザー名は@で始まる必要があります");
	const client = getClient();
	const persona = (await client.getPersonaByName({ name: name.slice(1) })).persona;
	const data = await client.getPersonalTimeline({
		personaId: persona?.personaId,
		limit,
		mediaOnly
	});
	return {
		title: `${persona?.name} - ${mediaOnly ? "メディア" : "ポスト"}`,
		image: persona?.avatarUrl,
		item: data?.posts?.filter(postFilter).map((post) => ({
			title: `@${persona?.name}`,
			description: parsePost(post),
			pubDate: parseDate(post.createdAt.seconds * 1e3),
			guid: post.postId,
			author: persona?.name,
			link: `https://mixi.social/@${persona?.name}/posts/${post.postId}`
		})) ?? []
	};
};
const route = {
	path: "/user/:name/:media?",
	name: "ユーザー",
	categories: ["social-media"],
	example: "/mixi2/user/@deyo",
	parameters: {
		name: { description: "@で始まるユーザー名" },
		media: { description: "`media`を入力するとメディアを含むポストのみを取得、デフォルトは空で全てのポストを取得" }
	},
	features: {
		requireConfig: CONFIG_OPTIONS,
		supportRadar: true
	},
	radar: [{
		source: ["mixi.social/:id"],
		target: "/user/:id",
		title: "ユーザー - ポスト"
	}, {
		source: ["mixi.social/:id"],
		target: "/user/:id/media",
		title: "ユーザー - メディア"
	}],
	view: 1,
	handler,
	maintainers: ["KarasuShin"]
};
//#endregion
export { route };
