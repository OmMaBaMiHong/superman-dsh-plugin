import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as isWorker } from "./is-worker-B5Qd1sOL.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { LRUCache } from "lru-cache";
import Redis from "ioredis";
//#region lib/utils/cache/http.ts
const status$2 = { available: false };
let baseUrl;
let apiToken;
const toRemoteKey = (key) => `rsshub:http-cache:${md5(key)}`;
const cacheUrl = (key, refresh = false) => {
	const url = `${baseUrl}/v1/cache/${encodeURIComponent(toRemoteKey(key))}`;
	return refresh ? `${url}?refresh=1` : url;
};
const requestSignal = () => typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(config.requestTimeout) : void 0;
const request = async (url, init = {}, headers = {}) => {
	if (!status$2.available || !apiToken) return null;
	try {
		return await fetch(url, {
			...init,
			headers: {
				authorization: `Bearer ${apiToken}`,
				...headers
			},
			signal: requestSignal()
		});
	} catch (error) {
		logger.error("HTTP cache request failed:", error);
		return null;
	}
};
const readResponseText = async (response) => {
	try {
		return await response.text();
	} catch {
		return "";
	}
};
const readCacheHitResponse = async (response) => {
	try {
		return await response.json();
	} catch {
		return null;
	}
};
const logUnexpectedResponse = async (operation, response) => {
	const message = await readResponseText(response);
	logger.error(`HTTP cache ${operation} failed with status ${response.status}${message ? `: ${message}` : ""}`);
	if (response.status === 401) status$2.available = false;
};
var http_default = {
	init: () => {
		baseUrl = config.httpCache.url?.replace(/\/+$/, "");
		apiToken = config.httpCache.token;
		if (!baseUrl || !apiToken) {
			status$2.available = false;
			logger.error("HTTP cache requires CACHE_HTTP_URL and CACHE_HTTP_TOKEN.");
			return;
		}
		try {
			new URL(baseUrl);
		} catch {
			status$2.available = false;
			logger.error("HTTP cache URL is invalid.");
			return;
		}
		status$2.available = true;
		logger.info("HTTP cache configured.");
	},
	get: async (key, refresh = true) => {
		if (!key) return null;
		const response = await request(cacheUrl(key, refresh), { method: "GET" });
		if (!response) return null;
		if (response.status === 404) return "";
		if (!response.ok) {
			await logUnexpectedResponse("get", response);
			return null;
		}
		const data = await readCacheHitResponse(response);
		if (data?.hit === true && typeof data.value === "string") return data.value;
		logger.error("HTTP cache get returned an invalid response.");
		return null;
	},
	has: async (key) => {
		if (!key) return false;
		const response = await request(cacheUrl(key), { method: "HEAD" });
		if (!response) return false;
		if (response.status === 204) return true;
		if (response.status === 404) return false;
		await logUnexpectedResponse("has", response);
		return false;
	},
	set: async (key, value, maxAge = config.cache.contentExpire) => {
		if (!key) return;
		if (!value || value === "undefined") value = "";
		if (typeof value === "object") value = JSON.stringify(value);
		const response = await request(cacheUrl(key), {
			method: "PUT",
			body: JSON.stringify({
				ttl: maxAge,
				value
			})
		}, { "content-type": "application/json" });
		if (response && response.status !== 204) await logUnexpectedResponse("set", response);
	},
	clients: {},
	status: status$2
};
//#endregion
//#region lib/utils/cache/memory.ts
const status$1 = { available: false };
const clients$1 = {};
var memory_default = {
	init: () => {
		clients$1.memoryCache = new LRUCache({
			ttl: config.cache.routeExpire * 1e3,
			max: config.memory.max
		});
		status$1.available = true;
	},
	get: (key, refresh = true) => {
		if (key && status$1.available && clients$1.memoryCache) {
			let value = clients$1.memoryCache.get(key, { updateAgeOnGet: refresh });
			if (value) value += "";
			return value;
		}
		return null;
	},
	has: (key) => {
		if (key && status$1.available && clients$1.memoryCache) return clients$1.memoryCache.has(key);
		return false;
	},
	set: (key, value, maxAge = config.cache.contentExpire) => {
		if (!value || value === "undefined") value = "";
		if (typeof value === "object") value = JSON.stringify(value);
		if (key && status$1.available && clients$1.memoryCache) return clients$1.memoryCache.set(key, value, { ttl: maxAge * 1e3 });
	},
	clients: clients$1,
	status: status$1
};
//#endregion
//#region lib/utils/cache/redis.ts
const status = { available: false };
const clients = {};
const getCacheTtlKey = (key) => {
	if (key.startsWith("rsshub:cacheTtl:")) throw new Error("\"rsshub:cacheTtl:\" prefix is reserved for the internal usage, please change your cache key");
	return `rsshub:cacheTtl:${key}`;
};
var redis_default = {
	init: () => {
		clients.redisClient = new Redis(config.redis.url);
		clients.redisClient.on("error", (error) => {
			status.available = false;
			logger.error("Redis error: ", error);
		});
		clients.redisClient.on("end", () => {
			status.available = false;
		});
		clients.redisClient.on("connect", () => {
			status.available = true;
			logger.info("Redis connected.");
		});
	},
	get: async (key, refresh = true) => {
		if (key && status.available && clients.redisClient) {
			const cacheTtlKey = getCacheTtlKey(key);
			let [value, cacheTtl] = await clients.redisClient.mget(key, cacheTtlKey);
			if (value && refresh) {
				if (cacheTtl) clients.redisClient.expire(cacheTtlKey, cacheTtl);
				else cacheTtl = config.cache.contentExpire + "";
				clients.redisClient.expire(key, cacheTtl);
				value += "";
			}
			return value || "";
		}
		return null;
	},
	has: async (key) => {
		if (key && status.available && clients.redisClient) return await clients.redisClient.exists(key) > 0;
		return false;
	},
	set: (key, value, maxAge = config.cache.contentExpire) => {
		if (!status.available || !clients.redisClient) return;
		if (!value || value === "undefined") value = "";
		if (typeof value === "object") value = JSON.stringify(value);
		if (key) {
			if (maxAge !== config.cache.contentExpire) clients.redisClient.set(getCacheTtlKey(key), maxAge, "EX", maxAge);
			return clients.redisClient.set(key, value, "EX", maxAge);
		}
	},
	clients,
	status
};
//#endregion
//#region lib/utils/cache/index.ts
const globalCache = {
	get: () => null,
	has: () => false,
	set: () => null
};
const noopCacheModule = {
	init: () => null,
	get: () => null,
	has: () => false,
	set: () => null,
	status: { available: false },
	clients: {}
};
let cacheModule = noopCacheModule;
if (isWorker) cacheModule = noopCacheModule;
else switch (config.cache.type) {
	case "redis": {
		cacheModule = redis_default;
		cacheModule.init();
		const { redisClient } = cacheModule.clients;
		globalCache.get = async (key) => {
			if (!key || !cacheModule.status.available || !redisClient) return;
			return await redisClient.get(key);
		};
		globalCache.has = async (key) => {
			if (key && cacheModule.status.available && redisClient) return await redisClient.exists(key) > 0;
			return false;
		};
		globalCache.set = cacheModule.set;
		break;
	}
	case "http":
		cacheModule = http_default;
		cacheModule.init();
		globalCache.get = (key) => {
			if (key && cacheModule.status.available) return cacheModule.get(key, false);
		};
		globalCache.has = (key) => {
			if (key && cacheModule.status.available) return cacheModule.has(key);
			return false;
		};
		globalCache.set = (key, value, maxAge = config.cache.routeExpire) => {
			if (key && cacheModule.status.available) return cacheModule.set(key, value, maxAge);
		};
		break;
	case "memory": {
		cacheModule = memory_default;
		cacheModule.init();
		const { memoryCache } = cacheModule.clients;
		globalCache.get = (key) => {
			if (key && cacheModule.status.available && memoryCache) return memoryCache.get(key, { updateAgeOnGet: false });
		};
		globalCache.has = (key) => {
			if (key && cacheModule.status.available && memoryCache) return memoryCache.has(key);
			return false;
		};
		globalCache.set = (key, value, maxAge = config.cache.routeExpire) => {
			if (!value || value === "undefined") value = "";
			if (typeof value === "object") value = JSON.stringify(value);
			if (key && memoryCache) return memoryCache.set(key, value, { ttl: maxAge * 1e3 });
		};
		break;
	}
	default:
		cacheModule = noopCacheModule;
		logger.error("Cache not available, concurrent requests are not limited. This could lead to bad behavior.");
}
var cache_default = {
	...cacheModule,
	/**
	* Try to get the cache. If the cache does not exist, the `getValueFunc` function will be called to get the data, and the data will be cached.
	* @param key The key used to store and retrieve the cache. You can use `:` as a separator to create a hierarchy.
	* @param getValueFunc A function that returns data to be cached when a cache miss occurs.
	* @param maxAge The maximum age of the cache in seconds. This should left to the default value in most cases which is `CACHE_CONTENT_EXPIRE`.
	* @param refresh Whether to renew the cache expiration time when the cache is hit. `true` by default.
	* @returns
	*/
	tryGet: async (key, getValueFunc, maxAge = config.cache.contentExpire, refresh = true) => {
		if (typeof key !== "string") throw new TypeError("Cache key must be a string");
		let v = await cacheModule.get(key, refresh);
		if (v) {
			let parsed;
			try {
				parsed = JSON.parse(v);
			} catch {
				parsed = null;
			}
			if (parsed) v = parsed;
			return v;
		}
		const value = await getValueFunc();
		cacheModule.set(key, JSON.stringify(value), maxAge);
		return value;
	},
	globalCache
};
//#endregion
export { cache_default as t };
