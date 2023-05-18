CREATE TABLE IF NOT EXISTS `pages` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `active` int(1) unsigned NOT NULL default '1',
  `created` datetime default NULL,
  `modified` datetime default NULL,
  `rank` int(10) unsigned default NULL,
  `name` tinytext,
  `body` mediumblob,
  `url` tinytext,
  `metadata` text,
  `ishome` int(1) unsigned NOT NULL default '0',
  `begin` datetime default NULL,
  `end` datetime default NULL,  
  PRIMARY KEY  (`id`)
);

CREATE TABLE IF NOT EXISTS `media` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `active` int(1) unsigned NOT NULL default '1',
  `created` datetime default NULL,
  `modified` datetime default NULL,
  `filename` tinytext,
  `weight` float default NULL,
  `rank` int(10) unsigned default NULL,
  `type` varchar(10) NOT NULL default 'jpg',
  `caption` text,
  PRIMARY KEY  (`id`)
);

CREATE TABLE IF NOT EXISTS `rel_pages_pages` (
  `p_id` int(10) unsigned,
  `c_id` int(10) unsigned,
  `active` int(1) unsigned NOT NULL default '1',
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`p_id`, `c_id`)
);

CREATE TABLE IF NOT EXISTS `rel_pages_media` (
  `p_id` int(10) unsigned,
  `m_id` int(10) unsigned,
  `active` int(1) unsigned NOT NULL default '1',
  `created` datetime default NULL,
  `modified` datetime default NULL,
  PRIMARY KEY  (`p_id`, `m_id`)
);