# 🎓 TeachConnect (Tuition Matching Platform )

A MERN stack web application that connects **school students / guardians** with **university student tutors** based on class, subject, and location preferences.  
The platform supports **role-based access**, **document verification**, and a structured **job posting & application workflow**.


---

## 📌 Overview

The Tuition Matching Platform streamlines the process of finding and hiring tutors by providing:

- **Verified profiles** through document uploads and admin approval.
- **Transparent job postings** from students.
- **Direct applications** from tutors.
- **Conditional chat** only after an application is accepted.
- **Centralized admin control** for user and content moderation.

This ensures **safety, quality, and efficiency** for all parties.

---

## ✨ Features

### 🔹 User Roles
- **Student / Guardian**
  - Register with **Student ID** and **Guardian NID**.
  - Post tuition jobs.
  - Review tutor applications and accept/reject.
  - Chat with accepted tutors.
  
- **Tutor**
  - Register with **Student ID** and **Educational Document**.
  - Browse and filter jobs.
  - Apply with a short message.
  - View application status.
  - Chat when accepted.
  
- **Admin**
  - Verify or reject documents.
  - Manage all users and posts.
  - Monitor applications and chats.

---

## 🔄 System Roles & Flow

```mermaid
flowchart TD
A[Landing Page] --> B{Select Role}
B --> C[Student/Guardian Login/Register]
B --> D[Tutor Login/Register]

C --> E[Upload Docs: Student ID, Guardian NID]
D --> F[Upload Docs: Student ID, Edu Document]

E --> G[Admin Verification]
F --> G

G -->|Approved| H[Dashboard Access]
G -->|Rejected| X[Account Disabled]

H --> I[Students Post Jobs]
H --> J[Tutors Browse & Apply]
I --> K[Students Review Applications]
K --> L[Accept Tutor -> Chat Enabled]
