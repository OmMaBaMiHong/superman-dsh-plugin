import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/hackmd/profile.ts
const route = {
	path: "/profile/:path",
	categories: ["programming"],
	example: "/hackmd/profile/hackmd",
	parameters: { path: "userpath or teampath" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Profile",
	maintainers: ["Yukaii", "kaiix"],
	handler
};
async function handler(ctx) {
	const path = ctx.req.param("path");
	const data = (await got_default({
		method: "get",
		url: `https://hackmd.io/api/@${path}/overview`
	})).data;
	const profile = data.user || data.team;
	return {
		title: `${profile.name}'s Profile`,
		link: `https://hackmd.io/@${path}`,
		description: `${profile.name}'s profile on HackMD`,
		item: data.notes.map((note) => ({
			title: note.title,
			description: `<pre>${note.content}</pre>`,
			pubDate: new Date(note.publishedAt).toUTCString(),
			link: `https://hackmd.io/@${path}/${note.permalink || note.shortId}`
		}))
	};
}
//#endregion
export { route };
