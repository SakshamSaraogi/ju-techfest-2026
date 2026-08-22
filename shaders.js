const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Global background shader: supports smooth transition between normal mode (black bg + red lines), white lines mode (black bg + white lines), and inverted mode (crimson bg + black lines)
const bgFragmentShader = `
  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uInvertProgress;
  uniform float uWhiteLinesProgress;
  
  varying vec2 vUv;
  
  float getMovingLines(vec2 uv, vec2 parallax, float time) {
    float aspect = uResolution.x / uResolution.y;
    vec2 center = vec2(0.5, aspect < 0.8 ? 0.44 : 0.5);
    vec2 p = (uv - center) * vec2(aspect, 1.0) * (aspect < 0.8 ? 2.5 : 2.2);
    p += parallax * 0.5;
    
    float w1 = sin(p.y * 1.8 + time * 0.35 + sin(p.x * 1.2) * 1.2);
    float w2 = cos(p.x * 1.5 - time * 0.25 + cos(p.y * 1.4) * 1.0);
    float field = (w1 + w2) * 2.5;
    
    float line = abs(fract(field - 0.5) - 0.5) / max(fwidth(field), 0.001);
    return 1.0 - smoothstep(0.0, 1.4, line);
  }
  
  void main() {
    vec2 mouseOffset = (uMouse - 0.5);
    vec2 bgParallax = mouseOffset * 0.032;
    
    vec2 centeredUv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    float vig = 1.0 - length(centeredUv) * 0.22;
    
    float lines = getMovingLines(vUv, bgParallax, uTime);
    
    // Normal Mode (Sections 1 & 4): Black background with dark red lines transitioning smoothly to white lines (Section 5)
    vec3 normalBg = vec3(0.02, 0.02, 0.025) * vig;
    vec3 redLines = vec3(0.68, 0.08, 0.12);
    vec3 whiteLines = vec3(0.92, 0.92, 0.96);
    float whiteT = clamp(uWhiteLinesProgress, 0.0, 1.0);
    vec3 normalLines = mix(redLines, whiteLines, whiteT);
    vec3 normalColor = mix(normalBg, normalLines, lines * mix(0.48, 0.42, whiteT));
    
    // Inverted Mode (Section 2): Rich crimson red background with deep blackish lines
    vec3 invertedBg = vec3(0.52, 0.06, 0.09) * vig;
    vec3 invertedLines = vec3(0.03, 0.02, 0.02);
    vec3 invertedColor = mix(invertedBg, invertedLines, lines * 0.65);
    
    // Smooth transition driven by scroll progress
    vec3 finalColor = mix(normalColor, invertedColor, clamp(uInvertProgress, 0.0, 1.0));
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const fluidFragmentShader = `
  uniform sampler2D uPrevTrails;
  uniform vec2 uMouse;
  uniform vec2 uPrevMouse;
  uniform bool uIsMoving;
  
  uniform vec2 uAutoMouse;
  uniform vec2 uAutoPrevMouse;
  uniform bool uAutoIsMoving;
  
  uniform vec2 uResolution;
  uniform float uDecay;
  
  varying vec2 vUv;
  
  float getStrokeIntensity(vec2 p1, vec2 p2, vec2 uv, float lineWidth) {
    vec2 dir = p1 - p2;
    float len = length(dir);
    if (len < 0.0001) return 0.0;
    
    vec2 dirNorm = dir / len;
    vec2 toPixel = uv - p2;
    float proj = clamp(dot(toPixel, dirNorm), 0.0, len);
    vec2 closest = p2 + proj * dirNorm;
    float dist = length(uv - closest);
    
    if (dist < lineWidth) {
      float normDist = dist / lineWidth;
      return (1.0 - normDist * normDist) * (1.0 - normDist * normDist) * 0.65;
    }
    return 0.0;
  }
  
  void main() {
    vec4 prevState = texture2D(uPrevTrails, vUv);
    
    // Clean, natural fluid dissipation
    float newValue = prevState.r * uDecay;
    
    float lineWidth = 0.085;
    
    // User cursor stroke
    if (uIsMoving) {
      newValue += getStrokeIntensity(uMouse, uPrevMouse, vUv, lineWidth);
    }
    
    // Automated 3-stroke sweep
    if (uAutoIsMoving) {
      newValue += getStrokeIntensity(uAutoMouse, uAutoPrevMouse, vUv, lineWidth);
    }
    
    gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0);
  }
