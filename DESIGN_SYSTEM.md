# UI Design System - Tenki Clone

## Overview
This document outlines the comprehensive design system implemented for Tenki Clone's dashboard interface.

## Color Palette

### Primary Colors
- **Blue Gradient**: `from-blue-500 to-blue-600` (Primary actions, links)
- **Blue Hover**: `from-blue-700 to-blue-800` (Hover states)

### Status Colors
- **Success (Green)**: `from-green-400 to-green-500` (IDLE status, success badges)
- **Warning (Yellow)**: `from-yellow-400 to-yellow-500` (BUSY status, warnings)
- **Error (Red)**: `from-red-400 to-red-500` (ERROR status, failures)
- **Running (Blue)**: `from-blue-400 to-blue-500` (RUNNING status)

### Secondary Colors
- **Purple**: `from-purple-500 to-purple-600` (Workflows, members)
- **Pink**: `from-pink-400 to-pink-500` (Workflow accents)
- **Teal**: `from-green-500 to-teal-500` (Runner accents)
- **Orange**: `from-orange-400 to-orange-500` (Large runners)

### Background Gradients
- **Main**: `from-gray-50 via-white to-blue-50`
- **Alt 1**: `from-gray-50 via-white to-green-50` (Runner pages)
- **Alt 2**: `from-gray-50 via-white to-purple-50` (Project pages)

## Typography

### Headings
```tsx
// Main Page Title
className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"

// Section Title
className="text-2xl font-bold text-gray-900"

// Card Title
className="text-xl font-bold group-hover:text-blue-600 transition-colors"
```

### Body Text
- **Primary**: `text-gray-900` (Dark text)
- **Secondary**: `text-gray-600` (Descriptions)
- **Tertiary**: `text-gray-500` (Meta information)

## Components

### Cards

#### Standard Card
```tsx
<Card className="border-none shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden">
  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
  {/* Card content */}
</Card>
```

Features:
- No border, shadow-based elevation
- Gradient top border (1px height)
- Hover: scale(1.05) + shadow increase
- 300ms transitions

#### Stat Card
```tsx
<Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-white">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      {/* Stat value */}
      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Buttons

#### Primary Button
```tsx
<Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
  <Icon className="mr-2 h-5 w-5" />
  Button Text
</Button>
```

#### Secondary Button
```tsx
<Button variant="outline" className="border-2 hover:bg-gray-50">
  Button Text
</Button>
```

### Badges

#### Status Badge
```tsx
// Success
<Badge className="bg-gradient-to-r from-green-400 to-green-500 text-white shadow-md">
  SUCCESS
</Badge>

// Error
<Badge className="bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md">
  FAILED
</Badge>

// Running
<Badge className="bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md">
  RUNNING
</Badge>
```

#### Info Badge
```tsx
<Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
  <Icon className="h-3.5 w-3.5 text-blue-600" />
  <span className="font-medium">Value</span>
  <span className="text-gray-500">label</span>
</Badge>
```

### Tabs

```tsx
<TabsList className="bg-white shadow-md border border-gray-200 p-1">
  <TabsTrigger 
    value="tab1" 
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white"
  >
    <Icon className="mr-2 h-4 w-4" />
    Tab Name (count)
  </TabsTrigger>
</TabsList>
```

### Icons

#### Icon Container
```tsx
<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
  <Icon className="h-5 w-5 text-white" />
</div>
```

#### Avatar Circle
```tsx
<div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg shadow-md">
  {initials}
</div>
```

## Animations

### Framer Motion Variants

#### Page Load
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

#### Staggered Grid
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {/* Item */}
  </motion.div>
))}
```

#### Scale on Hover (Alternative to CSS)
```tsx
<motion.div
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Content */}
</motion.div>
```

### CSS Transitions

All interactive elements use:
```css
transition-all duration-300
```

## Loading States

### Spinner
```tsx
<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  <div className="text-center">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
    <p className="text-gray-600 font-medium">Loading...</p>
  </div>
</div>
```

