@echo off
echo 🎓 BRACU Alumni Portal - Authentication Setup
echo =============================================

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from example...
    copy .env.example .env
    echo ✅ .env file created. Please update with your actual values.
    echo.
    echo 🔧 Required configurations:
    echo    - DATABASE_URL: Your PostgreSQL connection string
    echo    - JWT_SECRET: A secure 32+ character secret key
    echo    - SMTP_*: Email server configuration
    echo    - APP_URL: Your application URL
    echo.
) else (
    echo ✅ .env file already exists
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Generate Prisma client
echo 🔄 Generating Prisma client...
call npm run db:generate

REM Check if database is set up
echo 🗄️  Setting up database...
echo Note: Make sure your PostgreSQL database is running and accessible

REM Push schema to database
call npm run db:push
if %errorlevel% equ 0 (
    echo ✅ Database schema updated successfully
) else (
    echo ❌ Database setup failed. Please check your DATABASE_URL
    echo    Make sure PostgreSQL is running and the connection string is correct
)

REM Create initial admin user (optional)
set /p create_admin="🔐 Would you like to create an admin user? (y/N): "

if /i "%create_admin%"=="y" (
    echo Creating admin user setup script...
    
    > create-admin.js (
        echo const { PrismaClient } = require^('@prisma/client'^);
        echo const bcrypt = require^('bcryptjs'^);
        echo.
        echo const prisma = new PrismaClient^(^);
        echo.
        echo async function createAdmin^(^) {
        echo     const email = process.argv[2];
        echo     const password = process.argv[3];
        echo     const firstName = process.argv[4] ^|^| 'Admin';
        echo     const lastName = process.argv[5] ^|^| 'User';
        echo.    
        echo     if ^(!email ^|^| !password^) {
        echo         console.log^('Usage: node create-admin.js ^<email^> ^<password^> [firstName] [lastName]'^);
        echo         process.exit^(1^);
        echo     }
        echo.
        echo     try {
        echo         const hashedPassword = await bcrypt.hash^(password, 12^);
        echo.        
        echo         const admin = await prisma.user.create^({
        echo             data: {
        echo                 email,
        echo                 password: hashedPassword,
        echo                 firstName,
        echo                 lastName,
        echo                 graduationYear: 2020,
        echo                 degree: 'Administration',
        echo                 major: 'System Administration',
        echo                 role: 'ADMIN',
        echo                 isVerified: true,
        echo                 emailVerified: new Date^(^),
        echo             }
        echo         }^);
        echo.
        echo         console.log^('✅ Admin user created successfully:'^);
        echo         console.log^('   Email:', admin.email^);
        echo         console.log^('   Role:', admin.role^);
        echo         console.log^('   ID:', admin.id^);
        echo     } catch ^(error^) {
        echo         console.error^('❌ Error creating admin user:', error.message^);
        echo     } finally {
        echo         await prisma.$disconnect^(^);
        echo     }
        echo }
        echo.
        echo createAdmin^(^);
    )
    
    echo.
    echo 📋 To create an admin user, run:
    echo    node create-admin.js admin@bracu.ac.bd your-password Admin User
    echo.
)

REM Build the application
echo 🏗️  Building application...
call npm run build
if %errorlevel% equ 0 (
    echo ✅ Application built successfully
) else (
    echo ⚠️  Build failed. Check for TypeScript errors
)

echo.
echo 🎉 Setup complete!
echo.
echo 🚀 Next steps:
echo    1. Update .env file with your actual configuration values
echo    2. Ensure PostgreSQL database is running
echo    3. Create an admin user if needed
echo    4. Run 'npm run dev' to start the development server
echo.
echo 📚 Documentation:
echo    - Authentication: ./AUTHENTICATION.md
echo    - Setup Guide: ./BRACU_SETUP_GUIDE.md
echo.
echo 🔗 Default URLs:
echo    - Application: http://localhost:3000
echo    - Login: http://localhost:3000/login
echo    - Register: http://localhost:3000/register
echo    - Admin: http://localhost:3000/admin

pause
