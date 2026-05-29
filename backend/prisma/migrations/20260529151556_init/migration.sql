/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `profile_picture` VARCHAR(191) NULL,
    ADD COLUMN `show_articles` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `show_recipes` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `show_stats` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `username` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `feed_posts` (
    `post_id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `allow_comments` BOOLEAN NOT NULL DEFAULT true,
    `media_url` VARCHAR(191) NULL,
    `media_type` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,
    `recipe_id` INTEGER NULL,
    `review_id` INTEGER NULL,

    PRIMARY KEY (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feed_post_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,

    UNIQUE INDEX `feed_post_likes_user_id_post_id_key`(`user_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feed_post_replies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `parent_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `user_username_key` ON `user`(`username`);

-- AddForeignKey
ALTER TABLE `feed_posts` ADD CONSTRAINT `feed_posts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feed_posts` ADD CONSTRAINT `feed_posts_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipe`(`recipe_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feed_posts` ADD CONSTRAINT `feed_posts_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `reviews_given`(`review_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feed_post_likes` ADD CONSTRAINT `feed_post_likes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feed_post_likes` ADD CONSTRAINT `feed_post_likes_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `feed_posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feed_post_replies` ADD CONSTRAINT `feed_post_replies_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feed_post_replies` ADD CONSTRAINT `feed_post_replies_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `feed_posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feed_post_replies` ADD CONSTRAINT `feed_post_replies_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `feed_post_replies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
