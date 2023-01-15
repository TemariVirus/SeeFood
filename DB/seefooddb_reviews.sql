-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: seefooddb
-- ------------------------------------------------------
-- Server version	8.0.30

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
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` varchar(8190) DEFAULT NULL,
  `rating` tinyint(1) NOT NULL,
  `restaurant_id` int NOT NULL,
  `date` date NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `restaurant_id_FK_idx` (`restaurant_id`),
  KEY `user_id_FK_idx` (`user_id`),
  CONSTRAINT `review_restaurant_FK` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_user_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,'Very good restaurant',5,1,'2022-11-10',2),(2,'Best. Hot. Pot. Ever.',5,1,'2022-12-24',3),(3,'Pretty Mid.',3,1,'2022-12-18',4),(4,'Excellent seafood.',5,2,'2022-11-10',2),(5,'Decent sushi for the price.',4,4,'2022-11-11',2),(6,'pepeloni. you know the pepeloni?\n\nahh the pepeloni, pepeloni. you know the pepeloni? the nooo one. i always, i always order the, the domino. domino pepeloni and without pepeloni. i always order the pepeloni and without pepeloni. pepeloni! i like pepeloni, yeah. i always, i always order the, the cheese- cheese pan. ahh how can i explain? i can explain by my drawing! i always order like the cheese pan that it has cheese on here, this part, the ear. ear of pizza. and then, i order- wh- when i order pepeloni, the ear- it always have a pepeloni on h- on a top, but i pick up these... away! cause i don\'t eat it. and then i eat the cheese pan pizza. okay? you understand? understandable! pepeloni! yes.',5,3,'1818-08-18',18),(7,'The hainanese chicken rice they serve here is simply unbeatable! A michelin star top-notch demostration of Singapoeran cuisine. Simply devine. Top-notch. Unbeatable. Chicken.',4,6,'2022-12-22',8);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-01-15 23:39:21