`;

const displayFragmentShader = `
  uniform sampler2D uFluid;
  uniform sampler2D uTopTexture;
  uniform sampler2D uBottomTexture;
  uniform vec2 uResolution;
  uniform float uDpr;
  uniform vec2 uTopTextureSize;
  uniform vec2 uBottomTextureSize;
  uniform vec2 uMouse;
  uniform float uTime;
  
  varying vec2 vUv;
  
  // Calculate aspect ratio cover mapping with 3D parallax
  vec2 getCoverUV(vec2 uv, vec2 textureSize, vec2 parallaxOffset) {
    if (textureSize.x < 1.0 || textureSize.y < 1.0) return uv;
    
    vec2 s = uResolution / textureSize;
    float scale = max(s.x, s.y);
    vec2 scaledSize = textureSize * scale;
    vec2 offset = (uResolution - scaledSize) * 0.5;
    
    vec2 baseUv = (uv * uResolution - offset) / scaledSize;
    return baseUv + parallaxOffset;
  }
  
  // Procedural animated background contour streamlines
  float getMovingLines(vec2 uv, vec2 parallax, float time) {
    vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0) * 2.2;
    p += parallax * 0.5;
    
    float w1 = sin(p.y * 1.8 + time * 0.35 + sin(p.x * 1.2) * 1.2);
    float w2 = cos(p.x * 1.5 - time * 0.25 + cos(p.y * 1.4) * 1.0);
    float field = (w1 + w2) * 2.5;
    
    float line = abs(fract(field - 0.5) - 0.5) / max(fwidth(field), 0.001);
    return 1.0 - smoothstep(0.0, 1.4, line);
  }
  
  void main() {
    // 3D Parallax offsets
    vec2 mouseOffset = (uMouse - 0.5);
    vec2 charParallax = mouseOffset * -0.022;
    vec2 bgParallax = mouseOffset * 0.032;
    
    // Sample original portraits with 3D parallax
    vec2 topUV = getCoverUV(vUv, uTopTextureSize, charParallax);
    vec2 bottomUV = getCoverUV(vUv, uBottomTextureSize, charParallax * 0.7);
    
    vec4 topColor = texture2D(uTopTexture, topUV);
    vec4 bottomColor = texture2D(uBottomTexture, bottomUV);
    
    // Deep black base background with subtle vignette
    vec2 centeredUv = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    float vig = 1.0 - length(centeredUv) * 0.22;
    vec3 blackBg = vec3(0.02, 0.02, 0.025) * vig;
    
    // Continuously visible dark red flowing lines in the hero
    float lines = getMovingLines(vUv, bgParallax, uTime);
    vec3 darkRedColor = vec3(0.68, 0.08, 0.12);
    vec3 ambientBg = mix(blackBg, darkRedColor, lines * 0.48);
    
    // Fluid liquid mask sampling
    float fluid = texture2D(uFluid, vUv).r;
    float threshold = 0.02;
    float edgeWidth = 0.008 / uDpr;
    float t = smoothstep(threshold, threshold + edgeWidth, fluid);
    
    // Fluid interaction in background (gentle liquid surge under cursor trail)
    vec3 fluidBg = mix(blackBg, darkRedColor * 1.25, lines * 0.7) + vec3(0.08, 0.01, 0.02) * fluid;
    vec3 currentBg = mix(ambientBg, fluidBg, t);
    
    // Composite top state (person over ambient moving lines background)
    vec3 topFull = mix(currentBg, topColor.rgb, topColor.a);
    
    // Composite bottom state (robot over enhanced flowing lines background)
    vec3 bottomFull = mix(currentBg, bottomColor.rgb, bottomColor.a);
    
    // Fluid liquid reveal transition
    vec3 finalRgb = mix(topFull, bottomFull, t);
    
    // Semi-transparent background output to allow the marquee text behind canvas to show through
    float bgAlpha = clamp(lines * 0.75 + fluid * 0.45 + 0.35, 0.35, 0.85);
    float finalAlpha = mix(bgAlpha, 1.0, max(topColor.a, bottomColor.a * t));
    
    gl_FragColor = vec4(finalRgb, finalAlpha);
  }
`;

export { vertexShader, bgFragmentShader, fluidFragmentShader, displayFragmentShader };
