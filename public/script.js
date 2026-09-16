const ADMIN_PIN = '101778';
const pinModal = document.querySelector('#pinModal');
const pinForm = document.querySelector('#pinForm');
const pinInput = document.querySelector('#adminPin');
const pinError = document.querySelector('#pinError');
const listingGrid = document.querySelector('#listingGrid');
const listingForm = document.querySelector('#listingForm');
const productPage = document.querySelector('[data-product-page]');
window.currentPageId = Number(listingGrid?.dataset.pageId || 1);
const currentPageId = window.currentPageId;
const currentPageSlug = listingGrid?.dataset.pageSlug || 'home';
let pinAction = null;
let isCreatingListing = false;

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.');
  return result;
}

async function loadPages() {
  const pages = await requestJson('/api/pages');
  return Array.isArray(pages) ? pages : [];
}

async function fetchListings(pageId) {
  const listings = await requestJson(`/api/pages/${encodeURIComponent(pageId)}/listings`);
  return Array.isArray(listings) ? listings : [];
}

async function createPage() {
  const page = await requestJson('/api/pages', { method: 'POST' });
  renderPageNavigation(await loadPages());
  window.location.href = `/${page.slug}`;
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'listing';
}

function generateSlug(title, listings) {
  const baseSlug = slugify(title);
  const usedSlugs = new Set(listings.map((listing) => listing.slug));
  let slug = baseSlug;
  let suffix = 2;
  while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  return slug;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}

async function uploadImage(file, listingId, imageNumber) {
  const uploadData = new FormData();
  uploadData.append('listingId', listingId);
  uploadData.append(`image${imageNumber}`, file);
  return (await requestJson('/api/uploads', { method: 'POST', body: uploadData }))[`image${imageNumber}`];
}

function getValue(id) {
  return String(document.getElementById(id)?.value || '').trim();
}

function getFile(id) {
  return document.getElementById(id)?.files?.[0] || null;
}

function generateId() {
  return window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function showError(message) {
  const error = document.querySelector('#listingFormError');
  if (error) {
    error.textContent = message;
    error.hidden = false;
  }
}

function showModal(modal) {
  if (!modal) return;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('is-visible'));
}

function hideModal(modal) {
  if (!modal) return;
  modal.classList.remove('is-visible');
  window.setTimeout(() => { modal.hidden = true; }, 180);
}

function closeModals() {
  document.querySelectorAll('.modal').forEach(hideModal);
  pinAction = null;
}

function closeListingModal() {
  hideModal(document.querySelector('#listingModal'));
}

function openPin(action) {
  pinAction = action;
  pinInput.value = '';
  pinError.hidden = true;
  showModal(pinModal);
  pinInput.focus();
}

function renderPageNavigation(pages) {
  const navigation = document.querySelector('#listingPageNav');
  if (!navigation) return;
  navigation.replaceChildren();
  pages.filter((page) => page.id !== 1).forEach((page) => {
    const link = document.createElement('a');
    link.href = `/${page.slug}`;
    link.textContent = page.name;
    navigation.appendChild(link);
  });
}

async function deleteListing(listingId) {
  await requestJson(`/api/pages/${encodeURIComponent(currentPageId)}/listings/${encodeURIComponent(listingId)}`, { method: 'DELETE' });
  await refreshListings();
}

function renderListings(listings) {
  if (!listingGrid) return;
  listingGrid.replaceChildren();
  if (!listings.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No listings on this page yet.';
    listingGrid.appendChild(empty);
    return;
  }
  listings.forEach((listing) => {
    const card = document.createElement('article');
    card.className = 'listing-card';
    card.dataset.id = listing.id;
    card.tabIndex = 0;
    card.setAttribute('role', 'link');
    const image = document.createElement('img');
    image.className = 'listing-card-thumbnail';
    image.src = listing.image1;
    image.alt = listing.title;
    const body = document.createElement('div');
    body.className = 'listing-card-body';
    const title = document.createElement('h3');
    title.className = 'listing-title';
    title.textContent = listing.title;
    const price = document.createElement('p');
    price.className = 'listing-price';
    price.textContent = `$${Number(listing.price).toFixed(2)}`;
    const buyButton = document.createElement('button');
    buyButton.className = 'buy-now-btn';
    buyButton.type = 'button';
    buyButton.textContent = 'Buy Now';
    buyButton.addEventListener('click', (event) => {
      event.stopPropagation();
      window.location.href = listing.stripeLink;
    });
    body.append(title, price, buyButton);
    const deleteButton = document.createElement('button');
    deleteButton.className = 'trash-button';
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Delete ${listing.title}`);
    deleteButton.innerHTML = '&#128465;';
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation();
      openPin(async () => {
        try {
          await deleteListing(listing.id);
        } catch (error) {
          showError(error.message);
        }
      });
    });
    body.appendChild(deleteButton);
    card.append(image, body);
    const openProduct = () => {
      window.location.href = `/product/${encodeURIComponent(currentPageSlug)}/${encodeURIComponent(listing.slug)}`;
    };
    card.addEventListener('click', openProduct);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProduct();
      }
    });
    listingGrid.appendChild(card);
  });
}

async function refreshListings() {
  try {
    renderListings(await fetchListings(currentPageId));
  } catch (error) {
    showError(error.message);
  }
}

async function createListing(event) {
  event.preventDefault();
  if (isCreatingListing) return;
  const pageId = window.currentPageId;
  const title = getValue('titleInput');
  const price = getValue('priceInput');
  const description = getValue('descriptionInput');
  const imageFiles = [getFile('image1Input'), getFile('image2Input'), getFile('image3Input')];
  const stripeLink = getValue('stripeInput');
  const downloadUrl = getValue('downloadInput');
  if (!title || !price || !description || imageFiles.some((file) => !file) || !stripeLink || !downloadUrl) {
    showError('All fields are required.');
    return;
  }
  if (!Number.isFinite(Number(price)) || Number(price) <= 0 || imageFiles.some((file) => !file.type.startsWith('image/'))) {
    showError('Enter a price greater than $0 and upload three valid images.');
    return;
  }
  if (!isValidUrl(stripeLink) || !isValidUrl(downloadUrl)) {
    showError('Stripe and download links must be valid http:// or https:// URLs.');
    return;
  }
  isCreatingListing = true;
  const submitButton = listingForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
  try {
    const listingId = generateId();
    const [image1, image2, image3] = await Promise.all(imageFiles.map((file, index) => uploadImage(file, listingId, index + 1)));
    const listings = await fetchListings(pageId);
    await requestJson(`/api/pages/${encodeURIComponent(pageId)}/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: listingId,
        slug: generateSlug(title, listings),
        title,
        price: Number(price),
        description,
        image1,
        image2,
        image3,
        stripeLink,
        downloadUrl,
        createdAt: new Date().toISOString()
      })
    });
    listingForm.reset();
    closeListingModal();
    await refreshListings();
  } catch (error) {
    showError(error.message || 'Could not create the listing.');
  } finally {
    isCreatingListing = false;
    if (submitButton) submitButton.disabled = false;
  }
}

