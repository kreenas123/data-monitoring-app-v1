import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { SidebarData } from "./SidebarData";

const SidebarLink = styled(Link)`
display: flex;
color: #034694;
justify-content: space-between;
align-items: center;
padding: 20px;
list-style: none;
height: 60px;
text-decoration: none;
font-size: 18px;

&:hover {
	background: white;
	border-left: 8px solid #034694;
	filter: brightness(.8);
	cursor: pointer;
}
`;

const SidebarLabel = styled.span`
margin-left: 16px;
`;

const DropdownLink = styled(Link)`
background: #white;
height: 60px;
padding-left: 3rem;
display: flex;
align-items: center;
text-decoration: none;
color: #034694;
font-size: 18px;

&:hover {
	background: white;
	filter: brightness(.8);
	cursor: pointer;
}
`;


const SubMenu = ({ item }) => {
	// console.log(item,'submenuwala')
const [subnav, setSubnav] = useState(false);
const [subSubnav, setSubSubnav] = useState(false);

// const navBarLen = () => {
// 	if(SidebarData.sidesubNav.id > 3){
		
// 	}
// }

// navBarLen();

const showSubnav = () => setSubnav(!subnav);

const showSubSubnav = () => setSubSubnav(!subSubnav)

return (
	<>
	<SidebarLink to={item.path}
	onClick={item.subNav && showSubnav}>
		<div>
		{item.icon}
		<SidebarLabel>{item.title}</SidebarLabel>
		</div>
		<div>
		{item.subNav && subnav
			? item.iconOpened
			: item.subNav
			? item.iconClosed
			: null}
		</div>
	</SidebarLink>
	{subnav &&
		item.subNav.map((item, index) => {
		return (
			<DropdownLink to={item.path} key={index}>
			{item.icon}
			<SidebarLabel>{item.title}</SidebarLabel>
			</DropdownLink>
		);
		})}
	</>
);
};

export default SubMenu;
