# JB Inverters - Complete Design Specification

## Overview
This document provides a comprehensive design specification for the JB Inverters e-commerce website. The site is built with Next.js 15, React 19, TypeScript, and TailwindCSS, featuring a clean, minimal design focused on professional power conversion solutions.

---

## 1. Overall Layout & Structure

### 1.1 Page Structure
Every page follows a consistent layout pattern:
- **Header**: Navigation component with logo and menu
- **Hero Section**: Blue gradient background with descriptive text
- **Main Content**: White background with content sections
- **Footer**: Blue background with copyright information

### 1.2 Grid System
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Product Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
- **Two-Column Layout**: `grid-cols-1 lg:grid-cols-2 gap-12`
- **Three-Column Layout**: `grid-cols-1 lg:grid-cols-3 gap-6`

### 1.3 Spacing Rules
- **Section Padding**: `py-16` (64px top/bottom)
- **Container Padding**: `px-4 sm:px-6 lg:px-8`
- **Card Padding**: `p-6` (24px all around)
- **Form Spacing**: `space-y-6` (24px between elements)
- **Button Spacing**: `space-x-2` (8px between icon and text)

---

## 2. Typography

### 2.1 Font Families
- **Primary**: Geist Sans (`var(--font-geist-sans)`)
- **Fallback**: `system-ui, sans-serif`
- **Monospace**: Geist Mono (`var(--font-geist-mono)`)
- **Fallback**: `monospace`

### 2.2 Font Weights & Styles
- **Headings (h1)**: `text-3xl md:text-4xl font-bold` (30px/36px, 700 weight)
- **Headings (h2)**: `text-2xl font-bold` (24px, 700 weight)
- **Headings (h3)**: `text-lg font-semibold` (18px, 600 weight)
- **Body Text**: `text-gray-700` (default weight)
- **Small Text**: `text-sm` (14px)
- **Button Text**: `font-semibold` (600 weight)
- **Labels**: `text-sm font-medium` (14px, 500 weight)

### 2.3 Line Heights & Spacing
- **Default Line Height**: Tailwind default (1.5)
- **Letter Spacing**: Default (0)
- **Text Transform**: None (lowercase for buttons)
- **Text Alignment**: Center for hero sections, left for content

---

## 3. Colors & Theme

### 3.1 Primary Color Palette
- **Blue 50**: `#f0f9ff` - Light blue backgrounds
- **Blue 100**: `#e0f2fe` - Light blue accents
- **Blue 200**: `#bae6fd` - Light blue borders
- **Blue 300**: `#7dd3fc` - Medium light blue
- **Blue 400**: `#38bdf8` - Medium blue
- **Blue 500**: `#0ea5e9` - Primary blue
- **Blue 600**: `#0284c7` - Dark blue (buttons, links)
- **Blue 700**: `#0369a1` - Darker blue (hover states)
- **Blue 800**: `#075985` - Very dark blue
- **Blue 900**: `#0c4a6e` - Darkest blue (hero backgrounds)

### 3.2 Neutral Colors
- **White**: `#ffffff` - Primary background
- **Gray 50**: `#f9fafb` - Light gray backgrounds
- **Gray 100**: `#f3f4f6` - Card backgrounds
- **Gray 200**: `#e5e7eb` - Borders
- **Gray 300**: `#d1d5db` - Input borders
- **Gray 400**: `#9ca3af` - Disabled text
- **Gray 500**: `#6b7280` - Secondary text
- **Gray 600**: `#4b5563` - Muted text
- **Gray 700**: `#374151` - Body text
- **Gray 800**: `#1f2937` - Dark text
- **Gray 900**: `#111827` - Primary text

### 3.3 Status Colors
- **Green 50**: `#f0fdf4` - Success backgrounds
- **Green 200**: `#bbf7d0` - Success borders
- **Green 600**: `#16a34a` - Success text
- **Green 700**: `#15803d` - Success hover
- **Red 50**: `#fef2f2` - Error backgrounds
- **Red 200**: `#fecaca` - Error borders
- **Red 500**: `#ef4444` - Error text
- **Red 600**: `#dc2626` - Error hover
- **Yellow 50**: `#fefce8` - Warning backgrounds
- **Yellow 200**: `#fde047` - Warning borders
- **Yellow 800**: `#a16207` - Warning text

### 3.4 Background Colors
- **Primary Background**: `#ffffff` (white)
- **Secondary Background**: `#f9fafb` (gray-50)
- **Hero Background**: `bg-gradient-to-br from-blue-900 to-blue-800`
- **Card Background**: `#ffffff` (white)
- **Footer Background**: `#0c4a6e` (blue-900)

---

## 4. Components

### 4.1 Buttons

