ALTER TABLE `evidenceDetails` ADD `status` enum('draft','completed') DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE `evidenceDetails` ADD `lastAutoSaved` timestamp;