class PwmSimulator extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                :host { display: block; font-family: inherit; margin-bottom: 2rem; }
                canvas { display: block; width: 100%; height: 100%; }
            </style>
            <div class="card shadow-sm border-0 rounded-4 p-4 bg-white">
                <div class="row g-4 align-items-center">
                    
                    <!-- Controls Column -->
                    <div class="col-lg-5 border-end-lg pe-lg-4">
                        <h4 class="h5 fw-semibold text-dark mb-3">PWM Configuration</h4>

                        <div class="mb-3">
                            <label class="form-label small fw-bold text-uppercase text-secondary">Timer Resolution</label>
                            <select id="bitWidthSelect" class="form-select form-select-sm shadow-none">
                                <option value="8">8-bit (0 - 255 steps)</option>
                                <option value="10" selected>10-bit (0 - 1023 steps)</option>
                                <option value="12">12-bit (0 - 4095 steps)</option>
                                <option value="16">16-bit (0 - 65535 steps)</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <label class="form-label small fw-bold text-uppercase text-secondary mb-0">Frequency</label>
                                <span id="freqValueDisplay" class="badge bg-primary bg-opacity-10 text-primary px-2 py-1 fw-bold">1 kHz</span>
                            </div>
                            <input type="range" class="form-range" id="freqRange" min="100" max="5000" step="100" value="1000">
                        </div>

                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <label class="form-label small fw-bold text-uppercase text-secondary mb-0">Duty Cycle</label>
                                <span id="dutyValueDisplay" class="badge bg-success bg-opacity-10 text-success px-2 py-1 fw-bold">50%</span>
                            </div>
                            <input type="range" class="form-range" id="dutyRange" min="0" max="100" step="1" value="50">
                        </div>

                        <div class="p-2 bg-light rounded-3 border">
                            <div class="row text-center g-2">
                                <div class="col-6 border-end">
                                    <span class="d-block text-muted small text-uppercase" style="font-size: 0.7rem;">Max Steps (TOP)</span>
                                    <span id="maxStepsDisplay" class="fw-bold text-dark mb-0" style="font-size: 0.9rem;">1023</span>
                                </div>
                                <div class="col-6">
                                    <span class="d-block text-muted small text-uppercase" style="font-size: 0.7rem;">Period Time</span>
                                    <span id="periodDisplay" class="fw-bold text-dark mb-0" style="font-size: 0.9rem;">1.00 ms</span>
                                </div>
                            </div>
                            <div class="mt-2 pt-2 border-top text-muted text-center" style="font-size: 0.75rem;" id="thresholdInfoText">
                                Signal goes HIGH at count: <strong>0</strong> and switches LOW at compare value: <strong>512</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Visualization Column -->
                    <div class="col-lg-7 ps-lg-4 mt-4 mt-lg-0">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h4 class="h6 fw-semibold text-dark mb-0">Signal Output</h4>
                            <span class="badge bg-danger bg-opacity-10 text-danger px-2 py-1" style="font-size: 0.75rem;">Live Moving Waveform</span>
                        </div>

                        <div class="rounded-4 p-2 shadow-inner position-relative overflow-hidden border" style="height: 220px; background-color: #0f172a; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 20px 20px;">
                            <canvas id="pwmCanvas" class="w-100 h-100 display-block"></canvas>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mt-2 text-muted small px-1" style="font-size: 0.8rem;">
                            <span>● HIGH Level</span>
                            <span>● LOW Level</span>
                            <span id="onTimeDisplay">High Time: 0.50 ms</span>
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    connectedCallback() {
        const shadow = this.shadowRoot;
        const bitWidthSelect = shadow.getElementById('bitWidthSelect');
        const freqRange = shadow.getElementById('freqRange');
        const dutyRange = shadow.getElementById('dutyRange');

        const freqValueDisplay = shadow.getElementById('freqValueDisplay');
        const dutyValueDisplay = shadow.getElementById('dutyValueDisplay');
        const maxStepsDisplay = shadow.getElementById('maxStepsDisplay');
        const periodDisplay = shadow.getElementById('periodDisplay');
        const onTimeDisplay = shadow.getElementById('onTimeDisplay');
        const thresholdInfoText = shadow.getElementById('thresholdInfoText');

        const canvas = shadow.getElementById('pwmCanvas');
        const ctx = canvas.getContext('2d');

        let startTime = performance.now();

        const formatTime = (seconds) => {
            if (seconds >= 1) return (seconds).toFixed(2) + ' s';
            if (seconds >= 1e-3) return (seconds * 1e3).toFixed(2) + ' ms';
            if (seconds >= 1e-6) return (seconds * 1e6).toFixed(2) + ' µs';
            return (seconds * 1e9).toFixed(2) + ' ns';
        };

        const updateMetricsText = () => {
            const bitWidth = parseInt(bitWidthSelect.value);
            const maxSteps = Math.pow(2, bitWidth) - 1;
            const frequency = parseFloat(freqRange.value);
            const dutyCycle = parseFloat(dutyRange.value);

            const period = 1 / frequency;
            const highTime = period * (dutyCycle / 100);
            const compareValue = Math.round((dutyCycle / 100) * maxSteps);

            freqValueDisplay.textContent = frequency >= 1000 ? (frequency / 1000).toFixed(1) + ' kHz' : frequency + ' Hz';
            dutyValueDisplay.textContent = dutyCycle + '%';
            maxStepsDisplay.textContent = maxSteps.toLocaleString();
            periodDisplay.textContent = formatTime(period);
            onTimeDisplay.textContent = `High Time: ${formatTime(highTime)}`;
            thresholdInfoText.innerHTML = `Signal goes HIGH at count: <strong>0</strong> and switches LOW at compare value: <strong>${compareValue.toLocaleString()}</strong>`;
        };

        const renderLoop = (currentTime) => {
            const frequency = parseFloat(freqRange.value);
            const dutyCycle = parseFloat(dutyRange.value) / 100;

            const width = canvas.clientWidth || 400;
            const height = canvas.clientHeight || 200;
            const dpr = window.devicePixelRatio || 1;

            if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
                canvas.width = width * dpr;
                canvas.height = height * dpr;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);

            const padX = 10;
            const padY = 20;
            const plotWidth = width - padX * 2;
            const plotHeight = height - padY * 2;

            const highY = padY + 5;
            const lowY = padY + plotHeight - 5;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(padX, padY + plotHeight / 2);
            ctx.lineTo(width - padX, padY + plotHeight / 2);
            ctx.stroke();
            ctx.setLineDash([]);

            const windowTime = 0.002;
            const period = 1 / frequency;
            const cycleWidth = (period / windowTime) * plotWidth;

            const elapsedSec = (currentTime - startTime) * 0.001;
            const scrollSpeedPixelsPerSec = 40;
            const offset = (elapsedSec * scrollSpeedPixelsPerSec) % cycleWidth;

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.beginPath();

            let startX = padX - offset - cycleWidth;
            const limitX = width - padX;

            ctx.moveTo(padX, lowY);

            while (startX < width + cycleWidth) {
                const activeWidth = cycleWidth * dutyCycle;
                const lowWidth = cycleWidth - activeWidth;

                let nextLowEnd = startX + lowWidth;
                if (nextLowEnd > padX && startX < limitX) {
                    let drawStartX = Math.max(startX, padX);
                    let drawEndX = Math.min(nextLowEnd, limitX);
                    if (drawStartX === padX) {
                        ctx.moveTo(drawStartX, lowY);
                    } else {
                        ctx.lineTo(drawStartX, lowY);
                    }
                    ctx.lineTo(drawEndX, lowY);
                }
                startX = nextLowEnd;

                let newHighEnd = startX + activeWidth;
                if (newHighEnd > padX && startX < limitX) {
                    let drawStartX = Math.max(startX, padX);
                    let drawEndX = Math.min(newHighEnd, limitX);
                    ctx.lineTo(drawStartX, highY);
                    ctx.lineTo(drawEndX, highY);
                }
                startX = newHighEnd;
            }

            ctx.stroke();
            ctx.restore();

            requestAnimationFrame(renderLoop);
        };

        bitWidthSelect.addEventListener('change', updateMetricsText);
        freqRange.addEventListener('input', updateMetricsText);
        dutyRange.addEventListener('input', updateMetricsText);

        updateMetricsText();
        requestAnimationFrame(renderLoop);
    }
}

customElements.define('pwm-simulator', PwmSimulator);