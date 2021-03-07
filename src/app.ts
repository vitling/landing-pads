import { Sound } from './sound.js'
type Note = {
    freq:() => number,
    time: () => number,
    filter: () => number
}

function Gfx(canvas: HTMLCanvasElement, gradient: boolean = true, hill: boolean = false, moon: boolean = true, grading:boolean = false) {
    const g = canvas.getContext("2d") as CanvasRenderingContext2D;
    const bb = document.createElement("canvas");
    const gb = bb.getContext("2d") as CanvasRenderingContext2D;
    const w = canvas.width = bb.width = 1080;
    const h = canvas.height =bb.height =  1920;

    function clear() {
        g.fillStyle = "black";
        g.fillRect(0,0,w,h);
    }
    let noisePlates: HTMLCanvasElement[] = [];

    const npSize = 512;
    for (let i = 0 ;i < 12; i++) {
        const cvs = document.createElement("canvas");
        cvs.width = npSize;
        cvs.height = npSize;
        const x = cvs.getContext("2d") as CanvasRenderingContext2D;
        const data = x.getImageData(0,0,npSize,npSize);
        for (let z = 0; z < npSize * npSize; z++) {
            const p = Math.floor(Math.pow(Math.random(),2) * 16);
            const q = Math.floor(Math.random() * 256);
            data.data[z*4] = q;
            data.data[z*4+1] = q;
            data.data[z*4+2] = q;
            data.data[z*4+3] = p;
        }
        x.putImageData(data, 0,0);
        noisePlates.push(cvs);
    }

    const minFreq = 55 * Math.pow(2, 4 / 12);

    function drawNote(n: Note) {

        const octaveRange = 4.5;
        const x= Math.log2(n.freq()/minFreq) * w / octaveRange;

        const hue = octaveRange * x / w * 360;
        const sat = n.filter() * 100;
        g.globalCompositeOperation = "lighter";
        g.fillStyle = "hsl(" + hue + "," + sat + "%," + (sat*0.6) + "%)";

        const y = h * n.time() / 10;

        g.beginPath();
        let rad = 4;

        g.arc(x+ (Math.min(y, h/2)/h) * 150 - 75 + (y>h/2 ? ((y-h/2)/(h/2)) *  Math.sin(60* y/h) * 20 : 0),y ,rad,0,Math.PI * 2);
        if (y > h*0.5 && y < h * 0.513) {
            let diff = (y - h * 0.5) / (h * 0.013);
            for (let i = -2; i <= 2; i++) {
                g.arc(i * 16 * (1 - diff) + x+ (Math.min(y, h/2)/h) * 150 - 75 + (y>h/2 ? ((y-h/2)/(h/2)) *  Math.sin(60* y/h) * 20 : 0),y ,rad,0,Math.PI * 2);
            }
        }

        g.fill();
    }

    let hillData: number[] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0.1,0.8,0.3,0.2,0.3,0.6,0,0,0.1,0.3,0.2,0,0];
    // for (let i =0 ; i < 20; i++) {
    //     hill[i] = Math.random() < 0.5 ? 0 : Math.random();
    // }

    function fade() {
        g.save();
        g.globalCompositeOperation = "source-over";
        if (gradient) {
            const gradient = g.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0.0, "#111144");
            gradient.addColorStop(0.3, "#551144")
            gradient.addColorStop(0.5, "#884444");
            gradient.addColorStop(0.53, "#114477");
            gradient.addColorStop(1.0, "#111144");

            g.fillStyle = gradient;
            g.globalAlpha = 0.1;
            g.fillRect(0, 0, w, h);
        }
        gb.globalCompositeOperation ="source-over";
        gb.drawImage(canvas, 0,0);

         g.globalCompositeOperation = "source-over";
        //g.drawImage(bb,0,0);
        // g.fillStyle = "black";
        // g.fillRect(0,0,w,h);
        //g.globalCompositeOperation = "lighter";
        g.globalAlpha = 0.95;
         g.filter = "blur(3px)";

        //g.drawImage(bb, 5,0);
        g.drawImage(bb, 0,0);
        //g.drawImage(bb, -5,0);

        gb.globalCompositeOperation ="source-over";

        if (hill) {
            g.beginPath();
            for (let xi = 0; xi <= hillData.length; xi++) {
                let height = hillData[xi];
                let y = h * (0.5 - height * 0.1);
                let x = (xi / hillData.length) * w;
                if (xi == 0) {
                    g.moveTo(x, y);
                } else {
                    g.lineTo(x, y);
                }
            }
            g.lineTo(w, h * 0.50);
            g.lineTo(0, h * 0.50);
            g.closePath();

            g.fillStyle = "rgba(0,0,0.1,0.3)";
            g.fill();
        }


        g.restore();
    }
