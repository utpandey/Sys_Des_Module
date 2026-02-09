# Performance Interview Guide

## Common Interview Questions

### Core Web Vitals

**Q: What are Core Web Vitals?**
- LCP (Largest Contentful Paint) - < 2.5s
- FID (First Input Delay) - < 100ms
- CLS (Cumulative Layout Shift) - < 0.1
- Google's ranking factors
- Measure real user experience

**Q: How do you measure LCP?**
- Largest image or text block
- Performance API
- Lighthouse
- Real User Monitoring
- Measure render time

**Q: What causes poor CLS?**
- Images without dimensions
- Ads/embeds without space
- Dynamically injected content
- Web fonts causing FOIT/FOUT
- Actions causing layout changes

### Performance Optimization

**Q: How do you optimize bundle size?**
- Code splitting
- Tree shaking
- Remove unused code
- Minification
- Compression
- Analyze bundles

**Q: What is code splitting?**
- Split code into smaller chunks
- Load on demand
- Route-based or component-based
- Dynamic imports
- Reduce initial load

**Q: How do you optimize images?**
- Use modern formats (WebP, AVIF)
- Responsive images (srcset)
- Lazy loading
- Compression
- CDN
- Proper sizing

### Network Optimization

**Q: How do you reduce HTTP requests?**
- Bundle JavaScript/CSS
- Combine files
- Use sprites
- Inline critical CSS
- Code splitting
- HTTP/2 multiplexing

**Q: What caching strategies do you use?**
- Browser caching (Cache-Control)
- Service worker caching
- CDN caching
- ETags
- Versioned assets

**Q: How do you handle third-party scripts?**
- Defer non-critical
- Load asynchronously
- Use iframe sandbox
- Monitor performance impact
- Consider alternatives

### Rendering Optimization

**Q: What rendering patterns do you know?**
- CSR (Client-Side Rendering)
- SSR (Server-Side Rendering)
- SSG (Static Site Generation)
- ISR (Incremental Static Regeneration)
- Streaming SSR

**Q: How do you optimize the critical rendering path?**
- Minimize render-blocking CSS
- Defer non-critical JavaScript
- Inline critical CSS
- Optimize fonts
- Reduce layout shifts

**Q: What is virtual scrolling?**
- Render only visible items
- Handle large lists efficiently
- Better performance
- Libraries: react-window, react-virtual

### Build Optimization

**Q: What is tree shaking?**
- Remove unused code
- Dead code elimination
- ES modules required
- Side-effect free
- Reduces bundle size

**Q: How do you analyze bundle sizes?**
- Webpack Bundle Analyzer
- Source Map Explorer
- Rollup Visualizer
- Identify large dependencies
- Find duplicate code

**Q: What build optimizations do you apply?**
- Code splitting
- Tree shaking
- Minification
- Compression
- Asset optimization
- Remove console logs

### Performance Monitoring

**Q: How do you monitor performance in production?**
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Performance API
- Third-party tools (New Relic, Datadog)
- Google Analytics

**Q: What performance budgets do you set?**
- Bundle size limits
- Core Web Vitals targets
- Resource size limits
- Request count limits
- Lighthouse scores

**Q: How do you handle performance regressions?**
- Set up alerts
- Monitor trends
- Regular audits
- Performance budgets
- CI/CD checks

## Performance Metrics Reference

### Loading Metrics
- **TTFB** - Time to First Byte (< 600ms)
- **FCP** - First Contentful Paint (< 1.8s)
- **LCP** - Largest Contentful Paint (< 2.5s)
- **TTI** - Time to Interactive (< 3.8s)

### Interactivity Metrics
- **FID** - First Input Delay (< 100ms)
- **TBT** - Total Blocking Time (< 200ms)

### Visual Stability
- **CLS** - Cumulative Layout Shift (< 0.1)

## Optimization Strategies

### Network
1. Minimize HTTP requests
2. Enable compression
3. Use CDN
4. Implement caching
5. Optimize images
6. Lazy load resources

### JavaScript
1. Code splitting
2. Tree shaking
3. Minification
4. Remove unused code
5. Defer non-critical scripts

### CSS
1. Critical CSS inline
2. Remove unused CSS
3. Minify CSS
4. Avoid @import
5. Use CSS containment

### Rendering
1. Optimize critical path
2. Reduce layout shifts
3. Virtual scrolling
4. Lazy loading
5. Optimize animations

## Performance Checklist

### Before Deployment
- [ ] Bundle size within budget
- [ ] Core Web Vitals targets met
- [ ] Images optimized
- [ ] Compression enabled
- [ ] Caching configured
- [ ] Code splitting implemented
- [ ] Performance tests passing
- [ ] Lighthouse score > 90

## Key Takeaways

1. **Measure First** - Use tools to identify issues
2. **Set Budgets** - Define performance targets
3. **Optimize Critical Path** - Focus on what matters
4. **Monitor Continuously** - Track in production
5. **Test Regularly** - Regular performance audits
