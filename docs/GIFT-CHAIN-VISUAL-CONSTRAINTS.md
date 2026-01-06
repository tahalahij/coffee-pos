# Gift Chain Visual-Only Constraints

## Core Principle
The second screen (TV/Display) must communicate the "Pay It Forward" chain **purely through VISUAL ELEMENTS**. NO explanatory text, instructions, or paragraphs are allowed. The goal is **emotional motivation, not explanation**.

---

## ✅ ALLOWED Elements

### Names & Products
- ✅ Person names (or "Anonymous" if missing)
- ✅ Product names (Coffee, Latte, Cookie, Muffin, etc.)
- ✅ Product icons/emojis (☕ 🍪 🧁 🥐 etc.)

### Visual Connectors
- ✅ Arrows (→, ↓)
- ✅ Lines, curves, animated paths
- ✅ Visual flow indicators (LEFT → RIGHT or TOP → BOTTOM)

### Visual Effects
- ✅ Highlights (glow, pulse, ring)
- ✅ Animations (fade in, fade out, smooth transitions)
- ✅ Color gradients
- ✅ Scale/rotation effects
- ✅ Checkmarks (✓) for claimed gifts

---

## ❌ FORBIDDEN Elements

### Text Content
- ❌ Full sentences
- ❌ Explanatory text (e.g., "Ali bought a coffee for the next person")
- ❌ Instructions (e.g., "You could be next", "Pay it forward")
- ❌ Descriptive labels (e.g., "Active chain", "Last gifted")
- ❌ Tooltips

### Interactive Elements
- ❌ Buttons
- ❌ Forms
- ❌ User inputs
- ❌ Clickable elements (display is read-only)

### Financial Information
- ❌ Prices
- ❌ Currency symbols (unless part of product name)
- ❌ Transaction amounts

---

## 📐 Visual Chain Structure

Each gift unit MUST be represented as:

```
[ Person Name ] → [ Product Icon + Product Name ]
```

### Chain Flow
- **Direction**: LEFT → RIGHT or TOP → BOTTOM
- **Connection**: Visual arrows/lines between gifts
- **Active Gift**: Most recent AVAILABLE gift must be highlighted

### Example Visual Layout (Conceptual)

```
Ali        ☕ Latte
  └────────▶
           Sara        🍪 Cookie
             └────────▶
                      Anonymous     ☕ Espresso (glowing)
```

---

## 🎨 Visual Highlighting Rules

### Active (Unclaimed) Gift
- Soft glow or pulse animation
- Ring/border in accent color (e.g., yellow, gold)
- Scale slightly larger than other gifts
- Animated rotation or bounce

### Claimed Gift
- Fade opacity (e.g., 40-60%)
- Small checkmark indicator (✓)
- No glow/pulse
- Desaturated colors

### Continued Gift
- Smooth connection animation to new gift
- Keep chain visually intact
- Fade original gift, highlight new one

---

## 🎭 Animation Guidelines

### Add Gift Animation
```
Initial: opacity: 0, x: -50, scale: 0.8
Animate: opacity: 1, x: 0, scale: 1
Duration: 0.6s
Delay: index * 0.15s (stagger effect)
```

### Claim Gift Animation
```
Animate: opacity: 0.4
Add: Checkmark (scale from 0 to 1)
Duration: 0.5s
```

### Chain Continuation Animation
```
1. Mark original gift: opacity: 0.4, add checkmark
2. Draw arrow/line to new gift
3. New gift appears: scale from 0.8 to 1.1 to 1.0
4. Pulse/glow on new gift
```

### Fade Out (Chain End)
```
Animate: opacity: 0, scale: 0.8
Duration: 0.8s
Remove from DOM after animation
```

---

## 🧩 Component Structure

### GiftChainVisualization Component

**Props:**
- `giftUnits: GiftUnit[]` - Array of gift units to display

**State:**
- `activeGiftId` - ID of the currently highlighted gift

**Layout:**
- Horizontal flow (responsive to screen width)
- Centered on screen
- 16:9 safe area (1920x1080)

