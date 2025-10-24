# Authentication Flow Testing Guide

## 🎯 Purpose
Test the complete authentication system to verify all flows work correctly before proceeding to Phase 2.

---

## 🌐 Access Your Application

**Development Server**: http://localhost:3000

The server is already running. Open this URL in your browser.

---

## ✅ TEST 1: Sign Up Flow

### Steps:
1. Navigate to: http://localhost:3000/signup
2. Fill in the form:
   - **Email**: Use your actual email (you'll need to verify)
   - **Password**: Create a strong password
   - **Name**: Your name
3. Click "Sign Up"

### Expected Behavior:
- ✅ Form validates input
- ✅ Password strength indicator shows
- ✅ On submit, redirects to verify-email page
- ✅ Message shows: "Check your email to verify your account"

### Verify in Supabase:
1. Go to: https://supabase.com/dashboard
2. Select your `my-erp-plan` project
3. Authentication → Users
4. You should see your new user (email_confirmed_at will be null)

---

## ✅ TEST 2: Email Verification

### Steps:
1. Check your email inbox
2. Look for email from Supabase
3. Click the verification link

### Expected Behavior:
- ✅ Email arrives within 1-2 minutes
- ✅ Link redirects to your app
- ✅ Shows "Email verified" message
- ✅ Redirects to login page

### Alternative (Manual Verification):
If email doesn't arrive:
1. Go to Supabase Dashboard
2. Authentication → Users → Click your user
3. Click "Send verification email" manually
4. Or set `email_confirmed_at` to NOW() manually for testing

---

## ✅ TEST 3: Login Flow

### Steps:
1. Navigate to: http://localhost:3000/login
2. Enter your credentials:
   - **Email**: The email you signed up with
   - **Password**: Your password
3. Click "Log In"

### Expected Behavior:
- ✅ Form validates input
- ✅ On submit, authenticates user
- ✅ Redirects to dashboard (or onboarding if first-time)
- ✅ User session is active

### Verify Success:
- Should see dashboard at: `/[orgId]/`
- Header shows your name and email
- Sidebar navigation visible
- No redirect back to login

---

## ✅ TEST 4: Protected Routes

### Steps:
1. While logged in, navigate to: http://localhost:3000/dashboard
2. Open a new incognito/private window
3. Try to access: http://localhost:3000/dashboard (without logging in)

### Expected Behavior:
**Logged In:**
- ✅ Dashboard loads successfully
- ✅ Can navigate between pages

**Logged Out:**
- ✅ Redirects to /login
- ✅ Cannot access dashboard
- ✅ Shows "Please log in" message

---

## ✅ TEST 5: Session Persistence

### Steps:
1. Log in successfully
2. Close the browser completely
3. Reopen browser
4. Navigate to: http://localhost:3000

### Expected Behavior:
- ✅ Still logged in (session persists)
- ✅ No need to log in again
- ✅ Dashboard accessible

---

## ✅ TEST 6: Sign Out Flow

### Steps:
1. While logged in, click your avatar/name in header
2. Click "Sign Out" from dropdown
3. Confirm sign out

### Expected Behavior:
- ✅ Session ends
- ✅ Redirects to landing page or login
- ✅ Cannot access protected routes
- ✅ Dashboard requires re-authentication

---

## ✅ TEST 7: Password Reset Flow

### Steps:
1. Go to: http://localhost:3000/login
2. Click "Forgot password?"
3. Enter your email
4. Submit form

### Expected Behavior:
- ✅ Shows "Check your email" message
- ✅ Email sent with reset link
- ✅ Link redirects to reset-password page
- ✅ Can set new password
- ✅ Can log in with new password

---

## 🐛 TROUBLESHOOTING

### Issue: Email Not Arriving

**Solution 1: Check Supabase Email Settings**
1. Supabase Dashboard → Authentication → Email Templates
2. Verify SMTP is configured (or using Supabase default)
3. Check spam folder

**Solution 2: Manual Verification (Development Only)**
1. Supabase Dashboard → Authentication → Users
2. Click your user
3. Manually confirm email or send verification

**Solution 3: Use Magic Link Instead**
```typescript
// In signup-form.tsx, add magic link option
const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`
  }
})
```

### Issue: Redirect Loop After Login

**Check:**
1. Middleware.ts is configured correctly
2. Callback route exists: `/api/auth/callback`
3. NEXT_PUBLIC_APP_URL in .env is correct

**Solution:**
```typescript
// Verify middleware.ts has:
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

### Issue: Session Not Persisting

**Check:**
1. Cookies enabled in browser
2. HTTPS in production (localhost is OK)
3. Supabase client configured correctly

**Solution:**
```typescript
// Verify lib/supabase/client.ts has:
export const supabase = createClientComponentClient()
```

### Issue: RLS Blocking Queries

**Check:**
1. User is authenticated: `const { data: { user } } = await supabase.auth.getUser()`
2. User is member of organization
3. RLS policies allow user's role

**Solution:**
```sql
-- In Supabase SQL Editor, verify user has org membership:
SELECT * FROM organization_members
WHERE user_id = '[your-user-id]';

-- If not, add manually:
INSERT INTO organization_members (org_id, user_id, role)
VALUES ('[org-id]', '[user-id]', 'admin');
```

---

## 📊 TEST RESULTS CHECKLIST

After completing all tests, mark each:

- [ ] Sign up form works
- [ ] Email verification sent
- [ ] Email verified successfully
- [ ] Login works with verified account
- [ ] Protected routes require authentication
- [ ] Session persists across browser restarts
- [ ] Sign out works correctly
- [ ] Password reset flow works
- [ ] No console errors during any flow
- [ ] Supabase shows user correctly

---

## ✅ SUCCESS CRITERIA

**Phase 1 Complete When:**
- ✅ All 7 tests pass
- ✅ No blocking errors
- ✅ User can sign up, verify, login, access dashboard, and sign out
- ✅ Sessions persist correctly
- ✅ Protected routes are secure

---

## 🚀 NEXT STEPS AFTER AUTH TESTING

**Once all tests pass:**
1. ✅ Mark authentication flow as complete
2. ✅ Document any issues found
3. ✅ Commit any fixes to Git
4. ✅ Create final Phase 1 summary
5. 🎯 Ready to start Phase 2 with Genesis Skills!

---

## 💡 QUICK ACCESS LINKS

- **App**: http://localhost:3000
- **Signup**: http://localhost:3000/signup
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Supabase**: https://supabase.com/dashboard

---

**Test these flows now and report back which ones work!**

If any test fails, I'll help you debug and fix it before we move to Phase 2.
