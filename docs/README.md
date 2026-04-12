# UniLodge Documentation Index

Welcome to UniLodge documentation! This folder contains comprehensive guides for developers, architects, and stakeholders.

## 📚 Main Documentation Files

### [ARCHITECTURE.md](./ARCHITECTURE.md) - **START HERE**

Main overview of the entire system architecture. Includes:

- Technology stack overview
- User workflows
- Data flow and communication patterns
- Security architecture
- Deployment strategy
- Quick start guide

---

## 🏢 Component-Specific Guides

### [FRONTEND.md](./FRONTEND.md)

Complete guide to the Next.js frontend application:

- Project structure
- Component overview
- State management (Zustand)
- API integration
- Testing strategies
- Styling with Tailwind CSS
- Performance optimization

### [BACKEND.md](./BACKEND.md)

Complete guide to the Express.js backend API:

- API endpoint reference (all routes)
- Authentication and authorization
- Service layer architecture
- Database models and schemas
- Input validation
- Testing strategies
- Performance and optimization

### [AI_ENGINE.md](./AI_ENGINE.md)

Complete guide to the AI Engine service:

- Service architecture
- Recommendation algorithm
- Preference analysis
- Chat and conversational AI
- Hugging Face integration
- Testing and evaluation
- Future enhancements

---

## 📊 Architecture Diagrams

### [diagrams/ER_DIAGRAM.md](./diagrams/ER_DIAGRAM.md)

**Entity-Relationship Diagram** - Shows the database schema:

- All collections and their fields
- Relationships between entities
- Cardinality (one-to-many, etc.)
- Primary keys and foreign keys
- Data flow patterns
- Indices for performance

### [diagrams/CLASS_DIAGRAM.md](./diagrams/CLASS_DIAGRAM.md)

**Class Diagram (UML)** - Shows service and controller architecture:

- Backend service classes and methods
- Frontend React component structure
- AI Engine services
- Dependencies between classes
- Patterns and relationships

### [diagrams/SEQUENCE_DIAGRAM.md](./diagrams/SEQUENCE_DIAGRAM.md)

**Sequence Diagrams** - Shows workflow interactions:

- Authentication flow (login, signup)
- Room listing and search
- Booking request and confirmation
- AI chat and recommendations
- Admin analytics
- Room approval workflow
- Check-in/check-out process
- Error handling flows

### [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)

**System Architecture** - Shows overall system design:

- All three services (frontend, backend, AI engine)
- External services and APIs
- Data flow patterns
- Communication protocols
- Deployment architecture
- Security layer
- Performance optimization
- Monitoring and logging

---

## 📋 Setup & Configuration

### [SETUP_GUIDE.md](./SETUP_GUIDE.md)

Instructions for setting up the development environment and running all services locally.

### [../MIGRATION_PLAN.md](../MIGRATION_PLAN.md)

Database migration strategy and MongoDB setup instructions.

---

## 🗂️ Quick Reference

### By Role

**👨‍💻 Frontend Developer?**
Start with: [ARCHITECTURE.md](./ARCHITECTURE.md) → [FRONTEND.md](./FRONTEND.md) → [diagrams/CLASS_DIAGRAM.md](./diagrams/CLASS_DIAGRAM.md)

**🔧 Backend Developer?**
Start with: [ARCHITECTURE.md](./ARCHITECTURE.md) → [BACKEND.md](./BACKEND.md) → [diagrams/ER_DIAGRAM.md](./diagrams/ER_DIAGRAM.md) → [diagrams/SEQUENCE_DIAGRAM.md](./diagrams/SEQUENCE_DIAGRAM.md)

**🤖 AI/ML Engineer?**
Start with: [ARCHITECTURE.md](./ARCHITECTURE.md) → [AI_ENGINE.md](./AI_ENGINE.md) → [BACKEND.md](./BACKEND.md) (AI integration section)

**🏗️ System Architect?**
Start with: [ARCHITECTURE.md](./ARCHITECTURE.md) → [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) → All diagrams

**📊 Product Manager?**
Start with: [ARCHITECTURE.md](./ARCHITECTURE.md) → Component guides → Workflow sections

### By Topic

**How to...**

- Set up development environment → [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Book a room (workflow) → [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) → "Booking Request Flow"
- Approve a new room (workflow) → [diagrams/SEQUENCE_DIAGRAM.md](./diagrams/SEQUENCE_DIAGRAM.md) → "Room Approval"
- Deploy to production → [BACKEND.md](./BACKEND.md) → Deployment section
- Write tests → Component-specific guides → Testing section
- Call the backend API → [BACKEND.md](./BACKEND.md) → API Endpoints section

**Understanding...**

- Database schema → [diagrams/ER_DIAGRAM.md](./diagrams/ER_DIAGRAM.md)
- User flows → [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) → User Workflows
- System interactions → [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) → Overall Diagram
- Authentication → [BACKEND.md](./BACKEND.md) → Authentication section
- Recommendations → [AI_ENGINE.md](./AI_ENGINE.md) → Recommendation Algorithm

---

## 🔗 Links to Important Files

**Configuration**

- Backend: `apps/backend/.env.example`
- Frontend: `apps/frontend/.env.example`
- AI Engine: `apps/ai-engine/.env.example`

**Source Code**

- Backend controllers: `apps/backend/src/controllers/`
- Backend services: `apps/backend/src/services/`
- Backend models: `apps/backend/src/models/`
- Frontend components: `apps/frontend/src/components/`
- Frontend pages: `apps/frontend/src/pages/`
- AI services: `apps/ai-engine/src/services/`

**Tests**

- Backend tests: `apps/backend/__tests__/`
- Frontend tests: `apps/frontend/tests/`
- AI Engine tests: `apps/ai-engine/tests/`
- E2E tests: `tests/e2e/`

---

## 📝 Documentation Standards

All documentation follows these conventions:

- **Code blocks** include language (typescript, javascript, python, bash, sql, etc.)
- **Diagrams** use Mermaid markdown syntax for GitHub rendering
- **APIs** documented with HTTP method, endpoint, body, and example responses
- **Types** shown with TypeScript/Zod definitions
- **Workflows** illustrated with ASCII flow diagrams
- **Tables** used for quick reference comparisons

---

## 🔄 Keeping Documentation Updated

When making changes to the codebase:

1. Update relevant component guide (Frontend/Backend/AI_ENGINE)
2. Update sequence diagrams if workflow changes
3. Update ER diagram if database schema changes
4. Update API endpoint reference if routes change
5. Update ARCHITECTURE.md if major changes

---

## 📞 Questions or Feedback?

- Check the component-specific guide for your area
- Review the relevant diagram
- Look at example code in the tests directory
- Ask the development team

---

**Last Updated**: April 2024  
**Documentation Version**: 1.0  
**Status**: Complete and Production-Ready
