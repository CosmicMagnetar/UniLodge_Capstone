# UniLodge v2 - Test Suite Guide

## Overview

Comprehensive testing infrastructure has been set up for all applications in the monorepo. All tests use **Vitest** as the test runner with support for unit, integration, and E2E tests.

## Test Structure

```
├── apps/
│   ├── frontend/          # Next.js frontend
│   │   └── vitest.config.ts  (NEW)
│   ├── backend/           # Express backend
│   │   └── __tests__/     (Enhanced)
│   └── ai-engine/         # AI services
│       ├── vitest.config.ts  (NEW)
│       └── tests/         (NEW)
├── packages/
│   └── shared/            # Shared types & schemas
│       └── src/schemas/   (NEW tests)
└── tests/                 # Root-level tests (NEW)
    ├── unit/
    ├── integration/
    └── e2e/
```

## Running Tests

### All Tests

```bash
npm run test --workspaces
```

### Specific Workspace Tests

```bash
# Shared package
npm run test:shared

# Backend
npm run test --workspace=apps/backend

# AI Engine
npm run test --workspace=apps/ai-engine

# Frontend
npm run test --workspace=apps/frontend
```

### Test Options

```bash
# Watch mode
npm run test:watch --workspace=packages/shared

# Coverage report
npm run test:coverage --workspace=packages/shared
```

## Test Files Added

### 1. **Shared Package** (`packages/shared/`)

- **File**: `src/schemas/schemas.test.ts`
- **Tests**: 18 tests covering Zod schema validation
- **Covers**:
  - User role validation
  - Room type validation
  - Booking status validation
  - Login/signup validation
  - Booking schema validation

### 2. **AI Engine** (`apps/ai-engine/`)

- **Config**: `vitest.config.ts` (NEW)
- **File**: `tests/services.test.ts` (NEW)
- **Tests**: 8 tests for HuggingFaceService
- **Covers**:
  - Service initialization
  - Text generation function calls
  - Embedding generation
  - Error handling

### 3. **Backend** (`apps/backend/`)

#### Services

- **File**: `__tests__/services/room.test.ts` (NEW)
- **Tests**: 10 tests for room validation
- **Covers**:
  - Room type validation
  - Price calculations
  - Amenities tracking
  - Availability checks
  - Rating validation

- **File**: `__tests__/services/analytics.test.ts` (NEW)
- **Tests**: 9 tests for analytics functions
- **Covers**:
  - Booking metrics
  - Occupancy calculations
  - Room ratings
  - Amenity popularity
  - Time-based analytics

#### Integration

- **File**: `__tests__/integration/api.test.ts` (NEW)
- **Tests**: 15 tests for API workflows
- **Covers**:
  - Room endpoints
  - Booking endpoints
  - Authentication flow
  - Health checks

#### Utilities

- **Files**:
  - `__tests__/utils/date.test.ts` (existing)
  - `__tests__/utils/price.test.ts` (existing)

### 4. **Root Tests** (`tests/`)

#### Unit Tests

- **File**: `unit/utils.test.ts` (NEW)
- **Tests**: 13 tests for frontend utilities
- **Covers**:
  - Price formatting
  - Date formatting
  - Search/filter logic
  - Form validation

#### Integration Tests

- **File**: `integration/workflow.test.ts` (NEW)
- **Tests**: 8 tests for end-to-end workflows
- **Covers**:
  - Complete booking flow
  - Payment processing
  - Notifications
  - Analytics tracking

#### E2E Tests

- **File**: `e2e/main.spec.ts` (NEW)
- **Config**: `playwright.config.ts` (NEW)
- **Tests**: ~12 Playwright tests
- **Covers**:
  - Page loading
  - Navigation
  - Room filtering
  - Responsive design
  - Booking interaction

## Test Coverage Summary

| Module              | Tests   | Status        |
| ------------------- | ------- | ------------- |
| Shared Schemas      | 18      | ✅ Passing    |
| AI Engine           | 8       | ✅ Passing    |
| Backend Services    | 19      | ✅ Configured |
| Backend Integration | 15      | ✅ Configured |
| Frontend Utils      | 13      | ✅ Configured |
| Root Integration    | 8       | ✅ Configured |
| E2E Tests           | 12      | ✅ Configured |
| **TOTAL**           | **~93** | **Ready**     |

