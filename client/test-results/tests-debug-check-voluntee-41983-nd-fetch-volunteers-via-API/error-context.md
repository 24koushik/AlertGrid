# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\debug-check-volunteers.test.js >> Check Volunteers Data >> log in and fetch volunteers via API
- Location: tests\debug-check-volunteers.test.js:4:3

# Error details

```
SyntaxError: Unexpected end of JSON input
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test.describe('Check Volunteers Data', () => {
  4  |   test('log in and fetch volunteers via API', async ({ request }) => {
  5  |     // Login as admin
  6  |     const loginResponse = await request.post('http://localhost:5173/api/auth/login', {
  7  |       data: {
  8  |         email: 'admin@resqnet.demo',
  9  |         password: 'demo123'
  10 |       }
  11 |     });
  12 |
  13 |     console.log('Login status:', loginResponse.status());
  14 |     if (!loginResponse.ok) {
  15 |       console.log('Login failed');
  16 |       return;
  17 |     }
  18 |
> 19 |     const loginData = await loginResponse.json();
     |                       ^ SyntaxError: Unexpected end of JSON input
  20 |     console.log('Login data:', loginData);
  21 |
  22 |     const token = loginData.token || loginData.accessToken;
  23 |     if (!token) {
  24 |       console.log('No token in login response');
  25 |       return;
  26 |     }
  27 |
  28 |     // Fetch volunteers
  29 |     const volunteersResponse = await request.get('http://localhost:5173/api/volunteers', {
  30 |       headers: {
  31 |         Authorization: `Bearer ${token}`
  32 |       }
  33 |     });
  34 |
  35 |     console.log('Volunteers status:', volunteersResponse.status());
  36 |     if (!volunteersResponse.ok) {
  37 |       const errorText = await volunteersResponse.text();
  38 |       console.log('Volunteers error:', errorText);
  39 |       return;
  40 |     }
  41 |
  42 |     const volunteersData = await volunteersResponse.json();
  43 |     console.log('Volunteers data:', volunteersData);
  44 |     console.log('Type:', typeof volunteersData);
  45 |     if (Array.isArray(volunteersData)) {
  46 |       console.log('Length:', volunteersData.length);
  47 |       volunteersData.forEach((v, i) => {
  48 |         console.log(`  ${i}:`, v);
  49 |       });
  50 |     } else if (volunteersData && typeof volunteersData === 'object') {
  51 |       console.log('Keys:', Object.keys(volunteersData));
  52 |       if (volunteersData.volunteers) {
  53 |         console.log('Volunteers array:', volunteersData.volunteers);
  54 |         console.log('Length:', volunteersData.volunteers.length);
  55 |         volunteersData.volunteers.forEach((v, i) => {
  56 |           console.log(`  ${i}:`, v);
  57 |         });
  58 |       }
  59 |     }
  60 |   });
  61 | });
```
