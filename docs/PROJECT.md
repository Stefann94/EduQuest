# PROJECT.md — Educational Programming Platform

## 1. Project Overview

### 1.1 Product Vision

Build a modern, accessible, and engaging educational platform that helps students learn programming through structured learning materials, practical assignments, individual quizzes, and interactive live quiz sessions.

The platform connects students with mentors who organize classes, publish educational content, assign exercises, review submissions, track attendance, and encourage students through a positive reward system.

The primary goal is to make learning easier to navigate, enjoyable, and motivating without creating unnecessary academic pressure.

The platform should feel professional and educational while remaining friendly and approachable for younger students.

### 1.2 Target Audience

- Students who want to learn programming.
- Mentors who teach programming and manage educational activities.
- Administrators who verify mentor applications and manage platform access.

The initial deployment is intended for use within a volunteering and educational program, with the possibility of onboarding additional mentors and classes later.

### 1.3 Core Principles

1. **Simplicity first:** Users should understand how to navigate the platform without instructions.
2. **Learning over competition:** Rewards should encourage participation, effort, and improvement.
3. **Privacy by default:** Users must not be publicly searchable.
4. **Clear organization:** Every class has its own learning materials, activities, attendance records, and leaderboard.
5. **Flexible learning:** Students can explore programming topics outside their current classes.
6. **Meaningful feedback:** Mentors encourage students through constructive comments rather than numerical grades.
7. **Consistent experience:** Students and mentors share the same visual language but receive interfaces tailored to their roles.

---

## 2. User Roles

The platform has three roles: Student, Mentor, and Administrator.

### 2.1 Student

Students can:

- Create an account and log in.
- Join multiple classes using invitation codes.
- View active and archived classes.
- Access learning materials published in their classes.
- Browse programming exercises and worked solutions.
- Complete individual quizzes outside their classes.
- Participate in mentor-created quiz sessions.
- Submit assignments and upload files.
- Read private mentor feedback.
- View their attendance, XP, and class rankings.
- Receive in-app notifications about relevant activities.

Students cannot create classes, publish official learning materials, evaluate other students, or access private information belonging to other users.

### 2.2 Mentor

Mentors can:

- Apply for a mentor account.
- Access their approved account.
- Create and manage multiple classes.
- Generate invitation codes for their classes.
- View and manage students enrolled in their classes.
- Publish learning materials and worked solutions.
- Create assignments and optional exercises.
- Review student submissions and provide feedback.
- Award and adjust XP according to platform rules.
- Record attendance.
- Create individual or class-specific quizzes.
- Start live quiz sessions.
- View class activity, participation, and leaderboards.

Mentors can only access classes they own or are explicitly authorized to manage.

### 2.3 Administrator

Administrators can:

- Review mentor applications.
- Approve or reject applications.
- Manage mentor account activation.
- Review account-related issues.
- Suspend or deactivate accounts when necessary.
- Maintain the security and integrity of the platform.

Administrative access must be restricted to authorized accounts. Regular users must not be able to grant themselves elevated permissions.

---

## 3. Authentication and Account Management

### 3.1 Student Registration

The initial authentication screen provides a clear distinction between Student and Mentor.

Student is the default selection.

Student registration requires:

- Display name.
- Unique username.
- Email address.
- Password.

The platform must validate required fields and prevent duplicate usernames and email addresses.

Students use their credentials to log in. Email verification and password recovery must be supported.

### 3.2 Mentor Application

Selecting Mentor must not automatically create an active mentor account.

Instead, the user completes a mentor application containing:

- Full name.
- Email address.
- Phone number.
- Educational or professional background.
- A description of their intended use of the platform.
- Relevant information or evidence supporting their mentor application.

The application is submitted for administrative review.

The platform must explain what information is required and why it is collected. Additional verification information should only be requested when necessary.

Application states:

- Pending review.
- Approved.
- Rejected.
- Additional information required.

Applicants must receive an appropriate email notification when their application status changes.

### 3.3 Mentor Account Activation

After approval:

