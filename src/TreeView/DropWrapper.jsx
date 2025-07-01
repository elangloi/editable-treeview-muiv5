import { useDrop } from "react-dnd";
import React from "react";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  hoverDropTarget: {
    backgroundColor: "red",
  },
}));

/**
 * Provides a configurable droppable wrapper for a tree node to allow drag and drop capability
 *
 * @param {string[]} acceptTypes List of node types accepted by the drop target
 * @param {string[]} pathToNode Inclusive ID list through tree to the current node
 * @param {(x: string[], y: string[], z: string) => void} onReorder Provide a function to enable node reordering
 * @param {ReactNode} children TreeNode to render as a drop target
 */
const DropWrapper = ({ acceptTypes = [], pathToNode, children, onReorder }) => {
  const classes = useStyles();

  // Enables tree node as a drop target for reordering
  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: acceptTypes,
      /**
       * The item passed into the drop function includes
       * data that was passed via the DragWrapper
       */
      drop: (item, monitor) => {
        const didDrop = monitor.didDrop();
        if (didDrop) {
          // Ignore drop on outer tree levels
          return;
        }
        // Prevent nodes from dropping into themselves
        if (!dropIsValid(item.pathToNode, pathToNode)) {
          return;
        }

        // Handle the change here if the node has been moved properly
        onReorder(item.pathToNode, pathToNode, item.type);
      },
      collect: (monitor) => ({
        // Detect deepest node the dragged item is hovering over
        isOverCurrent: monitor.isOver({ shallow: true }),
      }),
    }),
    [pathToNode]
  );

  return (
    <div
      ref={drop}
      className={isOverCurrent ? classes.hoverDropTarget : undefined}
    >
      {children}
    </div>
  );
};

export default DropWrapper;
