# Level 2 — Intermediate (Codveda Full-Stack)

## Tasks completed (2)
1. **Task 2: Authentication and Authorization**
   - Signup / Login with bcrypt password hashing
   - JWT tokens stored in localStorage
   - Protected product write routes
   - Role-based delete (admin only)
   - Separate `login.html` page

2. **Task 3: Database Integration**
   - MySQL locally + Sequelize ORM
   - Models: `User`, `Product`
   - Relationship: User hasMany Products
   - Validation + indexes
   - Tables named `users_codveda` / `products_codveda` (safe shared DB)

## Demo accounts
- Admin: `admin@coveda.test` / `admin123`
- User can signup from login page

## Key files
- `level-1/rest-api/routes/auth.js`
- `level-1/rest-api/middleware/auth.js`
- `level-1/rest-api/models/`
- `level-1/frontend/login.html`
