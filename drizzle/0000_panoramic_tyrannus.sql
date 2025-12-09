CREATE TABLE `backgrounds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`imageUrl` text NOT NULL,
	`thumbnailUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`orderIndex` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backgrounds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidenceTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`standardId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`evidenceType` enum('general','subject','stage') NOT NULL DEFAULT 'general',
	`applicableSubjects` text,
	`applicableStages` text,
	`orderIndex` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidenceTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `standards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`orderIndex` int NOT NULL,
	`weight` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `standards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teacherProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`educationDepartment` varchar(255),
	`schoolName` varchar(255),
	`teacherName` varchar(255),
	`principalName` varchar(255),
	`gender` enum('male','female') NOT NULL,
	`stage` varchar(100),
	`subjects` text,
	`selectedBackground` varchar(100) DEFAULT 'default',
	`email` varchar(255),
	`phoneNumber` varchar(20),
	`professionalLicenseNumber` varchar(100),
	`licenseStartDate` date,
	`licenseEndDate` date,
	`employeeNumber` varchar(100),
	`jobTitle` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teacherProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `teacherProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userEvidence` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userEvidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
