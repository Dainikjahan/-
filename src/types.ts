/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- Types ---
export const NewsCategory = {
  TOP_STORY: "Top Story",
  WORLD: "World",
  TECHNOLOGY: "Technology",
  AI: "Artificial Intelligence",
  EDITORIAL: "Editorial",
  BUSINESS: "Business",
  SCIENCE: "Science"
} as const;

export type NewsCategory = typeof NewsCategory[keyof typeof NewsCategory];

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  isTopStory?: boolean;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  publishedAt: string;
}

export interface PublicationInfo {
  name: string;
  description: string;
  company: string;
  companyReg: string;
  editorInChief: string;
  edition: string;
}
