-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 06, 2024 at 05:31 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nutriai`
--

-- --------------------------------------------------------

--
-- Table structure for table `diettype`
--

CREATE TABLE `diettype` (
  `id` int(11) NOT NULL,
  `type` enum('VEGETARIAN','VEGAN','GLUTENFREE','DAIRYFREE','LOWFODMAP','KETOGENIC','WHOLE30') NOT NULL,
  `mealID` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `diettype`
--

INSERT INTO `diettype` (`id`, `type`, `mealID`) VALUES
(1, 'VEGETARIAN', 'clt4r17em00077vk6rxn5ukjh'),
(6, 'VEGETARIAN', 'clt4rg19x00051q1akxbvr0sd'),
(41, 'VEGETARIAN', 'clt4rgp4j0005bkr8wwxh4xhp'),
(10, 'VEGETARIAN', 'clt4s6pjk0005orbl1gwpxrw6'),
(43, 'VEGETARIAN', 'clt4wt16y000tlrsnrfr4f0s3'),
(45, 'VEGETARIAN', 'clt4wt6gv000ylrsnu940o5ta'),
(47, 'VEGETARIAN', 'clt4wt9im0013lrsno864a6cf'),
(49, 'VEGETARIAN', 'clt4wtd3q0018lrsnj1o6frwp'),
(51, 'VEGETARIAN', 'clt4wteir001dlrsnf0oi2c6d'),
(53, 'VEGETARIAN', 'clt4wtgaf001ilrsnmp8ahqas'),
(55, 'VEGETARIAN', 'clt4wthy0001nlrsnqaebhwnh'),
(57, 'VEGETARIAN', 'clt4wtj3b001slrsnc1wtqfdn'),
(59, 'VEGETARIAN', 'clt4wtkaz001xlrsnujwxo3r7'),
(61, 'VEGETARIAN', 'clt4wtmvr0022lrsnkd3e77jx'),
(63, 'VEGETARIAN', 'clt4wtnzl0027lrsnjlpsorzr'),
(65, 'VEGETARIAN', 'clt4wtpdh002clrsns0klp0lw'),
(67, 'VEGETARIAN', 'clt4wtqiq002hlrsn6p56njdp'),
(69, 'VEGETARIAN', 'clt4wtron002mlrsnox8tj4pi'),
(71, 'VEGETARIAN', 'clt4wtsxz002rlrsnzuqm96nl'),
(73, 'VEGETARIAN', 'clt4wtu7p002wlrsncx4nxu0z'),
(75, 'VEGETARIAN', 'clt526ybw0035lrsn3cm47ex0'),
(2, 'VEGAN', 'clt4r17em00077vk6rxn5ukjh'),
(7, 'VEGAN', 'clt4rg19x00051q1akxbvr0sd'),
(11, 'VEGAN', 'clt4s6pjk0005orbl1gwpxrw6'),
(44, 'VEGAN', 'clt4wt16y000tlrsnrfr4f0s3'),
(46, 'VEGAN', 'clt4wt6gv000ylrsnu940o5ta'),
(48, 'VEGAN', 'clt4wt9im0013lrsno864a6cf'),
(50, 'VEGAN', 'clt4wtd3q0018lrsnj1o6frwp'),
(52, 'VEGAN', 'clt4wteir001dlrsnf0oi2c6d'),
(54, 'VEGAN', 'clt4wtgaf001ilrsnmp8ahqas'),
(56, 'VEGAN', 'clt4wthy0001nlrsnqaebhwnh'),
(58, 'VEGAN', 'clt4wtj3b001slrsnc1wtqfdn'),
(60, 'VEGAN', 'clt4wtkaz001xlrsnujwxo3r7'),
(62, 'VEGAN', 'clt4wtmvr0022lrsnkd3e77jx'),
(64, 'VEGAN', 'clt4wtnzl0027lrsnjlpsorzr'),
(66, 'VEGAN', 'clt4wtpdh002clrsns0klp0lw'),
(68, 'VEGAN', 'clt4wtqiq002hlrsn6p56njdp'),
(70, 'VEGAN', 'clt4wtron002mlrsnox8tj4pi'),
(72, 'VEGAN', 'clt4wtsxz002rlrsnzuqm96nl'),
(74, 'VEGAN', 'clt4wtu7p002wlrsncx4nxu0z'),
(76, 'VEGAN', 'clt526ybw0035lrsn3cm47ex0'),
(42, 'GLUTENFREE', 'clt4rgp4j0005bkr8wwxh4xhp'),
(3, 'LOWFODMAP', 'clt4r17em00077vk6rxn5ukjh');

-- --------------------------------------------------------

--
-- Table structure for table `dishtype`
--

CREATE TABLE `dishtype` (
  `id` int(11) NOT NULL,
  `type` enum('BREAKFAST','LUNCH','SNACK') NOT NULL,
  `mealID` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dishtype`
