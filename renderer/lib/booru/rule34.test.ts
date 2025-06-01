import { describe, expect, it, vi } from "vitest";
import { Rule34 } from "./rule34"; // Assuming Rule34 class is exported

// Mock html-entities, as Rule34's transformTagData uses decode
vi.mock("html-entities", () => ({
	decode: (str: string) => str, // Simple pass-through mock
}));

describe("Rule34 Connector", () => {
	describe("transformPostData", () => {
		it("should correctly transform raw post data and include postView URL", () => {
			const mockRawPosts = [
				{
					id: 121314,
					width: 1100,
					height: 850,
					tags: "tag_x tag_y character_z artist_a copyright_b",
					file_url: "https://api.rule34.xxx/images/1213/sample_abcdef.jpeg",
					preview_url:
						"https://api.rule34.xxx/thumbnails/1213/thumbnail_abcdef.jpeg",
					sample_url: "https://api.rule34.xxx/samples/1213/sample_abcdef.jpeg",
					rating: "explicit", // Rule34 seems to store full names or mixed types
					change: 1678886400, // Unix timestamp (seconds)
				},
				{
					id: 151617,
					width: 700,
					height: 1000,
					tags: "another_tag solo animated",
					file_url: "https://api.rule34.xxx/images/1516/sample_ghijkl.gif",
					preview_url:
						"https://api.rule34.xxx/thumbnails/1516/thumbnail_ghijkl.jpeg", // Preview might be jpeg
					sample_url: "https://api.rule34.xxx/samples/1516/sample_ghijkl.gif", // Sample is gif
					rating: "questionable",
					change: 1678972800,
				},
			];

			const result = Rule34.transformPostData(mockRawPosts);
			expect(result.posts).toHaveLength(2);
			expect(result.hasNextPage).toBe(true); // Based on current logic

			const post1 = result.posts[0];
			expect(post1.id).toBe("121314");
			expect(post1.postView).toBe(
				"https://rule34.xxx/index.php?page=post&s=view&id=121314",
			);
			expect(post1.fileUrl).toBe(mockRawPosts[0].file_url);
			expect(post1.previewUrl).toBe(mockRawPosts[0].preview_url);
			expect(post1.sampleUrl).toBe(mockRawPosts[0].sample_url); // Not a gif
			expect(post1.tags).toEqual(mockRawPosts[0].tags.split(" "));
			expect(post1.rating).toBe("explicit");
			// Multiply by 1000 for JS timestamp (milliseconds)
			expect(post1.createdAt).toBe(
				new Date(mockRawPosts[0].change * 1000).toISOString(),
			);
			expect(post1.height).toBe(mockRawPosts[0].height);
			expect(post1.width).toBe(mockRawPosts[0].width);

			const post2 = result.posts[1];
			expect(post2.id).toBe("151617");
			expect(post2.postView).toBe(
				"https://rule34.xxx/index.php?page=post&s=view&id=151617",
			);
			// Special handling for GIF samples in Rule34 connector
			expect(post2.sampleUrl).toBe(mockRawPosts[1].preview_url);
			expect(post2.rating).toBe("questionable");

			// Rule34 transformPostData does not currently implement getTagGroups
			expect(post1.getTagGroups).toBeUndefined();
		});

		it("should handle empty input", () => {
			const result = Rule34.transformPostData([]);
			expect(result.posts).toHaveLength(0);
			expect(result.hasNextPage).toBe(false);
		});

		it("should handle null or undefined input", () => {
			// @ts-expect-error testing invalid input
			const resultNull = Rule34.transformPostData(null);
			expect(resultNull.posts).toHaveLength(0);
			expect(resultNull.hasNextPage).toBe(false);

			// @ts-expect-error testing invalid input
			const resultUndefined = Rule34.transformPostData(undefined);
			expect(resultUndefined.posts).toHaveLength(0);
			expect(resultUndefined.hasNextPage).toBe(false);
		});

		it("should use preview_url for sample_url if sample_url ends with .gif", () => {
			const mockRawGifPost = [
				{
					id: 777,
					file_url: "file.gif",
					preview_url: "preview.jpg",
					sample_url: "sample.gif", // GIF sample
					tags: "animated",
					rating: "general",
					change: 1670000000,
					width: 100,
					height: 100,
				},
			];
			const result = Rule34.transformPostData(mockRawGifPost);
			expect(result.posts[0].sampleUrl).toBe(mockRawGifPost[0].preview_url);
			expect(result.posts[0].postView).toBe(
				"https://rule34.xxx/index.php?page=post&s=view&id=777",
			);
		});
	});
});
