# GIRA Redesigned Pages - Visual Guide

## Login Page

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────────┐          ┌──────────────────────────┐  │
│  │              │          │  Welcome Back            │  │
│  │   [Office    │          │                          │  │
│  │   Building   │          │  Sign in to access your  │  │
│  │   Illust]    │          │  dashboard               │  │
│  │              │          │                          │  │
│  │   [Security] │          │  ┌──────────────────────┐│  │
│  │              │          │  │  📧  E-mail          ││  │
│  │  [Clipboard] │          │  └──────────────────────┘│  │
│  │              │          │  ┌──────────────────────┐│  │
│  │              │          │  │  🔒  Password   👁    ││  │
│  │              │          │  └──────────────────────┘│  │
│  │              │          │  ☐ Show Password        │  │
│  │              │          │  ┌──────────────────────┐│  │
│  │              │          │  │   Sign In     →      ││  │
│  │              │          │  └──────────────────────┘│  │
│  │              │          │                          │  │
│  │              │          │  Don't have account?    │  │
│  │              │          │  Sign Up →              │  │
│  └──────────────┘          └──────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Color Scheme

- **Background Gradient**: Light blue (#E8F5FF) to light pink (#FFF0F8)
- **Form Background**: White
- **Input Fields**: Light lavender (#F9F9FF) with pink border on focus
- **Button**: Gradient pink (hot pink to coral)
- **Text**: Dark navy (#1a1a2e)
- **Icons**: Gray (#999)

### Interactive Elements

- Input fields expand with pink glow on focus
- Button lifts up on hover with enhanced shadow
- Show password toggle reveals/hides password

---

## Signup Page

### Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────────┐          ┌──────────────────────────┐  │
│  │              │          │  Create Your Account     │  │
│  │   [Desk with │          │                          │  │
│  │   Computer]  │          │  Join our platform to    │  │
│  │              │          │  manage projects         │  │
│  │   [Monitor]  │          │                          │  │
│  │              │          │  ┌──────────────────────┐│  │
│  │   [Keyboard] │          │  │  👤  Full Name       ││  │
│  │              │          │  └──────────────────────┘│  │
│  │   [Coffee]   │          │  ┌──────────────────────┐│  │
│  │              │          │  │  📧  E-mail          ││  │
│  │   [Speaker]  │          │  └──────────────────────┘│  │
│  │              │          │  ┌──────────────────────┐│  │
│  │              │          │  │  ⭕  Role   [▼]      ││  │
│  │              │          │  └──────────────────────┘│  │
│  │              │          │  ┌──────────────────────┐│  │
│  │              │          │  │  🔒  Password        ││  │
│  │              │          │  └──────────────────────┘│  │
│  │              │          │  ┌──────────────────────┐│  │
│  │              │          │  │  🛡️  Confirm Pass    ││  │
│  │              │          │  └──────────────────────┘│  │
│  │              │          │  ☐ Show Password        │  │
│  │              │          │  ┌──────────────────────┐│  │
│  │              │          │  │  Sign Up      →      ││  │
│  │              │          │  └──────────────────────┘│  │
│  │              │          │                          │  │
│  │              │          │  Already have account?  │  │
│  │              │          │  Login →                │  │
│  └──────────────┘          └──────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Color Scheme

- **Background Gradient**: Light blue (#E8F5FF) to light pink (#FFF0F8)
- **Form Background**: White
- **Input Fields**: Light lavender (#F9F9FF) with pink border on focus
- **Button**: Gradient pink (hot pink to coral)
- **Text**: Dark navy (#1a1a2e)
- **Icons**: Gray (#999)
- **Role Dropdown**: Clean select with SVG arrow

### Features

- Clean form with proper grouping
- Select dropdown for role selection (Worker, Provider, Manager)
- Password confirm field
- Show password checkbox
- Loading state button
- Smooth form transitions

---

## Removed: Playoffs Page

- ❌ Import removed from App.jsx
- ❌ Route removed from application
- ❌ No longer accessible via navigation

---

## SVG Illustrations

### Login Page Illustration

Shows an enterprise/office theme:

- **Buildings**: Multiple office buildings with lit windows
- **Security**: Padlock icon with digital lock
- **Checklist**: Task checklist with checkmarks
- **Arrows**: Flow indicators showing connectivity
- **Colors**: Pastel gradient (pink, blue, green, yellow)
- **Animation**: Gentle floating up/down motion

### Signup Page Illustration

Shows a designer's workspace:

- **Monitor**: Computer screen in teal-green
- **Desk**: Work desk with gradient green
- **Keyboard**: Colorful keyboard with individual keys
- **Coffee**: Warm brown coffee cup
- **Speaker**: Audio equipment in pink
- **Decorative**: Tech elements and circular accents
- **Colors**: Pastel gradient (pink, blue, green)
- **Animation**: Gentle floating up/down motion

---

## Responsive Behavior

### Desktop (>768px)

- Two-column layout with illustration on left
- Full-size SVG illustration
- Normal padding and spacing

### Tablet (600-768px)

- Illustration reduced in size
- Form takes more space
- Adjusted padding
- Illustration below form on very small tablets

### Mobile (<600px)

- Single column layout
- Illustration hidden
- Full-width form
- Optimized input sizes and spacing

---

## Animations & Interactions

### Illustrations

- **Float Animation**: Gentle up/down movement (3s loop)
- Starts from natural position
- Moves 20px up at peak

### Input Fields

- **Hover**: Border color change to light gray, slight background lift
- **Focus**: Border becomes hot pink (#ff6b9d)
- **Focus**: Shadow glow effect with pink tint
- **Transition**: Smooth 0.3s transition

### Buttons

- **Hover**: Moves up 2px, enhances shadow
- **Click**: Returns to normal position
- **Disabled**: 70% opacity, cursor not-allowed
- **Loading**: Shows loading text state

---

## Colors Palette

```
Primary Colors:
├─ Hot Pink: #ff6b9d
├─ Coral: #ff8fb3
│
Background Gradients:
├─ Left Panel: #f8f9ff → #f0e6ff (lavender)
├─ Top Color: #E8F5FF (light sky blue)
└─ Bottom Color: #FFF0F8 (light pink)

Input & Form:
├─ Input Background: #f9f9ff (very light purple)
├─ Input Border: #e8e8f0 (light purple)
├─ Input Border Focus: #ff6b9d (hot pink)
├─ Error: #d32f2f (red)
│
Illustration Colors:
├─ Pink: #FFD6E8, #FFB3D9, #FF6B9D
├─ Blue: #B3E5FC, #5DADE2
├─ Green: #C8E6C9, #7FD8BE, #A8E6CF
├─ Yellow: #FFE082, #FFD700
└─ Purple: #F0C4FF, #E0A8F0, #D8A5FF

Text Colors:
├─ Primary: #1a1a2e (dark navy)
├─ Secondary: #666 (medium gray)
└─ Placeholder: #999 (light gray)
```

---

## Key Features

✅ Modern, clean design inspired by Signup image
✅ Custom SVG illustrations matching project theme
✅ Pastel color palette for friendly feel
✅ Smooth interactions and animations
✅ Fully responsive design
✅ Proper form validation
✅ Accessible form elements
✅ Professional enterprise look
✅ Removed complex mesh animations
✅ Removed Playoffs page from app
