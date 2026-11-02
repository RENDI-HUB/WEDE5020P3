'use strict';

const CONTACT_RECIPIENT = 'info@gifttothenation.org';
const FORM_ENDPOINT = 'https://jsonplaceholder.typicode.com/posts'; 
const OFFICE_LOCATION = [-25.74794487736046, 28.18761327539998];
 
// Prices are placeholders: adjust to match your storyline.
const SERVICES = [
  { id: 'food-parcel', title: 'Monthly Food Parcel', category: 'Food & Nutrition', price: 350, unit: 'parcel',
    schedule: 'monthly', availability: 'Distributed on the 1st of every month',
    summary: 'A month of essential groceries for a family in need.',
    details: 'We currently support over 150 families. Sponsoring a parcel covers groceries, packing and delivery.' },

  { id: 'school-lunch', title: 'School Lunch Programme', category: 'Food & Nutrition', price: 15, unit: 'meal',
    schedule: 'schooldays', availability: 'Every school day',
    summary: 'A nutritious meal for a learner.',
    details: 'Each meal helps a child concentrate and learn. You can fund as many meals as you like.' },

  { id: 'charity-walk', title: 'Charity Walk', category: 'Donation & Fundraising Events', price: 120, unit: 'entry',
    schedule: 'quarterly', availability: 'Quarterly: 15 March, 15 June, 15 September, 15 December',
    summary: 'Walk with your community to raise funds.',
    details: 'Entry includes a t-shirt and refreshments. All proceeds go to our programmes.' },

  { id: 'gala', title: 'Fundraising Gala', category: 'Donation & Fundraising Events', price: 850, unit: 'ticket',
    schedule: 'quarterly', availability: 'Quarterly: 15 March, 15 June, 15 September, 15 December',
    summary: 'An evening of giving for individuals and businesses.',
    details: 'Tickets include dinner and entertainment. Tables of ten are available on request.' },

  { id: 'sponsor', title: 'Become a Sponsor', category: 'Get Involved', price: 5000, unit: 'sponsorship',
    schedule: 'anytime', availability: 'Open all year',
    summary: 'Back a programme with a quarterly sponsorship.',
    details: 'Sponsors receive impact reports and recognition at our events.' },

  { id: 'volunteer', title: 'Volunteer With Us', category: 'Get Involved', price: 0, unit: 'volunteer',
    schedule: 'anytime', availability: 'Open all year',
    summary: 'Give your time and expertise.',
    details: 'Help pack parcels, serve meals or run events. No experience necessary.' }
];

const FAQS = [
  ['Is Gift to the Nation a registered organisation?', 'Yes. We are a registered non-profit (NPO 032-031, PBO 930018993).'],
  ['How can I donate?', 'Use the Enquire page to ask about donating, sponsoring or volunteering. We reply with costs and availability.'],
  ['Who do you help?', 'Vulnerable communities across South Africa, through food support, disaster response and social support.']
];

const GALLERY_IMAGES = [
  { src: 'GTTNHero.jpeg', alt: 'Gift to the Nation home banner' },
  { src: 'AUHero.jpeg', alt: 'Gift to the Nation about us banner' },
  { src: 'SHero.jpeg', alt: 'Gift to the Nation services banner' },
  { src: 'CUhero.jpeg', alt: 'Gift to the Nation contact banner' },
  { src: 'EHero.jpeg', alt: 'Gift to the Nation enquiry banner' }
];

/* ===== Helpers ===== */
const byId = (id) => document.getElementById(id);
const formatRand = (amount) => (amount === 0 ? 'Free' : 'R' + amount.toLocaleString('en-ZA'));
const formatDate = (date) =>
  date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function todayAsIso() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

/* ===== Navigation, scroll animation ===== */
function highlightCurrentNav() {
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  for (const link of document.querySelectorAll('nav a')) {
    if (link.getAttribute('href') === currentPage) link.classList.add('active');
  }
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1 });
  for (const panel of document.querySelectorAll('.panel')) {
    panel.classList.add('reveal');
    observer.observe(panel);
  }
}

/* ===== Accordion (event delegation, so it also works on dynamically created items) ===== */
function buildAccordionItem(uniqueId, titleText, bodyNode) {
  const item = createElement('div', 'accordion-item');
  const trigger = createElement('button', 'accordion-trigger', titleText);
  trigger.type = 'button';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', uniqueId);
  const panel = createElement('div', 'accordion-panel');
  panel.id = uniqueId;
  panel.append(bodyNode);
  item.append(trigger, panel);
  return item;
}

function initAccordions() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('.accordion-trigger');
    if (!trigger) return;
    const panel = byId(trigger.getAttribute('aria-controls'));
    const wasOpen = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!wasOpen));
    panel.style.maxHeight = wasOpen ? null : panel.scrollHeight + 'px';
  });
}

