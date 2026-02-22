// ── Scroll To Top Button ──
(function () {
  const btn    = document.getElementById('scrollTopBtn');
  const hero   = document.getElementById('hero');
  if (!btn || !hero) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        btn.classList.toggle('visible', window.scrollY > heroBottom);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

const tabNames = {
  starters:  'Starters',
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner'
};

document.querySelectorAll('.menu-tab-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = link.dataset.tab;

    document.querySelectorAll('.menu-tab-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    document.querySelectorAll('.menu-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');

    document.querySelector('#tab-' + tab + ' .menu-sub-title').textContent = tabNames[tab];
  });
});



// ── Events Infinite Slider ──
(function () {
  const track    = document.getElementById('eventsTrack');
  const dotsWrap = document.getElementById('eventsDots');
  const cards    = document.querySelectorAll('.event-card');

  if (!track || !cards.length) return;

  const show    = 3;
  const total   = cards.length;
  let current   = 0;
  let autoPlay;
  let isTransitioning = false;


  const allCards = Array.from(cards);

  allCards.slice(-show).reverse().forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('clone');
    track.insertBefore(clone, track.firstChild);
  });

  allCards.slice(0, show).forEach(card => {
    const clone = card.cloneNode(true);
    clone.classList.add('clone');
    track.appendChild(clone);
  });

  let position = show; 

  function getCardWidth() {
    return track.children[0].offsetWidth;
  }

  function jumpTo(index) {
    track.style.transition = 'none';
    position = index;
    track.style.transform = `translateX(-${position * getCardWidth()}px)`;
  }

  function slideTo(index) {
    if (isTransitioning) return;
    isTransitioning = true;
    position = index;
    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform = `translateX(-${position * getCardWidth()}px)`;
  }

  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    const cloneCount = show;
    const realTotal  = total;

    if (position >= cloneCount + realTotal) {
      jumpTo(cloneCount);
      current = 0;
    }
    else if (position < cloneCount) {
      jumpTo(cloneCount + realTotal - 1);
      current = realTotal - 1;
    } else {
      current = position - cloneCount;
    }

    updateDots();
  });

  jumpTo(show);

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to event ${i + 1}`);
      dot.classList.add('events-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        clearInterval(autoPlay);
        current = i;
        slideTo(show + i);
        startAuto();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    document.querySelectorAll('.events-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() {
    slideTo(position + 1);
  }

  function startAuto() {
    clearInterval(autoPlay);
    autoPlay = setInterval(next, 3000);
  }

  buildDots();
  startAuto();

  window.addEventListener('resize', () => {
    track.style.transition = 'none';
    track.style.transform = `translateX(-${position * getCardWidth()}px)`;
  });
})();


// ── Booking Form Validation ──
const bookingBtn = document.querySelector('.booking-btn');

if (bookingBtn) {
  bookingBtn.addEventListener('click', () => {

    const fields = {
      'Your Name':    document.querySelector('.booking-input[placeholder="Your Name"]'),
      'Your Email':   document.querySelector('.booking-input[placeholder="Your Email"]'),
      'Your Phone':   document.querySelector('.booking-input[placeholder="Your Phone"]'),
      'Date':         document.querySelector('.booking-input[type="date"]'),
      'Time':         document.querySelector('.booking-input[type="time"]'),
      '# of people':  document.querySelector('.booking-input[placeholder="# of people"]'),
    };

    let isValid = true;

    Object.values(fields).forEach(input => {
      if (input) input.classList.remove('input-error');
    });

    Object.entries(fields).forEach(([name, input]) => {
      if (input && !input.value.trim()) {
        input.classList.add('input-error');
        isValid = false;
      }
    });

    if (!isValid) {
      showNotification('❌ Please fill in all required fields.', 'error');
      return;
    }

    const emailInput = fields['Your Email'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('input-error');
      showNotification('❌ Please enter a valid email address.', 'error');
      return;
    }

    showNotification('✅ Your reservation has been confirmed! We look forward to seeing you.', 'success');

    Object.values(fields).forEach(input => { if (input) input.value = ''; });
    const textarea = document.querySelector('.booking-textarea');
    if (textarea) textarea.value = '';
  });
}

function showNotification(message, type) {
  const old = document.getElementById('bookingNotif');
  if (old) old.remove();

  const notif = document.createElement('div');
  notif.id = 'bookingNotif';
  notif.textContent = message;
  notif.style.cssText = `
    position: fixed;
    top: 30px;
    right: 30px;
    z-index: 9999;
    padding: 16px 28px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'Open Sans', sans-serif;
    color: #fff;
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    background: ${type === 'success' ? '#28a745' : '#e83e3e'};
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    max-width: 380px;
    line-height: 1.5;
  `;

  document.body.appendChild(notif);

  requestAnimationFrame(() => {
    notif.style.opacity = '1';
    notif.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translateY(-10px)';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

// ── Contact Form Validation ──
(function () {
  const sendBtn = document.getElementById('contactSendBtn');
  if (!sendBtn) return;

  sendBtn.addEventListener('click', () => {
    const name    = document.getElementById('cName');
    const email   = document.getElementById('cEmail');
    const subject = document.getElementById('cSubject');
    const message = document.getElementById('cMessage');
    const fields  = [name, email, subject, message];

    fields.forEach(f => f && f.classList.remove('input-error'));

    let isValid = true;
    fields.forEach(f => {
      if (f && !f.value.trim()) {
        f.classList.add('input-error');
        isValid = false;
      }
    });

    if (!isValid) {
      showNotification('❌ Please fill in all required fields.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value.trim())) {
      email.classList.add('input-error');
      showNotification('❌ Please enter a valid email address.', 'error');
      return;
    }

    showNotification('✅ Your message has been sent. Thank you!', 'success');
    fields.forEach(f => { if (f) f.value = ''; });
  });
})();

// ── Page Loader ──
(function () {
  var loaderHidden = false;

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    var loader = document.getElementById('pageLoader');
    if (!loader) return;
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    loader.style.transition = 'opacity 0.5s ease, visibility 0.5s ease';
    setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
      document.body.classList.add('hero-ready');
    }, 550);
  }

  setTimeout(hideLoader, 1200); // Reduced from 2500ms to improve LCP

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 800);
  } else {
    window.addEventListener('load', function () { setTimeout(hideLoader, 800); });
    document.addEventListener('DOMContentLoaded', function () { setTimeout(hideLoader, 1200); });
  }
})();


// ── Scroll Reveal ──
(function () {
  const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  const elements  = document.querySelectorAll(selectors);

  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


// ── Stats Counter ──
(function () {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = +el.dataset.target;
    const duration = 2000;
    const step = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
    }, step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();
(function () {
  const navbar     = document.getElementById('mainNav');
  const navCollapse = document.getElementById('navbarNav');
  const OFFSET     = 75;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return; 

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });

      if (navCollapse && navCollapse.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    });
  });

  const navLinks = document.querySelectorAll('.navbar-nav .nav-link:not(.dropdown-toggle)');
  const sections = [];

  navLinks.forEach(link => {
    const id = link.getAttribute('href');
    if (id && id.startsWith('#') && id.length > 1) {
      const sec = document.querySelector(id);
      if (sec) sections.push({ link, sec });
    }
  });

  function setActive() {
    const scrollY = window.scrollY + OFFSET + 10;
    let current = null;

    sections.forEach(({ sec }) => {
      if (sec.offsetTop <= scrollY) current = sec.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === '#' + current);
    });

    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();

(function () {
  const track    = document.getElementById('galleryTrack');
  const dotsWrap = document.getElementById('galleryDots');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.gallery-slide'));
  const total  = slides.length;
  let current  = 0;
  let autoPlay;


  function getWrapWidth() {
    return track.parentElement.offsetWidth;
  }

  function update(animate) {
    slides.forEach((slide, i) => {
      let offset = i - current;

      if (offset > total / 2)  offset -= total;
      if (offset < -total / 2) offset += total;

      const isActive   = offset === 0;
      const isVisible  = Math.abs(offset) <= 2;  

      slide.classList.toggle('active', isActive);
      slide.style.opacity = isVisible ? (isActive ? '1' : '0.6') : '0';
      slide.style.pointerEvents = isVisible ? 'auto' : 'none';
      slide.style.zIndex     = 10 - Math.abs(offset);


      const wrapW       = getWrapWidth();
      const activeW     = slide.offsetWidth || wrapW * 0.24;
      const sideW       = wrapW * 0.22;

      let translateX = 0;
      if (offset === 0) {
        translateX = (wrapW / 2) - (activeW / 2);
      } else {
        const sign = offset > 0 ? 1 : -1;
        const steps = Math.abs(offset);
        translateX = (wrapW / 2) + sign * (activeW / 2);
        for (let s = 1; s < steps; s++) translateX += sign * sideW;
        if (offset < 0) translateX -= sideW;
      }

      slide.style.transition  = animate ? 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease' : 'none';
      slide.style.transform   = `translateX(${translateX}px)`;
      slide.style.position    = 'absolute';
      slide.style.left        = '0';
    });
  }

  track.style.position = 'relative';
  track.style.overflow = 'visible'; 
  function setTrackHeight() {
    track.style.height = '270px';
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to image ${i + 1}`);
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        clearInterval(autoPlay);
        current = i;
        update(true);
        updateDots();
        startAuto();
      });
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    document.querySelectorAll('.gallery-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(idx) {
    current = ((idx % total) + total) % total;
    update(true);
    updateDots();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(autoPlay);
    autoPlay = setInterval(next, 3000);
  }

  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => {
      if (i === current) return;
      clearInterval(autoPlay);
      goTo(i);
      startAuto();
    });
  });

  let startX = 0;
  track.parentElement.addEventListener('mousedown',  e => { startX = e.clientX; });
  track.parentElement.addEventListener('mouseup',    e => {
    const d = startX - e.clientX;
    if (Math.abs(d) > 50) { clearInterval(autoPlay); d > 0 ? next() : prev(); startAuto(); }
  });
  track.parentElement.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.parentElement.addEventListener('touchend',   e => {
    const d = startX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { clearInterval(autoPlay); d > 0 ? next() : prev(); startAuto(); }
  }, { passive: true });

  window.addEventListener('resize', () => { setTrackHeight(); update(false); });

  setTrackHeight();
  buildDots();
  update(false);
  startAuto();
})();