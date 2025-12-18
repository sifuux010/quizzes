# JWT Token Expiry Solution

## 🔍 Problem

After staying in the admin panel for a long time (more than 1 hour), the backend stops sending data and returns **401 Unauthorized** errors.

### Root Cause
- JWT tokens expire after **1 hour** (3600 seconds)
- When the token expires, all API requests fail with 401 errors
- The frontend was not checking token expiry or handling expired sessions

---

## ✅ Solution Implemented

### 1. **Created Authentication Utilities** (`src/utils/auth.ts`)

New helper functions for JWT management:

```typescript
// Check if token is expired
isTokenExpired(): boolean

// Get remaining time in seconds
getTokenRemainingTime(): number

// Check if user is authenticated
isAuthenticated(): boolean

// Logout and clear all auth data
logout(): void

// Get authorization headers
getAuthHeaders(): object
```

### 2. **Updated AdminLayout** (`src/pages/admin/AdminLayout.tsx`)

Added automatic token expiry checking:

- ✅ **Checks token on mount** - Redirects to login if expired
- ✅ **Periodic checks** - Every 30 seconds
- ✅ **Auto-logout** - Automatically logs out when token expires
- ✅ **Visual timer** - Shows remaining session time in header
- ✅ **Color-coded warning**:
  - 🟢 Green: More than 15 minutes remaining
  - 🟡 Yellow: 5-15 minutes remaining
  - 🔴 Red: Less than 5 minutes remaining

---

## 🎯 How It Works Now

### **Session Flow:**

```
1. Admin logs in
   ↓
2. JWT token stored (valid for 1 hour)
   ↓
3. Timer starts counting down
   ↓
4. Every 30 seconds: Check if token expired
   ↓
5. If expired:
   - Show "Session expired" message
   - Clear all auth data
   - Redirect to login page
```

### **Visual Indicators:**

**Header Timer Display:**
```
🟢 55:30  (55 minutes 30 seconds remaining)
🟡 12:45  (12 minutes 45 seconds remaining)
🔴 03:20  (3 minutes 20 seconds remaining - WARNING!)
```

---

## 📊 Token Expiry Settings

Current configuration in `backend/.env`:
```env
JWT_EXPIRY=3600  # 1 hour in seconds
```

**To change token duration:**
1. Edit `backend/.env`
2. Update `JWT_EXPIRY` value (in seconds)
3. Examples:
   - 30 minutes: `JWT_EXPIRY=1800`
   - 2 hours: `JWT_EXPIRY=7200`
   - 4 hours: `JWT_EXPIRY=14400`

---

## 🔒 Security Benefits

### **Before:**
- ❌ Token could expire silently
- ❌ User sees confusing errors
- ❌ No warning before expiry
- ❌ Manual logout required

### **After:**
- ✅ Automatic expiry detection
- ✅ Clear "Session expired" message
- ✅ Visual countdown timer
- ✅ Automatic logout on expiry
- ✅ 5-minute warning buffer

---

## 🧪 Testing

### **Test Token Expiry:**

1. **Quick Test (Development):**
   - Temporarily set `JWT_EXPIRY=60` (1 minute)
   - Login to admin panel
   - Wait 1 minute
   - Should auto-logout with message

2. **Timer Display Test:**
   - Login to admin panel
   - Check header for countdown timer
   - Timer should update every second
   - Colors should change based on time remaining

3. **Auto-Logout Test:**
   - Login and wait for token to expire
   - Should see toast: "Session expired. Please login again."
   - Should redirect to login page
   - All auth data should be cleared

---

## 💡 User Experience

### **What Users See:**

**Normal Session:**
```
Header: [Dashboard] [🟢 45:30] [Language]
```

**Warning (< 15 minutes):**
```
Header: [Dashboard] [🟡 12:15] [Language]
```

**Critical (< 5 minutes):**
```
Header: [Dashboard] [🔴 03:45] [Language]
```

**On Expiry:**
```
Toast: "Session expired. Please login again."
→ Redirected to login page
```

---

## 📝 Implementation Details

### **Files Modified:**

1. **`src/utils/auth.ts`** (NEW)
   - Authentication utility functions
   - Token expiry checking
   - Logout functionality

2. **`src/pages/admin/AdminLayout.tsx`** (UPDATED)
   - Added token expiry checking
   - Added session timer display
   - Auto-logout on expiry
   - Visual countdown in header

### **Key Features:**

- **Proactive Checking**: Checks every 30 seconds
- **Visual Feedback**: Color-coded timer in header
- **Buffer Time**: 5-minute warning before expiry
- **Automatic Cleanup**: Clears all auth data on logout
- **User-Friendly**: Clear messages and smooth redirects

---

## 🚀 Benefits

1. **No More Silent Failures**
   - Users know exactly when session will expire
   - Clear error messages

2. **Better Security**
   - Automatic logout on expiry
   - No stale sessions

3. **Improved UX**
   - Visual countdown timer
   - Color-coded warnings
   - Smooth transitions

4. **Easier Debugging**
   - Clear auth state management
   - Centralized auth utilities

---

## ⚙️ Configuration Options

### **Adjust Token Duration:**
Edit `backend/.env`:
```env
# Short sessions (30 minutes)
JWT_EXPIRY=1800

# Standard (1 hour) - Current
JWT_EXPIRY=3600

# Long sessions (4 hours)
JWT_EXPIRY=14400

# Very long (8 hours)
JWT_EXPIRY=28800
```

### **Adjust Warning Times:**
Edit `src/pages/admin/AdminLayout.tsx`:
```typescript
// Change color thresholds
remainingTime < 300   // Red: < 5 minutes
remainingTime < 900   // Yellow: < 15 minutes
// Green: > 15 minutes
```

---

## 🎯 Recommendations

### **For Production:**

1. **Token Duration:**
   - Use 1-2 hours for admin sessions
   - Longer sessions = more security risk
   - Shorter sessions = better security, more logins

2. **Warning Buffer:**
   - Keep 5-minute buffer before expiry
   - Gives users time to save work

3. **User Training:**
   - Inform admins about session timeouts
   - Encourage regular saves
   - Explain timer colors

---

## 🔧 Troubleshooting

### **Timer Not Showing:**
- Check if token is stored: `localStorage.getItem('adminToken')`
- Check if expiry is set: `localStorage.getItem('tokenExpiry')`
- Verify login response includes `expiresIn`

### **Auto-Logout Too Early:**
- Check system clock is correct
- Verify `JWT_EXPIRY` in `.env`
- Check for 5-minute buffer in code

### **Session Not Expiring:**
- Verify token expiry checking is running
- Check browser console for errors
- Ensure `useEffect` is executing

---

## 📚 Related Files

- `backend/.env` - JWT expiry configuration
- `backend/utils/jwt.php` - JWT generation
- `backend/middleware/auth_admin.php` - JWT validation
- `src/utils/auth.ts` - Frontend auth utilities
- `src/pages/admin/AdminLayout.tsx` - Session management

---

**Last Updated:** 2025-12-18  
**Version:** 2.0  
**Status:** ✅ Implemented & Tested
