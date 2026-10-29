class PwmSimulator {
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        // Self-contained markup and styling injected into the standard div
        this.container.innerHTML = `
            <style>
                .pwm-sim-wrapper { display: block; font-family: inherit; margin-bottom: 2rem; }
                .pwm-sim-wrapper canvas { display: block; width: 100%; height: 100%; }
            </style>
            <div class="pwm-sim-wrapper">
                <div class="card shadow-sm border-0 rounded-4 p-4 bg-white">
                    <div class="row g-4 align-items-center">
                        
                        <!-- Controls Column -->
                        <div class="col-lg-5 border-end-lg pe-lg-4">
                            <h4 class="h5 fw-semibold text-dark mb-3">PWM Configuration</h4>

                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <label class="form-label small fw-bold text-uppercase text-secondary mb-0">Frequency</label>
                                    <span class="freqValueDisplay badge bg-primary bg-opacity-10 text-primary px-2 py-1 fw-bold">1 kHz</span>
                                </div>
                                <input type="range" class="freqRange form-range" min="100" max="5000" step="100" value="1000">
                            </div>

                            <div class="mb-3">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <label class="form-label small fw-bold text-uppercase text-secondary mb-0">Duty Cycle</label>
                                    <span class="dutyValueDisplay badge bg-success bg-opacity-10 text-success px-2 py-1 fw-bold">50%</span>
                                </div>
                                <input type="range" class="dutyRange form-range" min="0" max="100" step="1" value="50">
                            </div>

                            <div class="p-2 bg-light rounded-3 border">
                                <div class="row text-center g-2">
                                    <div class="col-6 border-end">
                                        <span class="d-block text-muted small text-uppercase" style="font-size: 0.7rem;">Period Time</span>
                                        <span class="periodDisplay fw-bold text-dark mb-0" style="font-size: 0.9rem;">1.00 ms</span>
                                    </div>
                                    <div class="col-6">
                                        <span class="d-block text-muted small text-uppercase" style="font-size: 0.7rem;">Pulse Width</span>
                                        <span class="onTimeDisplay fw-bold text-dark mb-0" style="font-size: 0.9rem;">0.50 ms</span>
                                    </div>
                                </div>
                            </div>

                            <details class="mt-3">
                                <summary class="small fw-bold text-uppercase text-secondary" style="cursor: pointer;">Advanced: Timer Resolution</summary>
                                <div class="mt-2">
                                    <select class="bitWidthSelect form-select form-select-sm shadow-none">
                                        <option value="8">8-bit (0 - 255 steps)</option>
                                        <option value="10" selected>10-bit (0 - 1023 steps)</option>
                                        <option value="12">12-bit (0 - 4095 steps)</option>
                                        <option value="16">16-bit (0 - 65535 steps)</option>
                                    </select>
                                    <div class="row g-2 mt-2">
                                        <div class="col-6">
                                            <div class="p-2 bg-light rounded-3 border text-center">
                                                <span class="d-block text-muted small text-uppercase" style="font-size: 0.68rem;">Max Steps (TOP)</span>
                                                <span class="maxStepsDisplay fw-bold text-dark" style="font-size: 0.9rem;">1023</span>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <div class="p-2 bg-light rounded-3 border text-center">
                                                <span class="d-block text-muted small text-uppercase" style="font-size: 0.68rem;">Compare Value</span>
                                                <span class="compareValueDisplay fw-bold text-dark" style="font-size: 0.9rem;">512</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>

                        <!-- Visualization Column -->
                        <div class="col-lg-7 ps-lg-4 mt-4 mt-lg-0">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h4 class="h6 fw-semibold text-dark mb-0">Signal Output</h4>
                                <div class="d-flex align-items-center gap-2">
                                    <span class="waveStatusBadge badge bg-danger bg-opacity-10 text-danger px-2 py-1" style="font-size: 0.75rem;">Live Moving Waveform</span>
                                    <button type="button" class="freezeWaveBtn btn btn-sm btn-outline-secondary" style="font-size: 0.72rem;">Freeze</button>
                                </div>
                            </div>

                            <div class="rounded-4 p-2 shadow-inner position-relative overflow-hidden border" style="height: 220px; background-color: #0f172a; background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px); background-size: 20px 20px;">
                                <canvas class="pwmCanvas w-100 h-100 display-block"></canvas>
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
        const freqRange = root.querySelector('.freqRange');
        const dutyRange = root.querySelector('.dutyRange');

        const freqValueDisplay = root.querySelector('.freqValueDisplay');
        const dutyValueDisplay = root.querySelector('.dutyValueDisplay');
        const maxStepsDisplay = root.querySelector('.maxStepsDisplay');
        const compareValueDisplay = root.querySelector('.compareValueDisplay');
        const periodDisplay = root.querySelector('.periodDisplay');
        const onTimeDisplay = root.querySelector('.onTimeDisplay');
        const freezeWaveBtn = root.querySelector('.freezeWaveBtn');
        const waveStatusBadge = root.querySelector('.waveStatusBadge');

        const canvas = root.querySelector('.pwmCanvas');
        const ctx = canvas.getContext('2d');

        let startTime = performance.now();
        let isFrozen = false;
        let frozenOffset = 0;
        let freezeStartedAt = 0;

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
            compareValueDisplay.textContent = compareValue.toLocaleString();
            periodDisplay.textContent = formatTime(period);
            onTimeDisplay.textContent = formatTime(highTime);
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

            const visualFrequency = Math.max(frequency, 400);
            const period = 1 / visualFrequency;
            let visiblePeriods = 1.3;
            if (plotWidth >= 520) {
                visiblePeriods = 1.5;
            }
            if (plotWidth >= 860) {
                visiblePeriods = 2;
            }
            const windowTime = period * visiblePeriods;
            const cycleWidth = (period / windowTime) * plotWidth;

            const elapsedSec = (currentTime - startTime) * 0.001;
            const scrollSpeedPixelsPerSec = 40;
            const animatedOffset = (elapsedSec * scrollSpeedPixelsPerSec) % cycleWidth;
            const offset = isFrozen ? frozenOffset : animatedOffset;

            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';
            ctx.beginPath();

            if (dutyCycle <= 0) {
                ctx.moveTo(padX, lowY);
                ctx.lineTo(width - padX, lowY);
                ctx.stroke();
                ctx.restore();
                requestAnimationFrame(renderLoop);
                return;
            }

            if (dutyCycle >= 1) {
                ctx.moveTo(padX, highY);
                ctx.lineTo(width - padX, highY);
                ctx.stroke();
                ctx.restore();
                requestAnimationFrame(renderLoop);
                return;
            }

            let startX = padX - offset - cycleWidth;
            const limitX = width - padX;
            let hasVisibleSegment = false;

            const drawHorizontalSegment = (segmentStart, segmentEnd, y) => {
                if (segmentEnd <= padX || segmentStart >= limitX) {
                    return;
                }

                const drawStartX = Math.max(segmentStart, padX);
                const drawEndX = Math.min(segmentEnd, limitX);

                if (!hasVisibleSegment) {
                    ctx.moveTo(drawStartX, y);
                    hasVisibleSegment = true;
                } else {
                    ctx.lineTo(drawStartX, y);
                }

                ctx.lineTo(drawEndX, y);
            };

            while (startX < width + cycleWidth) {
                const activeWidth = cycleWidth * dutyCycle;
                const lowWidth = cycleWidth - activeWidth;

                const nextLowEnd = startX + lowWidth;
                drawHorizontalSegment(startX, nextLowEnd, lowY);
                startX = nextLowEnd;

                const newHighEnd = startX + activeWidth;
                drawHorizontalSegment(startX, newHighEnd, highY);
                startX = newHighEnd;
            }

            if (hasVisibleSegment) {
                ctx.stroke();
            }
            ctx.restore();

            requestAnimationFrame(renderLoop);
        };

        bitWidthSelect.addEventListener('change', updateMetricsText);
        freqRange.addEventListener('input', updateMetricsText);
        dutyRange.addEventListener('input', updateMetricsText);
        freezeWaveBtn.addEventListener('click', () => {
            isFrozen = !isFrozen;

            if (isFrozen) {
                freezeStartedAt = performance.now();
                const frequency = parseFloat(freqRange.value);
                const visualFrequency = Math.max(frequency, 400);
                const period = 1 / visualFrequency;

                const width = canvas.clientWidth || 400;
                const padX = 10;
                const plotWidth = width - padX * 2;

                let visiblePeriods = 1.3;
                if (plotWidth >= 520) {
                    visiblePeriods = 1.5;
                }
                if (plotWidth >= 860) {
                    visiblePeriods = 2;
                }

                const windowTime = period * visiblePeriods;
                const cycleWidth = (period / windowTime) * plotWidth;
                const elapsedSec = (performance.now() - startTime) * 0.001;
                const scrollSpeedPixelsPerSec = 40;
                frozenOffset = (elapsedSec * scrollSpeedPixelsPerSec) % cycleWidth;
                freezeWaveBtn.textContent = 'Resume';
                waveStatusBadge.textContent = 'Frozen Waveform';
                waveStatusBadge.classList.remove('bg-danger', 'text-danger', 'bg-opacity-10');
                waveStatusBadge.classList.add('bg-secondary', 'text-white');
            } else {
                const pausedDuration = performance.now() - freezeStartedAt;
                startTime += pausedDuration;
                freezeWaveBtn.textContent = 'Freeze';
                waveStatusBadge.textContent = 'Live Moving Waveform';
                waveStatusBadge.classList.remove('bg-secondary', 'text-white');
                waveStatusBadge.classList.add('bg-danger', 'text-danger', 'bg-opacity-10');
            }
        });

        updateMetricsText();
        requestAnimationFrame(renderLoop);
    }
}

// Automatically find all placeholders on the page and initialize them
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.pwm-simulator-target').forEach(el => new PwmSimulator(el));
});
// Also run immediately in case the script loads after DOMContentLoaded
document.querySelectorAll('.pwm-simulator-target').forEach(el => {
    if (!el.dataset.initialized) {
        el.dataset.initialized = "true";
        new PwmSimulator(el);
    }
});