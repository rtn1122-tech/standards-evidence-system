CREATE TABLE `collaborators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password` varchar(255) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastLoginAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collaborators_id` PRIMARY KEY(`id`),
	CONSTRAINT `collaborators_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `evidenceSubTemplates` ADD `createdByCollaboratorId` int;--> statement-breakpoint
ALTER TABLE `evidenceSubTemplates` ADD `createdByCollaboratorEmail` varchar(320);