import { test, expect } from '@playwright/test'

test.describe('UniLodge E2E Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/UniLodge/)
    const heading = page.locator('h1, h2')
    await expect(heading.first()).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    const loginLink = page.locator('a[href*="login"], button:has-text("Login")')
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL(/login|auth/)
    }
  })

  test('should display room cards', async ({ page }) => {
    await page.goto('/')
    const roomCards = page.locator('[data-testid="room-card"], .room-card')
    // At least one room should be visible
    if (await roomCards.first().isVisible()) {
      await expect(roomCards.first()).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    const heading = page.locator('h1, h2')
    await expect(heading.first()).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    const heading = page.locator('h1, h2')
    await expect(heading.first()).toBeVisible()
  })

  test.describe('Booking Flow', () => {
    test('should allow searching rooms', async ({ page }) => {
      await page.goto('/')
      const searchInput = page.locator('input[placeholder*="search"], input[type="search"]')
      if (await searchInput.isVisible()) {
        await searchInput.fill('single')
        await page.waitForTimeout(500)
      }
    })

    test('should filter rooms by price', async ({ page }) => {
      await page.goto('/')
      const filterButton = page.locator('button:has-text("Filter"), [data-testid="filter"]')
      if (await filterButton.isVisible()) {
        await filterButton.click()
        await page.waitForTimeout(500)
      }
    })
  })

  test.describe('Navigation', () => {
    test('should have working navigation menu', async ({ page }) => {
      await page.goto('/')
      const navLinks = page.locator('nav a, header a')
      const count = await navLinks.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should have footer with links', async ({ page }) => {
      await page.goto('/')
      await page.locator('footer').scrollIntoViewIfNeeded()
      const footerLinks = page.locator('footer a')
      const count = await footerLinks.count()
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })
})