let plateNo =0 ;
    function topEffect() {
        g.globalCompositeOperation = "source-over";
        g.lineWidth = 1;
        for (let i =0 ; i < 7000; i++) {
            let x=  Math.random() * w;
            let y = Math.random() * h;
            g.beginPath();
            g.moveTo(x,y);
            g.lineTo(x + Math.random()* 4 - 2,y+6);
            let col = Math.floor(Math.random() * 192);
            g.strokeStyle = "rgba(" + col + "," + col + "," + col + ",0.1)";
            g.stroke();
        }
        if (moon) {

            const vignetteGrad = g.createRadialGradient(w / 4, h / 4, 0, w / 4, h / 4, w);
            vignetteGrad.addColorStop(0, "rgba(0,0,0,0.00)");
            // vignette.addColorStop(0.15,"rgba(0,0,0,0)");
            // vignette.addColorStop(0.85,"rgba(0,0,0,0)");
            vignetteGrad.addColorStop(1.0, "rgba(0,0,0,0.2)");

            g.fillStyle = vignetteGrad;
            g.fillRect(0, 0, w, h);

            g.fillStyle = "rgba(255,255,192,0.2)"
            g.beginPath();
            g.arc(w / 4, h / 4, 30, 0, Math.PI * 2);
            g.fill();
        }
        if (grading) {
            const grad = g.createLinearGradient(0,0,0,h);
            grad.addColorStop(0,"rgba(0,0,0,0.2)");
            grad.addColorStop(0.3,"rgba(0,0,0,0)");
            grad.addColorStop(0.5,"rgba(0,0,0,0)");
            grad.addColorStop(1.0,"rgba(0,0,0,0.1)");
            g.fillStyle = grad;
            g.fillRect(0,0,w,h);
        }
        plateNo = (plateNo + 1) % noisePlates.length;
        g.drawImage(noisePlates[plateNo], 0,0, w,h);
    }

    return {
        clear,
        drawNote,
        fade,
        topEffect
    }
}


function start() {
    const sound = Sound();
    const gfx = Gfx(document.getElementById("canvas") as HTMLCanvasElement);
    const bus = sound.Bus();
    const splash = sound.Splash();
    splash.out.connect(bus.in);
    bus.out.connect(sound.Out);

    function wait(s: number) {
        return new Promise<void>(resolve => {setTimeout(()=> resolve(), s * 1000)})
    }

    function noteToFreq(note: number) {
        return 55 * Math.pow(2,(note/12));
    }
    const notes = new Set<Note>();


    async function doNote(init: number, target: number) {
        await wait(Math.random()*1)
        const n = sound.Note(init, target);
        setTimeout(() => splash.trigger(target), 5000);
        notes.add(n);
        n.connect(bus.in);
        n.start(4);
        await wait(3 + Math.random());
        n.slide(0.4 + Math.random());
        await wait(2);
        n.release(4.0);
        await wait(4.0);
        notes.delete(n);
    }
    const min9 = [0,3,7,10,14,19];
    const maj9 = [0,4,7,11,14,19];
    let chord = maj9;
    let chords = [min9, maj9];

    let base = 7;
    let key = Math.floor(Math.random() * 12);

    window.setInterval(() => { key = (key + 5) % 12; chord = chords[Math.floor(Math.random() * 2)]} , 30000);

    function newNote() {
        const off = chord[Math.floor(Math.random() * chord.length)];
        doNote(noteToFreq(base + key + Math.floor(Math.random() * 4) * 12) + Math.random() * 5 - 2.5, noteToFreq(base + key + 12 + off) * (1 + Math.random() * 0.01 - 0.005));
    }


   // newNotes();
    window.setInterval(() => {
        newNote()
    }, 1000);
    gfx.clear();
    let lastMs = 0;
    function frame(ms: number) {
       // if (Math.floor(lastMs / 100) != Math.floor(ms / 100)) {
            gfx.fade();
        //}
        notes.forEach(n => gfx.drawNote(n));
      //  if (Math.floor(lastMs / 100) != Math.floor(ms / 100)) {
            gfx.topEffect();
        //}
        window.requestAnimationFrame(frame);
        lastMs = ms;
    }

    window.requestAnimationFrame(frame);
}

let started = false;
function handleStartAction() {
    if (!started) {
        started = true;
        start();
        button.style.display = "none";
    }
}

const button = document.getElementById("start") as HTMLButtonElement;
button.addEventListener("click", handleStartAction);
window.addEventListener("keydown", handleStartAction);