/* ===== Services: dynamic content, search, filter and sort ===== */
const SERVICE_SORTS = {
  name: (first, second) => first.title.localeCompare(second.title),
  'price-low': (first, second) => first.price - second.price,
  'price-high': (first, second) => second.price - first.price
};

function buildServiceCard(service) {
  const card = createElement('article', 'card');
  const priceText = service.price === 0 ? 'Free' : `${formatRand(service.price)} per ${service.unit}`;
  const details = createElement('div');
  const enquireLink = createElement('a', 'button-link', 'Enquire about this');
  enquireLink.href = 'enquire.html?service=' + service.id;
  details.append(
    createElement('p', null, service.details),
    createElement('p', null, 'Availability: ' + service.availability),
    enquireLink
  );
  card.append(
    createElement('h3', null, service.title),
    createElement('p', 'card-price', priceText),
    createElement('p', null, service.summary),
    buildAccordionItem('details-' + service.id, 'More details', details)
  );
  return card;
}

function initServices() {
  const listContainer = byId('serviceList');
  const searchInput = byId('serviceSearch');
  const categorySelect = byId('serviceCategory');
  const sortSelect = byId('serviceSort');
  const countLabel = byId('serviceCount');

  for (const category of new Set(SERVICES.map((service) => service.category))) {
    categorySelect.append(new Option(category, category));
  }

  function render() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const visibleServices = SERVICES
      .filter((service) => categorySelect.value === 'all' || service.category === categorySelect.value)
      .filter((service) => `${service.title} ${service.summary} ${service.category}`.toLowerCase().includes(searchTerm))
      .sort(SERVICE_SORTS[sortSelect.value]);

    listContainer.replaceChildren(...visibleServices.map(buildServiceCard));
    countLabel.textContent = visibleServices.length
      ? `Showing ${visibleServices.length} of ${SERVICES.length} services`
      : 'No services match your search.';
  }

  for (const control of [searchInput, categorySelect, sortSelect]) {
    control.addEventListener('input', render);
  }
  render();
}

