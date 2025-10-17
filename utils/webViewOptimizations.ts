// WebView performance optimization utilities

export const getOptimizedWebViewProps = (options: {
    enableCache?: boolean;
    enableMedia?: boolean;
    mixedContentMode?: 'never' | 'always' | 'compatibility';
} = {}) => {
    const {
        enableCache = true,
        enableMedia = false,
        mixedContentMode = 'never'
    } = options;

    return {
        // Performance optimizations
        cacheEnabled: enableCache,
        cacheMode: enableCache ? "LOAD_CACHE_ELSE_NETWORK" as const : undefined,
        allowsInlineMediaPlayback: enableMedia,
        mediaPlaybackRequiresUserAction: !enableMedia,
        mixedContentMode,

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
        mixedContentMode: 'never'
    }),

    // For theme selectors with images
    themeSelector: getOptimizedWebViewProps({
        enableCache: true,
        enableMedia: true,
        mixedContentMode: 'compatibility'
    }),

    // For AI responses and dynamic content
    dynamic: getOptimizedWebViewProps({
        enableCache: true,
        enableMedia: false,
        mixedContentMode: 'never'
    }),

    // For rich text editors
    editor: getOptimizedWebViewProps({
        enableCache: true,
        enableMedia: false,
        mixedContentMode: 'never'
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
