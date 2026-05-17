# Security Specification for ZONA PRESTASI YUMARIS

## Data Invariants
1. A user profile (`/users/{uid}`) must be created by the user themselves or an admin.
2. Only Admins can create, update, or delete categories, materials, and quizzes.
3. Students can read categories, materials, and quizzes.
4. Students can only create their own quiz submissions.
5. Students can only read their own quiz submissions and progress.
6. Progress records must be created and updated by the student for themselves.

## The Dirty Dozen Payloads (Target: Permission Denied)
1. **Student Create Material**: A student attempts to create a new learning material document.
2. **Student Delete Material**: A student attempts to delete a material.
3. **Student Update Role**: A student attempts to update their own role from 'student' to 'admin'.
4. **Student Read Others PII**: A student attempts to read another user's profile information.
5. **Student Modify Quiz**: A student attempts to change the correct answer in a quiz document.
6. **Student Spoof Submission**: A student attempts to create a quiz submission for another student.
7. **Unauthenticated Read**: A visitor who hasn't logged in attempts to list materials.
8. **Student Inject Junk ID**: A student attempts to create a progress record with a 50kb string as an ID.
9. **Student Overwrite Admin**: A student attempts to overwrite the admin's profile document.
10. **Student Skip Status**: A student attempts to update a finished quiz submission.
11. **Student Change Submissions**: A student attempts to update their score in an existing submission.
12. **Student Spoof Timestamp**: A student attempts to set a `createdAt` value in the past.

## Security Rule Draft (Logical Helpers)
- `isAdmin()`: Check if `request.auth.uid` is in an `admins` collection (or check a specific trusted doc).
- `isOwner(userId)`: `request.auth.uid == userId`.
- `isValidUser(data)`: Validates user fields + `uid` matching.
- `isValidMaterial(data)`: Validates material schema.
