# Onboarding Questionnaire Testing Guide

## Prerequisites

1. **Dev server running**:
   ```bash
   npm run dev
   ```

2. **Logged in** with a verified account

3. **Organization created** (or use onboarding to create one)

## Test URLs

- **New Onboarding**: http://localhost:3000/onboarding-new
- **Old Onboarding** (for comparison): http://localhost:3000/onboarding

## Test Data Sets

### Test 1: Manufacturing Facility

**Step 1: Organization**
- Name: `Acme Manufacturing Plant`
- Type: `Manufacturing`
- Size: `51-200`
- Employee Count: `125`
- Address: `123 Industrial Way`
- City: `Detroit`
- State: `MI`
- ZIP: `48201`

**Step 2: Facility**
- Square Footage: `50000`
- Floors: `1`
- Building Age: `25`
- Construction: `Steel Frame`
- ✓ Has Sprinklers
- ✓ Has Generator
- ✓ Has Security System
- Operating Hours: `24/7`
- ✓ 24/7 Operations
- Shifts: `3`

**Step 3: Assets**
- ✓ Has Collections
- Inventory Value: `High ($1M - $10M)`
- Critical Equipment:
  ```
  CNC Machine
  Forklift Fleet
  Injection Molding Press
  ```
- Critical Systems:
  ```
  HVAC System
  Compressed Air System
  Electrical Distribution
  ```
- Critical Data:
  ```
  Production Schedules
  Quality Control Records
  Customer Orders
  ```

**Step 4: Hazards**
- Select: Fire, Chemical, Power Outage, Explosion, Hazmat
- Custom Hazards: `Forklift accidents, Chemical spills`
- Risk Level: `High`
- ✓ Evacuation Plan exists
- ✓ Fire Plan exists

**Step 5: Team**
- Management: `15`
- Staff: `95`
- Contractors: `15`
- ✓ Has Emergency Team
- ✓ Accessibility Needs
- Details: `Wheelchair users in office area`
- Multilingual: `Spanish, Polish`
- Special Considerations:
  ```
  Chemical storage area with Class 1 flammables
  Heavy machinery requires lockout/tagout
  ```

**Step 6: Compliance**
- ✓ OSHA
- ✓ FEMA
- ✓ NFPA
- ✓ ISO 22301
- ✓ Insurance Requirements

---

### Test 2: Healthcare Facility

**Step 1: Organization**
- Name: `Riverside Medical Center`
- Type: `Healthcare`
- Size: `11-50`
- Employee Count: `35`
- City: `Portland`
- State: `OR`
- ZIP: `97201`

**Step 2: Facility**
- Square Footage: `8000`
- Floors: `2`
- ✓ Has Sprinklers
- ✓ Has Generator
- ✓ Has Security System
- Operating Hours: `7am-9pm, 7 days/week`

**Step 3: Assets**
- Skip (no special collections)

**Step 4: Hazards**
- Select: Fire, Medical Emergency, Power Outage, Flood, Active Shooter
- Risk Level: `High`

**Step 5: Team**
- Management: `5`
- Staff: `25`
- Contractors: `5`
- Visitors: `100` (daily patients)
- ✓ Accessibility Needs
- Details: `Non-ambulatory patients require assistance`
- Multilingual: `Spanish`
- Special Considerations:
  ```
  Medication refrigeration requires backup power
  X-ray equipment shutdown procedures
  ```

**Step 6: Compliance**
- ✓ OSHA
- ✓ HIPAA
- ✓ JCAHO
- ✓ FEMA

---

### Test 3: Office Building (Minimal Data)

**Step 1: Organization**
- Name: `Tech Startup HQ`
- Type: `Office`
- Size: `1-10`
- City: `Austin`
- State: `TX`

**Step 2: Facility**
- Floors: `3`
- ✓ Has Security System

**Step 3: Assets**
- Skip

**Step 4: Hazards**
- Select: Fire, Power Outage, Active Shooter
- Risk Level: `Medium`

**Step 5: Team**
- Staff: `8`

**Step 6: Compliance**
- ✓ OSHA

---

## Testing Checklist

### ✅ Step 1: Organization Info

- [ ] All fields render correctly
- [ ] Facility type selector shows all 10 types
- [ ] Clicking facility type updates selection
- [ ] "Other" type shows custom input field
- [ ] State field accepts 2-letter codes
- [ ] ZIP code validates format (12345 or 12345-6789)
- [ ] Required field validation works (name, type, size, city, state)
- [ ] "Next" button validates before proceeding

### ✅ Step 2: Facility Details

- [ ] Number inputs accept numeric values
- [ ] Construction dropdown populates
- [ ] Checkboxes toggle correctly
- [ ] 24/7 operations checkbox shows/hides shifts input
- [ ] Can proceed with minimal data
- [ ] Can proceed with full data

### ✅ Step 3: Collections/Assets

- [ ] "Has collections" checkbox toggles form visibility
- [ ] Inventory value dropdown works
- [ ] Textarea inputs parse line-by-line
- [ ] Can skip entirely (checkbox unchecked)
- [ ] Can provide full asset inventory

### ✅ Step 4: Hazard Assessment

