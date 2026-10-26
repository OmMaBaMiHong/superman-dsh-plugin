import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/hashnode/blog.tsx
const baseApiUrl = "https://api.hashnode.com";
const renderDescription = (image, brief) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: image }), brief ? /* @__PURE__ */ jsx(Fragment, { children: raw(brief) }) : null] }));
const route = {
	path: "/blog/:username",
	categories: ["blog"],
	example: "/hashnode/blog/inklings",
	parameters: { username: "博主名称，用户头像 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hashnode.dev/"] }],
	name: "用户博客",
	maintainers: ["hnrainll"],
	handler,
	url: "hashnode.dev/",
	description: `::: tip
username 为博主用户名，而非\`xxx.hashnode.dev\`中\`xxx\`所代表的 blog 地址。
:::`
};
async function handler(ctx) {
	const username = ctx.req.param("username");
	if (!username) return;
	const query = `
    {
        user(username: "${username}") {
            publication {
                posts{
                    slug
                    title
                    brief
                    coverImage
                    dateAdded
                }
            }
        }
    }
    `;
	const userUrl = `https://${username}.hashnode.dev`;
	const publication = (await got_default({
		method: "POST",
		url: baseApiUrl,
		headers: {
			Referer: userUrl,
			"Content-type": "application/json"
		},
		body: JSON.stringify({ query })
	})).data.data.user.publication;
	if (!publication) return;
	const list = publication.posts;
	return {
		title: `Hashnode by ${username}`,
		link: userUrl,
		item: list.map((item) => ({
			title: item.title,
			description: renderDescription(item.coverImage, item.brief),
			pubDate: parseDate(item.dateAdded),
			link: `${userUrl}/${item.slug}`
		})).filter((item) => item !== "")
	};
}
//#endregion
export { route };
