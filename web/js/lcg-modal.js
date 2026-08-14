/* ── Modal La Cumbre Gastronómica (contenido de tercero, solo en index.html) ── */
(function(){
  var END_DATE = new Date('2026-10-30T00:00:00');
  if(new Date() >= END_DATE) return;
  if(sessionStorage.getItem('lcgModalShown')) return;

  document.addEventListener('DOMContentLoaded', function(){
    var overlay = document.getElementById('lcgModalOverlay');
    var closeBtn = document.getElementById('lcgModalClose');
    if(!overlay) return;

    setTimeout(function(){
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      sessionStorage.setItem('lcgModalShown', '1');
    }, 1500);

    function close(){
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    closeBtn && closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
  });
})();
