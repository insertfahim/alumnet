# BRAC University Alumni Network Portal

A comprehensive web application for connecting BRAC University (BRACU) alumni worldwide, built with Next.js, TypeScript, and modern web technologies. This platform serves over 22,000 BRACU graduates across 80+ countries.

## Features

### 🎓 Core Alumni Features

-   **User Authentication**: Secure registration and login system
-   **Alumni Directory**: Search and filter alumni by graduation year, major, location, and company
-   **Profile Management**: Comprehensive user profiles with education and experience history
-   **Connection System**: Send and manage connection requests between alumni

### 💼 Professional Features

-   **Job Board**: Post and browse job opportunities within the alumni network
-   **Event Management**: Create, manage, and RSVP to alumni events and reunions
-   **Messaging System**: Direct messaging between connected alumni
-   **Networking Tools**: Professional networking features and recommendations

### 🚀 Technical Features

-   **Modern UI/UX**: Responsive design with Tailwind CSS
-   **Type Safety**: Full TypeScript implementation
-   **Database Integration**: PostgreSQL with Prisma ORM
-   **API Routes**: RESTful API with Next.js App Router
-   **Authentication**: JWT-based authentication system

## Tech Stack

-   **Frontend**: Next.js 14, React 18, TypeScript
-   **Styling**: Tailwind CSS
-   **Database**: PostgreSQL with Prisma ORM
-   **Authentication**: JWT with bcrypt
-   **Icons**: Lucide React
-   **Validation**: Zod
-   **Development**: ESLint, TypeScript

## About BRAC University

BRAC University (Bengali: ব্র্যাক ইউনিভার্সিটি, also known as BRACU) is a private research university located in Merul Badda, Dhaka, Bangladesh. Founded by Sir Fazle Hasan Abed in 2001 under the Private University Act, BRAC University has been a pioneer in higher education in Bangladesh.

### Key Facts

-   **Founded**: 2001 by Sir Fazle Hasan Abed
-   **Location**: 66 Mohakhali, Dhaka 1212, Bangladesh
-   **Students**: 11,200+ across 20 schools, departments, and institutes
-   **Alumni**: 22,000+ graduates worldwide
-   **Global Presence**: Alumni in 80+ countries

### Schools and Faculties

-   BRAC Business School
-   School of Computer Science and Engineering
-   BRAC James P Grant School of Public Health (JPGSPH)
-   School of Architecture and Design (SoAD)
-   School of Data and Sciences
-   School of Pharmacy
-   Faculty of Arts and Social Sciences
-   Faculty of Natural Sciences
-   BRAC Institute of Languages (BIL)
-   BRAC Development Institute (BDI)

### Alumni Success Stories

Our alumni have achieved remarkable success across various fields:

-   Technology leaders at Samsung R&D, Grameenphone, and international tech companies
-   Business executives at BRAC Bank and multinational corporations
-   Public health professionals at WHO and international organizations
-   Architects and designers shaping Bangladesh's urban landscape
-   Journalists and media professionals driving social change

## Office of Career Services and Alumni Relations (OCSAR)

This platform is managed by OCSAR, which facilitates BRAC University's growing global community of alumni and provides career services to current students and graduates.

## Getting Started

### Prerequisites

-   Node.js 18+ and npm
-   PostgreSQL database
-   Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd alumni-network-portal
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

    Edit \`.env.local\` and add your database URL and other configuration:
    \`\`\`env
    DATABASE_URL="postgresql://username:password@localhost:5432/alumni_network"
    JWT_SECRET="your-super-secure-jwt-secret-key"
    \`\`\`

4. **Set up the database**
   \`\`\`bash

    # Generate Prisma client

    npx prisma generate

    # Run database migrations

    npx prisma db push

    # Optional: Seed the database with sample data

    npx prisma db seed
    \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
alumni-network-portal/
├── src/
│ ├── app/ # Next.js App Router pages
│ │ ├── api/ # API routes
│ │ ├── auth/ # Authentication pages
│ │ ├── directory/ # Alumni directory
│ │ ├── events/ # Events management
│ │ ├── jobs/ # Job board
│ │ ├── messages/ # Messaging system
│ │ └── profile/ # User profiles
│ ├── components/ # Reusable React components
│ │ ├── home/ # Homepage components
│ │ ├── layout/ # Layout components
│ │ └── providers/ # Context providers
│ ├── lib/ # Utility libraries
│ └── types/ # TypeScript type definitions
├── prisma/ # Database schema and migrations
├── public/ # Static assets
└── docs/ # Documentation
\`\`\`

## Database Schema

The application uses a comprehensive database schema with the following main entities:

-   **Users**: Alumni profiles with personal and professional information
-   **Education**: Education history and degrees
-   **Experience**: Work experience and career history
-   **Connections**: Alumni networking connections
-   **Posts**: Social posts and updates
-   **Jobs**: Job postings and applications
-   **Events**: Alumni events and RSVPs
-   **Messages**: Direct messaging between users

## API Endpoints

### Authentication

-   \`POST /api/auth/register\` - User registration
-   \`POST /api/auth/login\` - User login
-   \`GET /api/auth/me\` - Get current user

### Users

-   \`GET /api/users\` - Get alumni directory
-   \`GET /api/users/[id]\` - Get user profile
-   \`PUT /api/users/[id]\` - Update user profile

### Jobs

-   \`GET /api/jobs\` - Get job listings
-   \`POST /api/jobs\` - Create job posting
-   \`POST /api/jobs/[id]/apply\` - Apply to job

### Events

-   \`GET /api/events\` - Get events
-   \`POST /api/events\` - Create event
-   \`POST /api/events/[id]/rsvp\` - RSVP to event

## Development

### Running Tests

\`\`\`bash
npm test
\`\`\`

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

### Database Management

\`\`\`bash

# View database in Prisma Studio

npx prisma studio

# Reset database

npx prisma migrate reset

# Deploy migrations

npx prisma migrate deploy
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

1. Build the application: \`npm run build\`
2. Set up PostgreSQL database
3. Configure environment variables
4. Run migrations: \`npx prisma migrate deploy\`
5. Start the application: \`npm start\`

## Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## Features Roadmap

### Phase 1 (Completed)

-   ✅ User authentication and profiles
-   ✅ Alumni directory with search
-   ✅ Job board functionality
-   ✅ Event management system
-   ✅ Basic messaging system

### Phase 2 (Future)

-   🔄 Advanced search and filtering
-   🔄 File upload for resumes and photos
-   🔄 Email notifications
-   🔄 Mobile app (React Native)
-   🔄 Analytics dashboard

### Phase 3 (Future)

-   🔄 Mentorship program matching
-   🔄 Integration with LinkedIn
-   🔄 Advanced networking features
-   🔄 Alumni success stories
-   🔄 Donation and fundraising tools

## Support

For support and questions:

-   Create an issue on GitHub
-   Contact the development team
-   Check the documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   Built with ❤️ for alumni communities
-   Inspired by modern social networking platforms
-   Designed for professional networking and career growth
