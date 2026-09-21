# Reeledin design system

Implement as-is. Do not brainstorm a new look.

## Color tokens

| Token | Hex | Role |
| --- | --- | --- |
| `--background` | `#000000` | True black page ground |
| `--card` | `#121212` | Card and panel surfaces |
| `--border` | `#262626` | Hairline dividers, borders |
| `--primary` | `#0095F6` | Interactive blue — buttons and links only |
| `--verified` | `#3797EF` | Verified-state blue — checkmarks only, never a button |
| `--muted-foreground` | `#A8A8A8` | Secondary / helper text |
| `--destructive` | `#ED4956` | Errors |
| `--success` | `#3DDC84` | Success states |

The Instagram 10-stop brand gradient (`#405DE6 → #5B51D8 → #833AB4 → #C13584 → #E1306C → #FD1D1D → #F56040 → #F77737 → #FCAF45 → #FFDC80`) is reserved for exactly two elements: the freshness ring and the brand mark square. Everything else stays solid from the token table. The checkmark is solid `--verified`.

## Type

- Headlines: General Sans 500/600/700 (Fontshare)
- Body / UI: Inter 400/500/600
- Stat numbers: `font-variant-numeric: tabular-nums`

## Surfaces

Cards `rounded-xl` / `rounded-2xl`, buttons `rounded-lg`, avatars fully round, 1px `border-border`. Sticky header `bg-background/85 backdrop-blur`. Widths: wide marketing, medium dashboard, `max-w-xl` public credential.

## Freshness ring

Conic-gradient ring around the avatar, driven by `--sweep` and `--fade` (0–1) from `lastSyncedAt` rounded to the hour. Under 6 hours: full saturated sweep. 6 hours–7 days: sweep shrinks and desaturates. Past 7 days: thin gray outline. No animation. `title` shows “Synced 2h ago”.

## Copy

Name controls: Connect Instagram, Sync now, Share link. Errors say what went wrong and what to do. Promise: “Verified, not self-reported.”
