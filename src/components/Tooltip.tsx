import { IconButton } from "@radix-ui/themes";
import deskroomIcon from "data-base64:assets/icon.png";
import React, { useEffect, useState } from "react";

import { useTextSelection } from "~hooks/useTextSelection";

type TooltipProps = {
  clickHandler: () => void;
} & React.HTMLAttributes<HTMLDivElement>;

const Tooltip: React.FC<TooltipProps> = ({ clickHandler }) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const { text, rects } = useTextSelection();

  useEffect(() => {
    if (text !== "") {
      const firstRect = rects[0];
      const lastRect = rects[rects.length - 1];

      const top = firstRect.top;
      const left = firstRect.left;

      const tooltipTop = top + window.scrollY - 50;
      const tooltipLeft = left + window.scrollX - 50;

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
    } else {
      setTimeout(() => {
        setTooltipPosition({ top: 0, left: 0 });
      }, 100);
    }
  }, [text, rects]);

  return (
    <div
      className={`tooltip flex items-center justify-end fixed transition-opacity ease-linear duration-75 cursor-pointer w-fit h-fit z-50 hover:scale-110 hover:transition-transform rounded-md ${
        text === "" ? "opacity-0" : "opacity-1"
      }`}
      onClick={clickHandler}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
      }}
    >
      <div className="bg-gray-300 p-1 rounded-lg flex-1 cursor-pointer">
        <IconButton className="cursor-pointer">
          <img src={deskroomIcon} width={45} height={45} />
        </IconButton>
      </div>
      <div className="w-3 overflow-hidden self-end absolute left-8 bottom-0 cursor-pointer">
        <div className="h-2 bg-gray-300 rotate-45 transform origin-bottom-left rounded-sm"></div>
      </div>
    </div>
  );
};

export default Tooltip;
