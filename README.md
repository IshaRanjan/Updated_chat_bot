# FAQ Navigator Chatbot

A full-stack FAQ chatbot built with **Next.js**, **TypeScript**, and **Supabase** that enables users to navigate FAQs through an intuitive category-based interface without requiring text input. The chatbot supports unlimited nested categories, dynamic content retrieval, and seamless deployment on Vercel.

## Features

- Interactive floating chat widget
- Category-based navigation
- Unlimited parent-child category hierarchy
- Dynamic FAQ retrieval from Supabase
- REST API architecture
- Back navigation through conversation history
- Redirect users to relevant website pages
- Responsive UI for desktop and mobile
- Scalable and easily maintainable architecture

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- Supabase

### Database
- PostgreSQL (Supabase)

### Deployment
- Vercel

## Project Structure

```
├── app
│   ├── api
│   ├── components
│   ├── lib
│   └── page.tsx
├── public
├── styles
├── supabase
│   ├── schema.sql
│   └── seed.sql
└── README.md
```

## Architecture

```
User
   │
   ▼
Chat Widget (Next.js)
   │
   ▼
Next.js API Routes
   │
   ▼
Supabase Database
   │
   ▼
FAQ Nodes
(Category → Subcategory → Questions → Answers)
```

## Database Design

The chatbot uses a hierarchical parent-child structure.

```
Category
│
├── Subcategory
│      ├── Question
│      │      └── Answer
│      └── Question
└── Subcategory
```

This structure supports unlimited nesting without requiring changes to the schema.


## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/nodes` | Fetch root categories |
| GET | `/api/nodes?id=<id>` | Fetch child nodes |
| GET | `/api/question?id=<id>` | Fetch question details |

## Key Functionalities

- Dynamic category navigation
- Unlimited nested FAQs
- Conversation history
- Parent-child traversal
- Redirect support
- Database-driven content
- Production-ready deployment

## Future Improvements

- AI-powered semantic search
- Natural language queries
- Voice support
- Multilingual support
- Analytics dashboard
- Admin panel for FAQ management
- User feedback collection
- Search suggestions

## Learnings

This project provided hands-on experience with:

- Full-stack application development
- REST API design
- Database schema design
- Recursive hierarchical data structures
- Supabase integration
- Next.js App Router
- TypeScript
- Production deployment on Vercel

## Live Demo
https://livesupportsystem.vercel.app/

## Author

**Isha Ranjan**

GitHub: https://github.com/IshaRanjan

LinkedIn: https://linkedin.com/in/isha-ranjan-056544304