--

INSERT INTO `dishtype` (`id`, `type`, `mealID`) VALUES
(1, 'BREAKFAST', 'clt4r17em00077vk6rxn5ukjh'),
(2, 'LUNCH', 'clt4r17em00077vk6rxn5ukjh'),
(23, 'LUNCH', 'clt4rgp4j0005bkr8wwxh4xhp'),
(4, 'SNACK', 'clt4rg19x00051q1akxbvr0sd'),
(22, 'SNACK', 'clt4rgp4j0005bkr8wwxh4xhp'),
(6, 'SNACK', 'clt4s6pjk0005orbl1gwpxrw6'),
(24, 'SNACK', 'clt4wt16y000tlrsnrfr4f0s3'),
(25, 'SNACK', 'clt4wt6gv000ylrsnu940o5ta'),
(26, 'SNACK', 'clt4wt9im0013lrsno864a6cf'),
(27, 'SNACK', 'clt4wtd3q0018lrsnj1o6frwp'),
(28, 'SNACK', 'clt4wteir001dlrsnf0oi2c6d'),
(29, 'SNACK', 'clt4wtgaf001ilrsnmp8ahqas'),
(30, 'SNACK', 'clt4wthy0001nlrsnqaebhwnh'),
(31, 'SNACK', 'clt4wtj3b001slrsnc1wtqfdn'),
(32, 'SNACK', 'clt4wtkaz001xlrsnujwxo3r7'),
(33, 'SNACK', 'clt4wtmvr0022lrsnkd3e77jx'),
(34, 'SNACK', 'clt4wtnzl0027lrsnjlpsorzr'),
(35, 'SNACK', 'clt4wtpdh002clrsns0klp0lw'),
(36, 'SNACK', 'clt4wtqiq002hlrsn6p56njdp'),
(37, 'SNACK', 'clt4wtron002mlrsnox8tj4pi'),
(38, 'SNACK', 'clt4wtsxz002rlrsnzuqm96nl'),
(39, 'SNACK', 'clt4wtu7p002wlrsncx4nxu0z'),
(40, 'SNACK', 'clt526ybw0035lrsn3cm47ex0');

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`id`, `name`) VALUES
('clt4r17e600037vk6rjh6o6oc', 'beans'),
('clt4rcbc30003o251yz3vrttr', 'cucumber'),
('clt4rcbc30004o251fno4foaq', 'lemon'),
('clt4r17e600067vk6vrm3dxvg', 'loaf'),
('clt4r17e600047vk61in87266', 'oliver oil'),
('clt526yb90033lrsny5vhdpv6', 'pasta'),
('clt526yb90032lrsnndjz53fa', 'potato'),
('clt4r17e600057vk6cnqc69kb', 'salt'),
('clt526y180031lrsnhjwt9zhz', 'test'),
('clt4rcbc30001o251c8fe3263', 'tomato');

-- --------------------------------------------------------

--
-- Table structure for table `meal`
--

