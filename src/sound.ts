// @ts-ignore
function Sound(ctx : AudioContext = (new (window.AudioContext || window.webkitAudioContext)() as AudioContext)) {
    function StereoDelay(timeL: number, timeR: number) {
        const split = ctx.createChannelSplitter(2);

        const delayL = ctx.createDelay();
        const delayR = ctx.createDelay();

        split.connect(delayL, 0);
        split.connect(delayR, 0);

        delayL.delayTime.value = timeL;
        delayR.delayTime.value = timeR;
        const feedbackL = ctx.createGain();
        const feedbackR = ctx.createGain();
        feedbackL.gain.value = feedbackR.gain.value = 0.3;
        feedbackL.connect(delayL);
        feedbackR.connect(delayR);
        delayL.connect(feedbackL);
        delayR.connect(feedbackR);

        const panL = ctx.createPanner();
        panL.panningModel = "equalpower";
        panL.setPosition(-1.0,0,0)
        const panR = ctx.createPanner();
        panR.panningModel = "equalpower";
        panR.setPosition(1.0,0,0);
        const gain = ctx.createGain();
        gain.gain.value = 0.3;

        delayL.connect(panL);
        panL.connect(gain);

        delayR.connect(panR);
        panR.connect(gain);
        return {
            in: split,
            out: gain
        }
    }

    let slideFn: number[] = [];
    function easeInOutSine(x: number): number {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }
    function easeInOutQuad(x: number): number {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }
    for (let i =0 ; i <= 1.001; i+=0.01) {
        slideFn.push(easeInOutQuad(i));
    }


    function Note(fInit: number, fTarget: number) {
        const startTime = new Date().getTime();
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = fInit;
        const gain = ctx.createGain();
        gain.gain.value = 0.04;
        const filter = ctx.createBiquadFilter();
        filter.Q.value = 5;

        const lfo = ctx.createOscillator();

        lfo.frequency.value = 4 + Math.random();
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 400;
        lfo.connect(lfoGain);
        lfo.start();
        lfoGain.connect(filter.detune);

        osc.connect(gain);
        gain.connect(filter);

        osc.onended = () => filter.disconnect();

        function start(attack: number) {
            filter.frequency.setValueAtTime(45, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(fTarget * 4, ctx.currentTime+attack);
            osc.start();
        }

        function slide(duration: number) {
            osc.frequency.setValueCurveAtTime(slideFn.map(c => (1-c) * fInit + c * fTarget), ctx.currentTime, duration);
        }

        function release(duration: number) {
            filter.frequency.setValueAtTime(fTarget*4, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(55,ctx.currentTime + duration);
            osc.stop(ctx.currentTime + duration);
        }

        return {
            start,
            slide,
            release,
            time: () => (new Date().getTime() - startTime) /1000,
            connect: (o: AudioNode) => filter.connect(o),
            freq: () => osc.frequency.value,
            filter: () => (filter.frequency.value / 4) / fTarget
        }
    }

    function Bus() {
        const d = StereoDelay(0.6,0.61);
        const i = ctx.createGain();
        i.gain.value = 1.0;
        const o = ctx.createGain();
        o.gain.value = 1.0;
        i.connect(d.in);
        i.connect(o);
        d.out.connect(o);
        return {
            in: i,
            out: o
        }
    }

    return {StereoDelay, Note, Bus, Out: ctx.destination, context: ctx}
}

export {Sound}