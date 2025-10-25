# 🧪 AUTHENTICATION TEST

## Test 1: Token yo'q
1. F12 → Console
2. `localStorage.clear()`
3. `/dashboard` ga boring
4. **Expected:** Login page'ga redirect
5. **Actual:** ?

## Test 2: Invalid token
1. F12 → Console
2. `localStorage.setItem('token', 'invalid-token-123')`
3. `localStorage.setItem('user', JSON.stringify({user: {id: '1', email: 'test@test.com', role: 'STUDENT'}, student: {id: '1', full_name: 'Test User'}}))`
4. `/dashboard` ga boring
5. **Expected:** Login page'ga redirect (backend 401)
6. **Actual:** ?

## Test 3: Direct URL access
1. Logout qiling
2. Browser address bar'ga `/dashboard` yozing
3. **Expected:** Login page'ga redirect
4. **Actual:** ?

---

## 🔒 BU TESTLARNI BAJARING VA SCREENSHOT YUBORING!
