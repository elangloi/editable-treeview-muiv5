import { CircularProgress, Typography, Box, IconButton } from "@mui/material";
import React, { useRef } from "react";
import TreeItem from "@mui/lab/TreeItem";
import { makeStyles } from "@mui/styles";
import { useDrag, useDrop } from "react-dnd";
import { DragIndicator, MoreVert } from "@mui/icons-material";

const useStyles = makeStyles(() => ({
  activeNode: {
    backgroundColor: "#4EB2FF",
    borderRadius: "4px",
  },
  inactiveNode: {
    backgroundColor: "transparent !important",
  },
  assistiveBar: {
    borderLeft: `1px solid #e3e3e3`,
    marginLeft: "16px",
  },
  actionsContainer: {
    borderRadius: "4px",
    "&:hover": {
      backgroundColor: "#4EB2FF",
    },
  },
  hoverDropTarget: {
    border: "2px dashed #4EB2FF",
    borderRadius: "4px",
  },
}));

/**
 * Defines a recursive tree node with drag and drop re-order capability
 *
 * @param {ITreeNode} props
 */
const TreeNode = ({
  onActionsCallback,
  node,
  activeTreeItem,
  pathToNode,
  onReorder,
  dropRelationships,
  iconMap,
}) => {
  const { uuid, name, children, loading, type, subType, displayName } = node;

  const ref = useRef(null);

  const classes = useStyles();

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

  /**
   * Return true if the drop operation is valid for the given paths
   *
   * If the full source path is included in the destination,
   * the drop should be considered invalid. A loop in the nodes
   * has been generated at this point which breaks the tree structure.
   *
   * @param {string[]} path1 array of node UUIDs
   * @param {string[]} path2 array of node UUIDs
   */
  const dropIsValid = (sourcePath, destinationPath) => {
    let result = false;
    for (let i = 0; i < sourcePath.length; i++) {
      if (sourcePath[i] !== destinationPath[i]) {
        // Prove that the drop is valid if the destination path strays from the source
        result = true;
        break;
      }
    }
    return result;
  };

  // Enables tree node as a drop target for reordering
  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: dropRelationships.dropTargetsAcceptTypes,
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

  /**
   *  Handles action button click by passing
   * deepest clicked node data back to parent
   *
   * @param {React.SyntheticEvent} event via onClick
   */
  const onActionsClick = (event) => {
    event.stopPropagation();
    if (onActionsCallback) {
      onActionsCallback(event, pathToNode, node);
    }
  };

  const nodeIsActive = activeTreeItem && activeTreeItem.uuid === uuid;
  const labelClasses = nodeIsActive ? classes.activeNode : classes.inactiveNode;

  const Icon = iconMap ? iconMap(subType || type) : null;

  // Apply the drag capability to the node label
  drag(ref);

  // Conditionally apply the drop target capability to the node label
  if (dropRelationships.canDropNodesInto.includes(type)) {
    drop(ref);
  }

  return (
    <TreeItem
      classes={{
        group: classes.assistiveBar,
        label: labelClasses,
      }}
      nodeId={uuid}
      icon={loading ? <CircularProgress size={14} /> : null}
      onFocusCapture={(e) => e.stopPropagation()}
      label={
        <div
          ref={ref}
          className={isOverCurrent ? classes.hoverDropTarget : undefined}
        >
          <Typography component="div" className={classes.label}>
            <Box
              display="flex"
              alignItems="center"
              className={classes.actionsContainer}
              style={{ cursor: "auto" }}
            >
              <div
                style={{
                  cursor: "grab",
                }}
              >
                <DragIndicator color="primary" />
              </div>
              {Icon && (
                <Box paddingRight={0.5}>
                  <Icon fontSize="inherit" />
                </Box>
              )}
              {displayName ?? name}
              {onActionsCallback && (
                <IconButton
                  onClick={onActionsClick}
                  {...{ "aria-label": "More Actions" }}
                >
                  <MoreVert color="primary" />
                </IconButton>
              )}
            </Box>
          </Typography>
        </div>
      }
    >
      {children
        ? children.map((childNode) => (
            <TreeNode
              key={`tree-node-${childNode.uuid}`}
              node={childNode}
              pathToNode={[...pathToNode, childNode.uuid]}
              onReorder={onReorder}
              dropRelationships={dropRelationships}
              activeTreeItem={activeTreeItem}
              iconMap={iconMap}
              onActionsCallback={onActionsCallback}
            />
          ))
        : null}
    </TreeItem>
  );
};

export default TreeNode;
