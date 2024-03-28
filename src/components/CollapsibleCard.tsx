import { CopyIcon } from "@radix-ui/react-icons";
import { Box, Flex } from "@radix-ui/themes";
import React, { useState } from "react";

function copyToClipboard(content: string) {
  let copyFrom = document.createElement("textarea");
  copyFrom.textContent = content;
  document.body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand("copy");
  copyFrom.blur();
  document.body.removeChild(copyFrom);
}

type CardProps = {
  title: string;
  content: string;
  onCopyClicked?: () => void;
} & React.HTMLAttributes<HTMLDivElement>;
const CollapsibleCard: React.FC<CardProps> = ({
  title,
  content,
  onCopyClicked,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleCopyClick = () => {
    onCopyClicked();
    copyToClipboard(content);
  };
  const handleMouseEnter = () => {
    setIsCollapsed(false);
  };
  return (
    <Box
      className="card w-full h-fit rounded-md shadow-md p-4 bg-white hover:border hover:border-1 hover:border-[#2C2C2C] transition-all ease-in-out duration-75 hover:h-fit"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => {
        setIsCollapsed(true);
      }}
    >
      <Flex className="card-header">
        <Box className="category w-fit py-1 px-2 bg-primary-100 text-primary-700 font-bold rounded-sm text-sm">
          {title}
        </Box>
        <Box
          className="copy ml-auto text-[#C4C4C4] cursor-pointer"
          onClick={handleCopyClick}
        >
          <CopyIcon />
        </Box>
      </Flex>
      <Flex className={`card-content py-2`}>
        <p className={`${isCollapsed ? "line-clamp-3" : "line-clamp-none"}`}>
          {content}
        </p>
      </Flex>
    </Box>
  );
};

export default CollapsibleCard;
