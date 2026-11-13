// Time-gated content. Elements with:
//   data-launch="<ISO time>"        stay hidden until that time, then appear
//   data-until="<ISO time>"         are visible until that time, then disappear
//   data-launch-redirect="<url>"    (with data-launch) send visitors there if it is still too early
const now = Date.now();
document.querySelectorAll('[data-launch]').forEach((el) => {
  const launched = now >= Date.parse(el.dataset.launch);
  if (launched) {
    el.hidden = false;
  } else if (el.dataset.launchRedirect) {
    location.replace(el.dataset.launchRedirect);
  }
});
document.querySelectorAll('[data-until]').forEach((el) => {
  if (now >= Date.parse(el.dataset.until)) el.hidden = true;
});
