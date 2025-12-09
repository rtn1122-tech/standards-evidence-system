CREATE TABLE `activationCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`sallaOrderId` varchar(100),
	`isUsed` boolean NOT NULL DEFAULT false,
	`usedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`usedAt` timestamp,
	CONSTRAINT `activationCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `activationCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `customEvidences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`standardId` int NOT NULL,
	`evidenceName` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`grades` text NOT NULL,
	`subject` varchar(255),
	`customFields` text,
	`isPublic` boolean NOT NULL DEFAULT false,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'approved',
	`ownerNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`reviewedAt` timestamp,
	CONSTRAINT `customEvidences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customServiceAssignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`templateId` int NOT NULL,
	`imageId` int NOT NULL,
	`position` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customServiceAssignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customServiceImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`originalFilename` varchar(255),
	`fileSize` int,
	`mimeType` varchar(100),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customServiceImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customServiceRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`requestedTemplateIds` text NOT NULL,
	`notes` text,
	`ownerNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `customServiceRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidenceTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`standardId` int NOT NULL,
	`standardCode` varchar(50) NOT NULL,
	`standardName` varchar(255) NOT NULL,
	`evidenceName` varchar(255) NOT NULL,
	`subEvidenceName` varchar(255),
	`description` text NOT NULL,
	`defaultImageUrl` text,
	`page2Boxes` text NOT NULL,
	`userFields` text NOT NULL,
	`subject` varchar(100),
	`stage` enum('kindergarten','primary','middle','high','all') NOT NULL DEFAULT 'all',
	`isActive` boolean NOT NULL DEFAULT true,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidenceTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidences` (
	`id` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`stage` enum('kindergarten','elementary','middle','high','all') NOT NULL,
	`standardId` int NOT NULL,
	`box1Title` varchar(200),
	`box1Content` text,
	`box2Title` varchar(200),
	`box2Content` text,
	`box3Title` varchar(200),
	`box3Content` text,
	`box4Title` varchar(200),
	`box4Content` text,
	`box5Title` varchar(200),
	`box5Content` text,
	`box6Title` varchar(200),
	`box6Content` text,
	`field1Label` varchar(200),
	`field1Value` varchar(500),
	`field2Label` varchar(200),
	`field2Value` varchar(500),
	`field3Label` varchar(200),
	`field3Value` varchar(500),
	`field4Label` varchar(200),
	`field4Value` varchar(500),
	`field5Label` varchar(200),
	`field5Value` varchar(500),
	`field6Label` varchar(200),
	`field6Value` varchar(500),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `printOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('pending','paid','printing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`paperType` enum('standard','premium','vip') NOT NULL DEFAULT 'standard',
	`bindingType` enum('spiral','thermal','luxury') NOT NULL DEFAULT 'spiral',
	`copies` int NOT NULL DEFAULT 1,
	`price` int NOT NULL,
	`evidenceIds` text NOT NULL,
	`shippingAddress` text,
	`trackingNumber` varchar(255),
	`notes` text,
	`sallaOrderId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidAt` timestamp,
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	CONSTRAINT `printOrders_id` PRIMARY KEY(`id`)
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
	`preferredTheme` varchar(100) DEFAULT 'white',
	`preferredCoverTheme` varchar(100) DEFAULT 'theme1',
	`profileImage` text,
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
CREATE TABLE `themes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('full','cover') NOT NULL,
	`previewImageUrl` text,
	`templateFileUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `themes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userEvidences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int NOT NULL,
	`userData` text NOT NULL,
	`customImageUrl` text,
	`themeId` int,
	`coverThemeId` int,
	`pdfUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userEvidences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `gender` enum('male','female');--> statement-breakpoint
ALTER TABLE `users` ADD `activationCode` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionStart` date;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEnd` date;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_phone_unique` UNIQUE(`phone`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_activationCode_unique` UNIQUE(`activationCode`);