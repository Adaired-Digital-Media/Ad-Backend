export type BlogTypes = {
  metaTitle: string;
  metaDescription: string;
  canonicalLink: string;
  openGraphImage: string;
  robotsText: string;
  category: string | null;
  featuredImage: string;
  postTitle: string;
  postDescription: string;
  slug: string;
  tags?: string;
  blogAuthor?: string | null;
  status?: "publish" | "draft";
};
