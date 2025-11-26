-- Drop old evidence table if exists
DROP TABLE IF EXISTS `evidence`;

-- Create new tables
CREATE TABLE IF NOT EXISTS `teacherProfiles` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL UNIQUE,
  `educationDepartment` varchar(255),
  `schoolName` varchar(255),
  `teacherName` varchar(255),
  `principalName` varchar(255),
  `gender` enum('male', 'female') NOT NULL,
  `stage` varchar(100),
  `subjects` text,
  `selectedBackground` varchar(100) DEFAULT 'default',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `evidenceTemplates` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `standardId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `evidenceType` enum('general', 'subject', 'stage') NOT NULL DEFAULT 'general',
  `applicableSubjects` text,
  `applicableStages` text,
  `orderIndex` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `userEvidence` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `evidenceTemplateId` int NOT NULL,
  `standardId` int NOT NULL,
  `page1Title` varchar(255),
  `page1Content` text,
  `page1Images` text,
  `page2Title` varchar(255),
  `page2Content` text,
  `page2Images` text,
  `eventDate` timestamp,
  `lessonName` varchar(255),
  `celebrationName` varchar(255),
  `initiativeName` varchar(255),
  `additionalData` text,
  `isCompleted` boolean NOT NULL DEFAULT false,
  `completedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `backgrounds` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `imageUrl` text NOT NULL,
  `thumbnailUrl` text,
  `isActive` boolean NOT NULL DEFAULT true,
  `orderIndex` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Update standards table to add weight column
ALTER TABLE `standards` ADD COLUMN IF NOT EXISTS `weight` int NOT NULL DEFAULT 10;
ALTER TABLE `standards` DROP COLUMN IF EXISTS `createdBy`;
