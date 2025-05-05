import axios from 'axios';
import * as cheerio from 'cheerio';

export async function generateSummary(url: string): Promise<string> {
  try {
    // Fetch the HTML content of the URL
    const response = await axios.get(url);
    const html = response.data;

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Try to get description from meta tags
    let summary = $('meta[name="description"]').attr('content') ||
                 $('meta[property="og:description"]').attr('content');

    // If no description is found, extract text from the first few paragraphs
    if (!summary) {
      const paragraphs: string[] = [];
      $('p').slice(0, 3).each((_, element) => {
        const text = $(element).text().trim();
        if (text.length > 50) { // Only include substantial paragraphs
          paragraphs.push(text);
        }
      });

      summary = paragraphs.join(' ').substring(0, 300);

      // Add ellipsis if the summary was truncated
      if (summary.length === 300) {
        summary += '...';
      }
    }

    return summary || 'No summary available';
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Failed to generate summary';
  }
}