1. The mentor receives an email containing a secure account activation or password setup link.
2. The mentor establishes their password.
3. The mentor logs in and accesses their dashboard.

Mentors do not need a public username. Their display name identifies them within classes.

For authentication, mentors should use their verified email address or another unique login identifier. Display names must not be treated as unique credentials.

Passwords must never be sent as readable text in emails.

### 3.4 Password Recovery

Both students and mentors must be able to recover their accounts using their registered email addresses.

The recovery flow must use secure, time-limited reset links and must not reveal whether an email address belongs to an existing account.

---

## 4. Application Structure and Navigation

The application should use a consistent navigation system with role-specific options.

### 4.1 Student Navigation

Recommended main navigation:

- Home
- My Classes
- Learning
- Quizzes
- My Progress
- Notifications
- Account Settings

### 4.2 Mentor Navigation

Recommended main navigation:

- Dashboard
- My Classes
- Learning Materials
- Assignments
- Quizzes
- Notifications
- Account Settings

Mentor-specific functionality, such as attendance management and class leaderboards, should be available inside the relevant class.

### 4.3 Administrator Navigation

- Overview
- Mentor Applications
- User Management
- Platform Settings

Administrative pages must be accessible only to authorized administrators.

### 4.4 Navigation Requirements

- Use a sidebar on desktop.
- Provide simplified, responsive navigation on mobile.
- Clearly indicate the currently selected section.
- Keep related actions close to the content they affect.
- Avoid unnecessarily deep navigation hierarchies.
- Use consistent page titles, buttons, cards, and status indicators.

---

## 5. Student Home and Classes

### 5.1 Student Home

The student home page should provide a useful overview of current activities.

Recommended sections:

- Welcome message.
- Upcoming or pending assignments.
- Recently published learning materials.
- Upcoming quiz sessions.
- Recent notifications.
- Personal XP summary.
- Quick access to active classes.

The page should prioritize actionable information rather than displaying too many statistics.

### 5.2 My Classes

Students can belong to multiple classes simultaneously.

The My Classes page displays class cards containing:

- Class name.
- Mentor name.
- Optional class description.
- Pending assignments or other relevant activity indicators.
- A clear action to open the class.

Provide separate views or filters for:

- Active Classes.
- Archived Classes.

An easily accessible `+ Join a Class` action allows students to enter an invitation code.

### 5.3 Joining a Class

1. The student selects `Join a Class`.
2. A dialog opens with an invitation code field.
3. The platform validates the code.
4. The student receives confirmation and joins the class if the code is valid.

The interface must handle invalid codes, expired codes, already-enrolled students, and unavailable classes.

Mentors can revoke or regenerate invitation codes.

### 5.4 Class Details

Each class has its own dedicated page with the following sections:

- Overview.
- Learning Materials.
- Assignments.
- Quizzes.
- Attendance.
- Leaderboard.
- Class Information.

Students can access only the content and information permitted for their class membership.

Mentors see additional management controls within classes they are authorized to manage.

---

## 6. Learning Materials

### 6.1 Learning Section

The Learning section organizes educational content into two primary categories:

1. Courses and Learning Materials.
2. Worked Problems and Solutions.

Students can access global learning resources and class-specific resources.

Global resources are available independently of class membership. Class-specific resources are accessible only to members of the relevant class.

### 6.2 Courses and Learning Materials

Mentors can publish educational content using:

- PDF documents.
- External web links.
- Formatted content created directly in the platform.
- Video links.
- Code examples with readable formatting and syntax highlighting.

Each material should support:

- Title.
- Short description.
- Topic or category.
- Content or attachment.
- Optional tags.
- Publication status.

Students should be able to browse, open, and revisit published materials.

### 6.3 Worked Problems

Mentors can publish worked problems containing:

- Problem title.
- Problem statement.
- Optional constraints or examples.
- A solution section.
- Optional explanation or step-by-step reasoning.

The problem statement and solution must be displayed separately.

The solution should be initially hidden behind a clear action such as `Reveal Solution`, allowing students to attempt the problem before viewing the answer.

### 6.4 Material Management

