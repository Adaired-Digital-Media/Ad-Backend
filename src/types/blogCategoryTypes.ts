export type BlogCategoryTypes = {
  isSubCategory: boolean;
  parentCategory: string;
  subCategories: { categoryId: string }[];
  categoryName: string;
  categorySlug: string;
  status: string;
  blogs: { blogId: string }[];
};
