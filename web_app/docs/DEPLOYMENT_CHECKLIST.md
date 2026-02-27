# Deployment Checklist for CarpetClean Pro

## Pre-Deployment Tasks

### 1. Security & Dependencies
- [ ] Run `npm audit fix` to fix security vulnerabilities
- [ ] Update all dependencies to latest stable versions
- [ ] Review and rotate any exposed credentials
- [ ] Ensure `.env` is in `.gitignore` and not committed

### 2. Database
- [ ] Run Settings table migration in Supabase SQL Editor:
  ```sql
  -- Copy contents from prisma/migrations/update_settings_pricing.sql
  ```
- [ ] Verify all tables exist and have proper indexes
- [ ] Test database connection from production environment
- [ ] Set up automated database backups in Supabase

### 3. Environment Variables
Set these in Vercel/your hosting platform:
```
DATABASE_URL=<your_supabase_pooled_connection>
DIRECT_URL=<your_supabase_direct_connection>
OCR_SPACE_API_KEY=<your_ocr_api_key>
NODE_ENV=production
```

### 4. Code Quality
- [ ] Remove all `console.log` statements (or replace with logger)
- [ ] Run TypeScript type check: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Test build locally: `npm run build`
- [ ] Test production build: `npm start`

### 5. Testing
- [ ] Test complete order flow (intake → operations → delivery)
- [ ] Test approval flow (cleaning and repair estimates)
- [ ] Test client management (create, edit, view)
- [ ] Test route optimization
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)

### 6. Performance
- [ ] Check bundle size: `npm run build` (review .next/analyze)
- [ ] Test page load times
- [ ] Verify images are optimized
- [ ] Check database query performance

### 7. Vercel Deployment
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`
- [ ] Add environment variables in Vercel dashboard
- [ ] Enable automatic deployments from main branch
- [ ] Set up preview deployments for pull requests

### 8. Post-Deployment
- [ ] Verify production URL is accessible
- [ ] Test all features in production
- [ ] Check error logs in Vercel dashboard
- [ ] Monitor database connections in Supabase
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure custom domain (if applicable)
- [ ] Set up SSL certificate (automatic with Vercel)

### 9. Documentation
- [ ] Update README.md with production URL
- [ ] Document environment variables
- [ ] Create user guide for team members
- [ ] Document backup and recovery procedures

### 10. Monitoring & Maintenance
- [ ] Set up error tracking (Sentry recommended)
- [ ] Enable Vercel Analytics
- [ ] Schedule weekly database backups
- [ ] Set up alerts for downtime
- [ ] Create maintenance schedule

## Quick Deploy Commands

```bash
# 1. Fix vulnerabilities
npm audit fix

# 2. Type check
npx tsc --noEmit

# 3. Lint
npm run lint

# 4. Build test
npm run build

# 5. Test production locally
npm start

# 6. Deploy to Vercel (if using Vercel CLI)
vercel --prod
```

## Rollback Plan

If deployment fails:
1. Revert to previous Vercel deployment in dashboard
2. Check error logs in Vercel
3. Verify database connection
4. Check environment variables
5. Test locally with production environment variables

## Support Contacts

- **Database Issues:** Supabase Support
- **Hosting Issues:** Vercel Support
- **OCR Issues:** OCR.space Support

## Success Criteria

✅ Application loads without errors  
✅ All pages are accessible  
✅ Database operations work correctly  
✅ Orders can be created and processed  
✅ Approval system functions properly  
✅ Mobile responsive design works  
✅ No console errors in browser  
✅ Performance is acceptable (<3s page load)  

---

**Last Updated:** February 26, 2026  
**Deployment Status:** Ready for Production
