# Color Palette & Design System - GIRA Platform

## Primary Colors

```css
/* Hot Pink & Coral Gradient */
--primary-pink: #ff6b9d;
--primary-coral: #ff8fb3;
--primary-gradient: linear-gradient(135deg, #ff6b9d 0%, #ff8fb3 100%);

/* Dark Text */
--text-dark: #1a1a2e;
--text-secondary: #666;
--text-light: #999;

/* Borders & Input Fields */
--input-border: #e8e8f0;
--input-background: #f9f9ff;
--input-background-hover: #fff;
--input-focus-shadow: rgba(255, 107, 157, 0.1);
```

## Gradient Backgrounds

### Main Page Gradients

```css
/* Left Panel - Soft Lavender Gradient */
background: linear-gradient(135deg, #f8f9ff 0%, #f0e6ff 100%);

/* SVG Background - Sky */
<linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" style={{ stopColor: "#E8F5FF", stopOpacity: 1 }} />
  <stop offset="100%" style={{ stopColor: "#FFF0F8", stopOpacity: 1 }} />
</linearGradient>
```

## SVG Illustration Colors

### Pink Palette

- `#FFD6E8` - Pastel pink (light)
- `#FFB3D9` - Medium pink
- `#FF6B9D` - Hot pink (accent)

### Blue Palette

- `#E8F5FF` - Sky blue (very light)
- `#B3E5FC` - Light cyan
- `#5DADE2` - Medium blue

### Green Palette

- `#C8E6C9` - Pastel green
- `#7FD8BE` - Mint green
- `#A8E6CF` - Light mint

### Yellow/Gold Palette

- `#FFE082` - Light yellow
- `#FFD700` - Gold
- `#D4A574` - Tan/beige

### Purple Palette

- `#F0C4FF` - Light purple
- `#E0A8F0` - Medium purple
- `#D8A5FF` - Lavender

## Interactive States

```css
/* Input Field - Normal State */
border: 2px solid #e8e8f0;
background: #f9f9ff;
border-radius: 10px;
padding: 12px 14px;

/* Input Field - Hover State */
border-color: #e8e8f0; /* slight change */
background: #f9f9ff;

/* Input Field - Focus State */
border-color: #ff6b9d; /* hot pink */
background: #fff;
box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1); /* pink glow */

/* Button - Normal State */
background: linear-gradient(135deg, #ff6b9d 0%, #ff8fb3 100%);
color: white;
box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
border-radius: 25px;

/* Button - Hover State */
transform: translateY(-2px);
box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);

/* Button - Disabled State */
opacity: 0.7;
cursor: not-allowed;
```

## Typography

```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             Oxygen, Ubuntu, Cantarell, sans-serif;

/* Heading Sizes */
h1: font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.5px;

p: font-size: 0.95rem;
   color: #666;
   line-height: 1.5;

label: font-size: 0.9rem;
       color: #666;

/* Icon Sizes */
input-icon: width: 20px; height: 20px;

/* Placeholder */
::placeholder: color: #999;
```

## Spacing & Layout

```css
/* Page Container */
height: 100vh;
width: 100vw;
display: flex;

/* Form Container */
max-width: 400px;
padding: 2rem;

/* Form Field Gaps */
.form {
  gap: 1rem; /* between fields */
}

/* Button Margin */
margin-top: 0.5rem;

/* Link Margin */
margin-top: 1.5rem;
```

## Border Radius

```css
--radius-small: 8px; /* error messages, small inputs */
--radius-normal: 10px; /* input fields, form groups */
--radius-large: 25px; /* buttons, pill-shaped elements */
```

## Shadows

```css
/* Input Focus Shadow */
box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);

/* Button Shadow - Normal */
box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);

/* Button Shadow - Hover */
box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);

/* Error Message */
border-left: 3px solid #d32f2f;
background: #fff5f5;
```

## Animations

```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* Applied to: .signup-illustration, .login-illustration */
animation: float 3s ease-in-out infinite;
```

## Transitions

```css
/* Fast interactions */
transition: all 0.2s ease;

/* Normal interactions */
transition: all 0.3s ease;

/* Smooth focus states */
transition: all 0.3s ease;

/* Button interactions */
transition: all 0.3s ease;
```

## Error Styling

```css
background: #fff5f5; /* light red background */
color: #d32f2f; /* red text */
padding: 12px 14px; /* proper spacing */
border-radius: 8px; /* rounded corners */
border-left: 3px solid #d32f2f; /* accent line */
font-size: 0.9rem; /* smaller text for errors */
```

## Form Elements

### Input Fields

```css
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 2px solid #e8e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  background: #f9f9ff;
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1a1a2e;
  outline: none;
}
```

### Select Elements

```css
select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}
```

### Checkboxes

```css
input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #ff6b9d; /* pink checkmark */
}
```

## Responsive Breakpoints

```css
/* Desktop */
@media (max-width: 768px) {
  .signup-page,
  .login-page {
    flex-direction: column;
  }

  .left-panel {
    flex: 0.5;
    min-height: 250px;
  }

  .illustration {
    max-width: 300px;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .left-panel {
    display: none;
  }

  .right-panel {
    padding: 1.5rem 1rem;
  }
}
```

## Visual Summary

| Element          | Color                    | Size                   | Styling                   |
| ---------------- | ------------------------ | ---------------------- | ------------------------- |
| Page Background  | White                    | Full page              | Solid                     |
| Left Panel       | Gradient lavender        | 50% width              | Illustration area         |
| Form Area        | White                    | 50% width              | Form container            |
| Input Fields     | #f9f9ff                  | Full width (max 400px) | Border #e8e8f0            |
| Primary Button   | Gradient pink            | Full width             | Rounded 25px              |
| Hot Pink Accent  | #ff6b9d                  | Various                | Primary interactive color |
| Text - Primary   | #1a1a2e                  | Various                | Dark navy                 |
| Text - Secondary | #666                     | Various                | Medium gray               |
| Borders          | #e8e8f0                  | 2px                    | Light purple              |
| Shadows          | rgba(255, 107, 157, 0.x) | Various                | Pink-tinted               |
