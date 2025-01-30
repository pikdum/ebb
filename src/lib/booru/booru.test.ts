import { describe, expect, it } from "vitest";
import { getPosts, getSites, getTags } from "./index";

const sites = getSites()
	.map((site) => site.value)
	.filter((site) => site !== "e621");

describe("Booru Providers", () => {
	sites.forEach((site) => {
		it(`should return posts from ${site}`, async () => {
			const result = await getPosts({
				site,
				tags: "",
				limit: 1,
				page: 1,
			});
			expect(result.posts.length).toBeGreaterThan(0);
		});

		it(`should return tags from ${site}`, async () => {
			const tags = await getTags({
				site,
				query: "land",
			});
			expect(tags.length).toBeGreaterThan(0);
		});
	});
});
