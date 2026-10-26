import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as getDataLayer, i as getArticleList, n as cookieJar, r as getArticle, t as baseUrl } from "./utils-8wIE3g81.mjs";
import { load } from "cheerio";
//#region lib/routes/nature/research.ts
const route = {
	path: "/research/:journal?",
	categories: ["journal"],
	example: "/nature/research/ng",
	parameters: { journal: "short name for a journal, `nature` by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: true
	},
	radar: [{
		source: [
			"nature.com/:journal/research-articles",
			"nature.com/:journal",
			"nature.com/"
		],
		target: "/research/:journal"
	}],
	name: "Latest Research",
	maintainers: [
		"y9c",
		"TonyRL",
		"pseudoyu"
	],
	handler,
	description: `|   \`:journal\`  |   Full Name of the Journal  | Route                                                                              |
| :-----------: | :-------------------------: | ---------------------------------------------------------------------------------- |
|     nature    |            Nature           | [/nature/research/nature](https://rsshub.app/nature/research/nature)               |
|      nbt      |     Nature Biotechnology    | [/nature/research/nbt](https://rsshub.app/nature/research/nbt)                     |
|     neuro     |     Nature Neuroscience     | [/nature/research/neuro](https://rsshub.app/nature/research/neuro)                 |
|       ng      |       Nature Genetics       | [/nature/research/ng](https://rsshub.app/nature/research/ng)                       |
|       ni      |      Nature Immunology      | [/nature/research/ni](https://rsshub.app/nature/research/ni)                       |
|     nmeth     |        Nature Method        | [/nature/research/nmeth](https://rsshub.app/nature/research/nmeth)                 |
|     nchem     |       Nature Chemistry      | [/nature/research/nchem](https://rsshub.app/nature/research/nchem)                 |
|      nmat     |       Nature Materials      | [/nature/research/nmat](https://rsshub.app/nature/research/nmat)                   |
| natmachintell | Nature Machine Intelligence | [/nature/research/natmachintell](https://rsshub.app/nature/research/natmachintell) |

- Using router (\`/nature/research/\` + "short name for a journal") to query latest research paper for a certain journal of Nature Publishing Group.
  If the \`:journal\` parameter is blank, then latest research of Nature will return.
- The journals from NPG are run by different group of people, and the website of may not be consitent for all the journals
- Only abstract is rendered in some researches`
};
async function handler(ctx) {
	const pageURL = `${baseUrl}/${ctx.req.param("journal") ?? "nature"}/research-articles`;
	const pageCapture = load((await got_default(pageURL, { cookieJar })).data);
	const pageTitle = getDataLayer(pageCapture).content.journal.title;
	let items = getArticleList(pageCapture);
	items = await Promise.all(items.map((item) => getArticle(item)));
	return {
		title: `Nature (${pageTitle}) | Latest Research`,
		description: pageCapture("meta[name=\"description\"]").attr("content") || "Nature, a nature research journal",
		link: pageURL,
		item: items
	};
}
//#endregion
export { route };
