// Fetch articles and render them as a list.
import { formatDate } from './utils.js';

const API_URL = 'https://www.silvestar.codes/feed.json';
const MAX_ITEMS = 10;

/**
 * Render a list of articles.
 * @param {Array<Object>} articles
 * @returns {string}
 */
export async function renderArticles(articles = []) {
  if (!articles.length) return '<p>No articles yet.</p>';

  const items = articles
    .slice(0, MAX_ITEMS)
    .map(({ title, url, date }) => `<li><a href="${url}">${title}</a> — ${formatDate(date)}</li>`)
    .join('\n');

  return `<ul class="articles">${items}</ul>`;
}

class Feed extends EventTarget {
  #cache = new Map();

  constructor(url = API_URL) {
    super();
    this.url = url;
  }

  async load() {
    try {
      const response = await fetch(this.url);
      const { items } = await response.json();
      this.#cache.set(this.url, items);
      this.dispatchEvent(new CustomEvent('loaded', { detail: items }));
      return items.filter((item) => /css|html/i.test(item.tags?.join(' ')));
    } catch (error) {
      console.error(`Failed to load ${this.url}:`, error);
      return null;
    }
  }
}

export default new Feed();
