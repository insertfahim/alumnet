#!/bin/bash

# BRACU Alumni Portal - Authentication Setup Script
# This script helps set up the authentication system

echo "🎓 BRACU Alumni Portal - Authentication Setup"
echo "============================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created. Please update with your actual values."
    echo ""
    echo "🔧 Required configurations:"
    echo "   - DATABASE_URL: Your PostgreSQL connection string"
    echo "   - JWT_SECRET: A secure 32+ character secret key"
    echo "   - SMTP_*: Email server configuration"
    echo "   - APP_URL: Your application URL"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npm run db:generate

# Check if database is set up
echo "🗄️  Setting up database..."
echo "Note: Make sure your PostgreSQL database is running and accessible"

# Push schema to database
npm run db:push
if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully"
else
    echo "❌ Database setup failed. Please check your DATABASE_URL"
    echo "   Make sure PostgreSQL is running and the connection string is correct"
fi

# Create initial admin user (optional)
read -p "🔐 Would you like to create an admin user? (y/N): " create_admin

if [[ $create_admin =~ ^[Yy]$ ]]; then
    echo "Creating admin user setup script..."
    
    cat > create-admin.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    const email = process.argv[2];
    const password = process.argv[3];
    const firstName = process.argv[4] || 'Admin';
    const lastName = process.argv[5] || 'User';
    
    if (!email || !password) {
        console.log('Usage: node create-admin.js <email> <password> [firstName] [lastName]');
        process.exit(1);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const admin = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                graduationYear: 2020,
                degree: 'Administration',
                major: 'System Administration',
                role: 'ADMIN',
                isVerified: true,
                emailVerified: new Date(),
            }
        });

        console.log('✅ Admin user created successfully:');
        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
        console.log('   ID:', admin.id);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
EOF

    echo ""
    echo "📋 To create an admin user, run:"
    echo "   node create-admin.js admin@bracu.ac.bd your-password Admin User"
    echo ""
fi

# Build the application
echo "🏗️  Building application..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Application built successfully"
else
    echo "⚠️  Build failed. Check for TypeScript errors"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Update .env file with your actual configuration values"
echo "   2. Ensure PostgreSQL database is running"
echo "   3. Create an admin user if needed"
echo "   4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 Documentation:"
echo "   - Authentication: ./AUTHENTICATION.md"
echo "   - Setup Guide: ./BRACU_SETUP_GUIDE.md"
echo ""
echo "🔗 Default URLs:"
echo "   - Application: http://localhost:3000"
echo "   - Login: http://localhost:3000/login"
echo "   - Register: http://localhost:3000/register"
echo "   - Admin: http://localhost:3000/admin"
