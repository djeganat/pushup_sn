# 🚀 Block 01 Deployment Guide

## Overview
This guide will walk you through deploying **Block 01: Application Shell** to your ServiceNow instance.

## ⏱️ Estimated Time
5-10 minutes

## ✅ Pre-Deployment Checklist
- [ ] ServiceNow instance URL: _____________________
- [ ] Admin credentials available
- [ ] Studio access confirmed
- [ ] Git repository set up (if using source control)

---

## 📥 Deployment Method 1: Studio Source Control (Recommended)

### Step 1: Prepare Your Git Repository
```bash
# Clone this repository
git clone https://github.com/djeganat/pushup_sn.git
cd pushup_sn

# Copy Block 01 files to your ServiceNow-linked Git repo
cp -r block-01-app-shell/src/* /path/to/your/servicenow/repo/
```

### Step 2: Import to ServiceNow
1. Open ServiceNow Studio
2. Navigate to: **File → Import From Source Control**
3. Select your repository and branch
4. Wait for import to complete
5. Refresh the application list

---

## 📥 Deployment Method 2: Manual Creation

### Step 1: Create the Application
1. Log into your ServiceNow instance
2. Navigate to: **System Applications → Studio**
3. Click **"Create Application"**
4. Fill in the form:
   - **Name**: `FitChallenge`
   - **Scope**: `x_fitchal_fitness`
   - **Version**: `1.0.0`
   - **Description**: `Gamified fitness tracking application with XP, badges, streaks, and challenges`
   - **License Model**: `Use with Subscription`
5. Click **"Create"**
6. Note the generated `sys_id` for your records

### Step 2: Verify Scope
1. In Studio, check the top-left corner shows: **x_fitchal_fitness**
2. The application should now appear in your application list

---

## 📥 Deployment Method 3: XML Import

### Step 1: Navigate to Update Sets
1. Go to: **System Update Sets → Retrieved Update Sets**
2. Click **"Import Update Set from XML"**

### Step 2: Import Application XML
1. Open file: `block-01-app-shell/src/sys_app/x_fitchal_fitness.xml`
2. Copy the entire XML content
3. Paste into the import field
4. Click **"Upload"**

### Step 3: Preview and Commit
1. Open the imported update set
2. Click **"Preview Update Set"**
3. Resolve any conflicts (there shouldn't be any for Block 01)
4. Click **"Commit Update Set"**

---

## ✅ Validation Steps

### Run the Validation Script
1. Navigate to: **System Definition → Scripts - Background**
2. Open the file: `block-01-app-shell/VALIDATE.js`
3. Copy the entire script
4. Paste into the "Run script" field
5. Click **"Run script"**

### Expected Results
You should see output like:

```
═══════════════════════════════════════════════════════════
   BLOCK 01: APPLICATION SHELL - VALIDATION
═══════════════════════════════════════════════════════════

✅ PASS: Application "x_fitchal_fitness" exists
✅ PASS: Application name is "FitChallenge"
✅ PASS: Version is 1.0.x (1.0.0)
✅ PASS: Scope is correctly formatted "x_fitchal_fitness"
✅ PASS: Scope is accessible for queries

═══════════════════════════════════════════════════════════
   ✅ BLOCK 01 VALIDATION PASSED - Proceed to Block 02
═══════════════════════════════════════════════════════════
```

### If Validation Fails
Check the following:
- [ ] Application was created successfully
- [ ] Scope name is exactly `x_fitchal_fitness` (no typos)
- [ ] Application name is `FitChallenge`
- [ ] Version number is `1.0.0`

---

## 🔍 Post-Deployment Verification

### Verify in Studio
1. Open Studio
2. Select the **FitChallenge** application
3. Confirm you can see:
   - Application name in the top-left
   - Scope: `x_fitchal_fitness`
   - Version: `1.0.0`

### Verify in Application List
1. Navigate to: **System Applications → Applications**
2. Search for `FitChallenge`
3. Open the application record
4. Verify all fields match the specification

### Verify Scope Accessibility
1. Go to: **System Definition → Tables**
2. Try to create a test table with prefix `x_fitchal_fitness_`
3. If you can see the scope option, validation is successful
4. (Don't actually create the test table - we'll do that in Block 02)

---

## 📸 Screenshots Checklist

Capture these screenshots for your documentation:
- [ ] Studio showing FitChallenge application
- [ ] Validation script output (all green checkmarks)
- [ ] Application record in sys_app table
- [ ] Source control properties (if using Git)

---

## 🐛 Troubleshooting

### Issue: "Scope already exists"
**Solution**: 
- Check if someone already created an app with this scope
- Either delete the existing app or use a different scope name
- Update all references if you change the scope

### Issue: "Permission denied"
**Solution**:
- Ensure you have admin role
- Check if your user has Studio access
- Verify license allows scoped application creation

### Issue: "Import failed"
**Solution**:
- Verify XML file syntax is correct
- Check ServiceNow instance version compatibility
- Review System Logs for detailed error messages

### Issue: Validation script doesn't run
**Solution**:
- Ensure you're in the **Scripts - Background** module
- Check for JavaScript syntax errors
- Verify you have script execution permissions

---

## ✨ Success Criteria

You can proceed to Block 02 when:
- ✅ All validation tests pass
- ✅ Application appears in Studio
- ✅ Scope is accessible
- ✅ No error messages in System Logs
- ✅ Screenshots captured
- ✅ Git commit made (if using source control)

---

## ➡️ Next Steps

Once Block 01 validation passes:
1. ✅ Mark Block 01 as "DEPLOYED" in the main README
2. ✅ Commit changes to Git:
   ```bash
   git add .
   git commit -m "Deploy Block 01: Application Shell"
   git push origin main
   ```
3. ✅ Proceed to **Block 02: Tables**
4. Read: `block-02-tables/PROMPT.md`

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review ServiceNow System Logs: **System Logs → System Log → All**
3. Search ServiceNow Community forums
4. Create an issue in this GitHub repository

---

**Deployment Time**: _____ minutes

**Deployed By**: _____________________

**Date**: _____________________

**Validation Status**: ⬜ PASSED / ⬜ FAILED

**Notes**: 
_______________________________________
_______________________________________
_______________________________________
