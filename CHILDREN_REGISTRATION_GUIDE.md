# Children Registration System - Complete Guide

## Overview

Parents can now register and manage their children's profiles. Each child is stored in a separate `children` collection in Firebase and linked to their parent.

## What Was Created

### 1. Firebase Service (`firebase/children.ts`)

**TypeScript interface:**
```typescript
export interface Child {
  id?: string;
  name: string;
  age: number;
  gender: string;
  gradeLevel: string;
  parentId: string;
  parentEmail: string;
  createdAt: string;
  updatedAt?: string;
}
```

**Functions:**
- `getAllChildren()` - Get all children
- `getChildById(childId)` - Get specific child
- `getChildrenByParentId(parentId)` - Get children by parent ID
- `getChildrenByParentEmail(parentEmail)` - Get children by parent email
- `addChild(childData)` - Register new child
- `updateChild(childId, childData)` - Update child info
- `deleteChild(childId)` - Remove child

### 2. Children Management Page (`app/parent/children/page.tsx`)

**Features:**
- ✅ View all registered children
- ✅ Add new child
- ✅ Edit existing child
- ✅ Delete child
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

**Form Fields:**
- **Name** - Full name (text input)
- **Age** - Age in years (number input, 1-18)
- **Gender** - Male/Female/Other (dropdown)
- **Grade Level** - Preschool through Grade 12 (dropdown)

### 3. Updated Parent Dashboard

Added links to children management:
- "Manage" button in Children section
- "Manage Children" in Quick Actions

## Firebase Structure

### Children Collection

```
firestore/
└── children/
    └── {childId}/
        ├── name: "Emily Johnson"
        ├── age: 12
        ├── gender: "Female"
        ├── gradeLevel: "Grade 7"
        ├── parentId: "parent_abc123"
        ├── parentEmail: "parent@example.com"
        ├── createdAt: "2024-01-15T10:00:00.000Z"
        └── updatedAt: "2024-01-15T10:00:00.000Z"
```

## How to Use

### For Parents

#### 1. Register a Child

1. Go to `/parent/children` or click "Manage Children" from dashboard
2. Click "Add Child" button
3. Fill in the form:
   - **Name**: Enter child's full name
   - **Age**: Enter age (1-18)
   - **Gender**: Select from dropdown
   - **Grade Level**: Select from dropdown
4. Click "Register Child"
5. Child is saved to Firebase and appears in the list

#### 2. Edit a Child

1. Go to children page
2. Click "Edit" button on child card
3. Update the information
4. Click "Update Child"
5. Changes are saved to Firebase

#### 3. Remove a Child

1. Go to children page
2. Click "Remove" button on child card
3. Confirm deletion
4. Child is removed from Firebase

## User Flow

```
Parent Dashboard
    ↓
Click "Manage Children"
    ↓
Children Management Page
    ↓
Click "Add Child"
    ↓
Fill Registration Form
    ↓
Submit Form
    ↓
Validate Data
    ↓
Save to Firebase
    ↓
Show Success Message
    ↓
Reload Children List
```

## Code Examples

### Register a Child

```typescript
const { addChild } = await import("@/firebase/children")

const childData = {
  name: "Emily Johnson",
  age: 12,
  gender: "Female",
  gradeLevel: "Grade 7",
  parentId: user.id,
  parentEmail: user.email,
  createdAt: new Date().toISOString(),
}

const childId = await addChild(childData)
console.log('Child registered with ID:', childId)
```

### Get Parent's Children

```typescript
const { getChildrenByParentId } = await import("@/firebase/children")

const children = await getChildrenByParentId(parentId)
console.log('Children:', children)
```

### Update Child

```typescript
const { updateChild } = await import("@/firebase/children")

await updateChild(childId, {
  name: "Emily Rose Johnson",
  age: 13,
  gradeLevel: "Grade 8"
})
```

### Delete Child

```typescript
const { deleteChild } = await import("@/firebase/children")

await deleteChild(childId)
```

## Form Validation

### Required Fields
- ✅ Name (must not be empty)
- ✅ Age (must be 1-18)
- ✅ Gender (must select one)
- ✅ Grade Level (must select one)

### Grade Level Options
- Preschool
- Kindergarten
- Grade 1 through Grade 12

