
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;

--
-- Database: `led_panel`
--

-- --------------------------------------------------------

--
-- Table structure for table `led_destinations`
--

CREATE TABLE IF NOT EXISTS `led_destinations` (
  `id` bigint(21) NOT NULL AUTO_INCREMENT,
  `project_id` bigint(21) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `led_panels`
--

CREATE TABLE IF NOT EXISTS `led_panels` (
  `id` bigint(21) NOT NULL AUTO_INCREMENT,
  `project_id` bigint(21) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `data` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- --------------------------------------------------------

--
-- Table structure for table `led_panels_data`
--

CREATE TABLE IF NOT EXISTS `led_panels_data` (
  `id` bigint(21) NOT NULL AUTO_INCREMENT,
  `panel_id` bigint(21) DEFAULT NULL,
  `destination_id` bigint(21) DEFAULT NULL,
  `data` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `panel_id` (`panel_id`),
  KEY `destination_id` (`destination_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `led_projects`
--

CREATE TABLE IF NOT EXISTS `led_projects` (
  `id` bigint(21) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

COMMIT;
