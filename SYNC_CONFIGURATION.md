# Bookmark Sync Configuration Guide

## Overview

This guide explains the configurable parameters for bookmark syncing and the jump to bottom feature in the Twitter Bookmark Organizer extension.

## Bookmark Sync Parameters

### Location
These parameters are defined in `content.js` in the `scrollToLoadAll()` function (around line 437):

```javascript
// SYNC PARAMETERS - Adjust these to control sync behavior:
const maxScrolls = 20;        // Max scroll iterations
const scrollInterval = 1000;  // Time between scrolls in ms
const waitForContent = 500;   // Wait time for content to load after each scroll in ms
```

### Parameter Details

#### `maxScrolls`
- **Type**: Number
- **Default**: 20
- **Description**: Maximum number of scroll iterations before stopping
- **Effect on bookmarks**:
  - `10` = ~200-300 bookmarks
  - `20` = ~400-600 bookmarks (default)
  - `50` = ~1500-1800 bookmarks
  - `100` = ~3000+ bookmarks
- **Recommended**: Start with 20 and increase if you have many bookmarks

#### `scrollInterval`
- **Type**: Number (milliseconds)
- **Default**: 1000 (1 second)
- **Description**: Time to wait between each scroll action
- **Recommendations**:
  - `500ms` = Faster sync, may miss some bookmarks on slow connections
  - `1000ms` = Balanced (default)
  - `1500ms` = Slower but more reliable on slow connections
- **Warning**: Too fast may cause Twitter to not load content in time

#### `waitForContent`
- **Type**: Number (milliseconds)
- **Default**: 500 (0.5 seconds)
- **Description**: Time to wait after each scroll for content to load before checking if at bottom
- **Recommendations**:
  - `300ms` = Faster, for good connections
  - `500ms` = Balanced (default)
  - `800ms` = Slower connections or many media-heavy bookmarks

### Example Configurations

#### Fast Sync (for smaller libraries)
```javascript
const maxScrolls = 15;
const scrollInterval = 800;
const waitForContent = 400;
```
- Syncs ~300-450 bookmarks
- Total time: ~12-18 seconds
- Best for: Quick syncs, good internet connection

#### Balanced (default)
```javascript
const maxScrolls = 20;
const scrollInterval = 1000;
const waitForContent = 500;
```
- Syncs ~400-600 bookmarks
- Total time: ~20-30 seconds
- Best for: Most users

#### Maximum Sync (for large libraries)
```javascript
const maxScrolls = 50;
const scrollInterval = 1200;
const waitForContent = 600;
```
- Syncs ~1500-2000 bookmarks
- Total time: ~60-90 seconds
- Best for: Users with many bookmarks, slower connections

#### Extreme (for very large libraries)
```javascript
const maxScrolls = 100;
const scrollInterval = 1500;
const waitForContent = 800;
```
- Syncs ~3000+ bookmarks
- Total time: ~2.5-3 minutes
- Best for: Power users with massive bookmark collections

## Jump to Bottom Feature

### How It Works

The "Jump to Bottom" button continuously scrolls the page until it reaches the bottom, loading all bookmarks in the process.

### Configuration

Located in `content.js` in the `addJumpToBottomButton()` function (around line 152):

```javascript
scrollInterval = setInterval(() => {
    // Scroll logic
}, 150); // Scroll every 150ms
```

### Parameters

#### Scroll Frequency
- **Default**: 150ms (scrolls ~6.7 times per second)
- **Options**:
  - `100ms` = Very fast, aggressive scrolling
  - `150ms` = Fast continuous scrolling (default)
  - `200ms` = Moderate speed
  - `300ms` = Slower, gentler scrolling

### Behavior

1. Click the "Jump to Bottom" button
2. Extension continuously scrolls down every 150ms
3. Checks every 100ms if bottom is reached or scroll has stopped
4. Automatically stops when:
   - Bottom of page is reached
   - Scroll position hasn't changed (no more content)
5. Shows "Reached bottom!" notification when complete

## Sync Process Flow

```
User clicks "Sync to Organizer"
    ↓
Check if on bookmarks page
    ↓
Start scrollToLoadAll()
    ↓
Scroll down (every scrollInterval ms)
    ↓
Wait for content (waitForContent ms)
    ↓
Check if at bottom or hit maxScrolls
    ↓
Extract all visible tweets from page
    ↓
Save each bookmark to IndexedDB
    ↓
Complete! Show success notification
```

## Tips

1. **First Sync**: Use higher `maxScrolls` (50-100) to get all your bookmarks
2. **Regular Syncs**: Use lower `maxScrolls` (10-20) to just get new bookmarks
3. **Slow Internet**: Increase `scrollInterval` and `waitForContent`
4. **Fast Internet**: Can decrease both for quicker syncs
5. **Many Media Bookmarks**: Increase `waitForContent` to ensure images/videos load

## Troubleshooting

### Missing Bookmarks
- Increase `maxScrolls`
- Increase `scrollInterval` (give more time between scrolls)
- Increase `waitForContent` (wait longer for content to load)

### Sync Takes Too Long
- Decrease `maxScrolls`
- Decrease `scrollInterval` (scroll faster)
- Decrease `waitForContent` (don't wait as long)

### Jump to Bottom Not Working
- Check if content is still loading (Twitter's infinite scroll may be slow)
- Try clicking again after the first attempt completes
- Manually scroll a bit first to trigger Twitter's scroll handler

## Advanced: Auto-Sync on Schedule

For future implementation, consider adding:
- Background sync timer
- Sync only new bookmarks since last sync
- Smart sync that detects when you've added new bookmarks