### Gender Options
- Male
- Female
- Other

## Console Logs

When registering a child:
```
💾 Saving child to Firebase...
Child data: {
  name: "Emily Johnson",
  age: 12,
  gender: "Female",
  gradeLevel: "Grade 7",
  parentId: "parent_123",
  parentEmail: "parent@example.com"
}
✅ Child registered with ID: child_abc123
```

## Toast Notifications

### Success Messages
- "Child Registered" - When new child is added
- "Child Updated" - When child info is updated
- "Child Removed" - When child is deleted

### Error Messages
- "Validation Error" - When required fields are missing
- "Error" - When Firebase operation fails

## Testing Checklist

- [ ] Parent can access children page
- [ ] "Add Child" button shows form
- [ ] Form validates required fields
- [ ] Can register new child
- [ ] Child appears in Firebase
- [ ] Child appears in list
- [ ] Can edit existing child
- [ ] Changes save to Firebase
- [ ] Can delete child
- [ ] Child removed from Firebase
- [ ] Toast notifications work
- [ ] Loading states work
- [ ] Error handling works

## Database Queries

### Get all children for a parent
```typescript
const children = await getChildrenByParentId(parentId)
```

### Get children by parent email
```typescript
const children = await getChildrenByParentEmail(parentEmail)
```

### Get specific child
```typescript
const child = await getChildById(childId)
```

## Security Considerations

### Current Implementation
- Children are linked to parent via `parentId` and `parentEmail`
- Only the logged-in parent can see their children
- Parent ID is taken from authenticated user

### For Production
Add Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /children/{childId} {
      // Parents can read their own children
      allow read: if request.auth != null && 
        resource.data.parentId == request.auth.uid;
      
      // Parents can create children
      allow create: if request.auth != null && 
        request.resource.data.parentId == request.auth.uid;
      
      // Parents can update their own children
      allow update: if request.auth != null && 
        resource.data.parentId == request.auth.uid;
      
      // Parents can delete their own children
      allow delete: if request.auth != null && 
        resource.data.parentId == request.auth.uid;
    }
  }
}
```

## Next Steps

### Enhancements
1. **Add photos** - Upload child profile pictures
2. **Add notes** - Special needs, interests, learning style
3. **Add subjects** - Subjects the child needs help with
4. **Link to bookings** - Show which child each booking is for
5. **Progress tracking** - Track learning progress per child
6. **Reports** - Generate progress reports

### Integration with Bookings
When creating a booking, allow parent to select which child:

```typescript
const booking = {
  parentId: user.id,
  childId: selectedChild.id,
  childName: selectedChild.name,
  tutorId: tutor.id,
  subject: "Math",
  // ... other booking data
}
```

## File Structure

```
app/
└── parent/
    └── children/
        └── page.tsx          ← Children management page

firebase/
└── children.ts               ← Firebase service

Documentation/
└── CHILDREN_REGISTRATION_GUIDE.md  ← This file
```

## API Reference

### addChild(childData)
Registers a new child in Firebase.

**Parameters:**
- `childData` - Child object without ID

**Returns:**
- `string` - New child ID

**Example:**
```typescript
const childId = await addChild({
  name: "Emily",
  age: 12,
  gender: "Female",
  gradeLevel: "Grade 7",
  parentId: "parent_123",
  parentEmail: "parent@example.com",
  createdAt: new Date().toISOString()
})
```

### getChildrenByParentId(parentId)
Gets all children for a specific parent.

**Parameters:**
- `parentId` - Parent's user ID

**Returns:**
- `Child[]` - Array of children

**Example:**
```typescript
const children = await getChildrenByParentId("parent_123")
```

### updateChild(childId, childData)
Updates child information.

**Parameters:**
- `childId` - Child's document ID
- `childData` - Partial child object with fields to update

**Returns:**
- `void`

**Example:**
```typescript
await updateChild("child_123", {
  age: 13,
  gradeLevel: "Grade 8"
})
```

### deleteChild(childId)
Removes a child from Firebase.

**Parameters:**
- `childId` - Child's document ID

**Returns:**
- `void`

**Example:**
```typescript
await deleteChild("child_123")
```

---

**Status:** ✅ Children registration system complete and integrated!

**Access:** `/parent/children`
