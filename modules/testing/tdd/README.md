# Test-Driven Development (TDD)

## Overview

TDD is a development approach where you write tests before writing the implementation code.

## TDD Cycle (Red-Green-Refactor)

1. **Red** - Write a failing test
2. **Green** - Write minimal code to pass
3. **Refactor** - Improve code while keeping tests green

## TDD Benefits

- **Better Design** - Forces you to think about API
- **Documentation** - Tests serve as documentation
- **Confidence** - Know when code works
- **Regression Prevention** - Catch bugs early
- **Refactoring Safety** - Safe to refactor

## TDD Process

### 1. Write Test First
```javascript
// test.js
describe('calculateTotal', () => {
  it('should calculate total with tax', () => {
    expect(calculateTotal(100, 0.1)).toBe(110);
  });
});
```

### 2. Run Test (Should Fail)
```bash
npm test
# ❌ ReferenceError: calculateTotal is not defined
```

### 3. Write Implementation
```javascript
// utils.js
function calculateTotal(price, tax) {
  return price * (1 + tax);
}
```

### 4. Run Test (Should Pass)
```bash
npm test
# ✅ All tests passing
```

### 5. Refactor
```javascript
// Improve implementation while tests still pass
function calculateTotal(price, tax = 0.1) {
  if (price < 0) throw new Error('Price must be positive');
  return price * (1 + tax);
}
```

## When to Use TDD

### Good For
- Complex logic
- Critical features
- APIs and interfaces
- Bug fixes

### Not Always Needed
- Simple code
- Prototyping
- Learning/exploration
- UI components (sometimes)

## Production TODO

- [ ] Write tests before implementation
- [ ] Follow Red-Green-Refactor cycle
- [ ] Keep tests simple
- [ ] Refactor regularly
- [ ] Maintain test coverage
- [ ] Review test quality

## Common Mistakes

1. **Writing too many tests at once** - One test at a time
2. **Skipping refactor step** - Important for code quality
3. **Writing complex tests** - Keep tests simple
4. **Testing implementation** - Test behavior
5. **Not running tests frequently** - Run after each change

## DON'Ts

- ❌ Don't write all tests first
- ❌ Don't skip the refactor step
- ❌ Don't write complex tests
- ❌ Don't test implementation details
- ❌ Don't ignore failing tests

## DO's

- ✅ Write one test at a time
- ✅ Follow Red-Green-Refactor
- ✅ Keep tests simple
- ✅ Run tests frequently
- ✅ Refactor regularly
- ✅ Test behavior, not implementation
