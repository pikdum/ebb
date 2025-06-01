import { describe, expect, it } from "vitest";
import { e621 } from "./e621"; // Assuming e621 class is exported

describe("e621 Connector", () => {
	describe("transformPostData", () => {
		it("should correctly transform raw post data and include postView URL", async () => {
			const mockRawData = {
				posts: [
					{
						id: 78901,
						file: {
							width: 1200,
							height: 900,
							ext: "png",
							size: 1024000,
							md5: "abcdef1234567890",
							url: "https://static1.e621.net/data/sample/ab/cd/abcdef1234567890.png",
						},
						preview: {
							width: 150,
							height: 112,
							url: "https://static1.e621.net/data/preview/ab/cd/abcdef1234567890.jpg",
						},
						sample: {
							has: true,
							width: 800,
							height: 600,
							url: "https://static1.e621.net/data/sample/ab/cd/abcdef1234567890.jpg",
						},
						tags: {
							general: ["tag1", "tag2"],
							artist: ["artist1"],
							copyright: ["copy1"],
							character: ["char1"],
							species: ["spec1"],
							invalid: [],
							meta: ["meta1"],
							lore: ["lore1"],
						},
						rating: "e",
						created_at: "2023-03-10T14:45:00.000Z",
					},
					{
						id: 11223,
						file: {
							width: 800,
							height: 1000,
							ext: "jpg",
							size: 900000,
							md5: "0987654321fedcba",
							url: "https://static1.e621.net/data/sample/09/87/0987654321fedcba.jpg",
						},
						preview: {
							width: 120,
							height: 150,
							url: "https://static1.e621.net/data/preview/09/87/0987654321fedcba.jpg",
						},
						sample: {
							has: false, // No sample URL
							width: 0,
							height: 0,
							url: null,
						},
						tags: {
							general: ["solo_focus"],
							artist: ["artist2"],
							copyright: [],
							character: [],
							species: ["spec2"],
							invalid: [],
							meta: [],
							lore: [],
						},
						rating: "q",
						created_at: "2023-04-05T18:00:00.000Z",
					},
				],
			};

			const result = e621.transformPostData(mockRawData);
			expect(result.posts).toHaveLength(2);
			expect(result.hasNextPage).toBe(true);

			const post1 = result.posts[0];
			expect(post1.id).toBe("78901");
			expect(post1.postView).toBe("https://e621.net/posts/78901");
			expect(post1.fileUrl).toBe(mockRawData.posts[0].file.url);
			expect(post1.previewUrl).toBe(mockRawData.posts[0].preview.url);
			expect(post1.sampleUrl).toBe(mockRawData.posts[0].sample.url);
			const expectedTags1 = Object.values(mockRawData.posts[0].tags).flat();
			expect(post1.tags.sort()).toEqual(expectedTags1.sort());
			expect(post1.rating).toBe("explicit"); // transformed from 'e'
			expect(post1.createdAt).toBe(
				new Date(mockRawData.posts[0].created_at).toISOString(),
			);
			expect(post1.height).toBe(mockRawData.posts[0].file.height);
			expect(post1.width).toBe(mockRawData.posts[0].file.width);

			const post2 = result.posts[1];
			expect(post2.id).toBe("11223");
			expect(post2.postView).toBe("https://e621.net/posts/11223");
			expect(post2.sampleUrl).toBeNull(); // as sample.has is false
			expect(post2.rating).toBe("questionable"); // transformed from 'q'

			// Test getTagGroups for the first post
			if (post1.getTagGroups) {
				const tagGroups = await post1.getTagGroups();
				expect(tagGroups.Tag).toEqual(mockRawData.posts[0].tags.general);
				expect(tagGroups.Artist).toEqual(mockRawData.posts[0].tags.artist);
				expect(tagGroups.Copyright).toEqual(
					mockRawData.posts[0].tags.copyright,
				);
				expect(tagGroups.Character).toEqual(
					mockRawData.posts[0].tags.character,
				);
				expect(tagGroups.Species).toEqual(mockRawData.posts[0].tags.species);
				expect(tagGroups.Metadata).toEqual(mockRawData.posts[0].tags.meta);
				expect(tagGroups.Lore).toEqual(mockRawData.posts[0].tags.lore);
				expect(tagGroups.Invalid).toBeUndefined(); // As it's empty
			} else {
				throw new Error("getTagGroups not defined on e621 post object");
			}
		});

		it("should handle empty input (no posts)", () => {
			const result = e621.transformPostData({ posts: [] });
			expect(result.posts).toHaveLength(0);
			expect(result.hasNextPage).toBe(false);
		});

		it("should handle null or undefined input", () => {
			// @ts-expect-error testing invalid input
			const resultNull = e621.transformPostData(null);
			expect(resultNull.posts).toHaveLength(0);
			expect(resultNull.hasNextPage).toBe(false);

			// @ts-expect-error testing invalid input
			const resultUndefined = e621.transformPostData(undefined);
			expect(resultUndefined.posts).toHaveLength(0);
			expect(resultUndefined.hasNextPage).toBe(false);
		});

		it("should filter out posts without file.url", () => {
			const mockRawDataWithMissingFileUrl = {
				posts: [
					// Post that should be filtered out
					{
						id: 333,
						file: {
							url: undefined,
							width: 100,
							height: 100,
							ext: "jpg",
							size: 123,
							md5: "abc",
						},
						// Provide other fields like preview, sample, tags, rating, created_at
						// to ensure the test is robust and doesn't fail due to these missing
						// if the filtering logic changes or has issues.
						preview: { url: "preview_url_333", width: 10, height: 10 },
						sample: { has: false, url: null, width: 0, height: 0 },
						tags: { general: ["test_filter_out"] },
						rating: "s",
						created_at: "2023-01-01T00:00:00.000Z",
					},
					// Post that should NOT be filtered out
					{
						id: 444,
						file: {
							url: "https://static1.e621.net/data/sample/ef/gh/efghef12345.jpg",
							width: 200,
							height: 200,
							ext: "jpg",
							size: 456,
							md5: "def",
						},
						preview: {
							url: "https://static1.e621.net/data/preview/ef/gh/efghef12345.jpg",
							width: 20,
							height: 20,
						},
						sample: {
							has: true,
							url: "https://static1.e621.net/data/sample/ef/gh/efghef12345.jpg",
							width: 100,
							height: 100,
						},
						tags: { general: ["test_keep"] },
						rating: "g",
						created_at: "2023-01-02T00:00:00.000Z",
					},
				],
			};
			const result = e621.transformPostData(mockRawDataWithMissingFileUrl);
			expect(result.posts).toHaveLength(1);
			expect(result.posts[0].id).toBe("444"); // Ensure the correct post is kept
			expect(result.posts[0].postView).toBe("https://e621.net/posts/444");
		});
	});
});
