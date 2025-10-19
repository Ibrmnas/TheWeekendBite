
(function(){
  function token(str){ return (str||"").replaceAll("{city}", window.SITE_CONFIG.city).replaceAll("{brand}", window.SITE_CONFIG.brand); }
  function setLang(lang){
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function(n){
      var key = n.getAttribute('data-i18n');
      var txt = (window.I18N_DICT[lang]||{})[key] || "";
      n.innerHTML = token(txt);
    });
    var enBtn = document.getElementById('btn-en');
    var itBtn = document.getElementById('btn-it');
    if(enBtn&&itBtn){ enBtn.classList.toggle('active', lang==='en'); itBtn.classList.toggle('active', lang==='it'); }
  }
  function initLang(){
    var saved = localStorage.getItem('lang');
    var pref = saved ? saved : ((navigator.language || 'en').toLowerCase().startsWith('it') ? 'it' : 'en');
    setLang(pref);
  }
  function markActive(){
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navlinks a').forEach(function(a){
      var href = a.getAttribute('href'); if(!href) return;
      var active = path === href || (path==='' && href==='index.html');
      a.classList.toggle('active', active);
    });
  }
  function getCart(){ try { return JSON.parse(localStorage.getItem('cart')||"[]"); } catch(e){ return []; } }
  function setCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); updateOrderCount(); }
  function addToCart(key, qty){
    qty = parseFloat(qty||0); if(!qty) return;
    var cart = getCart();
    var found = cart.find(function(x){ return x.key===key; });
    if(found){ found.qty = (parseFloat(found.qty||0) + qty); }
    else{
      var item = (window.SITE_CONFIG.items||[]).find(function(i){return i.key===key;});
      if(!item) return;
      cart.push({ key: key, qty: qty, price: item.price });
    }
    setCart(cart);
    try{ alert('Added to order'); }catch(e){}
  }
  function updateOrderCount(){
    var c = getCart().reduce(function(sum, x){ return sum + (parseFloat(x.qty)||0); }, 0);
    var badge = document.getElementById('order-count');
    if(badge){ badge.textContent = c>0 ? (Math.round(c*10)/10)+' kg' : ''; badge.style.display = c>0?'inline-flex':'none'; }
  }

  window.__WBB = { setLang: setLang, addToCart: addToCart, getCart: getCart };

  document.addEventListener('DOMContentLoaded', function(){
    initLang(); markActive(); updateOrderCount();
    document.querySelector('#btn-en')?.addEventListener('click', function(){ setLang('en'); });
    document.querySelector('#btn-it')?.addEventListener('click', function(){ setLang('it'); });
    document.querySelectorAll('[data-wa]').forEach(function(a){
      var msg = encodeURIComponent('Ciao! Vorrei ordinare le marinature di pollo.');
      a.setAttribute('href', window.SITE_CONFIG.wa + msg);
    });
    document.querySelectorAll('[data-phone]').forEach(function(n){ n.textContent = window.SITE_CONFIG.phone; });
  });
})();