#### Primary Button
- **Background**: `bg-blue-600`
- **Hover**: `hover:bg-blue-700`
- **Text**: `text-white`
- **Padding**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Border Radius**: `rounded-md` (6px)
- **Font Weight**: `font-semibold`
- **Transition**: `transition-colors`

#### Secondary Button
- **Background**: `bg-gray-200`
- **Hover**: `hover:bg-gray-300`
- **Text**: `text-gray-700`
- **Padding**: `px-4 py-2`
- **Border Radius**: `rounded-md`

#### Disabled Button
- **Background**: `bg-gray-400`
- **Text**: `text-white`
- **Cursor**: `cursor-not-allowed`

#### Button Sizes
- **Small**: `px-3 py-2 text-sm`
- **Medium**: `px-4 py-2` (default)
- **Large**: `px-6 py-3`

### 4.2 Forms

#### Input Fields
- **Background**: `bg-white`
- **Border**: `border border-gray-300`
- **Focus**: `focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- **Padding**: `px-3 py-2`
- **Border Radius**: `rounded-md`
- **Text Color**: `text-gray-900`
- **Placeholder**: `placeholder-gray-500`

#### Textarea
- **Same as input fields**
- **Resize**: `resize-none`
- **Rows**: `rows={3}` or `rows={6}`

#### Labels
- **Font**: `text-sm font-medium`
- **Color**: `text-gray-700`
- **Margin**: `mb-2`

#### Error States
- **Border**: `border-red-500`
- **Error Text**: `text-red-500 text-xs mt-1`

### 4.3 Cards

#### Product Card
- **Background**: `bg-white`
- **Border**: `border border-gray-200`
- **Border Radius**: `rounded-lg`
- **Shadow**: `shadow-sm`
- **Hover**: `hover:shadow-md`
- **Padding**: `p-6`
- **Overflow**: `overflow-hidden`

#### Info Card
- **Background**: `bg-white`
- **Border**: `border border-gray-200`
- **Border Radius**: `rounded-lg`
- **Shadow**: `shadow-sm`
- **Padding**: `p-8`

### 4.4 Navigation

#### Header
- **Background**: `bg-white`
- **Border**: `border-b`
- **Shadow**: `shadow-sm`
- **Height**: `h-48` (192px - includes logo)

#### Logo
- **Height**: `h-48` (192px)
- **Image**: `/images/jblogo.png`

#### Navigation Links
- **Color**: `text-gray-700`
- **Hover**: `hover:text-gray-900`
- **Padding**: `px-3 py-2`
- **Font**: `text-sm font-medium`

#### Cart Icon
- **Size**: `h-5 w-5`
- **Badge**: `bg-red-500 text-white text-xs rounded-full h-5 w-5`

### 4.5 Modals

#### Modal Overlay
- **Background**: `bg-black bg-opacity-50`
- **Position**: `fixed inset-0`
- **Z-Index**: `z-50`

#### Modal Content
- **Background**: `bg-white`
- **Border Radius**: `rounded-lg`
- **Shadow**: `shadow-xl`
- **Max Width**: `max-w-md w-full mx-4`
- **Max Height**: `max-h-[90vh] overflow-y-auto`

#### Modal Header
- **Padding**: `p-6`
- **Border**: `border-b`
- **Title**: `text-xl font-semibold text-gray-900`

#### Modal Body
- **Padding**: `p-6`
- **Spacing**: `space-y-4`

### 4.6 Tables

#### Table Container
- **Background**: `bg-white`
- **Border**: `border border-gray-200`
- **Border Radius**: `rounded-lg`
- **Overflow**: `overflow-hidden`

#### Table Headers
- **Background**: `bg-gray-50`
- **Padding**: `px-6 py-3`
- **Font**: `text-xs font-medium text-gray-500 uppercase tracking-wider`

#### Table Cells
- **Padding**: `px-6 py-4`
- **Border**: `border-t border-gray-200`
- **Text**: `text-sm text-gray-900`

---

## 5. Images & Media

### 5.1 Image Handling
- **Aspect Ratio**: `aspect-w-16 aspect-h-12` (4:3 ratio)
- **Object Fit**: `object-cover`
- **Border Radius**: `rounded-lg`
- **Max Width**: `w-full`
- **Height**: `h-52` (208px) for product images

### 5.2 Logo
- **File**: `/images/jblogo.png`
- **Height**: `h-48` (192px)
- **Alt Text**: "JB Inverters"

### 5.3 Product Images
- **Default Size**: 400x300px
- **Fallback**: Gray placeholder with "No Image" text
- **Placeholder Icon**: 16x16px gray square

### 5.4 Favicon
- **File**: `/favicon.ico`
- **Location**: `/src/app/favicon.ico`

---

## 6. Responsive Design

### 6.1 Breakpoints
- **Mobile**: Default (0px+)
- **Small**: `sm:` (640px+)
- **Medium**: `md:` (768px+)
- **Large**: `lg:` (1024px+)
- **Extra Large**: `xl:` (1280px+)

### 6.2 Layout Changes

#### Navigation
- **Mobile**: Hamburger menu with slide-out navigation
- **Desktop**: Horizontal navigation with dropdown

#### Product Grid
- **Mobile**: 1 column
- **Medium**: 2 columns
- **Large**: 3 columns

#### Two-Column Layouts
- **Mobile**: Stacked vertically
- **Large**: Side-by-side

### 6.3 Font Size Scaling
- **Hero Text**: `text-xl` (20px) on mobile, `text-2xl` (24px) on desktop
- **Headings**: `text-3xl md:text-4xl` (30px/36px)
- **Body Text**: Consistent across breakpoints

---

## 7. Animations & Transitions

### 7.1 Transitions
- **Button Hover**: `transition-colors` (150ms)
- **Card Hover**: `transition-shadow` (150ms)
- **Modal**: `transition-transform` (150ms)

### 7.2 Loading States
- **Spinner**: `animate-spin` (1s linear infinite)
- **Pulse**: `animate-pulse` (2s cubic-bezier infinite)

### 7.3 Hover Effects
- **Buttons**: Color change on hover
- **Cards**: Shadow increase on hover
- **Links**: Color change on hover

---

## 8. Interactive Elements

### 8.1 Focus States
- **Input Fields**: `focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- **Buttons**: `focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`

