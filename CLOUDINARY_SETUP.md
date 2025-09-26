# Cloudinary Setup Guide

## Current Error

```
Cloudinary error: {"error":{"message":"Upload preset not found"}}
```

## Solution

### Option 1: Create Upload Preset in Cloudinary Dashboard

1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Navigate to **Settings** → **Upload**
3. Scroll down to **Upload presets**
4. Click **Add upload preset**
5. Set the following:
    - **Preset name**: `ml_default`
    - **Signing Mode**: `Unsigned`
    - **Folder**: `re-soldium`
6. Click **Save**

### Option 2: Use Base64 Fallback (Current)

The app is already configured to fall back to base64 encoding if Cloudinary isn't properly configured. You'll see this message:

```
"Cloudinary not configured, using base64 fallback"
```

### Option 3: Disable Cloudinary Completely

If you don't want to use Cloudinary, the app will automatically use base64 encoding for images.

## Environment Variables

Add these to your `.env.local`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=ml_default
```

## Test Upload

1. Go to `/test` page
2. Click "Test Image Upload"
3. Check the results

## Current Status

-   ✅ **Base64 fallback**: Working
-   ❌ **Cloudinary upload**: Needs upload preset
-   ✅ **All other APIs**: Working correctly
