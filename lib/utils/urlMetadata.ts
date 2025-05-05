import axios from 'axios';
import * as cheerio from 'cheerio';

interface UrlMetadata {
  title: string;
  favicon: string;
}

export async function extractUrlMetadata(url: string): Promise<UrlMetadata> {
  try {
    // Fetch the HTML content of the URL
    const response = await axios.get(url);
    const html = response.data;
    
    // Load the HTML into cheerio
    const $ = cheerio.load(html);
    
    // Extract the title
    let title = $('title').text();
    
    // Try to get a better title from OpenGraph tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    if (ogTitle) {
      title = ogTitle;
    }
    
    // Extract the favicon
    let favicon = '';
    
    // Try to get favicon from link tags
    const faviconLink = $('link[rel="icon"]').attr('href') || 
                        $('link[rel="shortcut icon"]').attr('href') ||
                        $('link[rel="apple-touch-icon"]').attr('href');
    
    if (faviconLink) {
      // Handle relative URLs
      if (faviconLink.startsWith('/')) {
        const urlObj = new URL(url);
        favicon = `${urlObj.origin}${faviconLink}`;
      } else {
        favicon = faviconLink;
      }
    } else {
      // Default to /favicon.ico if no favicon link is found
      const urlObj = new URL(url);
      favicon = `${urlObj.origin}/favicon.ico`;
    }
    
    return {
      title: title || 'Untitled',
      favicon
    };
  } catch (error) {
    console.error('Error extracting URL metadata:', error);
    return {
      title: 'Untitled',
      favicon: ''
    };
  }
}