listingForm?.addEventListener('submit', createListing);

document.querySelectorAll('#addListingBtn').forEach((button) => {
  button.addEventListener('click', () => {
    const error = document.querySelector('#listingFormError');
    if (error) error.hidden = true;
    showModal(document.querySelector('#listingModal'));
    document.querySelector('#listingForm [name="title"]')?.focus();
  });
});
document.querySelectorAll('#addPageBtn').forEach((button) => button.addEventListener('click', () => openPin(async () => {
  try {
    await createPage();
  } catch (error) {
    pinError.textContent = error.message;
    pinError.hidden = false;
  }
})));
document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModals));
document.querySelectorAll('.modal').forEach((modal) => modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModals();
}));

pinForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (pinInput.value !== ADMIN_PIN) {
    pinError.textContent = 'Incorrect PIN.';
    pinError.hidden = false;
    pinInput.select();
    return;
  }
  const action = pinAction;
  hideModal(pinModal);
  pinAction = null;
  action?.();
});

document.querySelector('#search')?.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  document.querySelectorAll('.listing-card').forEach((card) => {
    card.hidden = !((card.querySelector('h3')?.textContent || '').toLowerCase().includes(query));
  });
});

if (listingGrid) {
  refreshListings();
  loadPages().then(renderPageNavigation).catch((error) => showError(error.message));
}

if (productPage) {
  const pageSlug = productPage.dataset.pageSlug;
  const listingSlug = productPage.dataset.listingSlug;
  const content = productPage.querySelector('[data-product-content]');
  loadPages().then((pages) => {
    const page = pages.find((item) => item.slug === pageSlug);
    return page ? fetchListings(page.id) : [];
  }).then((listings) => {
    const listing = listings.find((item) => item.slug === listingSlug);
    if (!listing) {
      content.innerHTML = '<div class="copy-page"><h1>Listing not found</h1></div>';
      return;
    }
    content.replaceChildren();
    const gallery = document.createElement('div');
    gallery.className = 'product-gallery';
    [listing.image1, listing.image2, listing.image3].forEach((source, index) => {
      const image = document.createElement('img');
      image.className = 'product-image';
      image.src = source;
      image.alt = `${listing.title} preview ${index + 1}`;
      image.addEventListener('click', () => {
        const modal = document.querySelector('#imageModal');
        const modalImage = document.querySelector('#modalImage');
        modalImage.src = image.src;
        modalImage.alt = image.alt;
        modal.style.display = 'flex';
      });
      gallery.appendChild(image);
    });
    const details = document.createElement('div');
    details.className = 'product-details';
    details.innerHTML = '<h1></h1><div class="product-price"></div><p class="product-description"></p><a class="buy-now-btn product-buy-button" target="_blank" rel="noopener">Buy Now</a>';
    details.querySelector('h1').textContent = listing.title;
    details.querySelector('.product-price').textContent = `$${Number(listing.price).toFixed(2)}`;
    details.querySelector('.product-description').textContent = listing.description;
    details.querySelector('a').href = listing.stripeLink;
    content.append(gallery, details);
    const imageModal = document.querySelector('#imageModal');
    document.querySelector('#closeModal').addEventListener('click', () => {
      imageModal.style.display = 'none';
    });
    imageModal.addEventListener('click', (event) => {
      if (event.target === imageModal) imageModal.style.display = 'none';
    });
  }).catch((error) => {
    content.innerHTML = `<div class="copy-page"><h1>${error.message}</h1></div>`;
  });
}
