import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as getNextBuildId, t as baseUrl } from "./utils-CzDMMvsQ.mjs";
//#region lib/routes/makerworld/user-upload.ts
const route = {
	path: "/user/:handle/upload",
	categories: ["design"],
	example: "/makerworld/user/@Wcad00/upload",
	parameters: { handle: "User handle" },
	name: "User Uploads",
	maintainers: ["TonyRL"],
	handler,
	radar: [{ source: ["makerworld.com/:lang/:handle/upload", "makerworld.com/:lang/:handle"] }]
};
async function handler(ctx) {
	const { handle } = ctx.req.param();
	const { userInfo, designs } = (await rofetch(`${baseUrl}/_next/data/${await getNextBuildId()}/en/${handle}/upload.json`, {
		headers: { "User-Agent": config.trueUA },
		query: { handle }
	})).pageProps;
	const items = designs.map((d) => ({
		title: d.title,
		link: `${baseUrl}/en/models/${d.id}-${d.slug}`,
		pubDate: parseDate(d.createTime),
		author: d.designCreator.name,
		category: d.tags,
		description: d.instances.map((i) => `<figure><img src="${i.cover}" alt="${d.title}"><figcaption>${i.title}</figcaption></figure>`).join("")
	}));
	return {
		title: `${userInfo.name} | Published - MakerWorld`,
		link: `${baseUrl}/en/${handle}/upload`,
		description: userInfo.personal.bio,
		image: userInfo.avatar,
		item: items
	};
}
//#endregion
export { route };
