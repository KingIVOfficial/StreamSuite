const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');
const LISTINGS_FILE = path.join(__dirname, 'data', 'listings-pages.json');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(path.dirname(LISTINGS_FILE), { recursive: true });

function readData() {
  try {
    const data = JSON.parse(fs.readFileSync(LISTINGS_FILE, 'utf8'));
    if (Array.isArray(data?.pages)) return data;
  } catch (_error) {
  }
  return { pages: [{ id: 1, name: 'Home', slug: 'home', listings: [] }] };
}

function writeData(data) {
  fs.writeFileSync(LISTINGS_FILE, `${JSON.stringify(data, null, 2)}\n`);
}

function getPage(data, pageId) {
  return data.pages.find((page) => page.id === pageId);
}

function pageIdFromRequest(req, res) {
  const pageId = Number(req.params.pageId);
  if (!Number.isInteger(pageId) || pageId < 1) {
    res.status(400).json({ error: 'Invalid page.' });
    return null;
  }
  return pageId;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, UPLOAD_DIR),
    filename: (req, file, callback) => {
      const listingId = req.body.listingId || (req.uploadId || (req.uploadId = crypto.randomUUID()));
      const extension = path.extname(file.originalname).toLowerCase() || '.png';
      callback(null, `${listingId}-${file.fieldname}${extension}`);
    }
  }),
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith('image/'));
  },
  limits: { files: 3, fileSize: 10 * 1024 * 1024 }
});
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/uploads', upload.any(), (req, res) => {
  const file = req.files?.[0];
  if (!file || !/^image[123]$/.test(file.fieldname)) {
    if (file) fs.unlink(file.path, () => {});
    return res.status(400).json({ error: 'One valid image file is required.' });
  }
  return res.json({
    [file.fieldname]: `/uploads/${file.filename}`
  });
});

app.get('/api/pages', (_req, res) => {
  return res.json(readData().pages);
});

app.post('/api/pages', (_req, res) => {
  const data = readData();
  const nextId = data.pages.reduce((highest, page) => Math.max(highest, Number(page.id) || 0), 0) + 1;
  const page = { id: nextId, name: `Listing Page ${nextId}`, slug: `listing-page-${nextId}`, listings: [] };
  data.pages.push(page);
  writeData(data);
  return res.status(201).json(page);
});

app.get('/api/pages/:pageId/listings', (req, res) => {
  const pageId = pageIdFromRequest(req, res);
  if (pageId === null) return;
  const page = getPage(readData(), pageId);
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  return res.json(page.listings);
});

app.post('/api/pages/:pageId/listings', (req, res) => {
  const pageId = pageIdFromRequest(req, res);
  if (pageId === null) return;
  const listing = req.body;
  const data = readData();
  const page = getPage(data, pageId);
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  if (!listing || typeof listing !== 'object') {
    return res.status(400).json({ error: 'Invalid listing.' });
  }
  const requiredFields = ['id', 'slug', 'title', 'description', 'image1', 'image2', 'image3', 'stripeLink', 'downloadUrl'];
  if (requiredFields.some((field) => typeof listing[field] !== 'string' || !listing[field].trim()) || !Number.isFinite(Number(listing.price)) || Number(listing.price) <= 0 || !isValidUrl(listing.stripeLink) || !isValidUrl(listing.downloadUrl)) {
    return res.status(400).json({ error: 'Listing fields are incomplete.' });
  }
  if (page.listings.some((item) => item.id === listing.id || item.slug === listing.slug)) {
    return res.status(409).json({ error: 'A listing with this identity already exists.' });
  }
  const savedListing = { ...listing, price: Number(listing.price) };
  page.listings.push(savedListing);
  writeData(data);
  return res.status(201).json(savedListing);
});

app.delete('/api/pages/:pageId/listings/:listingId', (req, res) => {
  const pageId = pageIdFromRequest(req, res);
  if (pageId === null) return;
  const data = readData();
  const page = getPage(data, pageId);
  if (!page) return res.status(404).json({ error: 'Page not found.' });
  const index = page.listings.findIndex((listing) => listing.id === req.params.listingId);
  if (index === -1) return res.status(404).json({ error: 'Listing not found.' });
  const [deletedListing] = page.listings.splice(index, 1);
  writeData(data);
  return res.json(deletedListing);
});

app.get('/', (req, res) => {
  res.render('home', { title: 'Home | StreamSuite', pageId: 1, pageSlug: 'home', pageName: 'Home' });
});

app.get('/bio', (req, res) => {
  res.render('bio', { title: 'About StreamSuite' });
});

app.get('/product/:pageSlug/:listingSlug', (req, res) => {
  return res.render('product', {
    title: 'Product | StreamSuite',
    pageSlug: req.params.pageSlug,
    listingSlug: req.params.listingSlug
  });
});

app.get('/listing-page-:id', (req, res) => {
  const pageId = Number(req.params.id);
  const page = getPage(readData(), pageId);
  if (!page || pageId < 2) {
    return res.status(404).render('page', { title: 'Page Not Found', pageId: 0, pageSlug: '', pageName: 'Page not found' });
  }
  return res.render('page', {
    title: `${page.name} | StreamSuite`,
    pageId,
    pageSlug: page.slug,
    pageName: page.name
  });
});

app.get('/success/:pageId/:listingSlug', (req, res) => {
  const pageId = Number(req.params.pageId);
  if (!Number.isInteger(pageId) || pageId < 1) {
    return res.status(404).render('page', { title: 'Page Not Found', pageId: 0, pageSlug: '', pageName: 'Page not found' });
  }
  const data = readData();
  const page = getPage(data, pageId);
  const listing = page?.listings.find((item) => item.slug === req.params.listingSlug);
  if (!page || !listing) {
    return res.status(404).render('page', { title: 'Listing Not Found', pageId: 0, pageSlug: '', pageName: 'Listing not found' });
  }
  return res.render('success', {
    title: 'Transaction Successful',
    listing
  });
});

app.listen(PORT, () => {
  console.log(`StreamSuite storefront listening on port ${PORT}`);
});

module.exports = { app };