CREATE TABLE `meal` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `image` varchar(191) NOT NULL,
  `measure` varchar(191) NOT NULL,
  `quantity` double NOT NULL,
  `calories` double NOT NULL,
  `fats` double NOT NULL,
  `carbs` double NOT NULL,
  `protein` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `meal`
--

INSERT INTO `meal` (`id`, `name`, `image`, `measure`, `quantity`, `calories`, `fats`, `carbs`, `protein`) VALUES
('clt4r17em00077vk6rxn5ukjh', 'foul medamis', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 250, 150, 0, 50, 50),
('clt4rg19x00051q1akxbvr0sd', 'salad2', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4rgp4j0005bkr8wwxh4xhp', 'salad', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 201, 150, 0, 50, 50),
('clt4s6pjk0005orbl1gwpxrw6', 'salad4', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wt16y000tlrsnrfr4f0s3', 'salad 5', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wt6gv000ylrsnu940o5ta', 'salad 6', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wt9im0013lrsno864a6cf', 'salad 7', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtd3q0018lrsnj1o6frwp', 'salad 8', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wteir001dlrsnf0oi2c6d', 'salad 9', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtgaf001ilrsnmp8ahqas', 'salad 10', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wthy0001nlrsnqaebhwnh', 'salad 11', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtj3b001slrsnc1wtqfdn', 'salad 12', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtkaz001xlrsnujwxo3r7', 'salad 13', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtmvr0022lrsnkd3e77jx', 'salad 14', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtnzl0027lrsnjlpsorzr', 'salad 15', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtpdh002clrsns0klp0lw', 'salad 16', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtqiq002hlrsn6p56njdp', 'salad 17', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtron002mlrsnox8tj4pi', 'salad 18', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtsxz002rlrsnzuqm96nl', 'salad 19', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt4wtu7p002wlrsncx4nxu0z', 'salad 20', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50),
('clt526ybw0035lrsn3cm47ex0', 'test', 'https://img-c.udemycdn.com/course/240x135/3726582_f4a7.jpg', 'gram', 200, 150, 0, 50, 50);

-- --------------------------------------------------------

--
-- Table structure for table `mealingredients`
--

CREATE TABLE `mealingredients` (
  `mealID` varchar(191) NOT NULL,
  `ingerID` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `mealingredients`
--

INSERT INTO `mealingredients` (`mealID`, `ingerID`) VALUES
('clt4r17em00077vk6rxn5ukjh', 'clt4r17e600037vk6rjh6o6oc'),
('clt4r17em00077vk6rxn5ukjh', 'clt4r17e600047vk61in87266'),
('clt4r17em00077vk6rxn5ukjh', 'clt4r17e600057vk6cnqc69kb'),
('clt4r17em00077vk6rxn5ukjh', 'clt4r17e600067vk6vrm3dxvg'),
('clt4rg19x00051q1akxbvr0sd', 'clt4r17e600047vk61in87266'),
('clt4rg19x00051q1akxbvr0sd', 'clt4rcbc30001o251c8fe3263'),
('clt4rg19x00051q1akxbvr0sd', 'clt4rcbc30003o251yz3vrttr'),
('clt4rg19x00051q1akxbvr0sd', 'clt4rcbc30004o251fno4foaq'),
('clt4rgp4j0005bkr8wwxh4xhp', 'clt4r17e600047vk61in87266'),
('clt4rgp4j0005bkr8wwxh4xhp', 'clt4r17e600057vk6cnqc69kb'),
('clt4rgp4j0005bkr8wwxh4xhp', 'clt4rcbc30001o251c8fe3263'),
('clt4s6pjk0005orbl1gwpxrw6', 'clt4r17e600047vk61in87266'),
('clt4s6pjk0005orbl1gwpxrw6', 'clt4rcbc30001o251c8fe3263'),
('clt4s6pjk0005orbl1gwpxrw6', 'clt4rcbc30003o251yz3vrttr'),
('clt4s6pjk0005orbl1gwpxrw6', 'clt4rcbc30004o251fno4foaq'),
('clt4wt16y000tlrsnrfr4f0s3', 'clt4r17e600047vk61in87266'),
('clt4wt16y000tlrsnrfr4f0s3', 'clt4rcbc30001o251c8fe3263'),
('clt4wt16y000tlrsnrfr4f0s3', 'clt4rcbc30003o251yz3vrttr'),
('clt4wt16y000tlrsnrfr4f0s3', 'clt4rcbc30004o251fno4foaq'),
('clt4wt6gv000ylrsnu940o5ta', 'clt4r17e600047vk61in87266'),
('clt4wt6gv000ylrsnu940o5ta', 'clt4rcbc30001o251c8fe3263'),
('clt4wt6gv000ylrsnu940o5ta', 'clt4rcbc30003o251yz3vrttr'),
('clt4wt6gv000ylrsnu940o5ta', 'clt4rcbc30004o251fno4foaq'),
('clt4wt9im0013lrsno864a6cf', 'clt4r17e600047vk61in87266'),
('clt4wt9im0013lrsno864a6cf', 'clt4rcbc30001o251c8fe3263'),
('clt4wt9im0013lrsno864a6cf', 'clt4rcbc30003o251yz3vrttr'),
('clt4wt9im0013lrsno864a6cf', 'clt4rcbc30004o251fno4foaq'),
('clt4wtd3q0018lrsnj1o6frwp', 'clt4r17e600047vk61in87266'),
('clt4wtd3q0018lrsnj1o6frwp', 'clt4rcbc30001o251c8fe3263'),
('clt4wtd3q0018lrsnj1o6frwp', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtd3q0018lrsnj1o6frwp', 'clt4rcbc30004o251fno4foaq'),
('clt4wteir001dlrsnf0oi2c6d', 'clt4r17e600047vk61in87266'),
('clt4wteir001dlrsnf0oi2c6d', 'clt4rcbc30001o251c8fe3263'),
('clt4wteir001dlrsnf0oi2c6d', 'clt4rcbc30003o251yz3vrttr'),
('clt4wteir001dlrsnf0oi2c6d', 'clt4rcbc30004o251fno4foaq'),
('clt4wtgaf001ilrsnmp8ahqas', 'clt4r17e600047vk61in87266'),
('clt4wtgaf001ilrsnmp8ahqas', 'clt4rcbc30001o251c8fe3263'),
('clt4wtgaf001ilrsnmp8ahqas', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtgaf001ilrsnmp8ahqas', 'clt4rcbc30004o251fno4foaq'),
('clt4wthy0001nlrsnqaebhwnh', 'clt4r17e600047vk61in87266'),
('clt4wthy0001nlrsnqaebhwnh', 'clt4rcbc30001o251c8fe3263'),
('clt4wthy0001nlrsnqaebhwnh', 'clt4rcbc30003o251yz3vrttr'),
('clt4wthy0001nlrsnqaebhwnh', 'clt4rcbc30004o251fno4foaq'),
('clt4wtj3b001slrsnc1wtqfdn', 'clt4r17e600047vk61in87266'),
('clt4wtj3b001slrsnc1wtqfdn', 'clt4rcbc30001o251c8fe3263'),
('clt4wtj3b001slrsnc1wtqfdn', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtj3b001slrsnc1wtqfdn', 'clt4rcbc30004o251fno4foaq'),
('clt4wtkaz001xlrsnujwxo3r7', 'clt4r17e600047vk61in87266'),
('clt4wtkaz001xlrsnujwxo3r7', 'clt4rcbc30001o251c8fe3263'),
('clt4wtkaz001xlrsnujwxo3r7', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtkaz001xlrsnujwxo3r7', 'clt4rcbc30004o251fno4foaq'),
('clt4wtmvr0022lrsnkd3e77jx', 'clt4r17e600047vk61in87266'),
('clt4wtmvr0022lrsnkd3e77jx', 'clt4rcbc30001o251c8fe3263'),
('clt4wtmvr0022lrsnkd3e77jx', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtmvr0022lrsnkd3e77jx', 'clt4rcbc30004o251fno4foaq'),
('clt4wtnzl0027lrsnjlpsorzr', 'clt4r17e600047vk61in87266'),
('clt4wtnzl0027lrsnjlpsorzr', 'clt4rcbc30001o251c8fe3263'),
('clt4wtnzl0027lrsnjlpsorzr', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtnzl0027lrsnjlpsorzr', 'clt4rcbc30004o251fno4foaq'),
('clt4wtpdh002clrsns0klp0lw', 'clt4r17e600047vk61in87266'),
('clt4wtpdh002clrsns0klp0lw', 'clt4rcbc30001o251c8fe3263'),
('clt4wtpdh002clrsns0klp0lw', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtpdh002clrsns0klp0lw', 'clt4rcbc30004o251fno4foaq'),
('clt4wtqiq002hlrsn6p56njdp', 'clt4r17e600047vk61in87266'),
('clt4wtqiq002hlrsn6p56njdp', 'clt4rcbc30001o251c8fe3263'),
('clt4wtqiq002hlrsn6p56njdp', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtqiq002hlrsn6p56njdp', 'clt4rcbc30004o251fno4foaq'),
('clt4wtron002mlrsnox8tj4pi', 'clt4r17e600047vk61in87266'),
('clt4wtron002mlrsnox8tj4pi', 'clt4rcbc30001o251c8fe3263'),
('clt4wtron002mlrsnox8tj4pi', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtron002mlrsnox8tj4pi', 'clt4rcbc30004o251fno4foaq'),
('clt4wtsxz002rlrsnzuqm96nl', 'clt4r17e600047vk61in87266'),
('clt4wtsxz002rlrsnzuqm96nl', 'clt4rcbc30001o251c8fe3263'),
('clt4wtsxz002rlrsnzuqm96nl', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtsxz002rlrsnzuqm96nl', 'clt4rcbc30004o251fno4foaq'),
('clt4wtu7p002wlrsncx4nxu0z', 'clt4r17e600047vk61in87266'),
('clt4wtu7p002wlrsncx4nxu0z', 'clt4rcbc30001o251c8fe3263'),
('clt4wtu7p002wlrsncx4nxu0z', 'clt4rcbc30003o251yz3vrttr'),
('clt4wtu7p002wlrsncx4nxu0z', 'clt4rcbc30004o251fno4foaq'),
('clt526ybw0035lrsn3cm47ex0', 'clt4r17e600037vk6rjh6o6oc'),
('clt526ybw0035lrsn3cm47ex0', 'clt4r17e600047vk61in87266'),
('clt526ybw0035lrsn3cm47ex0', 'clt4rcbc30001o251c8fe3263'),
('clt526ybw0035lrsn3cm47ex0', 'clt4rcbc30003o251yz3vrttr'),
('clt526ybw0035lrsn3cm47ex0', 'clt4rcbc30004o251fno4foaq'),
('clt526ybw0035lrsn3cm47ex0', 'clt526y180031lrsnhjwt9zhz'),
('clt526ybw0035lrsn3cm47ex0', 'clt526yb90032lrsnndjz53fa'),
('clt526ybw0035lrsn3cm47ex0', 'clt526yb90033lrsny5vhdpv6');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `passwordChangedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('USER','ADMIN') NOT NULL DEFAULT 'USER',
  `activated` tinyint(1) NOT NULL DEFAULT 0,
  `blocked` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `password`, `passwordChangedAt`, `role`, `activated`, `blocked`, `createdAt`, `updatedAt`) VALUES
('clt4r13u300007vk6ug1gb80p', 'Admin', 'admin@nutriai.com', '$2b$12$SOKGoo2hmNxB58uoiLwIc.1HOnsZUOFQv0Ryi/qPdIa3mqPrffYka', '2024-02-27 19:16:39.723', 'ADMIN', 1, 0, '2024-02-27 19:16:39.723', '2024-03-05 00:44:04.732'),
('clt626ogp0001s91uxl73xz7k', 'M7mmed 3tef Ewias', 'mohammed.atef.ewais@gmail.com', '$2b$12$Y2AHo/9foK/J0lMDR70axu7bHugpUAQWJU6InnEkT5QeVAz3zU0qS', '2024-02-28 17:16:41.690', 'USER', 1, 0, '2024-02-28 17:16:41.690', '2024-03-02 01:40:29.270'),
('clt62i6cq0006s91uhhejybba', 'Mohammed atef', 'mo256atef@gmail.com', '$2b$12$onPblZ2wCXSeSQ78PmnPUOC.GJwnLe76ROXPiTK2dw9IgQjCbm0Xy', '2024-02-28 17:25:38.090', 'USER', 0, 0, '2024-02-28 17:25:38.090', '2024-02-28 17:25:38.090'),
('cltdno4nr000bduwcn8epkl86', 'M7mmed 3TeF', 'mo25atef@gmail.com', '$2b$12$Bwit3wMx6oaYKWRE7espfu9tC7cL/vnE/mq4i2cZ6rWyevNaxcV9q', '2024-03-05 00:52:30.999', 'USER', 1, 0, '2024-03-05 00:52:30.999', '2024-03-05 00:56:43.236');

-- --------------------------------------------------------

--
-- Table structure for table `user_infos`
--

CREATE TABLE `user_infos` (
  `id` varchar(191) NOT NULL,
  `gender` enum('MALE','FEMALE') NOT NULL DEFAULT 'MALE',
  `height` double NOT NULL DEFAULT 170,
  `weight` double NOT NULL DEFAULT 70,
  `age` double NOT NULL DEFAULT 25,
  `activity` enum('SEDENTARY','LIGHT','MODERATE','HEAVY','ATHLETE') NOT NULL DEFAULT 'SEDENTARY',
  `userID` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_infos`
--

INSERT INTO `user_infos` (`id`, `gender`, `height`, `weight`, `age`, `activity`, `userID`) VALUES
('clt4r13uh00027vk6fxz0xc2d', 'MALE', 170, 70, 25, 'SEDENTARY', 'clt4r13u300007vk6ug1gb80p'),
('clt626ok40005s91uiqko3rbe', 'MALE', 170, 70, 25, 'SEDENTARY', 'clt626ogp0001s91uxl73xz7k'),
('clt62i6dc000as91uef138hz4', 'MALE', 170, 70, 25, 'SEDENTARY', 'clt62i6cq0006s91uhhejybba'),
('cltdno4o3000fduwcrrsbl92s', 'MALE', 170, 70, 25, 'SEDENTARY', 'cltdno4nr000bduwcn8epkl86');

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `userID` varchar(191) NOT NULL,
  `mealID` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`userID`, `mealID`) VALUES
('clt4r13u300007vk6ug1gb80p', 'clt4r17em00077vk6rxn5ukjh'),
('clt626ogp0001s91uxl73xz7k', 'clt4rg19x00051q1akxbvr0sd'),
('clt626ogp0001s91uxl73xz7k', 'clt4s6pjk0005orbl1gwpxrw6'),
('clt626ogp0001s91uxl73xz7k', 'clt4wt9im0013lrsno864a6cf'),
('clt626ogp0001s91uxl73xz7k', 'clt4wtqiq002hlrsn6p56njdp'),
('clt626ogp0001s91uxl73xz7k', 'clt4wtron002mlrsnox8tj4pi'),
('clt626ogp0001s91uxl73xz7k', 'clt4wtsxz002rlrsnzuqm96nl'),
('cltdno4nr000bduwcn8epkl86', 'clt4r17em00077vk6rxn5ukjh'),
('cltdno4nr000bduwcn8epkl86', 'clt4rg19x00051q1akxbvr0sd'),
('cltdno4nr000bduwcn8epkl86', 'clt4rgp4j0005bkr8wwxh4xhp'),
('cltdno4nr000bduwcn8epkl86', 'clt4s6pjk0005orbl1gwpxrw6'),
('cltdno4nr000bduwcn8epkl86', 'clt4wtkaz001xlrsnujwxo3r7');

-- --------------------------------------------------------

--
-- Table structure for table `verification_emails`
--

CREATE TABLE `verification_emails` (
  `id` varchar(191) NOT NULL,
  `sent_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `code` varchar(191) NOT NULL DEFAULT '',
  `count` int(11) NOT NULL DEFAULT 0,
  `userID` varchar(191) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `verification_emails`
--

INSERT INTO `verification_emails` (`id`, `sent_at`, `code`, `count`, `userID`, `createdAt`, `updatedAt`) VALUES
('cltdno4nv000dduwc5u1dand1', '2024-03-05 00:52:31.004', '4TgegjCh', 1, 'cltdno4nr000bduwcn8epkl86', '2024-03-05 00:52:31.004', '2024-03-05 00:52:33.336');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime DEFAULT NULL,
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('3ad4488c-e87c-4413-b7cf-bb0387a4a372', '9eef2fc77c435ac51a0ef83c606ef5463a50e41022c3aa33b3043414665ef1ba', '2024-02-27 19:15:51.512', '20240227191550_create', NULL, NULL, '2024-02-27 19:15:50.522', 1),
('66ebddea-444d-4263-b226-cb3e3c6b53a9', '5e88e626ada39eeb2cef0bd721d8e08a411727d36d80c88647a294b668229bfc', '2024-02-27 20:44:27.814', '20240227204427_update', NULL, NULL, '2024-02-27 20:44:27.712', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `diettype`
--
ALTER TABLE `diettype`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `DietType_type_mealID_key` (`type`,`mealID`),
  ADD KEY `DietType_mealID_fkey` (`mealID`);

--
-- Indexes for table `dishtype`
--
ALTER TABLE `dishtype`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `DishType_type_mealID_key` (`type`,`mealID`),
  ADD KEY `DishType_mealID_fkey` (`mealID`);

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Ingredients_name_key` (`name`);

--
-- Indexes for table `meal`
--
ALTER TABLE `meal`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mealingredients`
--
ALTER TABLE `mealingredients`
  ADD PRIMARY KEY (`mealID`,`ingerID`),
  ADD KEY `MealIngredients_ingerID_fkey` (`ingerID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `user_infos`
--
ALTER TABLE `user_infos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `User_Infos_userID_fkey` (`userID`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`userID`,`mealID`),
  ADD KEY `User_Preferences_mealID_fkey` (`mealID`);

--
-- Indexes for table `verification_emails`
--
ALTER TABLE `verification_emails`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Verification_Emails_userID_fkey` (`userID`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `diettype`
--
ALTER TABLE `diettype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT for table `dishtype`
--
ALTER TABLE `dishtype`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `diettype`
--
ALTER TABLE `diettype`
  ADD CONSTRAINT `DietType_mealID_fkey` FOREIGN KEY (`mealID`) REFERENCES `meal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `dishtype`
--
ALTER TABLE `dishtype`
  ADD CONSTRAINT `DishType_mealID_fkey` FOREIGN KEY (`mealID`) REFERENCES `meal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `mealingredients`
--
ALTER TABLE `mealingredients`
  ADD CONSTRAINT `MealIngredients_ingerID_fkey` FOREIGN KEY (`ingerID`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `MealIngredients_mealID_fkey` FOREIGN KEY (`mealID`) REFERENCES `meal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_infos`
--
ALTER TABLE `user_infos`
  ADD CONSTRAINT `User_Infos_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `User_Preferences_mealID_fkey` FOREIGN KEY (`mealID`) REFERENCES `meal` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `User_Preferences_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `verification_emails`
--
ALTER TABLE `verification_emails`
  ADD CONSTRAINT `Verification_Emails_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