- [ ] All 14 hazard types display with icons
- [ ] Location-based suggestions appear (for TX, CA, FL, etc.)
- [ ] Can select/deselect individual hazards
- [ ] "Select All" by category works
- [ ] Custom hazard input adds to list
- [ ] Custom hazards display as badges
- [ ] Risk level dropdown works
- [ ] Existing plans checkboxes work
- [ ] Validation requires at least 1 hazard

### ✅ Step 5: Team Structure

- [ ] All personnel count inputs work
- [ ] Emergency team checkbox works
- [ ] Accessibility checkbox shows/hides details textarea
- [ ] Multilingual input parses comma-separated values
- [ ] Special considerations textarea parses line-by-line

### ✅ Step 6: Compliance Needs

- [ ] All 7 compliance frameworks display
- [ ] Can select multiple frameworks
- [ ] Card highlights when selected
- [ ] Validation requires at least 1 framework
- [ ] Optional textareas work
- [ ] Insurance checkbox works

### ✅ Progress & Navigation

- [ ] Step indicator shows current step highlighted
- [ ] Completed steps show checkmarks
- [ ] Back button works (returns to previous step)
- [ ] Back button disabled on step 1
- [ ] Next button validates before proceeding
- [ ] Error messages display for validation failures
- [ ] Can navigate back/forward without losing data

### ✅ LocalStorage Persistence

- [ ] Progress saves automatically after each step
- [ ] Refreshing page restores progress
- [ ] Data persists across browser refresh
- [ ] "Clear Progress" button works
- [ ] Clear progress resets to step 1

### ✅ Step Indicator

- [ ] Shows all 6 steps
- [ ] Current step highlighted
- [ ] Completed steps show green checkmark
- [ ] Mobile progress bar shows percentage
- [ ] Mobile shows "Step X of 6"

### ✅ Final Submission

- [ ] "Generate Emergency Plan" button appears on step 6
- [ ] Button shows loading state when clicked
- [ ] Loading message displays during generation
- [ ] Error handling for failed API calls
- [ ] Success redirects to plan page (when API ready)

---

## Known Issues / Expected Behavior

### ✅ API Endpoint Created

The `/api/plans/generate` endpoint has been created and is ready for testing!

**Expected Behavior**:
- Validates user authentication
- Generates AI-powered ERP using Claude 4
- Saves plan to database
- Redirects to plan page

**Note**: You must have a valid Supabase session and organization membership for the API to work.

### ⚠️ Old vs New Onboarding

- **Old**: `/onboarding` - Simple single-step form (original)
- **New**: `/onboarding-new` - Multi-step questionnaire (just created)

For now, test at `/onboarding-new`. Once API is ready, we can replace the old one.

---

## Manual Testing Commands

```bash
# 1. Start dev server
npm run dev

# 2. Open browser to:
http://localhost:3000/onboarding-new

# 3. Complete the form with test data above

# 4. Check browser console for:
# - Validation errors
# - LocalStorage saves
# - API calls (will fail for now)

# 5. Check localStorage in DevTools:
# Application → Local Storage → http://localhost:3000
# Look for key: "onboarding_progress"
```

---

## Browser DevTools Checks

### Console

Should see:
```
[generateERP] Generating ERP for [Facility Name] ([type])
[generateERP] Model: claude-sonnet-4-20250514, Max tokens: 8000
```

### Network Tab

Final submission should attempt:
```
POST /api/plans/generate
```

### LocalStorage

Key: `onboarding_progress`

Value (example):
```json
{
  "allStepData": {
    "step1": { "name": "Acme...", ... },
    "step2": { ... },
    ...
  },
  "currentStep": 3,
  "completedSteps": [1, 2],
  "savedAt": "2025-10-24T..."
}
```

---

## Success Criteria

✅ **All 6 steps load without errors**
✅ **Can navigate forward/backward**
✅ **Validation works on each step**
✅ **Data persists in localStorage**
✅ **Progress indicator updates correctly**
✅ **All form inputs work as expected**
✅ **Location-based hazard suggestions appear**
✅ **Visual components (facility selector, hazard checklist) work**
✅ **Loading state shows when generating**
✅ **API endpoint exists and responds** (created, ready to test)
⏳ **Full end-to-end generation flow** (ready for browser testing)

---

## Next Steps After Testing

1. ✅ **Create `/api/plans/generate` endpoint** - COMPLETED
2. ✅ **Integrate with `generateERP()` function** - COMPLETED
3. ✅ **Save generated plan to database** - COMPLETED
4. ✅ **Redirect to plan display page** - COMPLETED
5. **Test end-to-end flow in browser** - READY TO TEST
6. **Create/update plan display pages** - Next step
7. **Replace old onboarding with new one** - After testing

---

## Troubleshooting

**Issue**: Page won't load
- Check: `npm run dev` is running
- Check: No TypeScript compilation errors

**Issue**: Validation not working
- Check: Browser console for errors
- Check: Zod schema matches form fields

**Issue**: localStorage not saving
- Check: Browser allows localStorage
- Check: Not in private/incognito mode

**Issue**: Hazard suggestions not appearing
- Check: State field is filled (2-letter code)
- Check: Step 1 data is saved

**Issue**: Can't proceed to next step
- Check: All required fields filled
- Check: Validation errors in console
- Check: Red error messages below fields

---

**Last Updated**: October 24, 2025
**Version**: 1.0.0 (First Release)
