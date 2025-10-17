import React from "react";
import { Image } from "expo-image";

// Image caching configuration for better performance
export const imageCacheConfig = {
  // Cache policy for different types of images
  policies: {
    // Timeline images - cache aggressively since they don't change often
    timeline: {
      cachePolicy: "memory-disk" as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
    // Quote backgrounds - cache for a long time
    quoteBackground: {
      cachePolicy: "memory-disk" as const,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    // User avatars - cache moderately
    avatar: {
      cachePolicy: "memory-disk" as const,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
    // General images - default caching
    general: {
      cachePolicy: "memory-disk" as const,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  },

  // Placeholder images for different categories
  placeholders: {
    timeline:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    quoteBackground:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    avatar:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    general:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  },
};

// Optimized image component with caching
export const OptimizedImage = ({
  source,
  style,
  contentFit = "cover",
  category = "general",
  transition = 200,
  ...props
}: {
  source: { uri: string } | number;
  style?: any;
  contentFit?: "cover" | "contain" | "fill" | "scale-down" | "none";
  category?: keyof typeof imageCacheConfig.policies;
  transition?: number;
  [key: string]: any;
}) => {
  const config = imageCacheConfig.policies[category];
  const placeholder =
    imageCacheConfig.placeholders[category] ||
    imageCacheConfig.placeholders.general;

  return (
    <Image
      source={source}
      style={style}
      contentFit={contentFit}
      placeholder={placeholder}
      transition={transition}
      cachePolicy={config.cachePolicy}
      {...props}
    />
  );
};

// Preload critical images
export const preloadImages = async (imageUrls: string[]) => {
  try {
    await Image.prefetch(imageUrls);
    console.log(`Preloaded ${imageUrls.length} images`);
  } catch (error) {
    console.warn("Failed to preload images:", error);
  }
};

// Clear image cache
export const clearImageCache = async () => {
  try {
    await Image.clearMemoryCache();
    await Image.clearDiskCache();
    console.log("Image cache cleared");
  } catch (error) {
    console.warn("Failed to clear image cache:", error);
  }
};

// Get cache size (expo-image doesn't expose cache size APIs)
export const getCacheSize = async () => {
  try {
    // expo-image doesn't provide cache size APIs
    // This is a placeholder for future implementation
    return { memory: 0, disk: 0, total: 0 };
  } catch (error) {
    console.warn("Failed to get cache size:", error);
    return { memory: 0, disk: 0, total: 0 };
  }
};
