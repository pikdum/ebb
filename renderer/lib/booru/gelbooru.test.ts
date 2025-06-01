import { describe, expect, it, vi } from "vitest";
import { Gelbooru } from "./gelbooru"; // Assuming Gelbooru class is exported

// Mock html-entities
vi.mock("html-entities", () => ({
	decode: (str: string) => str, // Simple pass-through mock
}));

describe("Gelbooru Connector", () => {
	describe("transformPostData", () => {
		it("should correctly transform raw post data and include postView URL", async () => {
			const mockRawData = {
				post: [
					{
						id: 5678,
						width: 1024,
						height: 768,
						tags: "tag_a tag_b character_c artist_d copyright_e meta_f",
						file_url:
							"https://img3.gelbooru.com/images/00/01/sample_0001abcdef.jpg",
						preview_url:
							"https://img3.gelbooru.com/thumbnails/00/01/thumbnail_0001abcdef.jpg",
						sample_url:
							"https://img3.gelbooru.com/samples/00/01/sample_0001abcdef.jpg",
						rating: "explicit", // Gelbooru uses full names
						created_at: "Sat Mar 12 10:00:00 +0000 2023", // Example date format
					},
					{
						id: 91011,
						width: 800,
						height: 1200,
						tags: "another_one solo",
						file_url:
							"https://img3.gelbooru.com/images/00/02/sample_0002ghijkl.png",
						preview_url:
							"https://img3.gelbooru.com/thumbnails/00/02/thumbnail_0002ghijkl.jpg",
						sample_url:
							"https://img3.gelbooru.com/samples/00/02/sample_0002ghijkl.jpg",
						rating: "general",
						created_at: "Sun Apr 15 14:30:00 +0000 2023",
					},
				],
				"@attributes": { limit: 2, offset: 0, count: 100 }, // Example attributes
			};

			// Mock fetch for getTagGroups
			const mockTagData = {
				tag: [
					{ name: "tag_a", type: 0, count: 10 },
					{ name: "tag_b", type: 0, count: 12 },
					{ name: "character_c", type: 4, count: 5 },
					{ name: "artist_d", type: 1, count: 8 },
					{ name: "copyright_e", type: 3, count: 3 },
					{ name: "meta_f", type: 5, count: 20 },
				],
			};
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockTagData,
			} as Response);

			const result = Gelbooru.transformPostData(mockRawData);
			expect(result.posts).toHaveLength(2);
			expect(result.hasNextPage).toBe(true); // count > limit + offset

			const post1 = result.posts[0];
			expect(post1.id).toBe("5678");
			expect(post1.postView).toBe(
				"https://gelbooru.com/index.php?page=post&s=view&id=5678",
			);
			expect(post1.fileUrl).toBe(mockRawData.post[0].file_url);
			expect(post1.previewUrl).toBe(mockRawData.post[0].preview_url);
			expect(post1.sampleUrl).toBe(mockRawData.post[0].sample_url);
			expect(post1.tags).toEqual(mockRawData.post[0].tags.split(" "));
			expect(post1.rating).toBe("explicit");
			expect(post1.createdAt).toBe(
				new Date(mockRawData.post[0].created_at).toISOString(),
			);
			expect(post1.height).toBe(mockRawData.post[0].height);
			expect(post1.width).toBe(mockRawData.post[0].width);

			const post2 = result.posts[1];
			expect(post2.id).toBe("91011");
			expect(post2.postView).toBe(
				"https://gelbooru.com/index.php?page=post&s=view&id=91011",
			);
			expect(post2.rating).toBe("general");

			// Test getTagGroups for the first post
			if (post1.getTagGroups) {
				const tagGroups = await post1.getTagGroups();
				expect(tagGroups.Tag).toEqual(["tag_a", "tag_b"]);
				expect(tagGroups.Character).toEqual(["character_c"]);
				expect(tagGroups.Artist).toEqual(["artist_d"]);
				expect(tagGroups.Copyright).toEqual(["copyright_e"]);
				expect(tagGroups.Metadata).toEqual(["meta_f"]);
				const expectedTagsParam = mockRawData.post[0].tags.replace(/ /g, "+");
				const expectedUrl = `https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&orderby=name&order=asc&names=${expectedTagsParam}`;
				expect(global.fetch).toHaveBeenCalledWith(
					expect.objectContaining({ href: expectedUrl }),
				);
			} else {
				throw new Error("getTagGroups not defined on Gelbooru post object");
			}
			vi.restoreAllMocks(); // Restore fetch mock
		});

		it("should handle empty input (no post array)", () => {
			// @ts-expect-error testing invalid input
			const result = Gelbooru.transformPostData({
				"@attributes": { limit: 0, offset: 0, count: 0 },
			});
			expect(result.posts).toHaveLength(0);
			expect(result.hasNextPage).toBe(false);
		});

		it("should handle empty post array", () => {
			const result = Gelbooru.transformPostData({
				post: [],
				"@attributes": { limit: 0, offset: 0, count: 0 },
			});
			expect(result.posts).toHaveLength(0);
			expect(result.hasNextPage).toBe(false);
		});

		it("should handle hasNextPage correctly", () => {
			const validCreatedAt = "Sat Mar 12 10:00:00 +0000 2023";
			const dataWithNext = {
				post: [
					{
						id: 1,
						file_url: "f",
						tags: "",
						created_at: validCreatedAt,
						rating: "g",
						width: 100,
						height: 100,
						preview_url: "pu",
						sample_url: "su",
					},
				],
				"@attributes": { limit: 1, offset: 0, count: 10 },
			};
			expect(Gelbooru.transformPostData(dataWithNext).hasNextPage).toBe(true);

			const dataWithoutNext = {
				post: [
					{
						id: 1,
						file_url: "f",
						tags: "",
						created_at: validCreatedAt,
						rating: "g",
						width: 100,
						height: 100,
						preview_url: "pu",
						sample_url: "su",
					},
				],
				"@attributes": { limit: 1, offset: 9, count: 10 },
			};
			expect(Gelbooru.transformPostData(dataWithoutNext).hasNextPage).toBe(
				false,
			);
		});
	});
});
