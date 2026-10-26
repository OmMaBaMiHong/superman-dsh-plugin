import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/genre.ts
const route = {
	path: ["/videos/genre/:genre?/:language?/:mode?", "/genre/:genre?/:language?/:mode?"],
	name: "Unknown",
	maintainers: [],
	handler,
	description: `| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |

::: tip
See [Categories](https://www.javlibrary.com/en/genres.php) to view all categories.
:::`,
	features: { nsfw: true }
};
async function handler(ctx) {
	const mode = ctx.req.param("mode") ?? "1";
	const genre = ctx.req.param("genre") ?? "amjq";
	const language = ctx.req.param("language") ?? "ja";
	return await ProcessItems(language, `${rootUrl}/${language}/vl_genre.php?list&g=${genre}&mode=${mode}`);
}
//#endregion
export { route };
