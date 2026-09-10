/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NewsArticle } from "../types";

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  try {
    const response = await fetch("/api/news");
    const data = await response.json();
    
    if (data.status === "initializing") {
       // Server is warming up and fetching news. Poll again after 3 seconds.
       await new Promise(resolve => setTimeout(resolve, 3000));
       return fetchNewsArticles();
    }
    
    return data;
  } catch (error) {
    console.error("Failed to fetch news from API:", error);
  }
  return [];
}
