---
name: Astro ClientRouter Best Practices
description: Enforces SPA-like routing with ClientRouter and correct script lifecycle handling in Astro projects.
---

# Astro ClientRouter Constraints

1. **Always use ClientRouter**: For Astro projects, always ensure `<ClientRouter />` from `astro:transitions` is imported and placed in the `<head>` of the global Layout to enable fast, SPA-like client-side routing.
2. **Handle Script Re-execution**: Because `ClientRouter` intercepts navigation, standard `<script is:inline>` tags will only execute on the initial page load. You MUST do one of the following for all custom scripts:
   - For simple inline scripts: Add the `data-astro-rerun` attribute (`<script is:inline data-astro-rerun>`).
   - For complex DOM manipulation or API calls: Wrap the initialization logic inside an event listener for `astro:page-load`:
     ```javascript
     document.addEventListener('astro:page-load', () => {
       if (document.getElementById('specific-page-element')) {
         initFunction();
       }
     });
     ```
3. **Modal & Event Listeners**: Always ensure event listeners attached to DOM elements are re-attached on `astro:page-load` to prevent UI bugs when users navigate back and forth between pages.
