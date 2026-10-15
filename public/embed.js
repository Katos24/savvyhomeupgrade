/*
 * Lead2Project booking form embed helper.
 * Paste next to the iframe:
 *   <iframe src="https://lead2project.com/YOUR-SLUG?embed=1" data-l2p-form
 *           style="width:100%;border:0;min-height:720px" title="Request a quote"></iframe>
 *   <script src="https://lead2project.com/embed.js" async></script>
 *
 * The form tells this page how tall it is (so there's no inner scrollbar)
 * and asks to scroll back to its top when it moves to the next step.
 */
(function () {
  if (window.__l2pEmbed) return;
  window.__l2pEmbed = true;

  function frames() {
    return Array.prototype.slice.call(document.querySelectorAll('iframe[data-l2p-form]'));
  }

  window.addEventListener('message', function (e) {
    var data = e.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string' || data.type.indexOf('l2p:') !== 0) return;

    // Only act on the iframe that sent the message.
    var frame = frames().filter(function (f) {
      return f.contentWindow === e.source;
    })[0];
    if (!frame) return;

    if (data.type === 'l2p:height' && typeof data.height === 'number' && data.height > 0) {
      frame.style.height = Math.ceil(data.height) + 'px';
      frame.style.minHeight = '0';
    }

    if (data.type === 'l2p:scroll') {
      var top = frame.getBoundingClientRect().top + window.pageYOffset - 16;
      if (top < window.pageYOffset) window.scrollTo({ top: top, behavior: 'smooth' });
    }
  });
})();