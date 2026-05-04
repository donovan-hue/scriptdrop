# 🎨 UI Design System - Glassmorphism KRONOS

## Color Palette

### Primary Colors
- **Metal White**: `#f8f9fa` - Base background color
- **Metal Silver**: `#e8eef5` - Secondary background
- **Silver Light**: `#f0f4f8` - Light accent

### Tornasol Effect (Iridescent)
- **Tornasol Pink**: `#ff6ec7` - Vibrant pink
- **Tornasol Cyan**: `#00d4ff` - Bright cyan  
- **Tornasol Purple**: `#b344ff` - Deep purple

### Glass Effects
- **Glass White**: `rgba(248, 249, 250, 0.7)` - Semi-transparent white
- **Glass Silver**: `rgba(232, 238, 245, 0.6)` - Semi-transparent silver

---

## Glassmorphism Classes

### `.glass-card`
Main glass effect for cards and containers.

```jsx
<div className="glass-card">
  Content here
</div>
```

**Properties**:
- Backdrop blur: 10px
- Border: 1.5px white with opacity 0.3
- Border radius: 16px
- Shadow: `0 8px 32px rgba(31, 38, 135, 0.1)`

**Hover Effect**:
- Enhanced backdrop blur
- Stronger shadow
- Iridescent border color

### `.glass-card-deep`
Enhanced glass effect for prominent sections.

```jsx
<div className="glass-card-deep">
  Featured content
</div>
```

**Properties**:
- Backdrop blur: 20px (stronger)
- Border: 1.5px white with opacity 0.4
- Border radius: 24px
- Shadow: `0 8px 32px rgba(31, 38, 135, 0.12)`

### `.iridescent-border`
Glass card with colorful gradient border.

```jsx
<div className="iridescent-border">
  Iridescent content
</div>
```

**Properties**:
- Gradient border with pink→cyan→purple
- Enhanced hover glow effect
- Perfect for CTAs and featured elements

---

## UI Components

### 1. GlassButton

**Component**: `<GlassButton />`

```jsx
import { GlassButton } from './components/UI';

<GlassButton 
  variant="primary" 
  size="lg"
  fullWidth
  onClick={() => handleAction()}
>
  Click Me
</GlassButton>
```

**Props**:
| Prop | Type | Default | Values |
|------|------|---------|--------|
| `variant` | string | 'primary' | 'primary', 'secondary', 'success', 'danger', 'ghost' |
| `size` | string | 'md' | 'sm', 'md', 'lg' |
| `fullWidth` | boolean | false | - |
| `isLoading` | boolean | false | - |
| `disabled` | boolean | false | - |
| `onClick` | function | - | - |

**Variants**:
- **Primary**: Pink→Cyan gradient (default)
- **Secondary**: Cyan→Purple gradient
- **Success**: Green→Blue gradient
- **Danger**: Red→Orange gradient
- **Ghost**: Flat white background

**Features**:
- Framer Motion animations
- Hover scale effect
- Loading state with spinner
- Fully accessible

---

### 2. SocialButtons

**Component**: `<SocialButtons />`

```jsx
import { SocialButtons } from './components/UI';

<SocialButtons 
  onApple={() => handleApple()}
  onGoogle={() => handleGoogle()}
  onFacebook={() => handleFacebook()}
/>
```

**Props**:
| Prop | Type | Default |
|------|------|---------|
| `onApple` | function | - |
| `onGoogle` | function | - |
| `onFacebook` | function | - |

**Features**:
- Circular buttons (56px diameter)
- Iridescent border effect
- Shine animation on hover
- Staggered animation on load
- Smooth scale transitions

**Buttons Included**:
1. 🍎 Apple (Black icon)
2. 🔵 Google (Blue icon)
3. 👍 Facebook (Facebook blue icon)

---

### 3. LogoHexagon

**Component**: `<LogoHexagon />`

```jsx
import { LogoHexagon } from './components/UI';

<LogoHexagon size={140} animate={true} />
```

**Props**:
| Prop | Type | Default |
|------|------|---------|
| `size` | number | 120 |
| `animate` | boolean | true |

**Features**:
- SVG-based hexagon shape
- Gradient fill with iridescent borders
- Floating animation
- Glow effect on hover
- Inner hexagon inner border
- Letter "S" with gradient text

**Animations**:
- Initial: Rotate 180° → 0° with scale
- Continuous: Floating up/down motion
- Hover: Enhanced glow effect

---

## Global Styles

### Animations

#### `float`
Smooth vertical floating motion.

```css
.float {
  animation: float 3s ease-in-out infinite;
}
```