Mentors can create, edit, publish, unpublish, and delete their own materials, subject to appropriate permissions.

Deleting or replacing content must not silently invalidate student submissions or historical activity records that depend on it.

---

## 7. Assignments and Exercises

### 7.1 Assignment Creation

Mentors can create activities for a specific class.

Each assignment includes:

- Title.
- Description and instructions.
- Optional attachments or reference links.
- Optional deadline.
- Assignment type: Required or Optional.
- Maximum submission XP.
- Optional publication and availability settings.

Required assignments must be visually distinguishable from optional exercises.

Students receive an in-app notification when a new assignment is published for their class.

### 7.2 Student Submissions

Students can submit work using:

- Text entered directly in the platform.
- Uploaded files, including programming source files and documents.
- External links, where supported.

The submission interface should clearly show the deadline, submission status, and available submission actions.

The platform must validate file types and sizes and prevent unauthorized access to uploaded files.

### 7.3 Submission States

Recommended states:

- Not Started.
- Submitted.
- Reviewed.
- Needs Changes.

Students should be able to view their submission history and resubmit work when permitted by the mentor.

### 7.4 Mentor Review

Mentors can:

- View submissions for their classes.
- Open submitted text and files.
- Add private written feedback.
- Award XP.
- Mark a submission as Reviewed.
- Request corrections.
- Review subsequent submissions.

The platform does not use numerical grades for assignments.

Feedback examples:

- "Excellent work! Your solution is clear and easy to understand."
- "Good effort! Try to simplify the second part."
- "Please review the loop condition and submit your corrected solution."

Feedback must be constructive and visible only to the student and authorized mentors.

### 7.5 Assignment XP

The proposed initial system is:

- Valid submission: +2 XP.
- Mentor quality bonus: 0–5 XP.

The mentor bonus is awarded based on the quality of the work and the learning objectives of the assignment.

Submitting an empty file or meaningless content must not automatically qualify for submission XP.

Resubmissions do not automatically award additional submission XP. Mentors can update the bonus after reviewing corrections.

The interface should explain how XP is earned without showing numerical academic grades.

---

## 8. Quizzes

The platform supports individual practice quizzes, assigned quizzes, and interactive live quiz sessions.

### 8.1 Individual Practice Quizzes

Students can access quizzes independently of their enrolled classes.

For example, a student attending an Object-Oriented Programming class should still be able to practice Python fundamentals.

Global quizzes are organized by subject, topic, or difficulty.

A quiz can include:

- Title and description.
- Topic and difficulty.
- Questions and answer options.
- Correct answers.
- Optional explanations.
- Optional time limits.

The initial implementation should prioritize multiple-choice questions.

After completion, students receive their result, correct answers where appropriate, and explanations if available.

### 8.2 Assigned Quizzes

Mentors can assign quizzes to a specific class.

Assigned quizzes can have:

- An availability window.
- A deadline.
- A maximum number of attempts.
- An XP reward policy.

Students can identify which quizzes are assigned and which are available for independent practice.

### 8.3 Live Quiz Sessions

Mentors can create and start interactive quiz sessions for a class.

The flow is:

1. The mentor creates or selects a quiz.
2. The mentor starts a live session.
3. The platform displays a session code or joining mechanism.
4. Students join the session.
5. Each student selects an avatar or character.
6. The character is associated with the student's existing platform identity.
7. The mentor starts the quiz.
8. Students answer questions during the session.
9. Scores and rankings update according to the session rules.
10. The session ends and a results summary is displayed.

Students must not be required to create a separate account for a quiz session.

### 8.4 Live Session Requirements

The interface should display:

- Session title.
- Participating students.
- Student avatars.
- Current question.
- Available answer options.
- Remaining time, when applicable.
- Session progress.
- Final results and rankings.

The mentor should be able to control the session, including starting questions and ending the quiz.

The system must prevent students from changing their answers after the applicable submission deadline.

Live-session scores and XP rewards must be stored separately.

---

## 9. Attendance

### 9.1 Mentor Attendance Management

Each class contains an Attendance section.

Mentors can:

- Create an attendance record for a class meeting.
- Select the meeting date.
- View enrolled students.
- Mark students as present or absent.
- Correct attendance records when necessary.
- View attendance history.

Each attendance event can award +2 XP to students marked present.

Attendance XP must be awarded only once for each eligible meeting and student.

### 9.2 Student Attendance View

Students can view their personal attendance history.

The interface should show:

- Class name.
- Meeting date.
- Attendance status.
- Total attended meetings.
- Attendance rate, where meaningful.

Students must not be able to edit their own attendance records.

---

## 10. XP, Rewards, and Leaderboards

### 10.1 Design Philosophy

The reward system should encourage participation, consistency, effort, and learning.

It must be suitable for younger students and avoid unnecessary pressure, public shaming, or excessive competition.

XP is a reward system, not an academic grade.

### 10.2 XP Sources

The proposed initial rules are:

| Activity | XP |
|---|---:|
| Eligible class attendance | +2 |
| Valid assignment submission | +2 |
| Assignment quality bonus | 0–5 |
| Live quiz, 1st place | +5 |
| Live quiz, 2nd place | +4 |
| Live quiz, 3rd place | +3 |
| Live quiz, 4th place | +2 |
| Live quiz, other participating students | +1 |

Students who participate in a live quiz receive at least +1 XP, even if they do not answer correctly.

The live quiz reward depends on the final session ranking. Ties, abandoned sessions, and incomplete sessions require consistent rules.

Individual practice quiz XP and additional rewards should be configurable or finalized before implementation.

### 10.3 XP Integrity

The platform must:

- Prevent duplicate XP awards for the same event.
- Maintain an XP transaction history.
- Recalculate totals when authorized corrections occur.
- Record the source of every XP award.
- Allow authorized mentors to correct activity-related rewards.
- Restrict manual XP adjustments to authorized roles.
- Prevent students from modifying their own XP.

The interface should communicate XP changes clearly.

### 10.4 Class Leaderboards

Each class has its own leaderboard based on total XP earned within that class.

Students should be able to see:

- Their own XP.
- Their position in the class.
- Other class members' display names and XP totals, according to the class privacy rules.

The leaderboard should use positive visual language.

The top positions can receive subtle visual emphasis, but students in lower positions must not be presented negatively.

### 10.5 Personal Progress

The My Progress page gives each student a private overview of their learning activity.

Recommended sections:

- Total XP.
- Attendance history.
- Assignment activity.
- Quiz participation.
- Recent achievements.
- Progress by class.
- Class leaderboard positions.

Personal progress should focus on growth and participation, not grades.

---

## 11. Notifications

### 11.1 In-App Notifications

Students should receive notifications for:

- New required assignments.
- New optional exercises, where enabled.
- Upcoming deadlines.
- Assignment feedback.
- Requests to correct and resubmit work.
- Newly published learning materials, when enabled.
- Upcoming or active quiz sessions.
- Relevant class announcements.

Mentors should receive notifications for:

- New assignment submissions.
- Student resubmissions.
- New mentor application decisions, where applicable.
- Relevant class activity.

### 11.2 Notification Behavior

Notifications should:

- Be accessible from a dedicated notification area.
- Indicate whether they have been read.
- Link to the relevant activity.
- Avoid duplicate notifications.
- Respect the user's class memberships and permissions.

Email notifications may be used for account activation, password recovery, and other important account-related events.

---

## 12. Profiles and Privacy

### 12.1 Minimal User Profiles

The platform does not provide a public user directory.

Student identity should be limited to information necessary for learning and class participation.

A student's visible identity may include:

- Display name.
- Username where appropriate.
- Optional avatar.

Email addresses, phone numbers, account credentials, and mentor verification information must not be publicly displayed.

### 12.2 Class Visibility

Students can see only the information necessary for their enrolled classes.

Mentors can access only the classes and student information they are authorized to manage.

Students cannot browse unrelated classes or discover users through a global search.

### 12.3 Account Security

The platform must enforce server-side authorization.

Hiding interface elements is not sufficient to protect data.

