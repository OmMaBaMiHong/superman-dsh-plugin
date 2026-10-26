import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gumroad/index.tsx
const route = {
	path: "/:username/:products",
	categories: ["shopping"],
	example: "/gumroad/afkmaster/Eve10",
	parameters: {
		username: "username, can be found in URL",
		products: "products name, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Products",
	maintainers: ["Fatpandac"],
	handler,
	description: "`https://afkmaster.gumroad.com/l/Eve10` -> `/gumroad/afkmaster/Eve10`"
};
const renderDescription = (img, productsName, price, desc, stack) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", { src: img }),
	/* @__PURE__ */ jsx("h1", { children: productsName }),
	/* @__PURE__ */ jsx("p", {
		style: "color: red;",
		children: price
	}),
	desc ? /* @__PURE__ */ jsx(Fragment, { children: raw(desc) }) : null,
	/* @__PURE__ */ jsx("hr", {}),
	stack ? /* @__PURE__ */ jsx(Fragment, { children: raw(stack) }) : null
] }));
async function handler(ctx) {
	const username = ctx.req.param("username");
	const products = ctx.req.param("products");
	if (!isValidHost(username)) throw new InvalidParameterError("Invalid username");
	const url = `https://${username}.gumroad.com/l/${products}`;
	const response = await got_default(url);
	const $ = load(response.data);
	const title = $("section.product-content.product-content__row > header > h1").text();
	const userFullName = $("section.product-content.product-content__row > section.details > a").text();
	const item = [{
		title,
		link: url,
		description: renderDescription(response.data.match(/data-preview-url="(.*?)"/)[1], title, $("div.price").text(), $("section.product-content.product-content__row > section:nth-child(3) > div").html(), $("div.product-info").find("ul.stack").html())
	}];
	return {
		link: url,
		title: `Gumroad - ${userFullName}/${title}`,
		item
	};
}
//#endregion
export { route };
