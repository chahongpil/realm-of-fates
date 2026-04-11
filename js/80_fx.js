// 80_fx.js — extracted by docs/_split_modules.py (Phase 5)
// FX module assigned to RoF namespace.

RoF.FX ={
  canvas:null,ctx:null,particles:[],bolts:[],_raf:null,

  initTitle(){
    this.destroy();
    const screen=document.getElementById('title-screen');if(!screen)return;
    const c=document.createElement('canvas');c.id='title-fx';
    c.style.cssText='position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    c.width=screen.offsetWidth;c.height=screen.offsetHeight;
    screen.insertBefore(c,screen.children[1]);// after ::before
    this.canvas=c;this.ctx=c.getContext('2d');
    this.particles=[];this.bolts=[];
    // Create embers
    for(let i=0;i<50;i++){
      this.particles.push({
        x:Math.random()*c.width,y:c.height+Math.random()*100,
        speed:0.3+Math.random()*1.5,drift:(Math.random()-.5)*.5,
        size:1+Math.random()*3,alpha:0.3+Math.random()*.5,
        color:Math.random()>.5?'255,100,30':'255,170,60',
      });
    }
    this._boltTimer=0;
    this._loop();
  },

  _loop(){
    if(!this.ctx)return;
    const c=this.canvas,ctx=this.ctx;
    ctx.clearRect(0,0,c.width,c.height);

    // Draw embers
    this.particles.forEach(p=>{
      p.y-=p.speed;p.x+=p.drift+Math.sin(p.y*.01)*.3;
      p.alpha-=0.002;
      if(p.y<-20||p.alpha<=0){p.y=c.height+10;p.x=Math.random()*c.width;p.alpha=0.3+Math.random()*.5;}
      ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.color},${p.alpha})`;ctx.fill();
      // Glow
      ctx.beginPath();ctx.arc(p.x,p.y,p.size*3,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.color},${p.alpha*.2})`;ctx.fill();
    });

    // Lightning bolts
    this._boltTimer++;
    if(this._boltTimer>180+Math.random()*120){
      this._boltTimer=0;
      const bolt={segments:[],alpha:0.8,life:20};
      let x=c.width*.3+Math.random()*c.width*.4,y=0;
      bolt.segments.push({x,y});
      for(let s=0;s<10;s++){
        x+=(Math.random()-.5)*80;y+=c.height/10;
        bolt.segments.push({x,y});
      }
      this.bolts.push(bolt);
    }
    // Draw & fade bolts
    this.bolts=this.bolts.filter(b=>{
      b.alpha-=0.04;b.life--;
      if(b.alpha<=0)return false;
      ctx.beginPath();ctx.moveTo(b.segments[0].x,b.segments[0].y);
      b.segments.forEach(s=>ctx.lineTo(s.x,s.y));
      ctx.strokeStyle=`rgba(150,180,255,${b.alpha})`;ctx.lineWidth=2;ctx.stroke();
      // Glow line
      ctx.strokeStyle=`rgba(100,140,255,${b.alpha*.3})`;ctx.lineWidth=8;ctx.stroke();
      // Flash overlay
      if(b.life>15){ctx.fillStyle=`rgba(150,180,255,${(b.life-15)*0.02})`;ctx.fillRect(0,0,c.width,c.height);}
      return true;
    });

    this._raf=requestAnimationFrame(()=>this._loop());
  },

  destroy(){
    if(this._raf)cancelAnimationFrame(this._raf);this._raf=null;
    this.ctx=null;this.particles=[];this.bolts=[];
    const c=document.getElementById('title-fx');if(c)c.remove();
  }
};

// Expose as global for inline onclick="FX.foo()" bindings and Game cross-refs.
window.FX = RoF.FX;