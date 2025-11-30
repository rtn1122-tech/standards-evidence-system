CREATE TABLE `evidenceSubTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evidenceTemplateId` int NOT NULL,
	`standardId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`applicableSubjects` text,
	`applicableGrades` text,
	`applicableStages` text,
	`applicableSemesters` text,
	`applicableTracks` text,
	`orderIndex` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidenceSubTemplates_id` PRIMARY KEY(`id`)
);