/* ===== About page ===== */
function initTabs() {
  const tabButtons = [...document.querySelectorAll('#aboutTabs [role="tab"]')];

  function selectTab(selectedButton) {
    for (const button of tabButtons) {
      const isSelected = button === selectedButton;
      button.setAttribute('aria-selected', String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
      byId(button.getAttribute('aria-controls')).hidden = !isSelected;
    }
  }

  for (const [index, button] of tabButtons.entries()) {
    button.addEventListener('click', () => selectTab(button));
    button.addEventListener('keydown', (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      const nextButton = tabButtons[(index + step + tabButtons.length) % tabButtons.length];
      selectTab(nextButton);
      nextButton.focus();
    });
  }
}

function initFaq() {
  const faqList = byId('faqList');
  for (const [index, [question, answer]] of FAQS.entries()) {
    faqList.append(buildAccordionItem('faq-' + index, question, createElement('p', null, answer)));
  }
}

/* ===== Gallery with lightbox ===== */
function initGallery() {
  const gallery = byId('gallery');
  let currentIndex = 0;
  let previouslyFocused = null;

  const overlay = createElement('div', 'lightbox');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');
  const bigImage = createElement('img');
  const caption = createElement('p', 'lightbox-caption');
  const makeButton = (className, label, symbol) => {
    const button = createElement('button', 'lightbox-button ' + className, symbol);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    return button;
  };
  const closeButton = makeButton('close', 'Close', '×');
  const previousButton = makeButton('prev', 'Previous image', '‹');
  const nextButton = makeButton('next', 'Next image', '›');
  overlay.append(closeButton, previousButton, bigImage, caption, nextButton);
  document.body.append(overlay);

  function showImage(index) {
    currentIndex = (index + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
    const { src, alt } = GALLERY_IMAGES[currentIndex];
    bigImage.src = src;
    bigImage.alt = alt;
    caption.textContent = `${alt} (${currentIndex + 1} of ${GALLERY_IMAGES.length})`;
  }
  function openLightbox(index) {
    previouslyFocused = document.activeElement;
    showImage(index);
    overlay.classList.add('open');
    closeButton.focus();
  }
  function closeLightbox() {
    overlay.classList.remove('open');
    if (previouslyFocused) previouslyFocused.focus();
  }

  for (const [index, image] of GALLERY_IMAGES.entries()) {
    const thumbnail = createElement('button', 'thumbnail');
    thumbnail.type = 'button';
    const thumbnailImage = createElement('img');
    thumbnailImage.src = image.src;
    thumbnailImage.alt = image.alt;
    thumbnailImage.loading = 'lazy';
    thumbnail.append(thumbnailImage);
    thumbnail.addEventListener('click', () => openLightbox(index));
    gallery.append(thumbnail);
  }

  closeButton.addEventListener('click', closeLightbox);
  previousButton.addEventListener('click', () => showImage(currentIndex - 1));
  nextButton.addEventListener('click', () => showImage(currentIndex + 1));
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', (event) => {
    if (!overlay.classList.contains('open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (event.key === 'ArrowRight') showImage(currentIndex + 1);
  });
}

/* ===== Form validation ===== */
const NAME_PATTERN = /^[\p{L}][\p{L} '.-]{1,59}$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^(?:\+27|0)[1-9]\d{8}$/; // South African numbers

const commonRules = {
  name: (value) => {
    if (!value.trim()) return 'Full name is required.';
    return NAME_PATTERN.test(value.trim()) ? '' : 'Use letters only (2 to 60 characters).';
  },
  email: (value) => {
    if (!value.trim()) return 'Email is required.';
    return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter a valid email, e.g. name@example.com.';
  },
  phone: (value, isRequired) => {
    const digitsOnly = value.replace(/[\s-]/g, '');
    if (!digitsOnly) return isRequired ? 'Phone number is required.' : '';
    return PHONE_PATTERN.test(digitsOnly) ? '' : 'Use a South African number, e.g. 082 123 4567 or +27 82 123 4567.';
  },
  message: (value, minimum, maximum) => {
    const length = value.trim().length;
    if (length < minimum) return `Message must be at least ${minimum} characters (currently ${length}).`;
    return length > maximum ? `Message must be ${maximum} characters or fewer (currently ${length}).` : '';
  }
};

function showFieldError(field, message) {
  let errorElement = field.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('field-error')) {
    errorElement = createElement('small', 'field-error');
    errorElement.id = field.id + '-error';
    errorElement.setAttribute('role', 'alert');
    field.after(errorElement);
  }
  errorElement.textContent = message;
  field.classList.toggle('invalid', Boolean(message));
  field.setAttribute('aria-invalid', String(Boolean(message)));
  field.setAttribute('aria-describedby', errorElement.id);
}


function validateForm(form, rules) {
  let firstInvalidField = null;
  for (const [fieldId, rule] of Object.entries(rules)) {
    const field = form.elements[fieldId];
    const message = rule(field.value);
    showFieldError(field, message);
    if (message && !firstInvalidField) firstInvalidField = field;
  }
  if (firstInvalidField) firstInvalidField.focus();
  return !firstInvalidField;
}

function attachLiveValidation(form, rules) {
  form.noValidate = true; // we show our own messages instead of the browser's
  for (const [fieldId, rule] of Object.entries(rules)) {
    const field = form.elements[fieldId];
    field.addEventListener('blur', () => showFieldError(field, rule(field.value)));
    field.addEventListener('input', () => {
      if (field.classList.contains('invalid')) showFieldError(field, rule(field.value));
    });
  }
}

/* ===== Enquiry form ===== */
function nextAvailableDate(service, preferredIsoDate) {
  const date = new Date(preferredIsoDate + 'T00:00:00');
  if (service.schedule === 'monthly' && date.getDate() > 1) {
    date.setMonth(date.getMonth() + 1, 1);
  } else if (service.schedule === 'quarterly') {
    for (const year of [date.getFullYear(), date.getFullYear() + 1]) {
      for (const month of [2, 5, 8, 11]) {
        const eventDate = new Date(year, month, 15);
        if (eventDate >= date) return eventDate;
      }
    }
  } else if (service.schedule === 'schooldays') {
    while ([0, 6].includes(date.getDay())) date.setDate(date.getDate() + 1);
  }
  return date;
}

function buildEnquiryResponse(data) {
  const firstName = data.name.trim().split(' ')[0];
  const service = SERVICES.find((item) => item.id === data.subject);
  const lines = [];
  if (!service) {
    lines.push(`A team member will reply to ${data.email} within 2 working days.`);
  } else {
    const quantity = Number(data.quantity);
    lines.push(`${quantity} × ${service.title}`);
    lines.push(service.price === 0
      ? 'Cost: free. Thank you for offering your time!'
      : `Estimated cost: ${formatRand(service.price * quantity)} (${formatRand(service.price)} per ${service.unit})`);
    lines.push('Availability: ' + service.availability);
    lines.push('Earliest date from your preferred date: ' + formatDate(nextAvailableDate(service, data.preferredDate)));
  }
  return { heading: `Thank you, ${firstName}!`, lines };
}

function initEnquiryForm() {
  const form = byId('enquiryForm');
  const responseMessage = byId('responseMessage');
  const subjectSelect = form.elements.subject;
  const dateInput = form.elements.preferredDate;

  for (const service of SERVICES) subjectSelect.append(new Option(service.title, service.id));
  dateInput.min = todayAsIso();
  const requestedService = new URLSearchParams(location.search).get('service');
  if (SERVICES.some((service) => service.id === requestedService)) subjectSelect.value = requestedService;

  const rules = {
    name: commonRules.name,
    email: commonRules.email,
    phone: (value) => commonRules.phone(value, true),
    subject: (value) => (value ? '' : 'Please choose a topic.'),
    quantity: (value) => {
      const quantity = Number(value);
      return Number.isInteger(quantity) && quantity >= 1 && quantity <= 500 ? '' : 'Enter a whole number from 1 to 500.';
    },
    preferredDate: (value) => {
      if (!value) return 'Please choose a preferred date.';
      return value < todayAsIso() ? 'The date cannot be in the past.' : '';
    },
    message: (value) => commonRules.message(value, 10, 500)
  };
  attachLiveValidation(form, rules);

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // AJAX: stay on the page
    responseMessage.replaceChildren();
    if (!validateForm(form, rules)) return;

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    const formData = Object.fromEntries(new FormData(form));
    try {
      const reply = await fetch(form.getAttribute('action') || FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!reply.ok) throw new Error('Server responded with ' + reply.status);
      const { heading, lines } = buildEnquiryResponse(formData);
      responseMessage.append(createElement('strong', null, heading), ...lines.map((line) => createElement('p', null, line)));
      form.reset();
      dateInput.min = todayAsIso();
    } catch (error) {
      responseMessage.append(createElement('p', 'submit-error', 'Sorry, we could not send your enquiry. Please check your connection and try again.'));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Enquiry';
    }
  });
}

