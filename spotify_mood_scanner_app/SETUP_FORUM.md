# SERPApi Forum Search Setup Guide

## Overview
This guide will help you set up the SERPApi Google Forums integration for your Spotify Mood Scanner app. This feature allows users to click on songs to search for related forum discussions using SERPApi.

## Step 1: Get Your SERPApi API Key

1. Go to **https://serpapi.com**
2. Click **Sign Up** (or **Login** if you already have an account)
3. Create a new account or sign in with email/Google/GitHub
4. Go to your **Dashboard**
5. Look for the **API Key** section - copy your API key
6. You have **10,000 free credits** to use (approximately 5,000+ forum searches)

## Step 2: Add Your API Key to the App

### Method 1: Direct Configuration in app.js (Simplest)

1. Open `web/app.js`
2. Find line 333:
   ```javascript
   const SERPAPI_KEY = ''; // User must add their key from .env or hardcode here
   ```
3. Replace it with:
   ```javascript
   const SERPAPI_KEY = 'your_actual_api_key_here';
   ```
4. Replace `your_actual_api_key_here` with your actual SERPApi key from Step 1

### Method 2: Use .env File (For Development)

1. Open the `.env` file in your project root
2. Find or add this line:
   ```
   VITE_SERPAPI_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual SERPApi key
4. Update `web/app.js` line 333 to:
   ```javascript
   const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY || '';
   ```

**Note:** This requires a build tool. If your app doesn't use one, use Method 1 instead.

## Step 3: Test the Feature

1. Open your web app in a browser
2. Make sure mood detection is working (you should see mood colors changing)
3. Look at the songs on the right side
4. **Click on any song** → A modal should open
5. Wait 2-3 seconds → Forum results should appear
6. Click "View on Forum" to open the discussion in a new tab

## Step 4: Security Best Practices

### ⚠️ Important: API Keys Are Sensitive

**DO NOT:**
- Commit your API key to git/GitHub
- Share your API key publicly
- Leave it in the .env file if you push to a public repository

**DO:**
- Add `.env` to your `.gitignore` file
- Keep your API key private
- Regenerate your key if you accidentally expose it (in SERPApi dashboard)

### .gitignore Setup

If you haven't already, add this to your `.gitignore` file:
```
.env
.env.local
.env.*.local
node_modules/
```

## Understanding Your API Credits

- **Free Tier:** Starts with 100 searches/month
- **Your Credit:** 10,000 free credits
- **Per Search:** ~2 credits per forum search
- **Total:** Approximately 5,000+ forum searches before quota limit
- **Rate Limit:** Requests limited to prevent spam

The app includes automatic debouncing (500ms) to prevent accidental rapid clicks from wasting credits.

## Troubleshooting

### "API Key Not Configured" Error
- Check that you've added your API key correctly to line 333 in `web/app.js`
- Make sure there are no extra spaces or quotes
- Verify your key is correct in the SERPApi dashboard

### "API quota exceeded" Error
- You've used up your 10,000 free credits
- Either wait for the monthly reset or upgrade your SERPApi plan
- Visit https://serpapi.com/dashboard to check your usage

### No Results Found
- This is normal - not all songs have forum discussions
- Try searching for more popular songs
- Results vary based on what's available on Google Forums

### Network Error
- Check your internet connection
- Verify SERPApi servers are online (https://status.serpapi.com)
- Try again in a few seconds

### "Invalid API Key" Error
- Your API key format is incorrect
- Go to SERPApi dashboard and copy your key again
- Make sure there are no accidental spaces at the beginning or end

## API Response Format

When a search succeeds, SERPApi returns data like this:
```javascript
{
  forums: [
    {
      title: "Why is this song so good?",
      snippet: "This song is amazing because...",
      link: "https://forum-site.com/discussion/123",
      source: "Music Forum"
    },
    // ... more results
  ]
}
```

The app displays up to 5 results per search to preserve API credits.

## Features Included

- ✅ Click any song to search forums
- ✅ Loading spinner while searching
- ✅ Forum title, preview snippet, and link
- ✅ Open links in new tab
- ✅ Error handling and user feedback
- ✅ Request debouncing (prevents accidental spam)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Keyboard support (Escape to close modal)
- ✅ Professional modal with smooth animations

## Sample Search Queries

The app searches using this format:
- Song: "Blinding Lights"
- Artist: "The Weeknd"
- Query: **"Blinding Lights by The Weeknd"**

This format provides accurate results from forums discussing that specific song.

## SERPApi Documentation

For more information about SERPApi and Google Forums API:
- **Main Docs:** https://serpapi.com/docs
- **Google Forums API:** https://serpapi.com/docs/search-api/google/google_forums
- **Dashboard:** https://serpapi.com/dashboard
- **Status Page:** https://status.serpapi.com

## Common Questions

**Q: Can I use this without paying?**
A: Yes! You have 10,000 free credits, which allows ~5,000 forum searches. That's plenty for testing and moderate usage.

**Q: Will my API key be exposed?**
A: If you commit the .env file to GitHub with your key visible, yes. Always add .env to .gitignore first.

**Q: Can I limit API usage?**
A: The app includes automatic debouncing (500ms between requests) and limits results to 5 per search to preserve credits.

**Q: What if I run out of credits?**
A: You can upgrade your SERPApi plan, or wait for your monthly quota reset if you're on a free tier.

## Next Steps

1. Add your API key using Method 1 or Method 2 above
2. Test by clicking on a song
3. Verify forum results appear
4. Check the browser console for any errors (press F12)
5. Enjoy discovering forum discussions about your favorite songs!

---

For any issues or questions, check the browser console (`F12` → Console tab) for detailed error messages and debug information.
