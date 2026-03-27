# 🎲 Morabaraba - Traditional African Strategy Game

A beautiful digital implementation of **Morabaraba**, the ancient two-player strategy board game from Southern Africa. Also known as "The Game of the Herd."

## 🎮 How to Play

Morabaraba is played in three phases:

### 1. Placing Phase
- Each player has 12 "cows" (pieces)
- Take turns placing cows on the board
- Goal: Form mills (3-in-a-row)

### 2. Moving Phase
- Once all cows are placed, move to adjacent points
- Goal: Form mills, block opponent

### 3. Flying Phase
- When you have only 3 cows left, you can "fly"
- Move to ANY empty point
- Tactical advantage!

### Winning
- Form a mill to remove opponent's cow
- Win by reducing opponent to 2 cows
- Or when opponent has no legal moves

## 🚀 Quick Start

### Install
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

## ✨ Features

- 🤖 **Single Player** - Play against yourself (hotseat mode)
- 👥 **2 Player** - Local multiplayer on same device
- 🎨 **Beautiful Design** - Savanna-inspired theme
- 📱 **Mobile Ready** - Touch-optimized interface
- 🔊 **Sound Effects** - Audio feedback for actions
- 🌍 **Cultural Heritage** - Traditional Southern African game

## 🛠️ Tech Stack

- **Framework:** Vite 6 + React 19
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **TypeScript:** Full type safety

## 📁 Project Structure

```
Morabaraba/
├── src/
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   ├── constants/      # Game constants
│   ├── App.tsx         # Main game component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/
│   ├── manifest.json   # PWA manifest
│   └── icons/          # App icons
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 📜 Rules Summary

### Board Layout
- 3 concentric squares connected by lines
- 24 intersection points (called "points")
- Each player starts with 12 cows

### Forming a Mill
- 3 cows in a row along any line
- When you form a mill, remove one opponent's cow
- Can't remove cows that are in a mill (unless all are)

### Movement
- **Placing:** Put cows on empty points
- **Moving:** Move to adjacent empty points
- **Flying:** With 3 cows, move to any empty point

### Winning Conditions
- Opponent has only 2 cows left
- Opponent has no legal moves
- (Optional) 50 moves without capture = draw

## 📜 Cultural Heritage

Morabaraba is a traditional two-player strategy game played in South Africa, Lesotho, and Botswana. It's a pastoral game where pieces are called "cows" (dikgomo), reflecting the deep connection between the people and their cattle.

The game was famously played at the Kingdom of Mapungubwe and is recognized by MSSA (Morabaraba, South African Sports Association).

## 🎓 Educational Value

- Strategic thinking
- Pattern recognition
- Planning ahead
- Cultural preservation

## 📄 License

Built with Ubuntu - African strategic brilliance.

---

**Master the herd!** 🎲🇿🇦
