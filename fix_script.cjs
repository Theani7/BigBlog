const fs = require('fs');
let code = fs.readFileSync('src/pages/p/[slug].astro', 'utf8');

// Wrap everything inside <script> with astro:page-load
const scriptStart = '<script>\n';
const replacement = `<script>
  let _shareMenuListenerAttached = false;
  
  document.addEventListener('astro:page-load', () => {
`;

code = code.replace(scriptStart, replacement);

const scriptEnd = `  })();
</script>`;
const newScriptEnd = `  })();
  
  if (!_shareMenuListenerAttached) {
    _shareMenuListenerAttached = true;
    document.addEventListener('click', (e) => {
      const currentShareMenu = document.getElementById('share-menu');
      const currentShareBtn = document.getElementById('share-btn');
      if (currentShareMenu && !currentShareMenu.hasAttribute('hidden')) {
        if (!currentShareMenu.contains(e.target) && !currentShareBtn?.contains(e.target)) {
          currentShareMenu.setAttribute('hidden', '');
          currentShareBtn?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  }
  }); // end astro:page-load
</script>`;

// wait, the old script had:
//   document.addEventListener('click', (e) => { ... shareMenu ... });
// I should remove the old one.

// Let's just do a manual string replace.
