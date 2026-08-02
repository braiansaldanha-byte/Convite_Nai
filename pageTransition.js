(function(){
  var body = document.body;
  if(!body) return;
  body.classList.add('fade-in');

  var links = document.querySelectorAll('a[href]');
  links.forEach(function(link){
    var href = link.getAttribute('href');
    if(!href || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
    if(link.target === '_blank' || link.target === '_top' || link.target === '_parent') return;
    if(href.indexOf('javascript:') === 0) return;
    link.addEventListener('click', function(event){
      if(href.charAt(0) === '#') return;
      event.preventDefault();
      body.classList.remove('fade-in');
      body.classList.add('fade-out');
      setTimeout(function(){ window.location.href = href; }, 300);
    });
  });
})();
