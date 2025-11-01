// WebView performance optimization utilities
import { Platform } from 'react-native';

export const getOptimizedWebViewProps = (options: {
    enableCache?: boolean;
    enableMedia?: boolean;
    mixedContentMode?: 'never' | 'always' | 'compatibility';
    allowFileAccess?: boolean;
} = {}) => {
    const {
        enableCache = true,
        enableMedia = false,
        mixedContentMode = 'never',
        allowFileAccess = false,
    } = options;

    return {
        // Performance optimizations
        cacheEnabled: enableCache,
        cacheMode: enableCache ? "LOAD_CACHE_ELSE_NETWORK" as const : undefined,
        allowsInlineMediaPlayback: enableMedia,
        mediaPlaybackRequiresUserAction: !enableMedia,
        mixedContentMode,

        // File access settings (needed for local image caching)
        ...(allowFileAccess && {
            allowFileAccess: true,
            allowFileAccessFromFileURLs: true,
            allowUniversalAccessFromFileURLs: true,
        }),

        // Additional performance settings
        javaScriptEnabled: true,
        domStorageEnabled: true,
        startInLoadingState: true,

        // Disable unnecessary features for better performance
        showsHorizontalScrollIndicator: false,
        showsVerticalScrollIndicator: false,
        bounces: false,
        automaticallyAdjustContentInsets: false,
    };
};

// Pre-configured WebView props for different use cases
export const webViewConfigs = {
    // For quote cards and static content
    static: getOptimizedWebViewProps({
        enableCache: true,
        enableMedia: false,
        mixedContentMode: 'never',
        allowFileAccess: false,
    }),

    // For theme selectors with images (with file access for cached images)
    themeSelector: getOptimizedWebViewProps({
        enableCache: true,
        enableMedia: true,
        mixedContentMode: 'compatibility',
        allowFileAccess: true,
    }),

    // For AI responses and dynamic content
    dynamic: getOptimizedWebViewProps({
        enableCache: true,
        enableMedia: false,
        mixedContentMode: 'never',
        allowFileAccess: false,
    }),

    // For rich text editors
    editor: getOptimizedWebViewProps({
        enableCache: true,
        enableMedia: false,
        mixedContentMode: 'never',
        allowFileAccess: false,
    }),

    // For content with cached images
    withCachedImages: getOptimizedWebViewProps({
        enableCache: true,
        enableMedia: true,
        mixedContentMode: 'compatibility',
        allowFileAccess: true,
    })
};

// Helper function to merge custom props with optimized defaults
export const createOptimizedWebViewProps = (
    customProps: any = {},
    configType: keyof typeof webViewConfigs = 'static'
) => {
    return {
        ...webViewConfigs[configType],
        ...customProps,
    };
};
