# Testing Interview Guide

## Common Interview Questions

### Unit Testing

**Q: How do you test React components?**
- Use React Testing Library
- Test user behavior, not implementation
- Query by role, text, or test-id
- Avoid testing internal state

**Q: What's the difference between unit and integration tests?**
- Unit: Test individual functions/components in isolation
- Integration: Test multiple components working together
- Unit tests are faster, integration tests catch more bugs

**Q: How do you mock API calls in tests?**
- Use MSW (Mock Service Worker)
- Use Jest mocks
- Mock fetch/axios
- Return predictable test data

### E2E Testing

**Q: What tools do you use for E2E testing?**
- Playwright (modern, fast, reliable)
- Cypress (great DX, developer-friendly)
- Selenium (industry standard)

**Q: How do you handle flaky tests?**
- Use proper wait strategies
- Avoid brittle selectors
- Use data-testid attributes
- Retry logic for network issues
- Isolate tests properly

**Q: What's your strategy for E2E test maintenance?**
- Page Object Model
- Reusable test utilities
- Regular test reviews
- Remove obsolete tests
- Keep tests focused

### Performance Testing

**Q: How do you measure frontend performance?**
- Core Web Vitals (LCP, FID, CLS)
- Lighthouse scores
- Real User Monitoring (RUM)
- Performance budgets

**Q: What metrics do you track?**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- TTFB < 600ms
- Bundle size

**Q: How do you test under load?**
- Load testing tools (k6, Artillery)
- Stress testing
- Spike testing
- Monitor metrics under load

### A/B Testing

**Q: How do you implement A/B tests?**
- Variant assignment (consistent)
- Traffic splitting
- Analytics tracking
- Statistical analysis
- Rollout strategy

**Q: How do you ensure statistical significance?**
- Sufficient sample size
- Run for adequate duration
- 95% confidence level
- Account for multiple testing

### TDD

**Q: What is TDD?**
- Write tests before code
- Red-Green-Refactor cycle
- Tests drive design
- Confidence in code

**Q: When do you use TDD?**
- Complex logic
- Critical features
- APIs
- Bug fixes
- Not always for simple code

### Security Testing

**Q: How do you test for security vulnerabilities?**
- Automated scanning (Snyk, OWASP ZAP)
- Dependency scanning
- Penetration testing
- Security code reviews
- Regular audits

**Q: What vulnerabilities do you test for?**
- XSS
- CSRF
- SQL Injection
- Authentication bypass
- Sensitive data exposure
- Insecure dependencies

## Testing Best Practices Summary

### DO's
- ✅ Test behavior, not implementation
- ✅ Keep tests fast and isolated
- ✅ Use descriptive test names
- ✅ Test edge cases and errors
- ✅ Maintain good coverage
- ✅ Mock external dependencies
- ✅ Keep tests maintainable

### DON'Ts
- ❌ Don't test implementation details
- ❌ Don't over-mock
- ❌ Don't write slow tests
- ❌ Don't ignore flaky tests
- ❌ Don't test third-party code
- ❌ Don't write dependent tests

## Testing Pyramid

```
        /\
       /  \      E2E Tests (Few, Critical Paths)
      /____\
     /      \    Integration Tests (Some, Key Flows)
    /________\
   /          \  Unit Tests (Many, Fast, Isolated)
  /____________\
```

## Key Metrics

- **Code Coverage** - Aim for >80%
- **Test Execution Time** - Keep fast
- **Flaky Test Rate** - Minimize
- **Test Maintenance** - Regular reviews

## Testing Checklist

### Before Deployment
- [ ] All tests passing
- [ ] Code coverage >80%
- [ ] E2E tests for critical paths
- [ ] Performance benchmarks met
- [ ] Security tests passing
- [ ] No flaky tests
- [ ] Test documentation updated
