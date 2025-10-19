
(function(){
  function money(n){ return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2); }
  function itemsMap(){ var m={}; (window.SITE_CONFIG.items||[]).forEach(i=>m[i.key]=i); return m; }

  function addRow(tbody, row){
    var map = itemsMap();
    var tr = document.createElement('tr');
    function td(){ return document.createElement('td'); }

    var tdItem = td(); var sel = document.createElement('select');
    (window.SITE_CONFIG.items||[]).forEach(function(it){
      var opt = document.createElement('option');
      opt.value = it.key; opt.textContent = it.name_en + ' / ' + it.name_it; sel.appendChild(opt);
    });
    tdItem.appendChild(sel);

    var tdPrice = td(); var price = document.createElement('input'); price.type='number'; price.step='0.01'; price.readOnly=true; tdPrice.appendChild(price);
    var tdQty   = td(); var qty   = document.createElement('input'); qty.type='number'; qty.step='0.1'; qty.min='0'; tdQty.appendChild(qty);
    var tdNotes = td(); var notes = document.createElement('input'); notes.type='text'; tdNotes.appendChild(notes);
    var tdTot   = td(); var tot   = document.createElement('input'); tot.type='number'; tot.step='0.01'; tot.readOnly=true; tdTot.appendChild(tot);
    var tdAct   = td(); var del = document.createElement('button'); del.textContent='✕'; del.className='btn'; del.addEventListener('click',()=>{tr.remove(); recalc();}); tdAct.appendChild(del);

    [tdItem, tdPrice, tdQty, tdNotes, tdTot, tdAct].forEach(x=>tr.appendChild(x)); tbody.appendChild(tr);

    function sync(){
      var it = map[sel.value]; var p = it?it.price:0; price.value = money(p);
      var q = parseFloat(qty.value||0); tot.value = money(p*q); recalc();
    }
    sel.addEventListener('change', sync); qty.addEventListener('input', sync);

    if(row){ sel.value=row.key; qty.value=row.qty; } else { sel.value=Object.keys(map)[0]; qty.value=1; }
    sync();
  }

  function recalc(){
    var sum = 0; document.querySelectorAll('tbody tr').forEach(tr=>{ sum += parseFloat(tr.querySelector('td:nth-child(5) input').value||0); });
    document.getElementById('grand').textContent = money(sum);
  }

  async function sendToSheet(){
    var endpoint = window.WB_ENDPOINT || "";
    if(!endpoint){ alert("Admin: please set WB_ENDPOINT in assets/js/backend.js"); return; }

    var items = [];
    document.querySelectorAll('tbody tr').forEach(function(tr){
      var sel = tr.querySelector('select');
      var name = sel.options[sel.selectedIndex].text.split(' / ')[0];
      var key  = sel.value;
      var price= parseFloat(tr.querySelector('td:nth-child(2) input').value||0);
      var qty  = parseFloat(tr.querySelector('td:nth-child(3) input').value||0);
      var notes= tr.querySelector('td:nth-child(4) input').value||'';
      if(qty>0){ items.push({ key, name, price, qty, notes }); }
    });

    var payload = {
      name:    document.getElementById('c-name').value.trim(),
      phone:   document.getElementById('c-phone').value.trim(),
      address: document.getElementById('c-addr').value.trim(),
      notes:   document.getElementById('c-notes').value.trim(),
      items,
      lang: document.documentElement.lang || 'en',
      ua: navigator.userAgent,
      hp: document.getElementById('hp-field').value || ""
    };

    if(!payload.name || !payload.phone || !payload.address || items.length===0){
      alert('Please fill your details and add at least one item.'); return;
    }

    var btn = document.getElementById('place-order');
    var prev = btn.textContent; btn.textContent = 'Sending...'; btn.disabled = true;

    try{
      var res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var j = await res.json().catch(()=>({ok:false, error:'Invalid JSON'}));
      if(j.ok){
        alert('Order received! Your ID: '+j.id);
        localStorage.removeItem('cart');
        location.href = 'index.html';
      }else{
        alert('Error: '+(j.error||'Unknown error'));
      }
    }catch(err){
      alert('Network error: '+err.message);
    }finally{
      btn.textContent = prev; btn.disabled = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    var tbody = document.getElementById('rows');
    addRow(tbody); addRow(tbody); recalc();

    document.getElementById('add').addEventListener('click', ()=>addRow(tbody));
    document.getElementById('clear').addEventListener('click', ()=>{ tbody.innerHTML=''; recalc(); });
    document.getElementById('csv').addEventListener('click', ()=>{
      var rows = [['Item','Price_EUR_kg','Qty_kg','Notes','Line_Total_EUR']];
      document.querySelectorAll('tbody tr').forEach(function(tr){
        var sel = tr.querySelector('select');
        var price = tr.querySelector('td:nth-child(2) input').value;
        var qty = tr.querySelector('td:nth-child(3) input').value;
        var notes = tr.querySelector('td:nth-child(4) input').value;
        var total = tr.querySelector('td:nth-child(5) input').value;
        rows.push([sel.options[sel.selectedIndex].text, price, qty, notes, total]);
      });
      var csv = rows.map(r=>r.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n');
      var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href=url; a.download='order-'+new Date().toISOString().slice(0,10)+'.csv'; a.click(); URL.revokeObjectURL(url);
    });
    document.getElementById('place-order').addEventListener('click', sendToSheet);
  });
})();
