-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: seefooddb
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(8190) DEFAULT NULL,
  `rating` tinyint(1) DEFAULT NULL,
  `date` date NOT NULL,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `review_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idcomments_UNIQUE` (`id`),
  KEY `comment_user_FK_idx` (`user_id`),
  KEY `comment_restaurant_FK_idx` (`restaurant_id`),
  KEY `comment_review_FK_idx` (`review_id`),
  CONSTRAINT `comment_restaurant_FK` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comment_review_FK` FOREIGN KEY (`review_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comment_user_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,'Very good restaurant',5,'2022-11-10',2,1,NULL),(2,'Best. Hot. Pot. Ever.',5,'2022-12-24',3,1,NULL),(3,'Pretty Mid.',3,'2022-12-18',4,1,NULL),(4,'Excellent seafood.',5,'2022-11-10',2,2,NULL),(8,'Decent sushi for the price.',4,'2022-11-11',2,4,NULL),(9,'ahh the pepeloni, pepeloni. you know the pepeloni? the nooo one. i always, i always order the, the domino. domino pepeloni and without pepeloni. i always order the pepeloni and without pepeloni. pepeloni! i like pepeloni, yeah. i always, i always order the, the cheese- cheese pan. ahh how can i explain? i can explain by my drawing! i always order like the cheese pan that it has cheese on here, this part, the ear. ear of pizza. and then, i order- wh- when i order pepeloni, the ear- it always have a pepeloni on h- on a top, but i pick up these... away! cause i don\'t eat it. and then i eat the cheese pan pizza. okay? you understand? understandable! pepeloni! yes.',5,'1818-08-18',18,3,NULL),(11,'The hainanese chicken rice they serve here is simply unbeatable! A michelin star top-notch demostration of Singapoeran cuisine. Simply devine. Top-notch. Unbeatable. Chicken.',4,'2022-12-22',8,6,NULL),(12,'ikr frfr',NULL,'2022-12-29',6,1,2),(13,'what? And how did you make a review before the internet was even born?',NULL,'2022-12-14',5,3,9),(14,'@Mary maybe time travellers are real ?',NULL,'2022-12-18',6,3,9),(15,'mood',NULL,'2022-12-19',7,3,9),(16,'Not mid.',NULL,'2022-12-21',3,1,3),(17,'Get out bot',NULL,'2022-12-27',7,6,11);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-05 20:44:48
