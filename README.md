# SousBot

Your digital sous chef for small bakery management. SousBot simplifies order tracking and inventory management through LINE ChatBot and Facebook Messenger integration.

## 🎯 Purpose
SousBot acts as your reliable kitchen assistant, helping small bakery owners manage orders and inventory effortlessly. Just like a sous chef keeps the kitchen running smoothly, SousBot handles order collection, stock tracking, and daily summaries so you can focus on baking.

## ✨ Key Features
- 📋 Automated order collection from LINE and Facebook Messenger
- 📦 Real-time stock management
- 📊 Daily sales summaries
- 🗂️ Menu management
- 🚚 Delivery fee calculation

## 🛠️ Tech Stack
- Node.js/TypeScript
- Firebase
- LINE Messaging API
- Facebook Messenger API
- Vercel (Deployment)

## 🚀 MVP Status
Currently in development with focus on core features for small bakery operations. Free-tier ready with Firebase and Vercel.

## 📝 License
MIT License

Copyright (c) 2025 Panuphan Chaimanee

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Project structure
```
sousbot/
├── backend/                                  # Backend
│   ├── config/                               # Configuration files
│   │   └── environment.ts                    # Environment configuration
│   │   └── firebase.ts                       # Firebase configuration
│   ├── repositories/
│   │   └── firebase/
│   │       └── index.ts                      # Existing repository with Firebase operations
│   ├── services/
│   │   └── line/
│   │       └── index.ts                      # Existing LINE service
│   ├── types/
│   │   └── index.ts                          # Shared types
│   └── index.ts                              # Main Express app
├── frontend/                                 # Frontend
│   └── src/
│       └── app/
│           └── menu-management/              # Menu Management feature
│               └── [userId]/
│                   ├── page.tsx              # Menu Management page
│           └── order-management/             # Order Management feature
│               └── [userId]/
│                   ├── page.tsx              # Order Management page
│           └── register/             				# Register feature
│               └── [userId]/
│                   ├── page.tsx              # Register page
│           └── api/                          # Frontend API routes (proxies)
│               └── users/										# User-scoped routes
│                   ├── [userId]/
│                   │   └── products
│                   │       └── route.ts			# GET/POST products for user
│                   |       └── [productId]/
│                   |           └── route.ts	# GET/PATCH/DELETE specific product
│           └── components/                   # Shared components
│               └── ui/                       # UI components
│                   └── alert.tsx             # Alert component
│                   └── button.tsx            # Button component
│                   └── card.tsx              # Card component
│           └── lib/                          # Shared libraries
│               └── types/                    
│                   └── index.ts              # Shared types
```
