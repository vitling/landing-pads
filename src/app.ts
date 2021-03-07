import { Sound } from './sound.js'
type Note = {
    freq:() => number,
    time: () => number,
    filter: () => number
}

function Gfx(canvas: HTMLCanvasElement) {
    const g = canvas.getContext("2d") as CanvasRenderingContext2D;
    const bb = document.createElement("canvas");
    const gb = bb.getContext("2d") as CanvasRenderingContext2D;
    const w = canvas.width = bb.width = 1080;
    const h = canvas.height =bb.height =  1080;

    function clear() {
        g.fillStyle = "black";
        g.fillRect(0,0,w,h);
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
        g.arc(x,y,4,0,Math.PI * 2);
        g.fill();
    }

    let flag = 1;

    function fade() {
        flag = -flag;
        g.save();
        gb.drawImage(canvas, 0,0);

        g.globalCompositeOperation = "source-over";
        g.fillStyle = "black";
        g.fillRect(0,0,w,h);
        g.globalCompositeOperation = "difference";
        g.globalAlpha =1;
        //g.filter = "blur(2px)";
        g.drawImage(bb, 5,0);
        g.drawImage(bb, -5,0);


        g.restore();
    }

    return {
        clear,
        drawNote,
        fade
    }
}


function start() {
    const sound = Sound();
    const gfx = Gfx(document.getElementById("canvas") as HTMLCanvasElement);
    const bus = sound.Bus();
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
        if (Math.floor(lastMs / 100) != Math.floor(ms / 100)) {
            gfx.fade();
        }
        notes.forEach(n => gfx.drawNote(n));

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