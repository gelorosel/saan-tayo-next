# Rate Limiting Implementation Guide

## Overview

Rate limiting has been implemented to prevent excessive API usage for destination descriptions. Users can fetch up to 50 descriptions per session before hitting a 24-hour timeout.

## Key Features

✅ **Client-side rate limiting** - No server changes needed  
✅ **Elegant modal notification** - Beautiful UI when limit is reached  
✅ **Live counter** - Shows remaining requests  
✅ **Persistent across sessions** - Uses localStorage  
✅ **Automatic reset** - Resets after timeout period  
✅ **Cached requests don't count** - Only new API calls are counted  
✅ **Fast mode bypass** - Users can enable fast mode to skip descriptions entirely  

## Configuration

### Changing the Timeout Duration

**Location:** `lib/rateLimit.ts` (Line 5)

```typescript
// Change this value to adjust the timeout duration
export const RATE_LIMIT_TIMEOUT_HOURS = 24; // Hours until rate limit resets
```

Simply change this number to adjust the timeout. Examples:
- `12` = 12 hours
- `48` = 2 days
- `1` = 1 hour
- `168` = 1 week

### Changing the Request Limit

**Location:** `lib/rateLimit.ts` (Line 10)

```typescript
export const MAX_DESCRIPTION_REQUESTS = 50;
```

Change this number to adjust how many requests users can make before hitting the limit.

## Files Modified

### New Files Created

1. **`lib/rateLimit.ts`** - Core rate limiting logic
   - Rate limit tracking
   - LocalStorage management
   - Time formatting utilities

2. **`components/RateLimitModal.tsx`** - Elegant timeout modal
   - Shows time remaining
   - Lists alternative actions users can take
   - Auto-updates countdown

### Modified Files

1. **`lib/description.ts`**
   - Added rate limit check before fetching
   - Increments counter on successful fetch
   - Respects fast mode

2. **`components/PersonalityResultCard.tsx`**
   - Shows rate limit modal when limit is reached
   - Checks rate limit before loading descriptions

3. **`app/page.tsx`**
   - Shows remaining requests counter
   - Updates counter periodically

4. **`README.md`**
   - Added documentation for rate limiting feature

## How It Works

### Flow Diagram

```
User views destination
    ↓
Check if rate limited? ──Yes──→ Show modal, skip description
    ↓ No
Check fast mode? ──Yes──→ Skip description
    ↓ No
Fetch description (Wiki/Gemini)
    ↓
Success? ──Yes──→ Increment counter
    ↓ No
Return null
```

### LocalStorage Structure

```json
{
  "description-rate-limit": {
    "count": 15,
    "resetTime": 1738368000000
  }
}
```

- `count`: Number of descriptions fetched
- `resetTime`: Unix timestamp when the limit resets

### Automatic Reset

The rate limit automatically resets when:
- The `resetTime` has passed
- User clears browser data (localStorage)

## User Experience

### Normal Usage (Under Limit)

1. User browses destinations
2. Descriptions load normally

### When Limit is Reached

1. User tries to load a new destination
2. Beautiful modal appears with:
   - Clock icon and "Rate Limit Reached" title
   - Clear explanation of the limit
   - Time remaining until reset (e.g., "23 hours and 45 minutes")
   - List of things they can still do:
     - Browse without descriptions
     - Use "I've been here" button
     - Enable fast mode
     - Share current results

### Alternative Actions

Users can bypass the limit by:
- Enabling **Fast Mode** (checkbox below results)
- Browsing destinations without descriptions
- Waiting for the timeout to reset

## Testing

### Manual Testing

1. **Test rate limit countdown:**
   ```typescript
   // In browser console
   import { getRemainingRequests } from '@/lib/rateLimit';
   console.log(getRemainingRequests());
   ```

2. **Test modal appearance:**
   - Browse 50 different destinations
   - On the 51st, the modal should appear

3. **Test reset:**
   ```typescript
   // In browser console  
   import { resetRateLimit } from '@/lib/rateLimit';
   resetRateLimit();
   ```

### Quick Testing (Developer Mode)

To test quickly, temporarily change the limit:

```typescript
// lib/rateLimit.ts
export const MAX_DESCRIPTION_REQUESTS = 3; // Test with 3 requests
export const RATE_LIMIT_TIMEOUT_HOURS = 0.1; // 6 minutes
```

## Analytics Integration (Future)

To track rate limit hits, add analytics events:

```typescript
// In PersonalityResultCard.tsx
if (isRateLimited()) {
  // Add your analytics event here
  analytics.track('rate_limit_reached', {
    count: getRateLimitData().count,
    timeUntilReset: getTimeUntilReset()
  });
  setIsRateLimitModalOpen(true);
}
```

## Troubleshooting

### Issue: Counter not updating

**Solution:** The counter updates every 30 seconds. Manually trigger update by navigating to a new destination.

### Issue: Limit resets too quickly

**Check:** Verify `RATE_LIMIT_TIMEOUT_HOURS` is set correctly in `lib/rateLimit.ts`

### Issue: Modal appears even when under limit

**Debug:** Check browser console for localStorage data:
```javascript
console.log(localStorage.getItem('description-rate-limit'));
```

## Security Notes

- Rate limiting is **client-side only**
- Can be bypassed by clearing localStorage
- For production, consider adding **server-side rate limiting** as well
- This implementation is primarily for cost control, not security

## Future Enhancements

Potential improvements:
- Server-side validation
- Per-IP rate limiting
- Premium tier with higher limits
- Progressive rate limiting (slower after threshold)
- Rate limit status in header/footer