Sensitive operations must be checked by the backend, including:

- Reading class data.
- Editing learning materials.
- Reviewing submissions.
- Updating attendance.
- Awarding XP.
- Managing mentor applications.
- Accessing private files.

Student data and mentor verification records must be handled with appropriate privacy and retention practices.

---

## 13. Visual Design and User Experience

### 13.1 Visual Direction

The interface should feel:

- Professional.
- Educational.
- Modern.
- Friendly.
- Organized.
- Easy to navigate.

Avoid overly playful visuals, excessive animations, cluttered dashboards, and unnecessary decorative elements.

Gamification should be visible through progress, XP, avatars, and leaderboards rather than a cartoon-heavy interface.

### 13.2 Layout

Use a responsive layout with:

- Desktop sidebar navigation.
- Simplified mobile navigation.
- Clear page headings.
- Consistent spacing.
- Reusable cards and form components.
- Readable typography.
- Clear empty states and loading states.
- Consistent confirmation and error messages.

### 13.3 Color and Typography

Use a restrained color palette with a primary color, a secondary accent, neutral backgrounds, and accessible text contrast.

The final color palette and typography should be established during the design phase.

Status indicators must not rely on color alone.

### 13.4 Interaction Design

Important actions should be easy to find.

Examples:

- `Join a Class`
- `Create Class`
- `Publish Material`
- `Create Assignment`
- `Submit Assignment`
- `Review Submission`
- `Start Quiz`
- `Record Attendance`

Use confirmation dialogs for destructive operations and provide clear feedback after successful or unsuccessful actions.

### 13.5 Accessibility

The interface should support:

- Keyboard navigation.
- Clear focus states.
- Readable font sizes.
- Accessible color contrast.
- Descriptive labels.
- Appropriate form validation.
- Responsive layouts.

---

## 14. Main Page Inventory

### Public and Authentication Pages

- Login.
- Student Registration.
- Mentor Application.
- Account Activation.
- Password Recovery.
- Password Reset.

### Student Pages

- Student Home.
- My Classes.
- Join Class Dialog.
- Class Overview.
- Class Learning Materials.
- Worked Problems.
- Assignment Details.
- Assignment Submission.
- Submission Feedback.
- Individual Quizzes.
- Quiz Results.
- Live Quiz Lobby.
- Live Quiz Session.
- My Progress.
- Notifications.
- Account Settings.

### Mentor Pages

- Mentor Dashboard.
- My Classes.
- Create and Edit Class.
- Class Overview.
- Class Members.
- Learning Material Management.
- Worked Problem Editor.
- Assignment Management.
- Submission Review.
- Attendance Management.
- Quiz Builder.
- Live Quiz Session Control.
- Class Leaderboard.
- Notifications.
- Account Settings.

### Administrator Pages

- Administrator Dashboard.
- Mentor Application Review.
- User Management.
- Account Status Management.

---

## 15. MVP Scope

The first version should prioritize a complete and usable learning workflow.

### Phase 1 — Core Platform

- Student registration and login.
- Email-based account recovery.
- Mentor application and administrative approval.
- Secure role-based access.
- Student and mentor dashboards.
- Class creation and joining through invitation codes.
- Basic class management.
- Learning materials and worked problems.
- Assignment creation and file or text submissions.
- Written mentor feedback and XP rewards.
- Attendance management.
- Personal progress and class leaderboards.
- In-app notifications.

### Phase 2 — Quizzes and Enhanced Learning

- Individual practice quizzes.
- Mentor-created assigned quizzes.
- Quiz results and explanations.
- Live quiz sessions.
- Student avatars.
- Session rankings and XP rewards.
- Enhanced activity history.

### Phase 3 — Future Improvements

Potential future features include:

- Multiple mentors managing the same class.
- Advanced quiz question types.
- More detailed learning analytics.
- Achievement badges.
- Additional content organization tools.
- More sophisticated progress visualizations.
- Optional class announcements.
- Further accessibility and personalization improvements.

The MVP should not attempt to implement every possible feature simultaneously. Each phase must be usable and tested before the next phase is introduced.

