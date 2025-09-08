# Campaign Proposals Feature

The Alumni Network Portal includes a comprehensive campaign proposals system that allows users to submit fundraising campaign ideas for admin review and approval.

## Overview

The campaign proposals feature enables:

-   **Users** to create and submit campaign proposals
-   **Admins** to review, approve, or reject proposals
-   **Donors** to contribute to approved campaigns
-   **Organizers** to track their proposal status

## How It Works

### 1. Campaign Status Flow

```
DRAFT → PENDING → APPROVED/REJECTED
```

-   **DRAFT**: Proposal saved but not submitted for review
-   **PENDING**: Submitted for admin review
-   **APPROVED**: Approved by admin, visible to donors
-   **REJECTED**: Rejected by admin with feedback

### 2. User Roles & Permissions

#### Regular Users (ALUMNI)

-   Create campaign proposals
-   Save drafts
-   Submit proposals for review
-   View their own proposals
-   Edit draft proposals

#### Admin Users

-   Review all pending proposals
-   Approve or reject proposals
-   Provide rejection feedback
-   View all campaigns regardless of status
-   Edit any campaign

## Using the System

### Web Interface

#### For Users:

1. Visit `/donations` page
2. Click "Create Campaign Proposal" button
3. Fill out the proposal form
4. Choose to save as draft or submit for review
5. View proposal status in `/dashboard/proposals`

#### For Admins:

1. Visit `/admin/donations` page
2. Review pending proposals in the "Campaign Proposals" tab
3. Click "Review" to approve/reject proposals
4. Provide feedback for rejections

### API Endpoints

#### Create Proposal

```http
POST /api/campaigns
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Campaign Title",
  "description": "Campaign description",
  "goalAmountCents": 500000,  // $5,000 in cents
  "endDate": "2025-12-31",
  "coverImage": "https://example.com/image.jpg",
  "isDraft": false  // true for draft, false for submission
}
```

#### Get Proposals (User)

```http
GET /api/campaigns?status=userOwned
Authorization: Bearer <token>
```

#### Get All Proposals (Admin)

```http
GET /api/campaigns?status=pending
Authorization: Bearer <admin_token>
```

#### Approve/Reject Proposal (Admin)

```http
PUT /api/campaigns/{id}/approve
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "action": "approve",  // or "reject"
  "rejectionReason": "Optional reason for rejection"
}
```

## Test Scripts

### Create Single Proposal

```bash
node create-campaign-proposal.js
```

Creates one test campaign proposal in PENDING status.

### Create Multiple Test Proposals

```bash
node create-test-campaign-proposals.js
```

Creates 5 test proposals with different statuses:

-   2 PENDING proposals
-   1 APPROVED proposal
-   1 DRAFT proposal
-   1 REJECTED proposal

### Manage Proposals (Approve/Reject)

```bash
node manage-campaign-proposals.js
```

Automatically approves the first pending proposal and rejects the second one.

## Database Schema

The `FundraisingCampaign` model includes:

-   `status`: DRAFT | PENDING | APPROVED | REJECTED
-   `approvedBy`: Admin user ID who approved/rejected
-   `approvedAt`: Timestamp of approval/rejection
-   `rejectionReason`: Feedback for rejected proposals
-   `isActive`: Whether the campaign is visible to donors

## Testing the Feature

1. **Create Test Data**:

    ```bash
    node create-test-campaign-proposals.js
    ```

2. **Test User Flow**:

    - Create account or use existing user
    - Visit `/donations` and create a proposal
    - Save as draft first, then submit for review
    - Check `/dashboard/proposals` to see status

3. **Test Admin Flow**:

    - Login as admin
    - Visit `/admin/donations`
    - Review and approve/reject pending proposals

4. **Test Donor Flow**:
    - Visit `/donations` to see approved campaigns
    - Make donations to active campaigns

## Key Components

### Frontend Components

-   `CampaignProposalForm`: Form for creating/editing proposals
-   `CampaignProposalManager`: Admin interface for managing proposals
-   `UserProposalsPage`: User dashboard for viewing their proposals

### API Routes

-   `/api/campaigns`: CRUD operations for campaigns
-   `/api/campaigns/[id]/approve`: Admin approval/rejection endpoint

## Best Practices

### For Proposal Creators

-   Provide detailed descriptions with clear impact goals
-   Set realistic funding goals based on campaign scope
-   Include compelling cover images
-   Consider campaign duration (typically 1-6 months)

### For Admins

-   Review proposals promptly
-   Provide constructive feedback for rejections
-   Consider community impact and feasibility
-   Ensure proposals align with organizational goals

### For Developers

-   Always check user permissions before operations
-   Validate input data thoroughly
-   Provide clear error messages
-   Log all approval/rejection actions

## Troubleshooting

### Common Issues

1. **"Authentication required" error**

    - Ensure user is logged in
    - Check token validity

2. **"Admin access required" error**

    - Verify user has ADMIN role
    - Check database user roles

3. **Proposals not showing up**

    - Check campaign status (only APPROVED are public)
    - Verify `isActive` flag is true
    - Check end date hasn't passed

4. **Cannot edit approved campaigns**
    - Approved campaigns are locked for editing
    - Create a new proposal for changes

### Database Queries

Check proposal counts by status:

```sql
SELECT status, COUNT(*) as count
FROM fundraising_campaigns
GROUP BY status;
```

Find pending proposals:

```sql
SELECT * FROM fundraising_campaigns
WHERE status = 'PENDING'
ORDER BY created_at DESC;
```
