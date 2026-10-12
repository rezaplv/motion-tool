function draw(ctx, time, width, height) {
    const t = time;
    const duration = 10;
    const sceneCount = 1;
    const loopT = t % duration;
    const sceneDuration = duration / sceneCount;
    const currentScene = Math.floor(loopT / sceneDuration);
    const sceneProgress = (loopT % sceneDuration) / sceneDuration;
    
    const minSide = Math.min(width, height);
    const pi2 = Math.PI * 2;
    const loopAngle = sceneProgress * pi2;
    // Color Palette
    const colors = {
        bgStart: '#0B1021',
        bgEnd: '#040710',
        panelBg: 'rgba(20, 32, 60, 0.65)',
        panelBorder: 'rgba(255, 255, 255, 0.1)',
        panelHighlight: 'rgba(255, 255, 255, 0.25)',
        cyan: '#00E5FF',
        magenta: '#FF007F',
        green: '#00F090',
        yellow: '#FFD700',
        textMain: '#FFFFFF',
        textMuted: 'rgba(255, 255, 255, 0.5)'
    };
    // Helper: Rounded Rectangle
    const drawRoundedRect = (x, y, w, h, r) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };
    // Helper: Glass Panel
    const drawPanel = (x, y, w, h, r, floatOffset = 0) => {
        const fy = y + Math.sin(loopAngle + floatOffset)  *minSide*  0.015;
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = minSide * 0.04;
        ctx.shadowOffsetY = minSide * 0.02;
        
        drawRoundedRect(x, fy, w, h, r);
        ctx.fillStyle = colors.panelBg;
        ctx.fill();
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        
        // Glossy border
        const gradient = ctx.createLinearGradient(x, fy, x + w, fy + h);
        gradient.addColorStop(0, colors.panelHighlight);
        gradient.addColorStop(0.5, colors.panelBorder);
        gradient.addColorStop(1, colors.panelHighlight);
        
        ctx.lineWidth = minSide * 0.002;
        ctx.strokeStyle = gradient;
        ctx.stroke();
        return { px: x, py: fy, pw: w, ph: h };
    };
    // 1. Draw Background
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
    bgGrad.addColorStop(0, colors.bgStart);
    bgGrad.addColorStop(1, colors.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    // 2. Animated Grid
    const gridSize = minSide * 0.08;
    const gridOffsetX = (sceneProgress * gridSize) % gridSize;
    const gridOffsetY = (sceneProgress * gridSize) % gridSize;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = minSide * 0.001;
    ctx.beginPath();
    for (let x = -gridSize + gridOffsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    for (let y = -gridSize + gridOffsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();
    // 3. Floating Particles / Glowing Nodes
    for (let i = 0; i < 15; i++) {
        const angle = (i / 15)  *pi2 + loopAngle*  (i % 2 === 0 ? 1 : -1);
        const radius = minSide  *0.2 + (i*  minSide * 0.02);
        const cx = width  *0.5 + Math.cos(angle)*  radius * 1.5;
        const cy = height  *0.5 + Math.sin(angle)*  radius;
        
        ctx.beginPath();
        ctx.arc(cx, cy, minSide * 0.004, 0, pi2);
        ctx.fillStyle = i % 3 === 0 ? colors.cyan : (i % 3 === 1 ? colors.magenta : colors.green);
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = minSide * 0.02;
        ctx.fill();
    }
    ctx.shadowBlur = 0; // reset
    // Layout configuration
    const margin = minSide * 0.05;
    const gap = minSide * 0.04;
    const panelRadius = minSide * 0.03;
    
    const leftW = width  *0.6 - margin*  1.5;
    const rightW = width - leftW - margin * 2 - gap;
    const topH = height * 0.45 - margin - gap/2;
    const bottomH = height - topH - margin * 2 - gap;
    // 4. Panel 1: Infinite Line Chart (Left)
    const p1 = drawPanel(margin, margin, leftW, height - margin * 2, panelRadius, 0);
    
    // Panel 1 Content
    const chartPadX = p1.pw * 0.1;
    const chartPadY = p1.ph * 0.15;
    const chartW = p1.pw - chartPadX * 2;
    const chartH = p1.ph - chartPadY * 2;
    const chartX = p1.px + chartPadX;
    const chartY = p1.py + chartPadY;
    // Chart Axes & Grid
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = minSide * 0.002;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartH);
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.stroke();
    
    for(let i=1; i<4; i++) {
        ctx.beginPath();
        ctx.moveTo(chartX, chartY + (chartH/4) * i);
        ctx.lineTo(chartX + chartW, chartY + (chartH/4) * i);
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.stroke();
    }
    // Smooth Infinite Line
    const getChartY = (nx) => {
        // Multi-layered sine wave moving left
        const wave1 = Math.sin(nx  *Math.PI*  4 - loopAngle)  *(chartH*  0.25);
        const wave2 = Math.cos(nx  *Math.PI*  2 + loopAngle  *2)*  (chartH * 0.15);
        return chartY + (chartH / 2) + wave1 + wave2;
    };
    ctx.save();
    ctx.beginPath();
    drawRoundedRect(chartX, chartY, chartW, chartH, 0);
    ctx.clip(); // Ensure wave doesn't bleed out of chart area
    const points = 100;
    ctx.beginPath();
    ctx.moveTo(chartX, chartY + chartH);
    for (let i = 0; i <= points; i++) {
        const nx = i / points;
        const px = chartX + nx * chartW;
        ctx.lineTo(px, getChartY(nx));
    }
    ctx.lineTo(chartX + chartW, chartY + chartH);
    ctx.closePath();
    // Fill under line
    const areaGrad = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
    areaGrad.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    areaGrad.addColorStop(1, 'rgba(0, 229, 255, 0.0)');
    ctx.fillStyle = areaGrad;
    ctx.fill();
    // Glowing Line
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
        const nx = i / points;
        const px = chartX + nx * chartW;
        if (i === 0) ctx.moveTo(px, getChartY(nx));
        else ctx.lineTo(px, getChartY(nx));
    }
    ctx.lineWidth = minSide * 0.006;
    ctx.strokeStyle = colors.cyan;
    ctx.shadowColor = colors.cyan;
    ctx.shadowBlur = minSide * 0.02;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset
    ctx.restore();
    // Data dots on the line
    const numDots = 4;
    for (let i = 0; i < numDots; i++) {
        const nx = ((sceneProgress + i/numDots) % 1);
        const px = chartX + nx * chartW;
        const py = getChartY(nx);
        
        ctx.beginPath();
        ctx.arc(px, py, minSide * 0.008, 0, pi2);
        ctx.fillStyle = colors.bgStart;
        ctx.fill();
        ctx.lineWidth = minSide * 0.003;
        ctx.strokeStyle = colors.cyan;
        ctx.stroke();
    }
    // Panel 1 Text
    ctx.fillStyle = colors.textMain;
    ctx.font = `bold ${minSide * 0.035}px Arial, sans-serif`;
    ctx.fillText("Real-time Revenue Analytics", p1.px + minSide  *0.04, p1.py + minSide*  0.06);
    ctx.fillStyle = colors.textMuted;
    ctx.font = `${minSide * 0.02}px Arial, sans-serif`;
    ctx.fillText("Global tracking metrics constantly updating", p1.px + minSide  *0.04, p1.py + minSide*  0.095);
    // 5. Panel 2: Spinning Donut Chart (Top Right)
    const p2 = drawPanel(margin + leftW + gap, margin, rightW, topH, panelRadius, Math.PI / 2);
    
    const donutCX = p2.px + p2.pw / 2;
    const donutCY = p2.py + p2.ph / 2 + p2.ph * 0.05;
    const donutR = Math.min(p2.pw, p2.ph) * 0.28;
    const donutThickness = minSide * 0.04;
    const segments = [
        { color: colors.cyan, pct: 0.45 },
        { color: colors.magenta, pct: 0.35 },
        { color: colors.yellow, pct: 0.20 }
    ];
    let currentAngle = loopAngle;
    segments.forEach((seg) => {
        const arcSpread = seg.pct * pi2;
        ctx.beginPath();
        ctx.arc(donutCX, donutCY, donutR, currentAngle, currentAngle + arcSpread - 0.1);
        ctx.lineWidth = donutThickness;
        ctx.strokeStyle = seg.color;
        ctx.lineCap = 'round';
        ctx.shadowColor = seg.color;
        ctx.shadowBlur = minSide * 0.015;
        ctx.stroke();
        currentAngle += arcSpread;
    });
    ctx.shadowBlur = 0;
    // Inner rotating dashed ring
    ctx.beginPath();
    ctx.arc(donutCX, donutCY, donutR - donutThickness  *1.2, -loopAngle*  2, -loopAngle * 2 + pi2);
    ctx.lineWidth = minSide * 0.003;
    ctx.strokeStyle = colors.textMuted;
    ctx.setLineDash([minSide  *0.01, minSide*  0.015]);
    ctx.stroke();
    ctx.setLineDash([]);
    // Donut Center Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.textMain;
    ctx.font = `bold ${minSide * 0.05}px Arial, sans-serif`;
    ctx.fillText("86%", donutCX, donutCY - minSide * 0.005);
    ctx.fillStyle = colors.green;
    ctx.font = `bold ${minSide * 0.018}px Arial, sans-serif`;
    ctx.fillText("▲ +12.4%", donutCX, donutCY + minSide * 0.035);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    // Panel 2 Text
    ctx.fillStyle = colors.textMain;
    ctx.font = `bold ${minSide * 0.025}px Arial, sans-serif`;
    ctx.fillText("Market Share", p2.px + minSide  *0.03, p2.py + minSide*  0.05);
    // 6. Panel 3: Bar Chart (Bottom Right)
    const p3 = drawPanel(margin + leftW + gap, margin + topH + gap, rightW, bottomH, panelRadius, Math.PI);
    
    // Panel 3 Text
    ctx.fillStyle = colors.textMain;
    ctx.font = `bold ${minSide * 0.025}px Arial, sans-serif`;
    ctx.fillText("Quarterly Growth", p3.px + minSide  *0.03, p3.py + minSide*  0.05);
    const numBars = 5;
    const barPad = p3.pw * 0.1;
    const barAreaW = p3.pw - barPad * 2;
    const barAreaH = p3.ph - p3.ph * 0.3;
    const barW = (barAreaW / numBars) * 0.5;
    const barSpacing = barAreaW / numBars;
    const barBaseY = p3.py + p3.ph - p3.ph * 0.1;
    // Draw bars
    for (let i = 0; i < numBars; i++) {
        // Sine wave height animation for bars
        const heightOscillation = Math.sin(loopAngle + i  *1.5)*  0.5 + 0.5; // 0 to 1
        const maxBarH = barAreaH  *(0.4 + (i / numBars)*  0.6); // Rising trend
        const currentBarH = maxBarH  *0.5 + (maxBarH*  0.5 * heightOscillation);
        
        const bx = p3.px + barPad + (i * barSpacing) + (barSpacing - barW) / 2;
        const by = barBaseY - currentBarH;
        
        const barGrad = ctx.createLinearGradient(bx, by, bx, barBaseY);
        barGrad.addColorStop(0, colors.green);
        barGrad.addColorStop(1, 'rgba(0, 240, 144, 0.1)');
        
        ctx.fillStyle = barGrad;
        drawRoundedRect(bx, by, barW, currentBarH, barW / 2);
        
        ctx.shadowColor = colors.green;
        ctx.shadowBlur = minSide * 0.01;
        ctx.fill();
        ctx.shadowBlur = 0;
        // X-Axis labels
        ctx.fillStyle = colors.textMuted;
        ctx.font = `${minSide * 0.015}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`Q${i+1}`, bx + barW/2, barBaseY + minSide * 0.025);
    }
    ctx.textAlign = 'left';
    // 7. Interactive UI Overlay elements (Scanning lines)
    const scanLineY = height * sceneProgress;
    const scanGrad = ctx.createLinearGradient(0, scanLineY - minSide * 0.05, 0, scanLineY);
    scanGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
    scanGrad.addColorStop(1, 'rgba(0, 229, 255, 0.1)');
    
    ctx.fillStyle = scanGrad;
    ctx.fillRect(0, scanLineY - minSide  *0.05, width, minSide*  0.05);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.fillRect(0, scanLineY, width, minSide * 0.002);
}
