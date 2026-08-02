function setActiveNav(){
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    if(a.getAttribute('data-page') === path) a.classList.add('active');
  });
}
document.addEventListener('DOMContentLoaded', setActiveNav);

function initCarousel(){
  document.querySelectorAll('.carousel-wrap').forEach(wrap=>{
    const track = wrap.querySelector('.carousel');
    const prev = wrap.querySelector('.c-prev');
    const next = wrap.querySelector('.c-next');
    if(!track) return;
    const scrollAmt = () => {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 40;
      return (track.querySelector('.cd-card, .session-card, .fs-card')?.offsetWidth || 300) + gap;
    };
    prev && prev.addEventListener('click', ()=> track.scrollBy({left: -scrollAmt(), behavior:'smooth'}));
    next && next.addEventListener('click', ()=> track.scrollBy({left: scrollAmt(), behavior:'smooth'}));
  });
}
document.addEventListener('DOMContentLoaded', initCarousel);

function initMobileNav(){
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if(!toggle || !nav) return;
  toggle.addEventListener('click', ()=>{
    nav.classList.toggle('mobile-menu-open');
  });
}
document.addEventListener('DOMContentLoaded', initMobileNav);

function initTeaserVideo(){
  const wrap = document.querySelector('#teaser-video-wrap');
  const video = document.querySelector('#teaser-video');
  if(!wrap || !video) return;
  wrap.addEventListener('click', ()=>{
    if(video.paused){
      video.setAttribute('controls','');
      video.play();
      wrap.classList.add('is-playing');
    }
  });
  video.addEventListener('pause', ()=> wrap.classList.remove('is-playing'));
  video.addEventListener('ended', ()=>{
    wrap.classList.remove('is-playing');
    video.removeAttribute('controls');
  });
}
document.addEventListener('DOMContentLoaded', initTeaserVideo);

function initForm(){
  const form = document.querySelector('#sound-form');
  if(!form) return;

  const banner = form.querySelector('#form-banner');
  const submitBtn = form.querySelector('.submit-btn');

  const fields = {
    firstName: { input: form.querySelector('[name="Nombre"]'), wrap: form.querySelector('[data-field="firstName"]') },
    lastName:  { input: form.querySelector('[name="Apellido"]'), wrap: form.querySelector('[data-field="lastName"]') },
    email:     { input: form.querySelector('[name="Email"]'), wrap: form.querySelector('[data-field="email"]') },
    phone:     { input: form.querySelector('[name="Teléfono"]'), wrap: form.querySelector('[data-field="phone"]') },
    message:   { input: form.querySelector('[name="Mensaje"]'), wrap: form.querySelector('[data-field="message"]') }
  };

  function showBanner(message, type){
    banner.textContent = message;
    banner.className = 'form-banner show' + (type === 'success' ? ' success' : '');
  }
  function hideBanner(){
    banner.className = 'form-banner';
  }
  function clearFieldError(key){
    fields[key].wrap.classList.remove('has-error');
  }
  function setFieldError(key){
    fields[key].wrap.classList.add('has-error');
  }
  function isValidEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // Clear individual field errors as the person fixes them
  Object.keys(fields).forEach(key=>{
    const el = fields[key].input;
    if(!el) return;
    el.addEventListener('input', ()=> clearFieldError(key));
  });

  function validate(){
    let firstInvalidEl = null;
    const missing = [];

    if(!fields.firstName.input.value.trim()){ setFieldError('firstName'); missing.push('Nombre'); firstInvalidEl = firstInvalidEl || fields.firstName.input; } else clearFieldError('firstName');
    if(!fields.lastName.input.value.trim()){ setFieldError('lastName'); missing.push('Apellido'); firstInvalidEl = firstInvalidEl || fields.lastName.input; } else clearFieldError('lastName');
    if(!isValidEmail(fields.email.input.value.trim())){ setFieldError('email'); missing.push('Email'); firstInvalidEl = firstInvalidEl || fields.email.input; } else clearFieldError('email');
    if(!fields.phone.input.value.trim()){ setFieldError('phone'); missing.push('Teléfono'); firstInvalidEl = firstInvalidEl || fields.phone.input; } else clearFieldError('phone');
    if(!fields.message.input.value.trim()){ setFieldError('message'); missing.push('Dream Bigger'); firstInvalidEl = firstInvalidEl || fields.message.input; } else clearFieldError('message');

    return { ok: missing.length === 0, missing, firstInvalidEl };
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    hideBanner();

    const result = validate();
    if(!result.ok){
      showBanner('Faltan completar campos obligatorios: ' + result.missing.join(', ') + '.', 'error');
      if(result.firstInvalidEl){
        result.firstInvalidEl.scrollIntoView({behavior:'smooth', block:'center'});
        result.firstInvalidEl.focus({preventScroll:true});
      }
      return;
    }

    // sync reply-to with the email the person entered
    const replyTo = form.querySelector('[name="_replyto"]');
    if(replyTo) replyTo.value = fields.email.input.value.trim();

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    }).then(response=>{
      if(response.ok){
        showBanner('¡Listo! Tu mensaje fue enviado a Amelia. Te vamos a contactar a ' + fields.email.input.value.trim() + '.', 'success');
        form.reset();
        Object.keys(fields).forEach(clearFieldError);
        submitBtn.textContent = 'Enviado ✓';
        setTimeout(()=>{ submitBtn.textContent = originalLabel; submitBtn.disabled = false; }, 2600);
      } else {
        return response.json().then(data=>{
          const msg = (data && data.errors && data.errors.length) ? data.errors.map(e=>e.message).join(' ') : 'Hubo un problema al enviar. Probá de nuevo o escribinos directamente a sessions@ameliaenvivo.com.';
          showBanner(msg, 'error');
          submitBtn.textContent = originalLabel;
          submitBtn.disabled = false;
        });
      }
    }).catch(()=>{
      showBanner('No pudimos enviar el mensaje. Probá de nuevo o escribinos directamente a sessions@ameliaenvivo.com.', 'error');
      submitBtn.textContent = originalLabel;
      submitBtn.disabled = false;
    });
  });
}
document.addEventListener('DOMContentLoaded', initForm);


