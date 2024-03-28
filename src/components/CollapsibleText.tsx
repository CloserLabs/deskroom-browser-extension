import { useState } from "react";

interface CollapsibleTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  text,
  ...props
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <div
      className="collapsible-text"
      {...props}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {isCollapsed ? text.slice(0, 50) + "..." : text}
    </div>
  );
};

export default CollapsibleText;
