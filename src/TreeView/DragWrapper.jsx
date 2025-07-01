import { useDrag } from "react-dnd";
import React, { useRef } from "react";

/**
 * Provides a configurable draggable wrapper for a tree node to allow drag and drop capability
 *
 * @param {string} type Type of the current node
 * @param {string[]} pathToNode Inclusive ID list through the tree to the current node
 * @param {ReactNode} children TreeNode to render as a drag target
 */
const DragWrapper = ({ type, pathToNode, children }) => {
  const ref = useRef(null);

  // Enables draggability of a tree node
  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    /**
     * Describes the item metadata to be passed to a
     * drop target
     */
    item: () => ({
      pathToNode: pathToNode,
      type: type,
    }),
    collect: (monitor) => ({
      // Track indication of whether the node is currently being dragged
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(ref);

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }}
    >
      {children}
    </div>
  );
};

export default DragWrapper;
