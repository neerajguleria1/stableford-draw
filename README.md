# ImpactHub - Transparent Charity Platform
**Live Demo:** [https://stableford-draw.vercel.app/]

A modern, full-stack web application built with Next.js 15, TypeScript, and Tailwind CSS. ImpactHub empowers donors to see exactly where their money goes and the real-world impact it creates through radical transparency.

## 🚀 Features

- **Modern Dark Theme** with glassmorphism design
- **Real-time Campaign Tracking** with progress visualization
- **Transparent Impact Metrics** showing measurable results
- **Secure Authentication** with Supabase
- **Stripe Integration** for donations
- **User Profiles** with impact tracking
- **Admin Dashboard** for campaign management
- **Responsive Design** for all devices
- **Smooth Animations** with Framer Motion
- **State Management** with Zustand
- **Type-Safe Forms** with React Hook Form + Zod

## 🛠️ Tech Stack

- **Frontend Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom CSS
- **UI Components:** shadcn/ui + Custom components
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Backend/Auth:** Supabase
- **Payments:** Stripe
- **Icons:** Lucide React

## 📁 Project Structure

```
.
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── campaigns/                # Campaign pages
│   │   ├── page.tsx             # Campaigns list
│   │   └── [id]/page.tsx        # Campaign detail
│   ├── dashboard/                # User dashboard
│   │   ├── page.tsx             # Main dashboard
│   │   ├── profile/             # Profile settings
│   │   ├── impact/              # Impact view
│   │   └── history/             # Donation history
│   ├── admin/                    # Admin pages
│   ├── about/                    # About page
│   ├── impact/                   # Impact page
│   ├── privacy/                  # Privacy policy
│   ├── terms/                    # Terms of service
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── dialog.tsx
│   │   └── progress.tsx
│   ├── layout/                  # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── providers/               # Context providers
│   │   └── AuthProvider.tsx
│   ├── campaign/                # Campaign components
│   │   └── CampaignCard.tsx
│   └── landing/                 # Landing page components
│       └── HeroSection.tsx
├── lib/                          # Utility functions
│   ├── supabase.ts             # Supabase client
│   ├── utils.ts                # Helper functions
│   └── store/                  # Zustand stores
│       ├── auth.ts
│       └── campaign.ts
├── services/                     # API services
│   ├── auth.ts
│   ├── campaign.ts
│   └── payment.ts
├── types/                        # TypeScript types
│   ├── auth.ts
│   ├── campaign.ts
│   ├── payment.ts
│   └── index.ts
├── public/                       # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── postcss.config.mjs
└── .env.local.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Stripe account

### Installation

1. **Clone and install dependencies**
   ```bash
   cd charity-impact-platform
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Fill in your credentials in `.env.local`**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎨 Design Features

### Color Palette
- **Primary:** Purple gradient (#8B5CF6 to #EC4899)
- **Secondary:** Blue (#3B82F6)
- **Background:** Deep navy (#0A0E08)
- **Glass:** Frosted glass effect with rgba colors
- **Accent:** Vibrant purple (#7C3AED)

### Design Elements
- Glassmorphism cards with backdrop blur
- Gradient text effects
- Smooth animations and transitions
- Neon glow effects on hover
- Responsive grid layouts
- Dark theme optimized for eye comfort

## 📱 Pages Included

### Public Pages
- **Home** - Landing page with hero section and features
- **Campaigns** - Browse and search all campaigns
- **Campaign Detail** - View campaign details and donate
- **Impact** - Global impact statistics and stories
- **About** - About the platform and team
- **Privacy** - Privacy policy
- **Terms** - Terms of service

### Authenticated Pages
- **Dashboard** - User dashboard with stats and quick actions
- **Profile** - Edit profile and account settings
- **Impact View** - Personal impact tracking
- **Donation History** - View all donations and export

### Admin Pages
- **Admin Dashboard** - Manage campaigns, users, and platform

## 🔐 Authentication

Uses Supabase Authentication with:
- Email/password signup and login
- Session management
- User profiles
- Role-based access control

## 💳 Payment Integration

Stripe integration for:
- One-time donations
- Payment processing
- Invoice generation
- Subscription management

## 📊 State Management

Zustand stores for:
- **Auth Store** - User authentication and session
- **Campaign Store** - Campaign data and operations

## 🎯 Form Validation

React Hook Form with Zod for:
- Input validation
- Error handling
- Type-safe forms
- Custom validation rules

## 🚀 Deployment

Ready to deploy on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS**
- **Docker containers**

```bash
npm run build
npm run start
```

## 📝 Development

### Format Code
```bash
npm run lint
```

### Type Check
```bash
npm run type-check
```

### Build for Production
```bash
npm run build
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 💡 Future Enhancements

- [ ] Social sharing features
- [ ] Email notifications
- [ ] API webhooks
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Multilingual support
- [ ] Blockchain transparency
- [ ] Advanced impact reporting

## 🆘 Support

For support, email hello@impacthub.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with Next.js, TypeScript, and Tailwind CSS
- UI components from shadcn/ui and Radix UI
- Icons from Lucide React
- Animations powered by Framer Motion
- Database and auth by Supabase