### Button Loading
```tsx
<Button disabled={loading}>
  {loading ? (
    <div className="flex items-center gap-2">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      <span>Creating...</span>
    </div>
  ) : (
    'Create'
  )}
</Button>
```

## Empty States

```tsx
<Card className="border-2 border-dashed border-gray-300">
  <CardContent className="py-20 text-center">
    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-6">
      <Icon className="h-8 w-8 text-blue-600" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No items yet</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">
      Description text
    </p>
    <Button>Create First Item</Button>
  </CardContent>
</Card>
```

## Shadow System

```css
/* Elevation Levels */
shadow-sm    /* Subtle elevation */
shadow-md    /* Default cards */
shadow-lg    /* Buttons, important cards */
shadow-xl    /* Hover states */
shadow-2xl   /* Maximum elevation */
```

## Spacing

### Container Padding
```tsx
// Mobile: p-6
// Tablet: md:p-8
// Desktop: lg:p-10
```

### Grid Gaps
```tsx
// Standard: gap-6
// Tight: gap-4
// Wide: gap-8
```

### Card Padding
```tsx
// Header: p-6
// Content: p-6
// Compact: p-4
```

## Responsive Design

### Breakpoints
- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)

### Grid Layouts
```tsx
// 1 column mobile, 2 tablet, 3 desktop
className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"

// Stats overview
className="grid grid-cols-1 md:grid-cols-3 gap-4"
```

## Best Practices

### DO:
✅ Use gradients sparingly for emphasis
✅ Maintain consistent transition durations (300ms)
✅ Apply shadows for elevation hierarchy
✅ Use Framer Motion for complex animations
✅ Implement loading states for all async operations
✅ Provide empty states with CTAs

### DON'T:
❌ Overuse animations (keep it subtle)
❌ Mix different transition speeds
❌ Use too many gradient directions
❌ Forget hover states on interactive elements
❌ Ignore accessibility (maintain contrast ratios)

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Status colors are distinguishable
- Gradient text maintains readability

### Interactive Elements
- Minimum touch target: 44x44px
- Focus states visible
- Keyboard navigation supported

### Motion
- Respects `prefers-reduced-motion`
- Animations are enhancement, not requirement

## Example Implementations

### Dashboard Card
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
>
  <Card className="cursor-pointer group border-none shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white overflow-hidden">
    <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
    <CardHeader className="pb-3">
      <CardTitle className="group-hover:text-blue-600 transition-colors text-xl">
        {title}
      </CardTitle>
      <CardDescription className="mt-2 line-clamp-2">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex gap-3">
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
          <Icon className="h-3.5 w-3.5 text-blue-600" />
          <span className="font-medium">{count}</span>
          <span className="text-gray-500">items</span>
        </Badge>
      </div>
    </CardContent>
  </Card>
</motion.div>
```

### Form Input
```tsx
<div className="space-y-3">
  <Label className="text-base font-semibold text-gray-900">
    Input Label
  </Label>
  <input
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base"
    placeholder="Placeholder text"
  />
</div>
```

## Design Tokens

### Border Radius
- Small: `rounded-lg` (8px)
- Medium: `rounded-xl` (12px)
- Large: `rounded-2xl` (16px)
- Circle: `rounded-full`

### Font Weights
- Regular: `font-normal` (400)
- Medium: `font-medium` (500)
- Semibold: `font-semibold` (600)
- Bold: `font-bold` (700)

### Icon Sizes
- Small: `h-3.5 w-3.5` (14px)
- Medium: `h-4 w-4` (16px)
- Large: `h-5 w-5` (20px)
- XLarge: `h-6 w-6` (24px)

## Conclusion

This design system provides a consistent, modern, and accessible user interface for the Tenki Clone application. All components follow the same principles of gradients, shadows, smooth transitions, and thoughtful animations to create a polished, professional experience.
