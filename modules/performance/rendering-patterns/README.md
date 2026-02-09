# Rendering Patterns

## Overview

Rendering patterns determine when and how content is rendered, significantly impacting performance and user experience.

## Rendering Patterns

### 1. Client-Side Rendering (CSR)
- Rendered in browser
- Single Page Application (SPA)
- Fast navigation
- Slower initial load

### 2. Server-Side Rendering (SSR)
- Rendered on server
- Faster initial load
- Better SEO
- Slower navigation

### 3. Static Site Generation (SSG)
- Pre-rendered at build time
- Fastest load time
- Great for static content
- Limited for dynamic content

### 4. Incremental Static Regeneration (ISR)
- Static with updates
- Best of both worlds
- Revalidate on demand
- Next.js feature

### 5. Streaming SSR
- Stream HTML chunks
- Progressive rendering
- Faster Time to First Byte
- Better perceived performance

## Optimization Techniques

### Critical Rendering Path
1. **HTML** - Parse HTML
2. **CSS** - Parse CSS, build CSSOM
3. **JavaScript** - Parse and execute
4. **Render Tree** - Combine DOM and CSSOM
5. **Layout** - Calculate layout
6. **Paint** - Paint pixels

### Optimization Strategies
- Minimize render-blocking resources
- Inline critical CSS
- Defer non-critical JavaScript
- Optimize fonts
- Reduce layout shifts

## Virtual Scrolling

### Benefits
- Render only visible items
- Handle large lists
- Better performance
- Smooth scrolling

### Implementation
- React Virtual
- react-window
- react-virtualized
- Custom implementation

## Production TODO

- [ ] Choose appropriate rendering pattern
- [ ] Optimize critical rendering path
- [ ] Minimize layout shifts
- [ ] Implement virtual scrolling
- [ ] Optimize fonts
- [ ] Reduce render-blocking resources
- [ ] Use code splitting
- [ ] Implement lazy loading

## Common Mistakes

1. **Wrong rendering pattern** - Not matching use case
2. **Render-blocking CSS** - Blocking initial render
3. **Render-blocking JS** - Blocking initial render
4. **Layout shifts** - Poor CLS scores
5. **No virtual scrolling** - Rendering too many items
6. **Synchronous rendering** - Blocking main thread

## DON'Ts

- ❌ Don't use CSR for SEO-critical pages
- ❌ Don't block rendering with CSS/JS
- ❌ Don't cause layout shifts
- ❌ Don't render too many items
- ❌ Don't ignore font optimization

## DO's

- ✅ Choose right rendering pattern
- ✅ Optimize critical path
- ✅ Minimize layout shifts
- ✅ Use virtual scrolling
- ✅ Optimize fonts
- ✅ Defer non-critical resources

## Pattern Comparison

| Pattern | Initial Load | SEO | Interactivity | Use Case |
|---------|-------------|-----|---------------|----------|
| CSR | Slow | Poor | Fast | Dashboards, Apps |
| SSR | Fast | Good | Medium | Content sites |
| SSG | Fastest | Best | Fast | Blogs, Docs |
| ISR | Fast | Good | Fast | Dynamic static |

## Implementation Examples

### Code Splitting with React
```javascript
import { lazy, Suspense } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Virtual Scrolling
```javascript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div key={virtualRow.key} style={{ height: virtualRow.size }}>
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
}
```