**Visual Hierarchy:**
1. Person name (large, bold)
2. Arrow down
3. Product icon (large, colored)
4. Product name (medium, semibold)

---

## 🔄 Event-Driven Updates

The display UI reacts ONLY to domain events:

### GIFT_UNIT_CREATED
- Add new gift to recent gifts
- Animate in with stagger effect
- Highlight as active gift

### GIFT_UNIT_CLAIMED
- Update gift unit to mark as claimed
- Fade opacity
- Add checkmark
- Remove glow/pulse

### GIFT_CHAIN_CONTINUED
- Mark original gift as continued
- Animate connection to new gift
- New gift becomes active
- Maintain visual chain integrity

### GIFT_STATE_UPDATE
- Replace entire state (used on initial connection)
- Re-render all gifts with animations

---

## 📏 Layout Specifications

### Screen Dimensions
- Target: 16:9 aspect ratio (1920x1080)
- Padding: 48px (3rem) on all sides
- Max content width: 1824px

### Gift Unit Card
- Width: Auto (based on content)
- Height: Auto (based on content)
- Padding: 32px (2rem)
- Border radius: 24px (rounded-3xl)
- Shadow: Large (shadow-lg)

### Typography
- Person name: 48px (text-3xl), bold
- Product name: 32px (text-2xl), semibold
- Icon size: 80px (w-20 h-20)

### Colors
- Background: Gradient from blue-50 via white to purple-50
- Cards: White (bg-white)
- Active highlight: Yellow-400 (ring-4 ring-yellow-400)
- Claimed: Opacity 60%
- Arrows: Blue-400 to Purple-400 gradient

---

## 🚫 Name & Product Handling

### Missing Name
```typescript
const displayName = giftUnit.giftedByName || 'Anonymous';
```

### Product Icon Mapping
```typescript
const PRODUCT_ICONS = {
  coffee: Coffee,
  latte: Coffee,
  espresso: Coffee,
  cookie: Cookie,
  croissant: Croissant,
  cake: Cake,
  // ... etc
};
```

### Fallback Icon
If no matching icon: Use default (e.g., Coffee icon)

---

## 🧪 UX Principles

### Instantly Understandable
- No reading required
- Visual patterns speak for themselves
- Emotional, not rational

### Emotional Tone
- ✅ Human
- ✅ Social
- ✅ Encouraging
- ❌ Never pressuring
- ❌ Never negative (no "broken chain" indicators)

### Natural Fade
When a chain ends:
- Let it fade naturally
- No error messages
- No "chain broken" visuals
- Simply remove from view after delay

---

## 🎯 Implementation Checklist

- [x] GiftChainVisualization component created
- [x] Visual-only layout (no explanatory text)
- [x] Person → Product visual structure
- [x] Horizontal LEFT → RIGHT flow
- [x] Active gift highlighting (glow, pulse)
- [x] Claimed gift fade + checkmark
- [x] Chain continuation animation
- [x] Product icon mapping
- [x] "Anonymous" fallback for missing names
- [x] useGiftChainSync hook for WebSocket
- [x] GiftChainGateway for backend events
- [x] Display page integration

---

## 📦 File References

### Frontend
- `/frontend/src/components/GiftChainVisualization.tsx` - Main visual component
- `/frontend/src/hooks/use-gift-chain-sync.ts` - WebSocket client
- `/frontend/src/app/display/page.tsx` - Display page integration

### Backend
- `/backend/src/display/gift-chain.gateway.ts` - WebSocket gateway
- `/backend/src/display/display.module.ts` - Module registration

---

## 🔐 Constraints Enforcement

This constraint is **mandatory** and must not be bypassed:

1. ✅ All display UI must be visual-only
2. ✅ No full sentences or paragraphs
3. ✅ No instructions or tooltips
4. ✅ No prices or financial info
5. ✅ Only names, products, icons, arrows, animations

Any violation of these rules must be corrected immediately.

---

**Last Updated**: January 7, 2026  
**Status**: ✅ Implemented  
**Version**: 1.0.0
