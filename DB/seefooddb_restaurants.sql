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
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(8190) NOT NULL,
  `logo_url` varchar(255) NOT NULL,
  `name` varchar(127) NOT NULL,
  `main_img_url` varchar(255) NOT NULL,
  `opening_hours` varchar(127) DEFAULT NULL,
  `telephone_no` varchar(16) DEFAULT NULL,
  `website` varchar(127) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'The brand Haidilao was founded in 1994. With over 20 years of development, Haidilao International Holding Ltd. has become a world-renowned catering enterprise.\nBy the end of December 31, 2021 ,Haidilao has opened 1329 chain restaurants in China, Singapore, U.S., South Korea, Japan, Canada ,the United Kingdom, Malaysia , Vietnam,Indonesia and Australia.\nOver the years, Haidilao has withstood the challenges of the market as well as customers, and has successfully forged a quality hot pot brand which has earned a reputation for itself. Haidilao combines kinds of characteristics of hot pot in many places of China. As a large-scale chain catering enterprise with operations all over the world, Haidilao adheres to integrity in business. It gives the highest priority to continuously improving the quality and safety of its food products, providing more thoughtful services to its customers while delivering healthier, safer and more nutritious food.','https://ntucclubdtecdn.azureedge.net/assets/images/default-source/shop-gallery-/hdl_1024x682_7.png?sfvrsn=6c579dc0_0','Haidilao','https://www.theo2.co.uk/assets/img/friend-party_web-31642d5304.jpg','8AM - 8PM on weekdays, 9AM - 10PM on Saturdays, closed on sundays','4009-107-107','www.haidilao.com'),(2,'Fish & Co. is a casual, family restaurant chain serving fresh seafood in a pan, a unique dining experience that drew inspiration from the Mediterranean fishermen who caught seafood fresh from the seas, cooked and ate it straight from the pan.\n\nDesigned with a casual, nautical ambience, Fish & Co. uses only the freshest fish and seafood, as well as natural ingredients like olive oil, herbs and various spices from around the world. Fish & Co. has been delighting customers with great tasting meals in generous portions and warm, friendly service – true marks of quality and value.','https://i.imgur.com/H6yNWbo.png','Fish & Co.','https://www.fish-co.com/new_version/wp-content/uploads/2018/11/main_banner-1.jpg','11:00AM - 9:30PM','+65 6224 4480','www.fish-co.com'),(3,'Swensen’s is synonymous with sweet celebrations enjoyed together with loved ones for all occasions. A delectable tradition treasured by families.\n\nWe are Singapore’s Family Restaurant of Choice, championing bonding over food, serving families & ice cream cakes since 1979.','https://searchlogovector.com/wp-content/uploads/2019/11/swensens-logo-vector.png','Swensen\'s','https://swensens.com.sg/wp-content/uploads/2022/10/swensens-singapore-about.jpg','11:30AM - 10:30PM','+65 6788 8128 ','swensens.com.sg'),(4,'Sushi Tei – where expert culinary skills and an innate appreciation of nature come together to inspire and enhance the Japanese dining experience.\n\nSince our debut in 1994, we have forged an identity of our own by combining the intricacies of sashimi with teppanyaki to offer the height of Japanese cuisine to the masses.\n\nSushi Tei is no ordinary dining restaurant. We believe in providing an alluring ambience that sets us apart from a regular diner.\n\nIllustrating the emerging influence Asia has on modern Japanese cuisine, our menu features a fusion of traditional Japanese dishes with modern innovative trends. An ever-evolving selection of appetizers, mains and sushi specials will guarantee you a truly authentic Japanese dining experience.\n\nWe frequently release seasonal themes to entice the taste buds of our customers. Some of which highlight items according to Japan’s seasons – Summer, Fall, Winter, Spring – and specialty items from regions such as Hokkaido, Miyazaki, Kagoshima, and many more.\n\nA modest homegrown Japanese Kaiten (conveyor belt) chain, our open-kitchen concept allows patrons to appreciate the culinary skills of our restaurants’ chefs while relishing mouth-watering savouries.','https://sushitei.com/wp-content/uploads/2020/02/Sushi-Tei-Logo-200.png','Sushi Tei','https://static.toiimg.com/photo/43510178.cms','11:30AM - 10:00PM',NULL,'sushitei.com'),(5,'Come and experience the rich coordination of Italian cuisine, and enjoy your meal!\n\nItalian food culture has a long tradition, built up over many years.\nAll dishes and drinks, from appetizers to desserts, apéritifs\nto digestifs, have their own sophistication. Selecting and combining\nthese elements allows us to form a meal that is more than the sum of its parts,\nas foods complement one another to double the flavors.\nAt Saizeriya, we portion our dishes just right, so diners can enjoy our flavors whether alone\nor with a large group. Not only do we determine portions,\nbut also prices, in order to make it easy to mix and match to create the perfect meal.\nFurthermore, our free condiment section lets our diners\ncustomise their dishes to their hearts’ content.\nCome and experience the rich coordination of Italian cuisine, and enjoy your meal!\n\nLa Buona Tavola','https://chawil.com/wp-content/uploads/2019/12/Saizeriya-Logo.png','Saizeriya','https://www.saizeriya.com.sg/lib/cmn_img/campany_img.jpg','11:00am – 10:00pm (LO : 09:30pm)',NULL,'https://www.saizeriya.com.sg/'),(6,'With a history dating back to 1950s, Hua Yu Wee is an award-winning restaurant that offers an authentically Singapore food experience. We believe in serving unpretentious and tasty seafood and \'Zhi Char\' dishes at affordable prices.\n\nOur signature dishes are Chilli Crab, Black Pepper Crab, Feng Sha Chicken, Lobster with Italian Sauce, La La Hor Fan, Olive Fried Rice... \n\nTry them today!','https://i.imgur.com/mg5eSBa.png','Hua Yu Wee','https://i.ytimg.com/vi/6dxHtymBukk/maxresdefault.jpg','5:00PM - 11:00PM (Last Order 10:30PM)','+65 6442 9313','https://huayuwee5.wixsite.com/website-1');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
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
