# "Frello" - An Project Management Application

## Overview

This application is a project management tool designed to help teams organize and track their tasks. It features user authentication, project and task management, and various user roles. The architecture is designed using modern web development practices with a client-server model.

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

- **User Authentication**: Users must register or log in to receive a valid JWT token, which is validated by the server middleware. The token's context, including the userId, is then sent to all protected procedures, allowing for user-specific operations and assignments.

- **User Roles and Permission**: The application has two roles: Admin and normal user. Admins can delete and update all entities, while normal users can only edit or delete entities they created or are assigned to. (Very minimalistic I know 😄)

- **Notification System**: When a task is assigned to a user, the server fetches their email and sends an email to it. The user can click the link in the email to be redirected to the website, with selectedTask as a search parameter, ensuring the frontend immediately displays the relevant task.

- **Comments and File Attachments**: File attachments are not implemented, but comments are. All users can comment, but only the admin or the comment's creator can delete it.

- **🤖 Fancy AI Feature**: When creating or updating a task, there's an option to ask AI for the ideal assignee. The AI analyzes the task description and the expertise of each user, returning the ID of the most suitable user. Providing more context improves the recommendation.
