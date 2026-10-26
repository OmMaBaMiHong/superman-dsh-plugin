import { t as handler } from "./common-C3GuItiY.mjs";
//#region lib/routes/dnaindia/topic.ts
const route = {
	name: "Topic",
	maintainers: ["Rjnishant530"],
	path: "/topic/:topic",
	example: "/dnaindia/topic/dna-verified",
	parameters: { category: "Find it in the URL" },
	radar: [{ source: ["www.dnaindia.com/topic/:topic"] }],
	handler,
	url: "www.dnaindia.com",
	description: `Topics:

| DNA verified |
| ------------ |
| dna-verified |

::: tip
The URL of the form \`https://www.dnaindia.com/topic/dna-verified\` demonstrates the utilization of the subdomain \`topic\`.
:::`
};
//#endregion
export { route };
