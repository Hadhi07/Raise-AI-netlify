// Raise AI blog: prompt copy buttons, topic filter, CTA tracking.
// Every page works with JavaScript off: prompts are plain text, all posts stay listed.
(function () {
  'use strict';
  var post = window.RAISE_POST || null;

  function track(name, pixelName) {
    try { if (window.clarity) window.clarity('event', name); } catch (e) {}
    try { if (pixelName && window.fbq) window.fbq('trackCustom', pixelName, post ? { slug: post.slug } : {}); } catch (e) {}
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  // Prompt cards
  document.querySelectorAll('.prompt').forEach(function (card) {
    var code = card.querySelector('pre');
    var btn = card.querySelector('[data-copy]');
    if (!code || !btn) return;
    var label = btn.textContent;
    function copied() {
      btn.textContent = 'Copied';
      btn.classList.add('done');
      setTimeout(function () { btn.textContent = label; btn.classList.remove('done'); }, 1800);
      track('prompt_copied', 'PromptCopied');
    }
    btn.addEventListener('click', function () {
      copyText(code.textContent).then(copied, function () { btn.textContent = 'Select and copy'; });
    });
    // "Copy + open" links: copy first, then let the link open the chat tool in a new tab.
    card.querySelectorAll('[data-copy-open]').forEach(function (a) {
      a.addEventListener('click', function () { copyText(code.textContent).then(copied, function () {}); });
    });
  });

  // CTA tracking
  var mid = document.getElementById('midbox-cta-btn');
  if (mid && post) mid.addEventListener('click', function () { track(post.event, post.pixel); });

  // Topic filter on the blog index
  var btns = document.querySelectorAll('.pills button[data-f]');
  if (btns.length) {
    var items = document.querySelectorAll('.feat, .posts .post');
    var empty = document.getElementById('blog-empty');
    var apply = function (f) {
      var shown = 0;
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
      items.forEach(function (el) {
        var show = f === 'all' || el.getAttribute('data-cat') === f;
        el.style.display = show ? '' : 'none';
        if (show) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    };
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-f');
        apply(f);
        try { history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f); } catch (e) {}
        track('filter_used');
      });
    });
    var initial = location.hash.replace('#', '');
    if (initial && document.querySelector('.pills button[data-f="' + initial + '"]')) apply(initial);
  }
})();
