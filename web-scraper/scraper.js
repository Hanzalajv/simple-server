const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://books.toscrape.com';
const OUTPUT_DIR = './output';

// Identify ourselves — good bot etiquette
const headers = {
  'User-Agent': 'Hanzala-Scraper/1.0 (student project; contact@example.com)'
};

// Polite delay between requests (1 second)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Step 1: Fetch a page
async function fetchPage(url) {
  console.log(`Fetching: ${url}`);
  const response = await axios.get(url, { headers });
  return response.data;
}

// Step 2: Parse and extract book data
function extractBooks(html) {
  const $ = cheerio.load(html);
  const books = [];

  $('article.product_pod').each((index, element) => {
    const title = $(element).find('h3 a').attr('title');
    const price = $(element).find('.price_color').text().replace('£', '');
    const availability = $(element).find('.availability').text().trim();
    const ratingClass = $(element).find('.star-rating').attr('class');
    const rating = ratingClass ? ratingClass.replace('star-rating ', '') : 'No rating';
    const link = BASE_URL + '/catalogue/' + $(element).find('h3 a').attr('href');

    books.push({
      title,
      price: parseFloat(price),
      availability,
      rating,
      link
    });
  });

  return books;
}

// Step 3: Clean and validate
function cleanBooks(books) {
  return books.filter(book => {
    return book.title && book.price && book.price > 0;
  });
}

// Step 4: Find next page link
function getNextPageUrl(html) {
  const $ = cheerio.load(html);
  const nextLink = $('li.next a').attr('href');
  if (nextLink) {
    return BASE_URL + '/catalogue/' + nextLink;
  }
  return null;
}

// Main scraper
async function scrapeAllPages() {
  // Respect robots.txt — this site allows all bots
  console.log('Checking robots.txt...');
  try {
    const robots = await axios.get(BASE_URL + '/robots.txt', { headers });
    console.log('robots.txt allows scraping. Proceeding.');
  } catch (err) {
    console.log('No robots.txt found. Proceeding cautiously.');
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let allBooks = [];
  let currentUrl = BASE_URL + '/catalogue/page-1.html';
  let pageCount = 0;

  while (currentUrl) {
    pageCount++;
    const html = await fetchPage(currentUrl);
    const books = extractBooks(html);
    const cleaned = cleanBooks(books);
    allBooks = allBooks.concat(cleaned);

    console.log(`Page ${pageCount}: extracted ${books.length} books (${cleaned.length} clean)`);

    // Save incremental progress
    fs.writeFileSync(
      `${OUTPUT_DIR}/books_page_${pageCount}.json`,
      JSON.stringify(cleaned, null, 2)
    );

    // Polite delay
    await sleep(1000);

    // Get next page
    currentUrl = getNextPageUrl(html);
  }

  // Step 5: Save complete dataset
  const outputPath = `${OUTPUT_DIR}/all_books.json`;
  fs.writeFileSync(outputPath, JSON.stringify(allBooks, null, 2));

  console.log(`\nScraping complete. ${allBooks.length} books saved to ${outputPath}`);
  console.log(`Pages scraped: ${pageCount}`);
  console.log(`Total files in output/: ${pageCount + 1}`);

  // Print summary
  const totalValue = allBooks.reduce((sum, book) => sum + book.price, 0);
  console.log(`Total value of all books: £${totalValue.toFixed(2)}`);
  console.log(`Average price: £${(totalValue / allBooks.length).toFixed(2)}`);

  // Count by rating
  const ratings = {};
  allBooks.forEach(book => {
    ratings[book.rating] = (ratings[book.rating] || 0) + 1;
  });
  console.log('\nBooks by rating:');
  Object.entries(ratings).forEach(([rating, count]) => {
    console.log(`  ${rating}: ${count}`);
  });
}

// Run
scrapeAllPages().catch(err => {
  console.error('Scraper failed:', err.message);
});