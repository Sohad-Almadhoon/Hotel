# Git Setup and Workflow Guide

## Initial Repository Setup

### 1. Initialize Git Repository

```bash
cd "c:\Users\Eng Sohad\Desktop\shahd"
git init
```

### 2. Configure Git User (if not already done)

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. Stage All Files

```bash
git add .
```

### 4. Create Initial Commit

```bash
git commit -m "Initial commit: Room Booking Management System

Features:
- User authentication with JWT
- Role-based access control (Owner, Guest, Admin)
- Room management with CRUD operations
- Booking system with overlap prevention
- Admin dashboard with statistics
- Complete API documentation (Swagger)
- Postman collection for testing
- Comprehensive error handling and validation"
```

## Connecting to Remote Repository

### Option 1: GitHub

```bash
# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/room-booking-backend.git
git branch -M main
git push -u origin main
```

### Option 2: GitLab

```bash
git remote add origin https://gitlab.com/yourusername/room-booking-backend.git
git branch -M main
git push -u origin main
```

### Option 3: Bitbucket

```bash
git remote add origin https://bitbucket.org/yourusername/room-booking-backend.git
git branch -M main
git push -u origin main
```

## Recommended Commit Message Format

Use conventional commits for better version control:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Adding a new feature
git commit -m "feat(booking): add email notification on booking confirmation"

# Fixing a bug
git commit -m "fix(auth): resolve token expiration issue"

# Documentation update
git commit -m "docs(api): update Swagger documentation for room endpoints"

# Refactoring
git commit -m "refactor(controllers): improve error handling in bookingController"
```

## Branching Strategy

### Main Branches
- `main`: Production-ready code
- `develop`: Development branch

### Feature Branches
```bash
# Create a new feature branch
git checkout -b feature/booking-notifications

# Work on your feature...
git add .
git commit -m "feat(notifications): implement email notifications"

# Push to remote
git push -u origin feature/booking-notifications

# After review, merge to develop
git checkout develop
git merge feature/booking-notifications
```

### Branch Naming Conventions
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent fixes for production
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

Examples:
- `feature/add-payment-gateway`
- `bugfix/fix-overlap-detection`
- `hotfix/security-patch`
- `docs/update-api-guide`

## Useful Git Commands

### Check Status
```bash
git status
```

### View Commit History
```bash
git log --oneline --graph --all
```

### View Changes
```bash
# Unstaged changes
git diff

# Staged changes
git diff --staged
```

### Undo Changes
```bash
# Discard changes in working directory
git checkout -- filename

# Unstage file
git reset HEAD filename

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Working with Branches
```bash
# List branches
git branch -a

# Switch branch
git checkout branch-name

# Create and switch
git checkout -b new-branch

# Delete branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

### Stashing Changes
```bash
# Save changes temporarily
git stash

# List stashes
git stash list

# Apply last stash
git stash apply

# Apply and remove stash
git stash pop
```

### Tags (for versioning)
```bash
# Create a tag
git tag -a v1.0.0 -m "Version 1.0.0 - Initial Release"

# Push tags
git push origin --tags

# List tags
git tag -l
```

## .gitignore File

The project already includes a `.gitignore` file. Key ignored items:

```
node_modules/     # Dependencies
.env              # Environment variables
*.log             # Log files
.DS_Store         # macOS files
dist/             # Build output
build/            # Build output
coverage/         # Test coverage
.vscode/          # Editor settings
```

## GitHub Repository Setup (Recommended)

### 1. Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `room-booking-backend`
3. Description: "Backend API for room booking management system with role-based access control"
4. Keep it Public or Private
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"

### 2. Push to GitHub

```bash
git remote add origin https://github.com/yourusername/room-booking-backend.git
git branch -M main
git push -u origin main
```

### 3. Add Repository Topics (on GitHub)

Click "Add topics" and add:
- `nodejs`
- `express`
- `prisma`
- `postgresql`
- `jwt-authentication`
- `booking-system`
- `rest-api`
- `swagger`

### 4. Add Description and Website

- Description: "Room booking management system with role-based access control"
- Website: Link to deployed API (when available)

### 5. Protect Main Branch (Recommended)

Settings → Branches → Add rule:
- Branch name pattern: `main`
- ✓ Require pull request reviews before merging
- ✓ Require status checks to pass

## Workflow for New Features

### Complete Feature Development Workflow

```bash
# 1. Make sure you're on develop branch
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/new-feature-name

# 3. Make your changes...
# Edit files, test, etc.

# 4. Stage and commit
git add .
git commit -m "feat(scope): description of changes"

# 5. Push to remote
git push -u origin feature/new-feature-name

# 6. Create Pull Request on GitHub
# Go to repository → Pull Requests → New Pull Request

# 7. After PR is approved and merged
git checkout develop
git pull origin develop

# 8. Delete feature branch (optional)
git branch -d feature/new-feature-name
git push origin --delete feature/new-feature-name
```

## Version Tagging Strategy

### Semantic Versioning (MAJOR.MINOR.PATCH)

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Examples

```bash
# Initial release
git tag -a v1.0.0 -m "Release v1.0.0 - Initial public release"

# Bug fix
git tag -a v1.0.1 -m "Release v1.0.1 - Fix booking overlap detection"

# New feature
git tag -a v1.1.0 -m "Release v1.1.0 - Add email notifications"

# Breaking change
git tag -a v2.0.0 -m "Release v2.0.0 - New authentication system"

# Push all tags
git push origin --tags
```

## Collaboration Guidelines

### For Contributors

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/room-booking-backend.git
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/originalowner/room-booking-backend.git
   ```

4. **Keep your fork updated**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

5. **Create feature branch and work**
6. **Push to your fork**
7. **Create Pull Request**

### Code Review Checklist

Before merging Pull Requests:
- [ ] Code follows project style
- [ ] All tests pass
- [ ] No console.log statements
- [ ] Error handling is proper
- [ ] API documentation updated
- [ ] No sensitive data committed
- [ ] .env.example updated if needed

## Emergency Procedures

### Accidentally Committed Sensitive Data

```bash
# Remove file from git but keep local copy
git rm --cached .env

# Remove from history (use with caution!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (dangerous!)
git push origin --force --all
```

**Better:** Change all secrets immediately!

### Revert a Commit That's Pushed

```bash
# Create a new commit that undoes changes
git revert <commit-hash>
git push origin main
```

## CI/CD Integration (Future)

### GitHub Actions Example

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npx prisma generate
      - run: npm test
```

## Best Practices

### Do's ✅
- Commit often with meaningful messages
- Pull before push
- Use branches for features
- Review code before merging
- Keep commits atomic (one logical change)
- Write descriptive commit messages
- Tag releases

### Don'ts ❌
- Don't commit sensitive data (.env files)
- Don't commit node_modules
- Don't force push to main
- Don't commit directly to main
- Don't make huge commits
- Don't use generic messages like "fix" or "update"

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**Happy Coding!** 🚀
