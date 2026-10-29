class TimerSimulator {
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <style>
                .timer-sim-wrapper { display: block; font-family: inherit; margin-bottom: 2rem; }
                .timer-sim-wrapper canvas { display: block; width: 100%; height: 100%; }
                .timer-visual-box { height: 250px; }
                @media (min-width: 992px) {
                    .timer-visual-box { height: 500px; }
                }
            </style>
            <div class="timer-sim-wrapper">
                <div class="card shadow-sm border-0 rounded-4 p-4 bg-white">
                    <div class="row g-4 align-items-start">

                        <div class="col-lg-5 border-end-lg pe-lg-4">
                            <h4 class="h5 fw-semibold text-dark mb-3">Timer Simulation</h4>

                            <div class="mb-3">
                                <label class="form-label small fw-bold text-uppercase text-secondary">Timer Resolution</label>
                                <select class="bitWidthSelect form-select form-select-sm shadow-none">
                                    <option value="2">2-bit (Educational: 0 - 3)</option>
                                    <option value="4">4-bit (Educational: 0 - 15)</option>
                                    <option value="6" selected>6-bit (Educational: 0 - 63)</option>
                                    <option value="8">8-bit (0 - 255)</option>
                                    <option value="10">10-bit (0 - 1023)</option>
                                    <option value="12">12-bit (0 - 4095)</option>
                                    <option value="16">16-bit (0 - 65535)</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="form-label small fw-bold text-uppercase text-secondary">Count Mode</label>
                                <select class="modeSelect form-select form-select-sm shadow-none">
                                    <option value="up" selected>Count Up</option>
                                    <option value="down">Count Down</option>
                                    <option value="updown">Count Up &amp; Down</option>
                                </select>
                            </div>

                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <label class="form-label small fw-bold text-uppercase text-secondary mb-0">Simulation Speed</label>
                                    <span class="tickRateDisplay badge bg-primary bg-opacity-10 text-primary px-2 py-1 fw-bold">16 steps/s</span>
                                </div>
                                <input type="range" class="tickRateRange form-range" min="1" max="64" step="1" value="16">
                            </div>

                            <div class="row g-2 mb-3">
                                <div class="col-6">
                                    <label class="form-label small fw-bold text-uppercase text-secondary">Compare A</label>
                                    <input type="number" class="compareAInput form-control form-control-sm shadow-none" min="0" max="63" value="32">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-bold text-uppercase text-secondary">Compare B</label>
                                    <input type="number" class="compareBInput form-control form-control-sm shadow-none" min="0" max="63" value="42">
                                </div>
                            </div>

                            <details class="mb-3">
                                <summary class="small fw-bold text-uppercase text-secondary" style="cursor: pointer;">Advanced: Compare Events</summary>
                                <div class="row g-2 mt-2">
                                    <div class="col-6">
                                        <label class="form-label small fw-bold text-uppercase text-secondary">Cmp A Event</label>
                                        <select class="compareAActionSelect form-select form-select-sm shadow-none">
                                            <option value="none">None</option>
                                            <option value="set">Set GPIO High</option>
                                            <option value="clear">Set GPIO Low</option>
                                            <option value="toggle" selected>Toggle GPIO</option>
                                        </select>
                                    </div>
                                    <div class="col-6">
                                        <label class="form-label small fw-bold text-uppercase text-secondary">Cmp B Event</label>
                                        <select class="compareBActionSelect form-select form-select-sm shadow-none">
                                            <option value="none" selected>None</option>
                                            <option value="set">Set GPIO High</option>
                                            <option value="clear">Set GPIO Low</option>
                                            <option value="toggle">Toggle GPIO</option>
                                        </select>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label small fw-bold text-uppercase text-secondary">Overflow Event</label>
                                        <select class="overflowActionSelect form-select form-select-sm shadow-none">
                                            <option value="none" selected>None</option>
                                            <option value="set">Set GPIO High</option>
                                            <option value="clear">Set GPIO Low</option>
                                            <option value="toggle">Toggle GPIO</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-check form-switch mt-3">
                                    <input class="form-check-input pauseOnCompareToggle" type="checkbox" role="switch">
                                    <label class="form-check-label small fw-semibold text-secondary">Pause on compare event</label>
                                </div>
                                <div class="form-check form-switch mt-2">
                                    <input class="form-check-input showGpioSignalToggle" type="checkbox" role="switch">
                                    <label class="form-check-label small fw-semibold text-secondary">Show GPIO signal in output</label>
                                </div>
                            </details>

                            <div class="d-flex gap-2 mb-3">
                                <button type="button" class="toggleRunBtn btn btn-sm btn-primary">Pause</button>
                                <button type="button" class="resetBtn btn btn-sm btn-outline-secondary">Reset</button>
                            </div>

                            <div class="p-2 bg-light rounded-3 border">
                                <div class="row g-2 text-center">
                                    <div class="col-6 border-end">
                                        <span class="d-block text-muted small text-uppercase" style="font-size: 0.68rem;">Current Count</span>
                                        <span class="currentCountDisplay fw-bold text-dark" style="font-size: 0.9rem;">0</span>
                                    </div>
                                    <div class="col-6">
                                        <span class="d-block text-muted small text-uppercase" style="font-size: 0.68rem;">TOP</span>
                                        <span class="topDisplay fw-bold text-dark" style="font-size: 0.9rem;">1023</span>
                                    </div>
                                </div>
                                <div class="row g-2 text-center mt-2 pt-2 border-top">
                                    <div class="col-4 border-end">
                                        <span class="d-block text-muted small text-uppercase" style="font-size: 0.62rem;">Overflows</span>
                                        <span class="overflowDisplay fw-bold text-dark" style="font-size: 0.85rem;">0</span>
                                    </div>
                                    <div class="col-4 border-end">
                                        <span class="d-block text-muted small text-uppercase" style="font-size: 0.62rem;">Cmp A Hits</span>
                                        <span class="compareAHitsDisplay fw-bold text-dark" style="font-size: 0.85rem;">0</span>
                                    </div>
                                    <div class="col-4">
                                        <span class="d-block text-muted small text-uppercase" style="font-size: 0.62rem;">Cmp B Hits</span>
                                        <span class="compareBHitsDisplay fw-bold text-dark" style="font-size: 0.85rem;">0</span>
                                    </div>
                                </div>
                                <div class="text-center mt-2 pt-2 border-top">
                                    <span class="d-block text-muted small text-uppercase" style="font-size: 0.62rem;">GPIO Output</span>
                                    <span class="gpioStateDisplay fw-bold text-dark" style="font-size: 0.85rem;">LOW</span>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-7 ps-lg-4 mt-4 mt-lg-0">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h4 class="h6 fw-semibold text-dark mb-0">Step Visualization</h4>
                                <span class="modeBadge badge bg-warning bg-opacity-25 text-dark px-2 py-1" style="font-size: 0.75rem;">Mode: Count Up</span>
                            </div>

                            <div class="timer-visual-box rounded-4 p-2 shadow-inner position-relative overflow-hidden border" style="background-color: #0f172a; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 20px 20px;">
                                <canvas class="timerCanvas w-100 h-100 display-block"></canvas>
                            </div>

                            <div class="d-flex flex-wrap justify-content-between gap-2 mt-2 text-muted small px-1" style="font-size: 0.78rem;">
                                <span>Orange markers: overflow / turn-around events</span>
                                <span>Green dots: Compare A, Pink dots: Compare B</span>
                                <span class="gpioLegendItem">Amber stepped line: GPIO output</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;

        this.setupLogic();
    }

    setupLogic() {
        const root = this.container;

        const bitWidthSelect = root.querySelector('.bitWidthSelect');
        const modeSelect = root.querySelector('.modeSelect');
        const tickRateRange = root.querySelector('.tickRateRange');
        const compareAInput = root.querySelector('.compareAInput');
        const compareBInput = root.querySelector('.compareBInput');
        const compareAActionSelect = root.querySelector('.compareAActionSelect');
        const compareBActionSelect = root.querySelector('.compareBActionSelect');
        const overflowActionSelect = root.querySelector('.overflowActionSelect');
        const pauseOnCompareToggle = root.querySelector('.pauseOnCompareToggle');
        const showGpioSignalToggle = root.querySelector('.showGpioSignalToggle');
        const toggleRunBtn = root.querySelector('.toggleRunBtn');
        const resetBtn = root.querySelector('.resetBtn');

        const tickRateDisplay = root.querySelector('.tickRateDisplay');
        const currentCountDisplay = root.querySelector('.currentCountDisplay');
        const topDisplay = root.querySelector('.topDisplay');
        const overflowDisplay = root.querySelector('.overflowDisplay');
        const compareAHitsDisplay = root.querySelector('.compareAHitsDisplay');
        const compareBHitsDisplay = root.querySelector('.compareBHitsDisplay');
        const gpioStateDisplay = root.querySelector('.gpioStateDisplay');
        const gpioLegendItem = root.querySelector('.gpioLegendItem');
        const modeBadge = root.querySelector('.modeBadge');

        const canvas = root.querySelector('.timerCanvas');
        const ctx = canvas.getContext('2d');

        const state = {
            top: 1023,
            counter: 0,
            direction: 1,
            overflowCount: 0,
            compareAHits: 0,
            compareBHits: 0,
            gpioState: false,
            isRunning: true,
            accumulator: 0,
            history: [],
            plotTickAccumulator: 0,
            pendingPlotEvent: { overflow: false, compareA: false, compareB: false }
        };

        const DEFAULT_CYCLE_SECONDS = 5;
        const compareValueMemory = {};
        let activeResolutionKey = bitWidthSelect.value;

        let lastFrameTime = performance.now();

        const modeLabelMap = {
            up: 'Count Up',
            down: 'Count Down',
            updown: 'Count Up & Down'
        };

        const toInt = (value, fallback) => {
            const parsed = parseInt(value, 10);
            return Number.isFinite(parsed) ? parsed : fallback;
        };

        const getTop = () => {
            const bits = toInt(bitWidthSelect.value, 10);
            return Math.pow(2, bits) - 1;
        };

        const getDefaultCompareValues = (top) => {
            return {
                a: Math.round(top * (1 / 3)),
                b: Math.round(top * (2 / 3))
            };
        };

        const saveCompareValuesForResolution = (key, topOverride) => {
            const top = topOverride || state.top || getTop();
            compareValueMemory[key] = {
                a: Math.min(Math.max(toInt(compareAInput.value, 0), 0), top),
                b: Math.min(Math.max(toInt(compareBInput.value, 0), 0), top)
            };
        };

        const getCycleSteps = () => {
            const mode = modeSelect.value;
            if (mode === 'updown') {
                return Math.max(state.top * 2, 2);
            }
            return state.top + 1;
        };

        const getRecommendedTickRate = () => {
            const maxTickRate = toInt(tickRateRange.max, 10000);
            const cycleSteps = getCycleSteps();
            const recommended = Math.round(cycleSteps / DEFAULT_CYCLE_SECONDS);
            return Math.min(maxTickRate, Math.max(1, recommended));
        };

        const updateTickRateBounds = () => {
            const cycleSteps = getCycleSteps();
            const maxTickRate = Math.max(1, cycleSteps);
            const minTickRate = Math.max(1, Math.round(cycleSteps / 30));

            tickRateRange.min = String(minTickRate);
            tickRateRange.max = String(maxTickRate);

            const current = toInt(tickRateRange.value, minTickRate);
            const clamped = Math.min(maxTickRate, Math.max(minTickRate, current));
            tickRateRange.value = String(clamped);
        };

        const applyRecommendedTickRate = () => {
            updateTickRateBounds();
            tickRateRange.value = String(getRecommendedTickRate());
        };

        const getHistoryCapacity = () => {
            const width = canvas.clientWidth || 500;
            const height = canvas.clientHeight || 220;

            const padLeft = 16;
            const padRight = 10;
            const padTop = 12;
            const padBottom = 14;

            const plotWidth = Math.max(width - padLeft - padRight, 1);
            const plotHeight = Math.max(height - padTop - padBottom, 1);

            // For low bit widths, keep horizontal step width near one vertical count step height.
            const idealCapacity = Math.round((plotWidth * Math.max(state.top, 1)) / plotHeight) + 1;
            return Math.min(420, Math.max(8, idealCapacity));
        };

        const getPlotSampleStride = (historyCap) => {
            // Keep small educational timers uncompressed so their steps remain wide and clear.
            if (state.top <= 63) {
                return 1;
            }

            // For larger timers, compress samples so at least two full cycles can fit on screen.
            const cycleSteps = getCycleSteps();
            const ticksForTwoCycles = cycleSteps * 2;
            return Math.max(1, Math.ceil(ticksForTwoCycles / Math.max(historyCap, 1)));
        };

        const clampCompareInputs = ({ restoreForResolution = false } = {}) => {
            state.top = getTop();
            compareAInput.max = String(state.top);
            compareBInput.max = String(state.top);

            const key = bitWidthSelect.value;
            const defaults = getDefaultCompareValues(state.top);
            const saved = restoreForResolution ? compareValueMemory[key] : null;

            const aSource = saved ? saved.a : defaults.a;
            const bSource = saved ? saved.b : defaults.b;

            const a = Math.min(Math.max(aSource, 0), state.top);
            const b = Math.min(Math.max(bSource, 0), state.top);

            compareAInput.value = String(a);
            compareBInput.value = String(b);
            compareValueMemory[key] = { a, b };

            state.counter = Math.min(Math.max(state.counter, 0), state.top);
            if (modeSelect.value === 'down' && state.counter === 0) {
                state.counter = state.top;
            }
        };

        const updateText = () => {
            const mode = modeSelect.value;
            tickRateDisplay.textContent = `${toInt(tickRateRange.value, 16)} steps/s`;
            currentCountDisplay.textContent = state.counter.toLocaleString();
            topDisplay.textContent = state.top.toLocaleString();
            overflowDisplay.textContent = state.overflowCount.toLocaleString();
            compareAHitsDisplay.textContent = state.compareAHits.toLocaleString();
            compareBHitsDisplay.textContent = state.compareBHits.toLocaleString();
            gpioStateDisplay.textContent = state.gpioState ? 'HIGH' : 'LOW';
            modeBadge.textContent = `Mode: ${modeLabelMap[mode]}`;
            toggleRunBtn.textContent = state.isRunning ? 'Pause' : 'Run';
        };

        const applyGpioAction = (action) => {
            if (action === 'set') {
                state.gpioState = true;
            } else if (action === 'clear') {
                state.gpioState = false;
            } else if (action === 'toggle') {
                state.gpioState = !state.gpioState;
            }
        };

        const pushHistoryPoint = (entry) => {
            const historyCap = getHistoryCapacity();
            if (state.history.length >= historyCap) {
                // Keep a continuous trace by shifting left one point at a time.
                state.history.shift();
                state.history.push(entry);
                return;
            }
            state.history.push(entry);
        };

        const simulateOneTick = () => {
            const mode = modeSelect.value;
            const compareA = toInt(compareAInput.value, Math.floor(state.top * 0.25));
            const compareB = toInt(compareBInput.value, Math.floor(state.top * 0.75));
            const event = { overflow: false, compareA: false, compareB: false };

            if (mode === 'up') {
                state.counter += 1;
                if (state.counter > state.top) {
                    state.counter = 0;
                    state.overflowCount += 1;
                    event.overflow = true;
                }
            } else if (mode === 'down') {
                state.counter -= 1;
                if (state.counter < 0) {
                    state.counter = state.top;
                    state.overflowCount += 1;
                    event.overflow = true;
                }
            } else {
                state.counter += state.direction;

                if (state.counter >= state.top) {
                    state.counter = state.top;
                    state.direction = -1;
                } else if (state.counter <= 0) {
                    state.counter = 0;
                    state.direction = 1;
                }
            }

            if (state.counter === compareA) {
                state.compareAHits += 1;
                event.compareA = true;
                applyGpioAction(compareAActionSelect.value);
            }
            if (state.counter === compareB) {
                state.compareBHits += 1;
                event.compareB = true;
                applyGpioAction(compareBActionSelect.value);
            }

            if (event.overflow) {
                applyGpioAction(overflowActionSelect.value);
            }

            event.gpio = state.gpioState;

            return event;
        };

        const drawGraph = () => {
            const width = canvas.clientWidth || 500;
            const height = canvas.clientHeight || 220;
            const dpr = window.devicePixelRatio || 1;

            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);

            const padLeft = 16;
            const padRight = 10;
            const padTop = 12;
            const padBottom = 14;
            const plotWidth = width - padLeft - padRight;
            const plotHeight = height - padTop - padBottom;

            const top = Math.max(state.top, 1);
            const compareA = toInt(compareAInput.value, Math.floor(state.top * 0.25));
            const compareB = toInt(compareBInput.value, Math.floor(state.top * 0.75));

            const yForValue = (value) => {
                const ratio = value / top;
                return padTop + plotHeight - ratio * plotHeight;
            };

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            for (let i = 1; i < 4; i += 1) {
                const y = padTop + (plotHeight * i) / 4;
                ctx.beginPath();
                ctx.moveTo(padLeft, y);
                ctx.lineTo(width - padRight, y);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            ctx.strokeStyle = 'rgba(74, 222, 128, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(padLeft, yForValue(compareA));
            ctx.lineTo(width - padRight, yForValue(compareA));
            ctx.stroke();

            ctx.strokeStyle = 'rgba(244, 114, 182, 0.55)';
            ctx.beginPath();
            ctx.moveTo(padLeft, yForValue(compareB));
            ctx.lineTo(width - padRight, yForValue(compareB));
            ctx.stroke();

            const showGpioSignal = showGpioSignalToggle.checked;
            const gpioBandTop = padTop + 6;
            const gpioBandBottom = padTop + Math.min(38, Math.max(22, plotHeight * 0.2));
            const gpioHighY = gpioBandTop + 4;
            const gpioLowY = gpioBandBottom - 4;

            if (showGpioSignal) {
                ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
                ctx.fillRect(padLeft, gpioBandTop, plotWidth, gpioBandBottom - gpioBandTop);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                ctx.font = '11px sans-serif';
                ctx.fillText('GPIO', padLeft + 4, gpioBandTop + 10);
            }

            const points = state.history;
            if (points.length > 1) {
                const historyCap = getHistoryCapacity();
                const stepX = plotWidth / Math.max(historyCap - 1, 1);

                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 2.5;
                ctx.lineJoin = 'round';
                ctx.beginPath();

                let prevY = yForValue(points[0].value);
                let prevX = padLeft;
                ctx.moveTo(prevX, prevY);

                for (let i = 1; i < points.length; i += 1) {
                    const x = padLeft + i * stepX;
                    const y = yForValue(points[i].value);
                    ctx.lineTo(x, prevY);
                    ctx.lineTo(x, y);
                    prevX = x;
                    prevY = y;
                }

                ctx.stroke();

                if (showGpioSignal) {
                    ctx.strokeStyle = '#f59e0b';
                    ctx.lineWidth = 2;
                    ctx.beginPath();

                    let prevGpioY = points[0].gpio ? gpioHighY : gpioLowY;
                    ctx.moveTo(padLeft, prevGpioY);

                    for (let i = 1; i < points.length; i += 1) {
                        const x = padLeft + i * stepX;
                        const gpioY = points[i].gpio ? gpioHighY : gpioLowY;
                        ctx.lineTo(x, prevGpioY);
                        ctx.lineTo(x, gpioY);
                        prevGpioY = gpioY;
                    }

                    ctx.stroke();
                }

                for (let i = 0; i < points.length; i += 1) {
                    const x = padLeft + i * stepX;
                    const point = points[i];
                    const y = yForValue(point.value);

                    if (point.overflow) {
                        ctx.strokeStyle = 'rgba(251, 146, 60, 0.95)';
                        ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        ctx.moveTo(x, padTop);
                        ctx.lineTo(x, height - padBottom);
                        ctx.stroke();
                    }

                    if (point.compareA) {
                        ctx.fillStyle = '#22c55e';
                        ctx.beginPath();
                        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    if (point.compareB) {
                        ctx.fillStyle = '#ec4899';
                        ctx.beginPath();
                        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }

            ctx.restore();
        };

        const resetSimulation = () => {
            state.top = getTop();
            state.counter = modeSelect.value === 'down' ? state.top : 0;
            state.direction = 1;
            state.overflowCount = 0;
            state.compareAHits = 0;
            state.compareBHits = 0;
            state.gpioState = false;
            state.accumulator = 0;
            state.history = [];
            state.plotTickAccumulator = 0;
            state.pendingPlotEvent = { overflow: false, compareA: false, compareB: false };
            pushHistoryPoint({ value: state.counter, overflow: false, compareA: false, compareB: false, gpio: state.gpioState });
            updateText();
        };

        const loop = (currentTime) => {
            const dt = Math.min((currentTime - lastFrameTime) * 0.001, 0.1);
            lastFrameTime = currentTime;

            if (state.isRunning) {
                const tickRate = toInt(tickRateRange.value, 16);
                state.accumulator += dt * tickRate;

                let ticksToRun = Math.floor(state.accumulator);
                const maxTicksPerFrame = 240;
                if (ticksToRun > maxTicksPerFrame) {
                    ticksToRun = maxTicksPerFrame;
                }
                state.accumulator -= ticksToRun;

                const historyCap = getHistoryCapacity();
                const sampleStride = getPlotSampleStride(historyCap);

                for (let i = 0; i < ticksToRun; i += 1) {
                    const event = simulateOneTick();
                    state.pendingPlotEvent.overflow = state.pendingPlotEvent.overflow || event.overflow;
                    state.pendingPlotEvent.compareA = state.pendingPlotEvent.compareA || event.compareA;
                    state.pendingPlotEvent.compareB = state.pendingPlotEvent.compareB || event.compareB;
                    state.plotTickAccumulator += 1;

                    if (state.plotTickAccumulator >= sampleStride) {
                        pushHistoryPoint({
                            value: state.counter,
                            overflow: state.pendingPlotEvent.overflow,
                            compareA: state.pendingPlotEvent.compareA,
                            compareB: state.pendingPlotEvent.compareB,
                            gpio: state.gpioState
                        });
                        state.plotTickAccumulator = 0;
                        state.pendingPlotEvent = { overflow: false, compareA: false, compareB: false };
                    }

                    if (pauseOnCompareToggle.checked && (event.compareA || event.compareB)) {
                        state.isRunning = false;
                        state.accumulator = 0;
                        break;
                    }
                }
            }

            drawGraph();
            updateText();
            requestAnimationFrame(loop);
        };

        bitWidthSelect.addEventListener('change', () => {
            saveCompareValuesForResolution(activeResolutionKey, state.top);
            activeResolutionKey = bitWidthSelect.value;
            clampCompareInputs({ restoreForResolution: true });
            applyRecommendedTickRate();
            resetSimulation();
        });

        modeSelect.addEventListener('change', () => {
            state.direction = 1;
            if (modeSelect.value === 'down') {
                state.counter = state.top;
            }
            applyRecommendedTickRate();
            updateText();
        });

        compareAInput.addEventListener('change', () => {
            compareAInput.value = String(Math.min(Math.max(toInt(compareAInput.value, 0), 0), state.top));
            saveCompareValuesForResolution(activeResolutionKey, state.top);
            updateText();
        });

        compareBInput.addEventListener('change', () => {
            compareBInput.value = String(Math.min(Math.max(toInt(compareBInput.value, 0), 0), state.top));
            saveCompareValuesForResolution(activeResolutionKey, state.top);
            updateText();
        });

        tickRateRange.addEventListener('input', updateText);

        showGpioSignalToggle.addEventListener('change', () => {
            gpioLegendItem.style.display = showGpioSignalToggle.checked ? '' : 'none';
        });

        toggleRunBtn.addEventListener('click', () => {
            state.isRunning = !state.isRunning;
            updateText();
        });

        resetBtn.addEventListener('click', resetSimulation);

        clampCompareInputs({ restoreForResolution: true });
        applyRecommendedTickRate();
        gpioLegendItem.style.display = showGpioSignalToggle.checked ? '' : 'none';
        resetSimulation();
        requestAnimationFrame(loop);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.timer-simulator-target').forEach((el) => {
        if (!el.dataset.initialized) {
            el.dataset.initialized = 'true';
            new TimerSimulator(el);
        }
    });
});

document.querySelectorAll('.timer-simulator-target').forEach((el) => {
    if (!el.dataset.initialized) {
        el.dataset.initialized = 'true';
        new TimerSimulator(el);
    }
});