### 8.2 Disabled States
- **Background**: `bg-gray-400`
- **Text**: `text-gray-500`
- **Cursor**: `cursor-not-allowed`

### 8.3 Active States
- **Buttons**: Darker background color
- **Links**: Underline or color change

---

## 9. Icons

### 9.1 Icon Library
- **Library**: Lucide React
- **Size**: `h-4 w-4`, `h-5 w-5`, `h-6 w-6`
- **Color**: Inherits from parent text color

### 9.2 Common Icons
- **Shopping Cart**: `ShoppingCart`
- **Menu**: `Menu`
- **Close**: `X`
- **Chevron Down**: `ChevronDown`
- **Plus**: `Plus`
- **Minus**: `Minus`
- **Trash**: `Trash2`
- **Credit Card**: `CreditCard`
- **QR Code**: `QrCode`
- **Mail**: `Mail`
- **Phone**: `Phone`
- **Map Pin**: `MapPin`
- **Send**: `Send`

---

## 10. Special Features

### 10.1 QR Code Generation
- **Library**: QRCode
- **Size**: 200px default, 250px for modals
- **Colors**: Black on white
- **Border**: `border border-gray-200`
- **Border Radius**: `rounded-lg`

### 10.2 Loading States
- **Spinner**: White border with transparent top
- **Animation**: `animate-spin`
- **Size**: `w-4 h-4` (16px)

### 10.3 Error States
- **Background**: `bg-red-50`
- **Border**: `border border-red-200`
- **Text**: `text-red-800`

### 10.4 Success States
- **Background**: `bg-green-50`
- **Border**: `border border-green-200`
- **Text**: `text-green-800`

---

## 11. Page-Specific Layouts

### 11.1 Homepage
- **Hero Section**: Blue gradient with descriptive text
- **Products Section**: 3-column grid on desktop
- **Loading State**: Skeleton cards with pulse animation

### 11.2 Cart Page
- **Empty State**: Centered content with "Continue Shopping" button
- **Cart Items**: Horizontal layout with image, details, and controls
- **Order Summary**: Sticky sidebar with form and payment options

### 11.3 Contact Page
- **Two-Column Layout**: Contact info and form
- **Contact Cards**: Icon, title, and description
- **Business Hours**: Gray background card

### 11.4 Mail-In Service Page
- **Steps Section**: Icon, title, and description for each step
- **Service Details**: Gray background card with pricing
- **Instructions**: White card with guidelines

### 11.5 Policy Pages
- **Content**: White card with prose styling
- **Headings**: Hierarchical with proper spacing
- **Lists**: Bulleted with proper indentation

---

## 12. Technical Implementation

### 12.1 CSS Framework
- **Primary**: TailwindCSS v4
- **Custom Classes**: Defined in `globals.css`
- **Variables**: CSS custom properties for colors

### 12.2 Component Structure
- **Layout**: `min-h-screen flex flex-col`
- **Sections**: `py-16` for main sections
- **Containers**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### 12.3 State Management
- **Cart**: React Context with local storage
- **Forms**: Controlled components with validation
- **Modals**: Conditional rendering with state

---

This specification provides all the details needed to recreate the JB Inverters website from scratch, including exact measurements, colors, typography, spacing, and component specifications.
