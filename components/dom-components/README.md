# Theme Integration for DOM Components

This guide explains how to integrate your React Native theme context with Tailwind CSS for DOM components.

## Overview

The theme integration system uses CSS custom properties (CSS variables) to make your theme colors available to Tailwind CSS classes. This allows your DOM components to automatically adapt to theme changes.

## Components and Hooks

### 1. `useThemeVariables()` Hook

Located in `hooks/useThemeVariables.ts`, this hook:

- Applies current theme colors as CSS custom properties to the document root
- Sets a `data-theme` attribute for additional styling options
- Returns the current theme and schema

### 2. `useThemeColors()` Hook

Also in `hooks/useThemeVariables.ts`, this hook returns theme colors as JavaScript objects for inline styles.

### 3. `ThemeProvider` Component

Located in `components/ThemeProvider.tsx`, this component applies theme variables and should wrap your DOM components.

## Usage

### Method 1: Using Tailwind Classes (Recommended)

```tsx
import React from "react";
import { useThemeVariables } from "@/hooks/useThemeVariables";
import { ThemeProvider } from "../ThemeProvider";

const MyDomComponent: React.FC = () => {
  // Ensure theme variables are applied
  const { schema } = useThemeVariables();

  return (
    <div className="bg-theme text-theme p-4">
      <div className="bg-theme-card border border-theme rounded-lg p-6">
        <h1 className="text-theme-primary text-2xl font-bold">Hello Theme!</h1>
        <p className="text-theme mt-2">Current theme: {schema}</p>
      </div>
    </div>
  );
};

// Wrap with ThemeProvider
export default () => (
  <ThemeProvider>
    <MyDomComponent />
  </ThemeProvider>
);
```

### Method 2: Using Inline Styles

```tsx
import React from "react";
import { useThemeColors } from "@/hooks/useThemeVariables";

const MyInlineStyledComponent: React.FC = () => {
  const colors = useThemeColors();

  return (
    <div
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        padding: "16px",
      }}
    >
      <h1 style={{ color: colors.primary }}>Styled with theme colors!</h1>
    </div>
  );
};
```

## Available Tailwind Classes

After integration, you can use these Tailwind classes:

### Colors

- `text-theme` - Primary text color
- `text-theme-primary` - Primary color as text
- `bg-theme` - Background color
- `bg-theme-card` - Card/surface color
- `bg-theme-contrast` - Background contrast color
- `border-theme` - Border color
- `border-theme-primary` - Primary color as border

### Specific Color Access

- `text-theme-primary` - Theme primary color
- `text-theme-background` - Theme background color
- `text-theme-notification` - Theme notification/accent color

## Theme Schema Detection

You can also style based on the current theme schema:

```tsx
const { schema } = useThemeVariables();

return (
  <div
    className={`p-4 ${
      schema === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
    }`}
  >
    Content that adapts to light/dark mode
  </div>
);
```

Or use CSS with the `data-theme` attribute:

```css
/* In your CSS file */
[data-theme="dark"] .my-element {
  background-color: #333;
}

[data-theme="light"] .my-element {
  background-color: #fff;
}
```

## Integration with Existing Components

For existing DOM components that already receive a `theme` prop:

```tsx
// Before
interface MyComponentProps {
  theme: TTheme;
  // other props...
}

// After - you can still use the theme prop OR use the hooks
const MyComponent: React.FC<MyComponentProps> = ({ theme: propTheme }) => {
  // Option 1: Use the context theme (automatically updates)
  const { theme: contextTheme } = useThemeVariables();

  // Option 2: Use the prop theme (manual updates)
  // const theme = propTheme;

  return (
    <div className="bg-theme text-theme">{/* Your component content */}</div>
  );
};
```

## Best Practices

1. **Wrap root DOM components with ThemeProvider**: Ensures theme variables are available throughout the component tree.

2. **Use Tailwind classes over inline styles**: More maintainable and consistent.

3. **Combine with existing theme props**: You can gradually migrate existing components.

4. **Test theme switching**: Ensure your components update correctly when themes change.

## Example: Updating DomNoteEditor

Here's how you might update an existing component like DomNoteEditor:

```tsx
// Add to the top of your component
import { ThemeProvider } from "../ThemeProvider";
import { useThemeVariables } from "@/hooks/useThemeVariables";

const DomNoteEditor: React.FC<DomNoteEditorProps> = (props) => {
  const { schema } = useThemeVariables();

  return (
    <ThemeProvider>
      <div className="bg-theme text-theme min-h-full">
        {/* Your existing editor content with theme-aware classes */}
        <div className="bg-theme-card border border-theme">
          {/* Editor content */}
        </div>
      </div>
    </ThemeProvider>
  );
};
```

This system provides seamless integration between your React Native theme context and Tailwind CSS for DOM components.
