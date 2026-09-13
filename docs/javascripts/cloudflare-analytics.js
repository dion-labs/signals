(function () {
  if (document.querySelector('script[src*="static.cloudflareinsights.com/beacon.min.js"]')) return;
  var beacon = document.createElement('script');
  beacon.defer = true;
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon = '{"token":"81c5346b0c3849ef9585959b79870b51"}';
  document.head.appendChild(beacon);
})();
