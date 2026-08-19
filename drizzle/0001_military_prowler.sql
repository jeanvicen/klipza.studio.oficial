CREATE TABLE `partnershipInquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(320) NOT NULL,
	`organization` varchar(160),
	`interest` enum('tecnologia','cultura','pesquisa','outro') NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnershipInquiries_id` PRIMARY KEY(`id`)
);