/* ── Overlay menu (Colors x Studios style) ── */
function initOverlayMenu(){
  const openBtn  = document.getElementById('menuOpen');
  const closeBtn = document.getElementById('menuClose');
  const overlay  = document.getElementById('menuOverlay');
  if(!openBtn || !overlay) return;

  openBtn.addEventListener('click', ()=>{
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });
  const close = ()=>{
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  closeBtn && closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', e=>{ if(e.target === overlay) close(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });

  // Mark active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  overlay.querySelectorAll('.menu-overlay-link').forEach(a=>{
    if(a.getAttribute('data-page') === path || a.getAttribute('href') === path){
      a.classList.add('active');
    }
  });
}
document.addEventListener('DOMContentLoaded', initOverlayMenu);

/* ── Inner nav: agrega clase .scrolled al hacer scroll ── */
function initInnerNav(){
  const nav = document.querySelector('.nav-inner');
  if(!nav) return;
  const onScroll = ()=> nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
}
document.addEventListener('DOMContentLoaded', initInnerNav);

/* ── Lightbox ── */
function initLightbox(){
  const images = Array.from(document.querySelectorAll('.lightbox-trigger'));
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');
  const lbCounter = document.getElementById('lightboxCounter');
  if(!lb || !images.length) return;

  let current = 0;

  function open(idx){
    current = idx;
    lbImg.src = images[idx].src;
    lbImg.alt = images[idx].alt;
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    updateCounter();
  }
  function close(){
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(()=>{ lbImg.src=''; }, 300);
  }
  function prev(){
    current = (current - 1 + images.length) % images.length;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt;
    updateCounter();
  }
  function next(){
    current = (current + 1) % images.length;
    lbImg.src = images[current].src;
    lbImg.alt = images[current].alt;
    updateCounter();
  }
  function updateCounter(){
    if(lbCounter) lbCounter.textContent = (current + 1) + ' / ' + images.length;
  }

  images.forEach((img, idx)=> img.addEventListener('click', ()=> open(idx)));
  lbClose && lbClose.addEventListener('click', close);
  lbPrev && lbPrev.addEventListener('click', prev);
  lbNext && lbNext.addEventListener('click', next);
  lb.addEventListener('click', e=>{ if(e.target === lb || e.target === document.querySelector('.lightbox-img-wrap')) close(); });
  document.addEventListener('keydown', e=>{
    if(!lb.classList.contains('is-open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') prev();
    if(e.key === 'ArrowRight') next();
  });
}
document.addEventListener('DOMContentLoaded', initLightbox);

/* ── Scroll Reveal ── */
function initReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}
document.addEventListener('DOMContentLoaded', initReveal);