#### `shimmer`
Light shimmer effect (2s loop).

```css
.shimmer {
  animation: shimmer 2s infinite;
}
```

#### `pulse-glow`
Pulsing glow animation.

```css
.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

### Gradient Text

#### `.gradient-text`
Full tornado gradient text (pink→purple→cyan).

```jsx
<h1 className="gradient-text">Colorful Text</h1>
```

#### `.gradient-text-soft`
Softer gradient text effect.

```jsx
<p className="gradient-text-soft">Softer gradient</p>
```

---

## Tailwind Extensions

Custom Tailwind colors added to `tailwind.config.js`:

```javascript
colors: {
  'metal-white': '#f8f9fa',
  'metal-silver': '#e8eef5',
  'silver-light': '#f0f4f8',
  'tornasol-pink': '#ff6ec7',
  'tornasol-cyan': '#00d4ff',
  'tornasol-purple': '#b344ff',
  'glass-white': 'rgba(248, 249, 250, 0.7)',
  'glass-silver': 'rgba(232, 238, 245, 0.6)',
}
```

**Usage**:
```jsx
<div className="bg-tornasol-pink text-glass-white">
  Colorful content
</div>
```

---

## Background Gradients

### Metal Gradient
```jsx
<div className="bg-gradient-metal">
  Metallic background
</div>
```

### Tornasol Gradient
```jsx
<div className="bg-gradient-tornasol text-white">
  Iridescent background
</div>
```

### Soft Tornasol
```jsx
<div className="bg-gradient-soft-tornasol">
  Soft iridescent
</div>
```

---

## Typography

### Fonts Imported
- **Inter** (300-800): Main font (sans-serif)
- **Poppins** (600-800): Headings (bold)

### Font Classes

```jsx
// Poppins bold headings
<h1 style={{ fontFamily: 'Poppins', fontWeight: 800 }}>
  Bold Heading
</h1>

// Inter regular text
<p>Regular paragraph text</p>
```

---

## Shadow Effects

### `.glass-card` Shadow
```css
box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1);
```

### Hover Shadow
```css
box-shadow: 0 12px 40px rgba(31, 38, 135, 0.15);
```

### Iridescent Glow
```css
box-shadow: 0 0 20px rgba(255, 110, 199, 0.3),
            0 0 30px rgba(0, 212, 255, 0.2);
```

---

## Usage Examples

### Complete Card
```jsx
<div className="glass-card p-6 rounded-2xl">
  <h2 className="gradient-text text-2xl font-bold mb-4">
    Title
  </h2>
  <p className="text-gray-600 mb-6">Description here</p>
  <GlassButton variant="primary" fullWidth>
    Action Button
  </GlassButton>
</div>
```

### Hero Section
```jsx
<div className="bg-gradient-metal min-h-screen flex items-center justify-center">
  <LogoHexagon size={200} animate />
  <h1 className="gradient-text text-5xl font-bold mt-8">
    Welcome
  </h1>
  <SocialButtons 
    onApple={handleApple}
    onGoogle={handleGoogle}
    onFacebook={handleFacebook}
  />
</div>
```

### Feature Grid
```jsx
<div className="grid grid-cols-3 gap-4 p-8">
  {[1, 2, 3].map(i => (
    <div key={i} className="glass-card p-4 flex flex-col items-center">
      <div className="text-4xl mb-2">🎨</div>
      <h3 className="gradient-text font-bold">Feature {i}</h3>
    </div>
  ))}
</div>
```

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 15.4+
- ✅ Mobile Safari (iOS 15.4+)

**Note**: Backdrop filter may have limited support on older browsers. Fallback to solid background is automatic via CSS.

---

## Performance Tips

1. **Use Framer Motion sparingly** - Not all elements need animation
2. **Lazy load components** - Use React.lazy() for heavy components
3. **Optimize images** - Use Cloudinary for responsive images
4. **Hardware acceleration** - Transform/opacity animations are GPU-accelerated
5. **Reduce blur** - Backdrop blur can impact performance on low-end devices

---

## Accessibility

✅ All components include:
- Proper contrast ratios
- ARIA labels on buttons
- Keyboard navigation support
- Focus states visible
- Motion reduced support via `prefers-reduced-motion`

---

## Future Enhancements

- [ ] Dark mode variant
- [ ] Custom theme generator
- [ ] More glassmorphism variants
- [ ] Animated SVG icons
- [ ] Component Storybook
- [ ] Figma design tokens export

---

**Last Updated**: March 25, 2026  
**Version**: 1.0.0 - Glassmorphism Edition 🎨
