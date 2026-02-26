# Quick Reference Guide - CarpetClean Pro

## 🚀 Quick Start

```bash
# Development
npm install
npm run dev

# Production
npm run build
npm start
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── clients/      # Client management
│   │   ├── orders/       # Order management
│   │   ├── delivery/     # Delivery operations
│   │   ├── operations/   # Operations management
│   │   └── settings/     # Settings API
│   ├── approve/          # Approval pages
│   ├── data/             # Data review
│   ├── delivery/         # Delivery dashboard
│   ├── operations/       # Operations dashboard
│   └── repair/           # Repair dashboard
├── components/           # React components
├── hooks/                # Custom React hooks
└── lib/                  # Utilities
    ├── prisma.ts         # Database client
    ├── types.ts          # TypeScript types
    ├── constants.ts      # App constants
    └── logger.ts         # Logging utility
```

---

## 🔑 Key Features

### 1. Order Management
- **Intake:** Create new orders with client info
- **Operations:** Measure carpets, calculate costs
- **Repair:** Estimate repair costs for damaged items
- **Delivery:** Optimize routes, complete deliveries

### 2. Client Management
- Create and edit clients
- Track client history
- Individual client tracking per carpet

### 3. Approval System
- Separate cleaning and repair approvals
- Email/SMS approval links
- Status tracking (pending/approved/rejected)

### 4. Pricing System
- Material-based pricing (Wool, Silk, Cotton, Synthetic, Other)
- Configurable rates in settings
- Automatic cost calculation

### 5. Route Optimization
- AI-powered route optimization
- Postal code-based distance calculation
- Numbered delivery sequence

---

## 🗄️ Database Schema

### Main Tables
- **Client:** Customer information
- **Order:** Order header with approval status
- **CarpetItem:** Individual carpet details
- **Settings:** Application configuration

### Key Relationships
- Client → Orders (one-to-many)
- Order → CarpetItems (one-to-many)

---

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL=          # Supabase pooled connection
DIRECT_URL=            # Supabase direct connection
OCR_SPACE_API_KEY=     # OCR API key
NODE_ENV=              # development | production
```

### Settings (Configurable in UI)
- Material pricing rates
- Repair hourly rate
- Tax rate
- Currency
- Email SMTP settings

---

## 📊 Workflow

### Order Flow
1. **Intake** → Create order with client
2. **Operations** → Measure carpets, calculate cleaning costs
3. **Repair** (if needed) → Add repair estimates
4. **Approval** → Send estimates to client
5. **Delivery** → Optimize route, complete delivery

### Approval Flow
1. Enable "Approval Flow" checkbox
2. Add measurements/estimates
3. Click "Send Cleaning" or "Send Repair"
4. Status changes to "Pending"
5. Client approves/rejects via link
6. Status updates to "Approved" or "Rejected"

---

## 🎨 UI Components

### Dashboards
- **OperationsDashboard:** Measurement and cleaning
- **RepairDashboard:** Repair estimates
- **DeliveryDashboard:** Route optimization and delivery
- **DataReviewDashboard:** Data export and analysis

### Forms
- **DeliveryForm:** Order intake
- **RugDetailForm:** Carpet measurement
- **RepairEstimateForm:** Repair cost estimation
- **SignaturePad:** Digital signatures

---

## 🔐 Security Notes

### ✅ Implemented
- Prisma ORM (SQL injection protection)
- Environment variable protection
- Input validation on API routes
- Error handling

### ⚠️ Not Implemented (Recommended)
- Authentication/Authorization
- Rate limiting
- CORS configuration
- Session management

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create new order
- [ ] Add client information
- [ ] Measure carpets
- [ ] Calculate costs
- [ ] Send approval
- [ ] Approve/reject estimate
- [ ] Optimize delivery route
- [ ] Complete delivery

### Automated Testing (Not Implemented)
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright
- API tests: Supertest

---

## 📈 Performance Tips

### Database
- Use pagination for large datasets
- Add indexes for frequently queried fields
- Monitor slow queries in Supabase

### Frontend
- Use SWR or React Query for data fetching
- Implement lazy loading for images
- Code splitting for large components

### Backend
- Implement caching for settings
- Use connection pooling (already configured)
- Monitor API response times

---

## 🐛 Common Issues & Solutions

### Issue: Database connection fails
**Solution:** Check DATABASE_URL and DIRECT_URL in .env

### Issue: Prisma client not found
**Solution:** Run `npx prisma generate`

### Issue: Build fails
**Solution:** Run `npm run lint` and fix errors

### Issue: Settings not saving
**Solution:** Ensure Settings table migration is run

---

## 📞 API Endpoints

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders/update` - Update order
- `GET /api/orders/next-id` - Get next order ID

### Clients
- `GET /api/clients` - List all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/[id]` - Update client

### Delivery
- `GET /api/delivery/ready` - Get ready orders
- `POST /api/delivery/optimize-route` - Optimize route
- `POST /api/delivery/complete` - Complete delivery

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

---

## 🎯 Best Practices

### Code
- Use TypeScript types from `src/lib/types.ts`
- Use constants from `src/lib/constants.ts`
- Use logger from `src/lib/logger.ts` instead of console.log
- Handle errors consistently

### Database
- Always use Prisma for queries
- Include related data with `include`
- Use transactions for multi-step operations

### UI
- Keep components focused and small
- Use proper loading states
- Show user feedback for actions
- Handle errors gracefully

---

## 📚 Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

---

## 🆘 Need Help?

1. Check `AUDIT_REPORT.md` for detailed analysis
2. Check `DEPLOYMENT_CHECKLIST.md` for deployment steps
3. Review error logs in Vercel dashboard
4. Check database logs in Supabase dashboard

---

**Last Updated:** February 26, 2026
