// ReçeteLab analytics: GA4 + WhatsApp lead tracking
const GA_MEASUREMENT_ID='G-KMQCJRLZ2K';
(()=>{
  if(!window.dataLayer) window.dataLayer=[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
  gtag('js',new Date());
  gtag('config',GA_MEASUREMENT_ID,{send_page_view:true});
  if(!document.querySelector(`script[data-recetelab-ga4="${GA_MEASUREMENT_ID}"]`)){
    const s=document.createElement('script');s.async=true;s.src=`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;s.dataset.recetelabGa4=GA_MEASUREMENT_ID;document.head.appendChild(s);
  }
})();
const trackWhatsApp=(source,linkUrl='',label='')=>{if(typeof window.gtag!=='function')return;gtag('event','whatsapp_click',{source,link_url:linkUrl,element_text:(label||'').trim().slice(0,100),page_location:location.href,page_path:location.pathname,page_language:document.documentElement.lang||window.RECETELAB?.lang||'',transport_type:'beacon'});};
document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a)return;const href=a.href||'';if(/(?:wa\.me|whatsapp\.com)/i.test(href))trackWhatsApp('whatsapp_link',href,a.textContent||'');});
const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
$('#year').textContent=new Date().getFullYear();
const header=$('.header');let scrollTick=false;addEventListener('scroll',()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{header?.classList.toggle('scrolled',scrollY>20);scrollTick=false})},{passive:true});
$('.lang>button')?.addEventListener('click',e=>{e.stopPropagation();$('.lang').classList.toggle('open')});document.addEventListener('click',()=>$('.lang')?.classList.remove('open'));
$('.menu-toggle')?.addEventListener('click',()=>$('.nav-links').classList.toggle('open'));$$('.nav-links a').forEach(a=>a.addEventListener('click',()=>$('.nav-links').classList.remove('open')));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(x=>io.observe(x));

// Dedicated visual for the self-leveling screed article only.
(()=>{
  const articlePaths=new Set(['/tr/bilgi-merkezi/kendinden-yayilan-sap-maliyet-optimizasyonu/','/en/knowledge-center/self-leveling-screed-cost-optimization/','/ar/knowledge-center/self-leveling-screed-cost-optimization/']);
  const path=location.pathname.replace(/\/+$/,'/');
  if(!articlePaths.has(path))return;
  const hero=$('.article-hero-img');if(hero) hero.src='/assets/self-leveling-screed-cost-optimization.jpg';
})();

// High-resolution Drymix scale-up visual for the original Drymix article and expertise cards.
(()=>{
  const newImage='/assets/drymix-formulation-development.png';
  const path=location.pathname.replace(/\/+$/,'/');
  const articlePaths=new Set(['/tr/bilgi-merkezi/drymix-formulasyon-laboratuvardan-endustriyel-uretime/','/en/knowledge-center/drymix-formulation-lab-to-industrial-production/','/ar/knowledge-center/drymix-formulation-lab-to-industrial-production/']);
  if(articlePaths.has(path)){const hero=$('.article-hero-img');if(hero) hero.src=newImage;}
  $$('img[src="/assets/expertise/drymix-technology.webp"]').forEach(img=>{img.src=newImage;});
})();

// Dedicated raw-material variability artwork: new article hero and its Knowledge Center card in TR/EN/AR.
(()=>{
  const image='/assets/raw-material-variability-drymix.png?v=20260915-2';
  const path=location.pathname.replace(/\/+$/,'/');
  const articlePaths=new Set(['/tr/bilgi-merkezi/hammadde-degisimi-drymix-recete-performansi/','/en/knowledge-center/raw-material-variability-drymix-formulation-troubleshooting/','/ar/knowledge-center/raw-material-variability-drymix-formulation/']);
  if(articlePaths.has(path)){const hero=$('.article-hero-img');if(hero) hero.src=image;}
  const cardHrefs=new Set(['/tr/bilgi-merkezi/hammadde-degisimi-drymix-recete-performansi/','/en/knowledge-center/raw-material-variability-drymix-formulation-troubleshooting/','/ar/knowledge-center/raw-material-variability-drymix-formulation/']);
  $$('.article-card-featured').forEach(card=>{try{const href=new URL(card.href,location.origin).pathname.replace(/\/+$/,'/');if(cardHrefs.has(href)){const img=$('img',card);if(img)img.src=image;}}catch(_){}});
})();


// Dedicated C2TES1 visuals: force the unique hero and S1 technical visual on the article,
// and force the unique hero on its Knowledge Center card. This also repairs stale cached HTML.
(()=>{
  const heroImage='/assets/c2tes1-tile-adhesive-formulation.png?v=20260925-3';
  const s1Image='/assets/c2tes1-s1-deformation-system.png?v=20260925-2';
  const articlePath='/tr/bilgi-merkezi/c2tes1-seramik-yapistirici-formulasyonu/';
  const path=location.pathname.replace(/\/+$/,'/');
  if(path===articlePath){
    const hero=$('.article-hero-img');
    if(hero){hero.src=heroImage;hero.style.display='block';hero.style.visibility='visible';hero.style.opacity='1';}
    if(!document.querySelector('img[src*="c2tes1-s1-deformation-system"]')){
      const headings=[...document.querySelectorAll('.article-body h2')];
      const h=headings.find(x=>/^3\.\s*Selüloz eter/.test((x.textContent||'').trim()));
      if(h){
        const fig=document.createElement('figure');fig.className='article-figure';
        const img=document.createElement('img');img.src=s1Image;img.alt='C2TES1 seramik yapıştırıcıda S1 deformasyonu, yapıştırıcı kesiti ve polimer mikro yapı ilişkisi';img.loading='lazy';img.decoding='async';
        const cap=document.createElement('figcaption');cap.textContent='S1 performansı yalnızca polimer miktarıyla değil; polimer fazı, mineral matris, aderans ve sistemin deformasyon davranışının birlikte dengelenmesiyle oluşur.';
        fig.append(img,cap);h.before(fig);
      }
    }
  }
  $$('.article-card-featured').forEach(card=>{try{const href=new URL(card.href,location.origin).pathname.replace(/\/+$/,'/');if(href===articlePath){const img=$('img',card);if(img){img.src=heroImage;img.style.display='block';img.style.visibility='visible';img.style.opacity='1';}}}catch(_){}});
})();

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sliders=$$('#optimizer input[type=range]');function optimize(){const p=+$('#perf').value,c=+$('#cost').value,w=+$('#work').value;sliders.forEach(s=>s.nextElementSibling.value=s.value);const score=Math.round(p*.46+w*.34+(100-c)*.2);$('#scoreValue').textContent=score;$('.score-ring').style.setProperty('--score',score);$('#qualityBar').style.width=`${Math.max(20,(p+w)/2)}%`;$('#savingBar').style.width=`${Math.max(10,100-c)}%`}sliders.forEach(s=>s.addEventListener('input',optimize));if(sliders.length)optimize();
const regions=window.RECETELAB?.regions||{};const mapPoints=$$('.region-point');const selectRegion=b=>{const k=b.dataset.region,v=regions[k];if(!v)return;mapPoints.forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',active?'true':'false')});$('#regionCode').textContent=k;$('#regionName').textContent=v[0];$('#regionText').textContent=v[1];const list=$('#regionFeatures');if(list){list.innerHTML='';(v[2]||[]).forEach(item=>{const li=document.createElement('li');li.textContent=item;list.appendChild(li)})}};mapPoints.forEach(b=>{b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false');b.addEventListener('click',()=>selectRegion(b));b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectRegion(b)}})});
const assessments={tr:{adh:'İlk odak: polimer türü ve dozajı, su/katı oranı, agrega gradasyonu ve kür koşulları birlikte kontrol edilmeli.',open:'İlk odak: su tutma paketi, selüloz eter seçimi, priz kontrolü ve sıcaklık altında kabuklaşma testi.',crack:'İlk odak: bağlayıcı/agrega oranı, rötre, elastikiyet, su ihtiyacı ve film oluşumu birlikte incelenmeli.',cost:'İlk odak: pahalı katkıların gerçek katkısı, yerel ikame hammaddeler ve dozaj optimizasyonu karşılaştırılmalı.',other:'İlk adım: hedef standardı, mevcut reçeteyi, üretim koşullarını ve saha şikâyetini birlikte ele almak.'},en:{adh:'Initial focus: review polymer type and dosage, water/solid ratio, aggregate grading and curing conditions together.',open:'Initial focus: water-retention package, cellulose ether selection, setting control and skinning under heat.',crack:'Initial focus: binder/aggregate ratio, shrinkage, flexibility, water demand and film formation.',cost:'Initial focus: verify the real contribution of high-cost additives, local substitutes and dosage optimization.',other:'First step: review the target standard, current formula, production conditions and field complaint together.'},ar:{adh:'المحور الأول: مراجعة نوع البوليمر وجرعته ونسبة الماء إلى المواد الصلبة وتدرج الركام وظروف المعالجة معاً.',open:'المحور الأول: نظام الاحتفاظ بالماء ونوع إيثر السليلوز وضبط الشك واختبار تكوّن القشرة في الحرارة.',crack:'المحور الأول: نسبة الرابط إلى الركام والانكماش والمرونة والطلب على الماء وتكوّن الغشاء.',cost:'المحور الأول: قياس الأثر الحقيقي للإضافات مرتفعة التكلفة ومقارنة البدائل المحلية وتحسين الجرعات.',other:'الخطوة الأولى: دراسة المواصفة المستهدفة والتركيبة الحالية وظروف الإنتاج وشكوى الموقع معاً.'}};
$('#assessmentForm')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.currentTarget),problem=f.get('problem'),lang=window.RECETELAB?.lang||document.documentElement.lang;let key=/aderans|adhesion|التماسك/.test(problem)?'adh':/açık|open|التشغيل/.test(problem)?'open':/çat|crack|التشقق/.test(problem)?'crack':/maliyet|cost|التكلفة/.test(problem)?'cost':'other';const text=assessments[lang]?.[key]||assessments.en[key],headline=`${f.get('product')} — ${f.get('goal')}`;$('#assessmentHeadline').textContent=headline;$('#assessmentText').textContent=text;$('#assessmentResult').hidden=false;$('#assessmentShare').href=`https://wa.me/905537718776?text=${encodeURIComponent(headline+'\n'+problem+'\n'+text)}`;$('#assessmentResult').scrollIntoView({behavior:'smooth',block:'nearest'})});
$('#contactForm')?.addEventListener('submit',function(e){e.preventDefault();if(!this.reportValidity())return;const d=new FormData(this),lang=window.RECETELAB?.lang||document.documentElement.lang,rows=[`ReçeteLab consultation request (${lang})`,`Name: ${d.get('name')||'-'}`,`Company: ${d.get('company')||'-'}`,`Phone: ${d.get('phone')||'-'}`,`Email: ${d.get('email')||'-'}`,`Service: ${d.get('service')||'-'}`,`Project: ${d.get('message')||'-'}`];const waUrl=`https://wa.me/905537718776?text=${encodeURIComponent(rows.join('\n'))}`;trackWhatsApp('contact_form',waUrl,'contact_form_submit');window.location.href=waUrl;});