---

## 16. Acceptance Criteria

The initial platform is considered functional when the following conditions are met.

### Authentication

- Students can register, log in, log out, and recover their accounts.
- Mentor applications require administrative approval.
- Approved mentors can activate and access their accounts.
- Unauthorized users cannot access protected pages or operations.

### Classes

- Mentors can create and manage multiple classes.
- Students can join multiple classes using valid invitation codes.
- Invalid or revoked codes are handled correctly.
- Class data is visible only to authorized users.

### Learning and Assignments

- Mentors can publish learning materials and worked problems.
- Students can access published content permitted for their classes.
- Mentors can create required and optional assignments.
- Students can submit work and view submission status.
- Mentors can provide written feedback and request corrections.
- Assignments do not use numerical academic grades.

### Attendance and XP

- Mentors can record and correct attendance.
- Attendance XP is awarded only once per eligible meeting.
- Assignment XP follows the configured rules.
- Students can view their personal progress.
- Class leaderboards reflect the correct XP totals.
- Duplicate rewards and unauthorized changes are prevented.

### Quizzes

- Students can complete individual practice quizzes.
- Mentors can create quizzes for their classes.
- Live sessions maintain student participation and results.
- XP rewards are calculated according to the session rules.

### Privacy and Usability

- Private information is not exposed through public profiles.
- Students cannot access other classes without authorization.
- Mentors cannot access unauthorized classes.
- The application works on desktop and mobile.
- Empty states, loading states, validation errors, and success messages are provided.

---

## 17. Open Decisions

The following decisions remain open and should be resolved before implementing the affected functionality:

- Final product name and visual identity.
- Final technology stack and deployment configuration.
- Whether classes can have multiple mentors in the initial release.
- Whether students can access archived class materials indefinitely.
- Detailed rules for individual quiz XP.
- Tie-breaking rules for live quiz rankings.
- Rules for missed deadlines and late submissions.
- Whether students can communicate directly with mentors.
- Final notification preferences.
- Final content retention and account deletion policies.

Until these decisions are confirmed, implementation should follow the simplest secure approach consistent with the product vision.

---

## 18. UI Design Brief for Figma AI

Create a professional, modern, student-friendly educational web application for learning programming.

The product connects students with mentors and supports classes, learning materials, assignments, feedback, attendance, quizzes, XP, and leaderboards.

### Design Goals

- Make the platform easy to understand for younger students.
- Keep the interface professional without feeling cold or overly academic.
- Make important actions immediately visible.
- Prioritize clarity, consistency, and intuitive navigation.
- Avoid unnecessary complexity and visual clutter.

### Required Screens

Start with the following high-priority screens:

1. Login and registration.
2. Mentor application.
3. Student dashboard.
4. Student My Classes page with class cards and a Join Class action.
5. Class overview with clear navigation between sections.
6. Learning materials list and material detail.
7. Assignment detail and submission form.
8. Mentor submission review with private feedback and XP controls.
9. Mentor dashboard and class management.
10. Attendance management.
11. Individual quiz interface and results.
12. Live quiz lobby and active quiz session.
13. My Progress and class leaderboard.
14. Administrator mentor application review.

### Design System

Establish reusable components for:

- Navigation.
- Buttons.
- Cards.
- Forms.
- Dialogs.
- Status indicators.
- Notifications.
- Assignment states.
- XP indicators.
- Leaderboard rows.
- Quiz answer options.
- Empty states.
- Loading states.
- Error messages.

### Interaction Requirements

Show how the interface responds to:

- Successful and unsuccessful login.
- Invalid invitation codes.
- Empty class lists.
- New assignments.
- Assignment submissions.
- Mentor feedback.
- Attendance changes.
- Quiz completion.
- Live session joining.
- Empty and populated leaderboards.

Use realistic example content related to programming education.

The student and mentor interfaces should share the same design system while presenting different actions and permissions.

Prioritize a coherent, implementable interface over decorative mockups. Use realistic spacing, responsive layouts, accessible typography, and clear visual hierarchy.
