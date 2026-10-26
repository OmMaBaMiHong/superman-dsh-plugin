import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/91porn/templates/index.tsx
const renderIndexDescription = ({ link, poster }) => renderToString(/* @__PURE__ */ jsx("a", {
	href: link,
	children: /* @__PURE__ */ jsx("img", { src: poster })
}));
//#endregion
//#region lib/routes/91porn/utils.ts
const allowDomain = /* @__PURE__ */ new Set([
	"91porn.com",
	"www.91porn.com",
	"0122.91p30.com",
	"www.91zuixindizhi.com",
	"w1218.91p46.com"
]);
const domainValidation = (domain) => {
	if (!config.feature.allow_user_supply_unsafe_domain && !allowDomain.has(domain)) throw new ConfigNotFoundError(`This RSS is disabled unless 'ALLOW_USER_SUPPLY_UNSAFE_DOMAIN' is set to 'true'.`);
};
//#endregion
export { renderIndexDescription as n, domainValidation as t };