## Configuration Files Added/Updated

### Vitest Configs

- `apps/ai-engine/vitest.config.ts` - NEW
- `apps/frontend/vitest.config.ts` - NEW (updated from broken state)
- `apps/backend/vitest.config.ts` - Existing
- `packages/shared/vitest.config.ts` - Existing

### Package.json Scripts Updated

- `apps/ai-engine/package.json` - Added: `type-check`, `test:watch`, `test:coverage`
- `packages/shared/package.json` - Added: `type-check`
- `apps/frontend/package.json` - Cleaned up unused dependencies

### Playwright Config

- `playwright.config.ts` - NEW root-level config for E2E testing

## How to Run the Full Test Suite

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Run all tests
npm run test --workspaces

# 3. Run type checking
npm run type-check --workspaces

# 4. Run E2E tests (requires frontend server running)
npm run test:e2e

# 5. Generate coverage reports
npm run test:coverage --workspaces
```

## Backend Status

✅ **Verified Working**:

- Express server initialization
- Database configuration
- Route definitions
- Middleware setup
- All TypeScript compilation passes

✅ **Test Coverage**:

- Authentication services
- Room management
- Booking workflows
- Analytics functions
- Price calculations
- Date utilities

## AI Engine Status

✅ **Fixed Issues**:

- Added missing `type-check` script
- Created `vitest.config.ts`
- Added test infrastructure
- Verified TypeScript compilation

✅ **Test Coverage**:

- HuggingFaceService initialization
- Text generation (placeholder)
- Embedding generation (placeholder)
- Error handling

## Frontend Status

✅ **Fixed Issues**:

- Added `postcss.config.js` (primary issue - Tailwind CSS)
- Created `vitest.config.ts`
- Added test infrastructure
- Verified TypeScript compilation

✅ **Test Coverage**:

- Utility functions
- Form validation
- Price/date formatting
- Responsive design (E2E)

## Next Steps

### To Run Tests in Development:

```bash
# Watch mode for development
npm run test:watch --workspace=apps/backend

# Run specific test file
npm run test -- --run __tests__/services/room.test.ts
```

### To Add More Tests:

1. Create `.test.ts` or `.spec.ts` files
2. Use `describe()` and `it()` from vitest
3. Follow the existing test patterns
4. Run tests in watch mode for development

### To Run E2E Tests:

```bash
# Ensure frontend is running on http://localhost:3000
npm run dev:frontend

# In another terminal
npm run test:e2e

# Or with specific browser
npx playwright test --project=chromium
```

## Test Patterns Used

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";

describe("Feature", () => {
  it("should do something", () => {
    expect(result).toBe(expected);
  });
});
```

### Integration Tests

```typescript
describe('Integration', () => {
  it('should handle full workflow', async () => {
    // Setup
    const input = {...}
    // Execute
    const result = process.operation(input)
    // Assert
    expect(result).toMatchObject({...})
  })
})
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from "@playwright/test";

test("should interact with UI", async ({ page }) => {
  await page.goto("/");
  await page.click("button");
  await expect(page.locator("h1")).toBeVisible();
});
```

## Troubleshooting

### Tests not running

- Ensure `npm install` is run at root
- Check that vitest is in devDependencies
- Run `npm run type-check` first

### Import errors in tests

- Check that paths in `tsconfig.json` match test imports
- Verify `@unilodge/shared` exports are correct
- Check file extensions (.ts vs .tsx)

### Playwright E2E failures

- Ensure localhost:3000 is accessible
- Check that frontend server is running
- Verify page selectors match actual HTML

## Summary

✅ **All test infrastructure is now in place**

- 93+ unit, integration, and E2E tests configured
- TypeScript compilation verified across all workspaces
- Vitest and Playwright properly configured
- Ready for CI/CD integration
- Backend and AI Engine verified as functional

The test suite covers core functionality for:

- User authentication
- Room management & filtering
- Booking workflows
- Payment processing
- Analytics
- Form validation
- UI responsiveness
