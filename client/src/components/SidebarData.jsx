import React from "react";
import * as IoIcons from "react-icons/io";
import * as RiIcons from "react-icons/ri";
import { AiFillDatabase } from "react-icons/ai";
import config from "../config.json";

const tabNames = Object.values(config.databases).map(database => (database.db_name));
const subTab = Object.values(config.databases).map(database => Object.values(database.db_columns));

const sidebarItems = tabNames.map((dataBaseName, index) => ({
	title: dataBaseName,
	path: index === 0 ? "/" : `/${dataBaseName}`,
	icon: <AiFillDatabase className="sidebar-icon" />,
	iconClosed: <RiIcons.RiArrowDownSFill className="sidebar-icon" />,
	iconOpened: <RiIcons.RiArrowUpSFill className="sidebar-icon" />,
	subNav: subTab[index]
	  .filter((tableName) => tableName !== "Timestamp") // Exclude "Timestamp" table
	  .map((tableName) => ({
		title: tableName,
		path: `/${dataBaseName}/${tableName}`,
		icon: <IoIcons.IoIosPaper className="sidebar-icon" />,
		iconClosed: <RiIcons.RiArrowDownSFill className="sidebar-icon" />,
		iconOpened: <RiIcons.RiArrowUpSFill className="sidebar-icon" />,
	  })),
  }));
  

export const SidebarData = sidebarItems;
