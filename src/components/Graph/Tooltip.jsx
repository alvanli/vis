import { useEffect } from "react";

export const Tooltip = ({ interactionData, clusters }) => {
  if (!interactionData) {
    return null;
  }
  
  let displayName = interactionData.name.split("\n")[0];
  if (displayName.length > 20){
    displayName = `${displayName.slice(0,20)}...`;
  }

  return (
    <div
      style={{
        position: 'relative',
        left: interactionData.xPos - 50,
        top: interactionData.yPos + 50,
        color: "#908d96",
        backgroundColor: "#121212",
        padding: 5,
        width: 200,
        textAlign: "center",
        fontSize: 15
      }}
    >
      {/* <div
        style={{
          fontSize: 10,
          textAlign: "left"
        }}
      >
        {clusters[interactionData.label].summary !== "None" && `${clusters[interactionData.label].summary}: `}
      </div> */}
      {displayName}
    </div>
  );
};
