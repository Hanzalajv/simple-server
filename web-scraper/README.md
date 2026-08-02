# Web Scraper — Books to Scrape

Scrapes books.toscrape.com for book titles, prices, ratings, and availability.

## What it respects

- robots.txt checked before scraping
- 1 second delay between requests
- Custom User-Agent identifying this as a student project
- Incremental saves per page to prevent data loss

## Run

npm install
node scraper.js

## Output

output/all_books.json — 1000 books with title, price, rating, availability, link
output/books_page_N.json — per-page backups

## Sample record

{
  "title": "A Light in the Attic",
  "price": 51.77,
  "availability": "In stock",
  "rating": "Three",
  "link": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"
}