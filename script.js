(function(){
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- ambient floating dots ----------
  var ambient = document.getElementById('ambient');
  var colors = ['#FFB7D2','#FFC4E1','#FAD3E0','#FFB3C9','#F8A1CA','#F6B3DA','#FFE2F1','#FFC7E3'];
  if(!reduceMotion){
    for(var i=0;i<36;i++){
      var d = document.createElement('span');
      var size = 6 + Math.random()*14;
      d.style.width = size+'px';
      d.style.height = size+'px';
      d.style.left = Math.random()*100+'%';
      d.style.top = Math.random()*100+'%';
      d.style.background = colors[i % colors.length];
      d.style.animationDelay = (Math.random()*4)+'s';
      d.style.animationDuration = (7+Math.random()*5)+'s';
      ambient.appendChild(d);
    }
  }

  // ---------- confetti ----------
  var canvas = document.getElementById('confetti');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var confettiColors = ['#FFB7D2','#FFC2E6','#F8A1CA','#FF8CB0','#D45E8A','#FFD6E8','#FFA6CD'];

  function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function burstConfetti(originX, originY, count){
    if(reduceMotion) return;
    for(var i=0;i<count;i++){
      particles.push({
        x: originX,
        y: originY,
        vx: (Math.random()-0.5)*11,
        vy: -(Math.random()*9+5),
        size: 5+Math.random()*6,
        color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
        rot: Math.random()*360,
        vr: (Math.random()-0.5)*14,
        life: 0,
        maxLife: 110+Math.random()*40
      });
    }
    if(!animating){ animating = true; requestAnimationFrame(tick); }
  }

  var animating = false;
  function tick(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    var alive = false;
    for(var i=0;i<particles.length;i++){
      var p = particles[i];
      if(p.life > p.maxLife) continue;
      alive = true;
      p.vy += 0.18;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      var alpha = 1 - (p.life/p.maxLife);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot*Math.PI/180);
      ctx.globalAlpha = Math.max(alpha,0);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
    }
    particles = particles.filter(function(p){ return p.life <= p.maxLife; });
    if(alive){
      requestAnimationFrame(tick);
    } else {
      animating = false;
      ctx.clearRect(0,0,canvas.width,canvas.height);
    }
  }

  // ---------- gift box open interaction ----------
  var box = document.getElementById('giftBox');
  var coverScreen = document.getElementById('screen-cover');
  var revealScreen = document.getElementById('screen-reveal');
  var opened = false;

  function triggerGift(){
    if(!box || opened) return;
    openGift();
  }

  function openGift(){
    if(opened) return;
    opened = true;
    box.classList.add('opening');

    var rect = box.getBoundingClientRect();
    var originX = rect.left + rect.width/2;
    var originY = rect.top + rect.height*0.3;

    setTimeout(function(){
      burstConfetti(originX, originY, reduceMotion ? 0 : 90);
    }, 350);

    setTimeout(function(){
      coverScreen.classList.add('hide');
      coverScreen.style.display = 'none';
      revealScreen.classList.add('show');
      revealScreen.style.display = 'block';
      setTimeout(function(){
        window.scrollTo({top:0, left:0, behavior:'auto'});
        revealScreen.scrollIntoView({behavior:'auto', block:'start'});
      }, 20);
      setTimeout(function(){
        burstConfetti(window.innerWidth/2, 80, reduceMotion ? 0 : 60);
      }, 200);
    }, 900);
  }

  if(box){
    box.addEventListener('click', triggerGift);
    box.addEventListener('pointerup', triggerGift);
    box.addEventListener('touchend', triggerGift);
    box.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); triggerGift(); }
    });
  }

  // ---------- replay confetti button ----------
  var replayBtn = document.getElementById('replayBtn');
  if(replayBtn){
    replayBtn.addEventListener('click', function(){
      burstConfetti(window.innerWidth/2, window.innerHeight*0.3, reduceMotion ? 0 : 80);
    });
  }

  // ---------- presentation stage arrow navigation ----------
  var presentationCards = document.querySelectorAll('.presentation-card');
  var currentPresentationIndex = 0;
  function updatePresentationCards(){
    presentationCards.forEach(function(card, index){
      card.classList.toggle('active', index === currentPresentationIndex);
    });
    if(nextBtn){
      nextBtn.disabled = currentPresentationIndex >= presentationCards.length - 1;
      nextBtn.style.opacity = nextBtn.disabled ? '.45' : '1';
      nextBtn.style.cursor = nextBtn.disabled ? 'not-allowed' : 'pointer';
    }
  }
  var nextBtn = document.getElementById('presentationNextBtn');
  if(nextBtn){
    nextBtn.addEventListener('click', function(){
      if(currentPresentationIndex < presentationCards.length - 1){
        currentPresentationIndex += 1;
        updatePresentationCards();
      }
    });
  }
  updatePresentationCards();

  // ---------- polaroid scroll reveal ----------
  var polaroids = document.querySelectorAll('.polaroid');
  if('IntersectionObserver' in window){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:0.2});
    polaroids.forEach(function(p){ obs.observe(p); });
  } else {
    polaroids.forEach(function(p){ p.classList.add('in-view'); });
  }
})();
