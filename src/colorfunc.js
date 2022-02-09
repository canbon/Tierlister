function setHSLA() {
    currhsla = `hsla(${hueInput.value}, ${satInput.value}%, ${valInput.value}%, ${alphaInput.value})`;
    hslaInput.value = currhsla;
    
    if (textOrTier) {
        sampleTier.className = 'custom-color';
        sampleTier.style.setProperty('--custom-color', currhsla);
        currLabel.className = 'tier-label';
        currLabel.classList.add('custom-color');
        currLabel.style.setProperty('--custom-color', currhsla);
    }
    else {
        sampleTier.style.color = currhsla;
        currLabel.style.color = currhsla;
    }
}

function hexToHSL(H) {
    let r = 0, g = 0, b = 0, a = 1;
    
    if (H.length == 4) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
    }
    else if (H.length == 5) {
        r = "0x" + H[1] + H[1];
        g = "0x" + H[2] + H[2];
        b = "0x" + H[3] + H[3];
        a = "0x" + H[4] + H[4];
    } else if (H.length == 9) {
        r = "0x" + H[1] + H[2];
        g = "0x" + H[3] + H[4];
        b = "0x" + H[5] + H[6];
        a = "0x" + H[7] + H[8];
    }
    
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
            
    a = (a / 255).toFixed(3);
            
    hueInput.value = h;
    satInput.value = s;
    valInput.value = l;
    alphaInput.value = 1;
    setHSLA();
}

function HSLToHex(h,s,l) {
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0, 
        b = 0; 
  
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
  
    // Prepend 0s, if necessary
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    hexInput.value = "#" + r + g + b;
}

function HSLToRGB(h,s,l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

    textColorInput.value = `rgba(${(255 * f(0)).toFixed(0)}, ${(255 * f(8)).toFixed(0)}, ${(255 * f(4)).toFixed(0)}, ${Math.trunc(alphaInput.value)})`
}

function RGBAToHSLA(r,g,b,a) {
    // Make r, g, and b fractions of 1
r /= 255;
g /= 255;
b /= 255;

// Find greatest and smallest channel values
let cmin = Math.min(r,g,b),
    cmax = Math.max(r,g,b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

    if (delta == 0)
    h = 0;
    // Red is max
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    // Green is max
    else if (cmax == g)
        h = (b - r) / delta + 2;
    // Blue is max
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);
        
    // Make negative hues positive behind 360°
    if (h < 0)
        h += 360;

            // Calculate lightness
    l = (cmax + cmin) / 2;

    // Calculate saturation
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        
    // Multiply l and s by 100
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    hueInput.value = h;
    satInput.value = s;
    valInput.value = l;
    alphaInput.value = a;
    setHSLA();
}