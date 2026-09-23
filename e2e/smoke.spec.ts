import { test, expect, type Page } from '@playwright/test';

// 페이지가 렌더되는 동안 콘솔에 찍힌 에러를 모은다.
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

test.describe('인증이 필요 없는 화면', () => {
  test('/resume 가 이력서 내용을 렌더한다', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/resume');

    await expect(page.getByRole('heading', { name: '곽경록' })).toBeVisible();
    await expect(page.getByRole('link', { name: '경력기술서' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('상단 탭으로 경력기술서·포트폴리오로 이동한다', async ({ page }) => {
    await page.goto('/resume');

    await page.getByRole('link', { name: '경력기술서' }).click();
    await expect(page).toHaveURL(/\/resume\/career$/);

    // 라벨은 "사이드 프로젝트", 경로는 /resume/portfolio 로 서로 다르다.
    await page.getByRole('link', { name: '사이드 프로젝트' }).click();
    await expect(page).toHaveURL(/\/resume\/portfolio$/);
    await expect(page.getByText('화면 구성')).toBeVisible();
  });

  test('/login 이 렌더된다', async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto('/login');

    await expect(page.getByText('주식 나침반').first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe('인증·에러 처리', () => {
  test('로그인 쿠키가 없으면 / 는 /login 으로 보낸다', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('없는 경로는 에러 페이지를 보여준다', async ({ page }) => {
    await page.goto('/이런경로는없다');
    await expect(page.getByText(/페이지를 찾을 수 없습니다|문제가 발생했습니다/)).toBeVisible();
  });
});
