# Quick Actions & App Icon Implementation

This document describes the implementation of quick actions and app icon switching in the Bible app.

## Features Implemented

### 1. Quick Actions

- **4 Quick Actions** configured for the Bible app:
  - **Search Bible** - Navigate to search functionality
  - **Favorites** - View saved verses
  - **Notes** - Read user notes
  - **Memorization** - Practice verses

### 2. App Icon Switching

- Support for multiple app icons (default, dark, light themes)
- Dynamic icon switching functionality
- Integration with settings screen

## Files Added/Modified

### New Files Created:

- `hooks/useQuickActions.ts` - Hook for managing quick actions
- `hooks/useAppIcon.ts` - Hook for app icon switching
- `components/AppIconSelector.tsx` - UI component for icon selection
- `components/QuickActionsDemo.tsx` - Demo component for testing

### Modified Files:

- `app.config.ts` - Added expo-quick-actions plugin configuration
- `app/_layout.tsx` - Integrated quick actions initialization
- `app/settings.tsx` - Added demo and icon selector components

## Configuration

### App Config (app.config.ts)

```typescript
[
  "expo-quick-actions",
  {
    androidIcons: {
      search: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#0c3e3d",
      },
      // ... other icons
    },
    iosIcons: {
      search: "./assets/images/icon.png",
      // ... other icons
    },
    iosActions: [
      {
        id: "search",
        title: "Search Bible",
        subtitle: "Find verses and passages",
        icon: "search",
        params: { href: "/search" },
      },
      // ... other actions
    ],
  },
],
  [
    "expo-quick-actions/icon/plugin",
    {
      dark: "./assets/images/icon.png",
      light: "./assets/images/icon.png",
    },
  ];
```

## Usage

### Quick Actions

Quick actions are automatically set up when the app starts. Users can:

1. Long press the app icon on their home screen
2. Select from the 4 available quick actions
3. Be taken directly to the relevant screen

### App Icon Switching

Users can change the app icon through:

1. Go to Settings screen
2. Scroll to the "App Icon" section
3. Select from available icons
4. The app will restart to apply the new icon

## Testing

### Quick Actions Demo

The settings screen includes a "Quick Actions Demo" section that allows users to:

- Check if quick actions are supported on their device
- Manually set up quick actions
- View quick actions status information

### App Icon Selector

The settings screen includes an "App Icon" section that allows users to:

- View current app icon
- Switch between available icons
- See which icons are supported

## Platform Support

### iOS

- Full support for quick actions and app icon switching
- Uses SF Symbols for built-in icons
- Supports custom icons through asset catalog

### Android

- Full support for quick actions and app icon switching
- Uses adaptive icons for better integration
- Supports custom icons with background colors

### Expo Go

- Limited support (features may not work in development)
- Best tested on physical devices with development builds

## Best Practices

### Quick Actions

- Limited to 4 actions (Apple recommendation)
- Use descriptive titles and subtitles
- Include relevant icons
- Deep link to specific screens

### App Icons

- Provide multiple theme options
- Use consistent design language
- Test on both light and dark themes
- Ensure icons are recognizable at small sizes

## Troubleshooting

### Quick Actions Not Working

1. Ensure device supports quick actions
2. Check if running in Expo Go (limited support)
3. Verify app.config.ts configuration
4. Test on physical device

### App Icon Not Changing

1. Check device support for icon switching
2. Verify icon files exist in assets
3. Ensure proper configuration in app.config.ts
4. Test on physical device

## Future Enhancements

1. **More Quick Actions**: Add additional actions based on user feedback
2. **Custom Icons**: Allow users to upload custom app icons
3. **Dynamic Actions**: Create context-aware quick actions
4. **Analytics**: Track quick action usage
5. **Themes**: Add more app icon themes

## Dependencies

- `expo-quick-actions`: ^6.0.0 (already installed)
- React Native: 0.79.5
- Expo SDK: 53.0.20

## Notes

- Quick actions work best on physical devices
- App icon switching requires app restart on Android
- Some features may not work in Expo Go development environment
- Configuration changes require app rebuild
