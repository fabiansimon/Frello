# "Frello" - An Project Management Application

## Installation

(Make sure to clean you cookies from localhost:3000)
```
  git clone https://github.com/fabiansimon/SelectCode.git
  cd selectcode
  Start you docker engine 🏎️
  docker-compose up --build
```

### Architecture

- **Frontend:** React.js
  - **State Management:** React Context
  - **Styling:** Tailwind CSS
  - **Routing:** React Router
- **Backend:** Express.js server
  - **API:** tRPC
  - **Database:** Prisma ORM with PostgreSQL
- **Authentication:** JWT

# Design Decisions

- **React Context** for State Management:
  Simplifies state management for user authentication and project data.

- **tRPC** for API Communication:

  Ensures type safety across the client and server. Simplifies the API layer by removing the need for REST endpoint definitions.

- **Prisma** ORM:

  Provides a type-safe interface to interact with the PostgreSQL database. Simplifies database migrations and schema definitions.

- **Docker Compose**:
  Simplifies the setup and deployment process by containerizing the application. Ensures consistency across different development environments.

# Implemented Features

## Core Features

- **Project Management**: Create and delete projects, and add or remove users. The project creator is the "admin" with the ability to manage users, create, update, and delete tasks, and delete the project.

- **Task Management**:
  Create, update, and delete tasks. Assign tasks to users and track their status.

- **Task Overview**:
  Tasks are filtered by their status and displayed in corresponding columns. An "overview" container on the right summarizes the current task statuses and shows personal tasks for the authenticated user.

## Optional Features

- **User Authentication**: Users must register or log in to receive a valid JWT token, which is validated by the server middleware. The token's context, including the userId, is then sent to all protected procedures, allowing for user-specific operations and assignments. For testing purposes, the user only validates themselves with an email, without requiring a password.

- **User Roles and Permission**: The application has two roles: Admin and normal user. Admins can delete and update all entities, while normal users can only edit or delete entities they created or are assigned to. (Very minimalistic I know 😄)

- **Notification System**: When a task is assigned to a user, the server fetches their email and sends an email to it. The user can click the link in the email to be redirected to the website, with selectedTask as a search parameter, ensuring the frontend immediately displays the relevant task.

- **Comments and File Attachments**: File attachments are not implemented, but comments are. All users can comment, but only the admin or the comment's creator can delete it.

- **🤖 Fancy AI Feature**: When the project has minimum 2 users and you want to create or update a task, there's an option to ask AI for the ideal assignee. The AI analyzes the task description and the expertise of each user, returning the ID of the most suitable user. Providing more context improves the recommendation.

# TBD

- **Testing**: Currently, only two server-side tests have been implemented, focusing on the public routes. The next steps involve writing tests for the protected routes and implementing potential frontend tests

- **OAuth 2.0 authentication**: Currently, to simplify the process, user authentication only requires an email. This is obviously far from production ready

- **Improve Error handling**: The backend currently only returns error messages. Ideally it should return a corresponding status code as well.

# Ideal Testing Flow

(When creating a user make sure to add detailed information in the expertise field. You cannot edit this later.)

- Create new user
  Example:

```
  Name: Max Musterman
  Role: Full-Stack Developer
  Email: max@musterman.com
  Expertise: With 10 years of experience in Nest.js and Express.js, my expertise predominantly lies in backend development (around 70%), with the remaining 30% in frontend technologies. I excel at managing and executing complex database migrations, ensuring smooth transitions and minimal downtime.
```

- Create new project
  Example:

```
  Name: SelectCode
  Expertise: SelectCode is a multinational conglomerate dedicated to leveraging AI to its fullest potential. With a focus on delivering innovative solutions, SelectCode empowers users through its cutting-edge platform, meinGPT. This beautiful platform offers unparalleled assistance, enabling people to harness the power of artificial intelligence in their daily lives and professional endeavors.
```

- Create new Task(s)
  Example:

```
  Title: Deploy Backend Changes
  Description:  Deploy the updated backend changes to integrate the latest OpenAI model. This deployment will enhance the platform's capabilities, ensuring users benefit from the most advanced AI functionalities.
  Assign: No one (leave unselected)
```

- Log out (top right, click on your email) and create new Account
  Example:

```
  Name: Julia Simon
  Role: Frontend Engineer
  Email: julia@simon.com
  Expertise: With 8 years of experience in React and Angular, my expertise predominantly lies in frontend development. I excel at designing and implementing beautiful, user-friendly interfaces that enhance user experience and engagement. My focus is on writing clean, efficient code and creating seamless, visually appealing UIs.
```

- Log out and login with first account you created

- Add julia@simon to the project by clicking on "1 user" in the top left

- Open the latest task you created and edit it. Check out the AI suggestion if it works.

- Check out the rest. Change statuses, create projects and tasks. Reassign them etc.
