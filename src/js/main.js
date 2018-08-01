'use strict';
(function(win, doc){
    /*** CONSTANT: Don't modify ***/
    let   _WAIT       = true; //waiting for append all object to array
    /*** VARIABLES ***/
    const _QUANTITY   = 20;      // default number of elements
    const _COLOR      = '#ef709d'; // default color of elements
    const _TYPE       = 'circle'; // default type of elements
    const _FILL       = '#1f2121'; // default filling of elements
    const _FTP        = 30; //number of frames per secund
    const _SPEED      = 0.3; // default speed of animation
    const _L_DISTANCE = 200; // range of connections
    let   _ANIMATE    = 'on'; // animation switch
    let   _DIFF_SPEED = 'off'; // start different speed of elements
    /* INPUT ARRAY: [ shapes_quantity, shapes_color, shapes_type, shapes_sides, movement_speed] */
    let INPUT = [];
    class Core{
      constructor(){
        if (new.target === Core) {
          throw new TypeError("Cannot construct Core instances directly");
        }
        this.CANVAS = doc.getElementById('canvas') || false;
        this.CTX  = this.CANVAS.getContext("2d");
      }
      prepareCanvas(){
        return new Promise((resolve, reject)=>{
          if(this.CANVAS){
            this.CANVAS.height = this.CANVAS.offsetHeight;
            this.CANVAS.width  = this.CANVAS.offsetWidth;
            resolve();
          }else
            reject('Canvas not found');
        });
      }
      rand(start, stop, float = false){
        return (float) ? (Math.random() * (stop - start) + start) : Math.floor(Math.random() * (stop - start + 1) + start);
      }
      hexToRgb(hex) {
          var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16)
          } : null;
      }
    }
    class Draw extends Core{
      constructor(data = []){
        super();
        console.info('START Draw');
        super.prepareCanvas().then(()=>{
            this.data = data;
            this.drawn = null;
            this.init().then(()=>{
              var interval = setInterval(()=>{
                if(!_WAIT){
                  clearInterval(interval);
                  this.drawn.animation.start();
                  setTimeout(()=>{
                   if(_ANIMATE === 'off') this.drawn.animation.pause();
                  },100);
                  doc.getElementById('pause').addEventListener('click', ()=>{
                    this.drawn.animation.pause();
                  });
                  doc.getElementById('play').addEventListener('click', ()=>{
                    this.drawn.animation.start();
                  });
                }
              },10);
            }).catch((e)=>{
                console.error(e);
            });
        }).catch((e)=>{
            console.error(e);
        });
      }
      init(){
        return new Promise((resolve, reject)=>{
          this.drawn = new Sets(this.data);
          if(this.drawn !== null) resolve();
          else reject('No Sets object');
        });
      }
      events(){
        doc.getElementById("type").addEventListener("change", (e)=>{
          let sides = doc.getElementById("sides");
          if(e.target.value ==='polygon') sides.disabled = false;
          else sides.disabled = true;
        });

        doc.getElementById('add').addEventListener('click',()=>{
          let array = doc.querySelector('.array');
          let q = (parseInt(doc.getElementById("quantity").value) < 300) ? parseInt(doc.getElementById("quantity").value) : _QUANTITY;
          let c = doc.getElementById("color").value;
          let t = doc.getElementById("type").value;
          let s = parseInt(doc.getElementById("sides").value);
          let sp = parseFloat(doc.getElementById("speed").value);
          array.insertAdjacentHTML('beforeend', `<span class="INPUT" data-value="${q}|${c}|${t}|${s}|${sp}" style="color:${c}">[ ${q}, ${c}, ${t}, ${s}, ${sp} ]</span><br>`);
        });

        doc.getElementById('run').addEventListener('click',()=>{
          let canvas = doc.getElementById('canvas');
          let canv = canvas.cloneNode(true);
          canvas.remove();
          doc.getElementById('container').appendChild(canv);
          delete(win.Draw);
          if(doc.getElementById("diffspeed").checked) _DIFF_SPEED   = 'on';
          else _DIFF_SPEED   = 'off';
          if(doc.getElementById("animate").checked) _ANIMATE   = 'off';
          else _ANIMATE   = 'on';

          if(doc.querySelector('.array').childNodes.length > 1){
            INPUT = [...doc.querySelectorAll('.INPUT')].map((e)=>{
              let a = e.dataset.value.split("|");
              return [parseInt(a[0]),a[1],a[2],parseInt(a[3]),parseFloat(a[4])];
            });
          }else{
            INPUT = [
              (parseInt(doc.getElementById("quantity").value) < 300)?parseInt(doc.getElementById("quantity").value):_QUANTITY,
              doc.getElementById("color").value,
              doc.getElementById("type").value,
              parseInt(doc.getElementById("sides").value),
              parseFloat(doc.getElementById("speed").value)
            ];
          }
          win.Draw  = new Draw(INPUT);
        });

        win.addEventListener('resize', ()=>{
          let canvas = doc.getElementById('canvas');
          let canv = canvas.cloneNode(true);
          canvas.remove();
          doc.getElementById('container').appendChild(canv);
          delete win.Draw;
          win.Draw  = new Draw(INPUT);
        });
      }
    }
    class Sets extends Core{
      constructor(data = []){
        super();
        this.POINTS = [];
        this.animation = null;
        console.group('START Sets');
        if(data.length !== 0 && data.every((e) => Array.isArray(e))){
          this.quantity = []; this.color = []; this.type = []; this.sides = []; this.speed = [];
          data.map((params)=>{
            this.quantity.push(params[0]?params[0]:_QUANTITY);
            this.color.push(params[1]?params[1]:_COLOR);
            this.type.push(params[2]?params[2]:_TYPE);
            this.sides.push(params[3]?params[3]:6);
            this.speed.push(params[4]?params[4]:_SPEED);
          });
          console.info({"quantity":this.quantity,"color":this.color,"type":this.type,"sides":this.sides, "speed":this.speed});
        }else{
          [
            this.quantity = _QUANTITY,
            this.color    = _COLOR,
            this.type     = _TYPE,
            this.sides    = 6,
            this.speed    = _SPEED
          ] = data;
          console.info({"quantity":this.quantity,"color":this.color,"type":this.type,"sides":this.sides, "speed":this.speed});
        }
        console.groupEnd();
        this.CANVAS.style.borderColor = Array.isArray(this.color) ? this.color[0]:this.color;

        this.run().then((anim)=>{
          this.animation = anim;
          _WAIT = false;
        });
      }
      run(){
        return new Promise((resolve, reject)=>{
          let allPOINTS = 0;
          if(Array.isArray(this.quantity)){
            this.quantity.map((params, i)=>{
              allPOINTS = this.quantity.reduce((a, b) => a + b, 0);
              this.POINTS = this.POINTS.concat(this.insertPoints(this.quantity[i], this.color[i], this.type[i], this.sides[i], this.speed[i],this.POINTS));
            });
          }else{
            allPOINTS = this.quantity;
            this.POINTS= this.insertPoints(this.quantity, this.color, this.type, this.sides, this.speed);
          }
          let interval = setInterval(()=>{ // wait until the array is full
            if(this.POINTS.length == allPOINTS){
              clearInterval(interval);
              resolve(new Animate(_FTP, this.createPoints.bind(this)));
            }
          },10);
        });
      }
      insertPoints(quantity, color, type, sides, speed, Arr = []){
        let tmpPOINTS = [];
        while(tmpPOINTS.length < quantity){ // append Point to array
          Arr = Arr.concat(tmpPOINTS);
          const uniq   = Math.random().toString(36).substr(2, 9);
          const way    = this.rand(1, 4);
          const spd  = (_DIFF_SPEED === 'on') ? this.rand(0.1, 1.1, true) : speed;
          const size   = (type === 'circle') ? this.rand(4, 20) : this.rand(4, 30);
          const x  = this.rand(size * 2, this.CANVAS.width - size * 2);
          const y  = this.rand(size * 2, this.CANVAS.height - size * 2);
          const check = this.checkPosition(Arr,size, x, y);
          if(check)
            tmpPOINTS.push(new Point([uniq, way, x, y, size, spd, color, type, sides]));
        }
        return tmpPOINTS;
      }
      checkPosition(POINTS, size, x, y){ //check if the elements overtap
        let overlap = POINTS.find((ele)=>{
          var distance = Math.sqrt(Math.pow(ele.x - x, 2) + Math.pow(ele.y - y, 2)); //distance between 2 points
          let diagonals = 0; // sum of the diagonals of 2 elements
          switch (this.type) {
            case 'square':
              diagonals = size * Math.sqrt(2) + ele.size * Math.sqrt(2);
              break;
            default:
              diagonals = size + ele.size;
          }
          return (distance <= diagonals + 10 ); // chceck diagonal + margin
        });
        return (overlap !== undefined) ? false : true;
      }
      createPoints(){
        this.CTX.clearRect(0, 0, this.CANVAS.width, this.CANVAS.height);
        this.POINTS.map((obj)=>{
          obj.move(this.POINTS);
        });
      }
    }
    class Point extends Core{
      constructor(data = []){
        super();
        [
          this.uniq,
          this.way,
          this.x,
          this.y,
          this.size,
          this.speed,
          this.color,
          this.type,
          this.sides
        ] = data;
        this.rgb = this.hexToRgb(this.color);
        this.stepX = this.speed;
        this.stepY = this.speed;
        this._POINTS = [];
        this._RELATIONS = [];
        console.info('START Point');
      }
      drawConnections(){ //draw connections line between points
        this._POINTS.forEach((ele, index)=>{
          let opacity = 0;
          let distance = Math.sqrt(Math.pow(ele.x - this.x, 2) + Math.pow(ele.y - this.y, 2));
          if(distance <= _L_DISTANCE && !(ele._RELATIONS.find((e)=>(e === this.uniq)))){
            if(!(this._RELATIONS.find((e)=>(e === ele.uniq)))) this._RELATIONS.push(ele.uniq);
            opacity = 1 - Math.floor((distance * 100) / _L_DISTANCE) / 100;
            this.CTX.beginPath();
            this.CTX.strokeStyle = `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b}, ${opacity})`;
            if(this.type === 'square'){
              this.CTX.moveTo(this.x+(this.size/2),this.y+(this.size/2));
              this.CTX.lineTo(ele.x+(ele.size/2),ele.y+(ele.size/2));
            }else{
              this.CTX.moveTo(this.x,this.y);
              this.CTX.lineTo(ele.x,ele.y);
            }
            this.CTX.stroke();
            this.CTX.closePath();
          }else{ // if no relation remove from relation arrays
            let ti = this._RELATIONS.indexOf(ele.uniq);
            let ei = ele._RELATIONS.indexOf(this.uniq);
            if (ti > -1) this._RELATIONS.splice(ti, 1);
            if (ei > -1) ele._RELATIONS.splice(ei, 1);
          }
        });
      }
      draw(){ // drow point shape
        this.drawConnections();
        this.CTX.beginPath();
        switch (this.type) {
          case 'square':
            this.CTX.rect(this.x, this.y, this.size, this.size);
            break;
          case 'polygon':
            this.buildPolygon(this.CTX, this.x, this.y, this.size, this.sides);
            break;
          case 'star':
              this.buildStar(this.CTX, this.x, this.y, 5, this.size, this.size/3);
              break;
          default:
            this.CTX.arc(this.x, this.y, this.size, 0, 2*Math.PI);
        }
        this.CTX.fillStyle = _FILL;
        this.CTX.fill();
        this.CTX.strokeStyle = this.color;
        this.CTX.lineWidth = 1.5;
        this.CTX.stroke();
        this.CTX.closePath();
      }
      move(Arr){ // change position of element
        this._POINTS = Arr;
        if(_ANIMATE === 'off'){
          this.draw();
          console.warn('Animation OFF');
          return;
        }
        let collision = this.avoidCollisions();   //check collision with other objects
        // check collision with end of canvas
        let begin = (this.type==='square') ? 0 : this.size;
        if (this.x < begin || this.x > this.CANVAS.width - this.size || collision) {
            this.stepX = -this.stepX;
        }
        if (this.y < begin || this.y > this.CANVAS.height - this.size || collision) {
            this.stepY = -this.stepY;
        }
        switch (this.way) { //set different way for start positions of elements
          case 2:
            this.x -= this.stepX;
            this.y -= this.stepY;
            break;
          case 3:
            this.x -= this.stepX;
            this.y += this.stepY;
            break;
          case 4:
            this.x += this.stepX;
            this.y -= this.stepY;
            break;
          default:
            this.x += this.stepX;
            this.y += this.stepY;
        }
        this.draw();
      }
      avoidCollisions(){ //check if the elements collision
        let collision = this._POINTS.find((ele)=>{
          let distance = Math.sqrt(Math.pow(ele.x - this.x, 2) + Math.pow(ele.y - this.y, 2));
          let diagonals = 0; // sum of the diagonals of 2 elements
          switch (this.type) {
            case 'square': //calculate center of square
              var ex = ele.x + (ele.size/2);
              var ey = ele.y + (ele.size/2);
              var tx = this.x + (this.size/2);
              var ty = this.y + (this.size/2);
              distance =  Math.sqrt(Math.pow(ex - tx, 2) + Math.pow(ey - ty, 2));
              diagonals = this.size/2 + ele.size/2;
              break;
            default:
              diagonals = this.size + ele.size;
          }
          return ( distance >= diagonals && distance <= diagonals + 2 );
        });
        return (collision === undefined) ? false : true;
      }
      buildPolygon(ctx, x, y, size, sides){
        ctx.moveTo (x +  size * Math.cos(0), y +  size *  Math.sin(0));
        for (var i = 1; i <= sides;i += 1) {
            ctx.lineTo (x + size * Math.cos(i * 2 * Math.PI / sides), y + size * Math.sin(i * 2 * Math.PI / sides));
        }
      }
      buildStar(ctx, cx, cy, spikes, outerRadius, innerRadius){
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
        ctx.moveTo(cx, cy - outerRadius);
        for(let i=0; i<spikes; i++){
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;
          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx,cy-outerRadius);
      }
    }
    class Animate extends Core{
      constructor(fps, fun){
        super();
        this.delay = 1000 / fps;
        this.time = null;
        this.frame = -1;
        this.handle = null;
        this.isPlaying = false;
        this.callback = fun;
        console.info('START Animate');
      }
      loop(timestamp){
            if(this.time === null) this.time = timestamp;
            let step = Math.floor((timestamp - this.time) / this.delay);
            if (step > this.frame){
                this.frame = step;
                this.callback();
            }
            this.handle = requestAnimationFrame((t)=>{this.loop(t);});
        }
        start(){
            if (!this.isPlaying) {
                this.isPlaying = true;
                this.handle = requestAnimationFrame((t)=>{this.loop(t);});
            }
        }
        pause(){
            if (this.isPlaying) {
                cancelAnimationFrame(this.handle);
                this.isPlaying = false;
                this.time = null;
                this.frame = -1;
            }
        }
    }

    try{
        win.Draw = new Draw(INPUT);
        win.Draw.events();
    }catch(e){
      console.error(e);
    }
})(window, document);