/* ===== Contact form: validation, compile an email, let the visitor send it ===== */
function initContactForm() {
  const form = byId('contactForm');
  const preview = byId('emailPreview');
  const rules = {
    name: commonRules.name,
    email: commonRules.email,
    phone: (value) => commonRules.phone(value, false),
    messageType: (value) => (value ? '' : 'Please choose the type of message.'),
    message: (value) => commonRules.message(value, 20, 1000)
  };
  attachLiveValidation(form, rules);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    preview.replaceChildren();
    if (!validateForm(form, rules)) return;

    const data = Object.fromEntries(new FormData(form));
    const subject = `${data.messageType} from ${data.name.trim()}`;
    const body = [
      `Name: ${data.name.trim()}`,
      `Email: ${data.email.trim()}`,
      `Phone: ${data.phone.trim() || 'not provided'}`,
      `Message type: ${data.messageType}`,
      '',
      data.message.trim()
    ].join('\n');

    const sendLink = createElement('a', 'button-link', 'Send email');
    sendLink.href = `mailto:${CONTACT_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    preview.append(
      createElement('h3', null, 'Your email is ready'),
      createElement('p', null, 'To: ' + CONTACT_RECIPIENT),
      createElement('p', null, 'Subject: ' + subject),
      createElement('pre', 'email-body', body),
      sendLink
    );
    preview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/* ===== Interactive map (Leaflet) ===== */
function initMap() {
  const mapElement = byId('map');
  if (typeof L === 'undefined') {
    mapElement.textContent = 'The map could not be loaded. Please check your internet connection.';
    return;
  }
  const map = L.map(mapElement).setView(OFFICE_LOCATION, 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  const popupContent = createElement('div');
  popupContent.append(
    createElement('strong', null, 'Gift to the Nation'),
    document.createElement('br'),
    document.createTextNode('Toll free: 0800 786 000')
  );
  L.marker(OFFICE_LOCATION).addTo(map).bindPopup(popupContent).openPopup();
}

/* ===== Start-up: run only what the current page contains ===== */
document.addEventListener('DOMContentLoaded', () => {
  highlightCurrentNav();
  initAccordions();
  if (byId('serviceList')) initServices();
  if (byId('aboutTabs')) initTabs();
  if (byId('faqList')) initFaq();
  if (byId('gallery')) initGallery();
  if (byId('enquiryForm')) initEnquiryForm();
  if (byId('contactForm')) initContactForm();
  if (byId('map')) initMap();
  initScrollReveal();
});

document.addEventListener("DOMContentLoaded", function() {
   
    const coords = OFFICE_LOCATION.split(", ");
    const lat = parseFloat(coords[0]);
    const lng = parseFloat(coords[1]);

  
    if (document.getElementById('map')) {
        const map = L.map('map').setView([lat, lng], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([lat, lng]).addTo(map)
            .bindPopup('Our Office Location')
            .openPopup();
    }
});

