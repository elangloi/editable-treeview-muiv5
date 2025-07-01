import TreeView from "../TreeView";
import { useState, useMemo } from "react";
import { Notes, CellTower, QueryStats, Summarize } from "@mui/icons-material";
import { Popover, Box, Typography, Button, TextField } from "@mui/material";
import {
  defaultOutline,
  REPORT_OUTLINE_ANALYSIS_DETAILS_ID,
  REPORT_OUTLINE_BACKGROUND_ID,
  REPORT_OUTLINE_ITEM,
  REPORT_OUTLINE_SIGNAL_PARAMETERS_ID,
  backgroundNode,
  signalParametersNode,
  analysisDetailsNode,
} from "../mockReportData";
import {
  flattenNodes,
  recursiveNodeFilter,
  recursiveNodeSearch,
  recursiveNodeSort,
  commonParentMove,
  differentParentMove,
  getReferenceToNode,
} from "./utils";
import cloneDeep from "lodash/cloneDeep";
import OutlineItemMenu from "./OutlineItemMenu";
import { v4 as uuidv4 } from "uuid";
import AddReportContent from "./AddReportContent";
import AddHeader from "./AddHeader";

const ReportOutline = () => {
  // Current outline nodes to generate the report from
  const [outlineNodes, setOutlineNodes] = useState(defaultOutline);

  // Active node to take actions on
  const [activeNode, setActiveNode] = useState(null);
  const [activePathToNode, setActivePathToNode] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Set all nodes as expanded by default
  const [expanded, setExpanded] = useState(
    flattenNodes([], outlineNodes).map((node) => node.uuid)
  );

  const [showAddHeaderForm, setShowAddHeaderForm] = useState(null);
  const [newHeaderName, setNewHeaderName] = useState("");

  /**
   * Report nodes are tied to custom UUIDs that will
   * generate report content
   *
   * This list includes report nodes that can be added to the tree
   * without duplicating nodes that have already been added to the
   * outline
   */
  const reportNodes = useMemo(() => {
    // TODO Any dynamically added nodes will need to be added here
    const flatOutlineNodes = flattenNodes([], outlineNodes);
    return [backgroundNode, signalParametersNode, analysisDetailsNode].filter(
      (reportNode) => {
        // Include the report node if the outline does not have it
        return !flatOutlineNodes.find((node) => {
          return node.uuid === reportNode.uuid;
        });
      }
    );
  }, [outlineNodes]);

  // Set the outlilne back to default
  const resetOutline = () => {
    // TODO Ensure dynamically added nodes are included here
    setOutlineNodes(defaultOutline);
  };

  /**
   * Given a node type, return corresponding icon
   *
   * @param {string} nodeType type of node in the outline tree
   */
  const iconMap = (nodeType) => {
    switch (nodeType) {
      case REPORT_OUTLINE_ITEM:
        return Notes;
      case REPORT_OUTLINE_SIGNAL_PARAMETERS_ID:
        return CellTower;
      case REPORT_OUTLINE_ANALYSIS_DETAILS_ID:
        return QueryStats;
      case REPORT_OUTLINE_BACKGROUND_ID:
        return Summarize;
      default:
        return null;
    }
  };

  /**
   * Handle action button click on a node
   * A context or pop up menu can be opened here
   *
   * @param {React.MouseEvent} event from the action button onClick
   * @param {string[]} pathToNode ids from root to node clicked
   * @param {ITreeData} nodeData tree structure node data
   */
  const onActionsClick = (event, pathToNode, nodeData) => {
    // Default to position of mouse click
    setAnchorEl(event.currentTarget);
    setActiveNode(nodeData);
    setActivePathToNode(pathToNode);
  };

  /**
   * Moves node in tree to another position
   * This function acts on the same level of the target node
   * and does not generate a new branch
   *
   * @param sourceNodePath inclusive path of IDs through the tree to the node to move
   * @param targetNodePath path of IDs through the tree to position the moved node at
   */
  const onReorder = (sourceNodePath, targetNodePath) => {
    let updatedOutlineNodes = cloneDeep(outlineNodes);
    const originPositionNode = recursiveNodeSearch(
      updatedOutlineNodes,
      sourceNodePath[sourceNodePath.length - 1]
    );
    const targetPositionNode = recursiveNodeSearch(
      updatedOutlineNodes,
      targetNodePath[targetNodePath.length - 1]
    );
    if (originPositionNode.parentUuid == targetPositionNode.parentUuid) {
      updatedOutlineNodes = commonParentMove(
        updatedOutlineNodes,
        originPositionNode.parentUuid,
        originPositionNode.sortOrder,
        targetPositionNode.sortOrder
      );
    } else {
      updatedOutlineNodes = differentParentMove(
        updatedOutlineNodes,
        originPositionNode,
        targetPositionNode
      );
    }

    if (originPositionNode && targetPositionNode) {
      setExpanded([...expanded, targetNodePath[targetNodePath.length - 1]]);
      setOutlineNodes(recursiveNodeSort(updatedOutlineNodes));
    }
  };

  // Close outline menu and clean up active node
  const closeOutlineMenu = () => {
    setActiveNode(null);
    setActivePathToNode(null);
    setAnchorEl(null);
  };

  /**
   * Moves the active node into a new branch under the target node path

  * @param {string[]} UUID path to the new parent node for the active node
   */
  const moveOutlineNode = (targetNodePath) => {
    setOutlineNodes((prevNodes) => {
      let newNodes = cloneDeep(prevNodes);

      const newParentNode = getReferenceToNode(targetNodePath, newNodes);
      const nodeToMove = cloneDeep(activeNode);

      // Get a reference to the current parent of the node to move
      let oldParentPath = activePathToNode.slice();
      oldParentPath.pop();
      const oldParentNode = getReferenceToNode(oldParentPath, newNodes);

      // Move node into the new parent
      nodeToMove.parentUuid = newParentNode.uuid;
      newParentNode.children.push(nodeToMove);

      // Prune the node from the previous parent node or tree root
      if (oldParentNode) {
        oldParentNode.children = oldParentNode.children.filter(
          (n) => n.uuid !== nodeToMove.uuid
        );
      } else {
        newNodes = newNodes.filter((n) => n.uuid !== nodeToMove.uuid);
      }

      return recursiveNodeSort(newNodes);
    });

    closeOutlineMenu();
  };

  /**
   * Deletes the active outline node
   */
  const deleteOutlineNode = () => {
    if (activeNode?.uuid) {
      const updatedOutlineNodes = recursiveNodeFilter(
        cloneDeep(outlineNodes),
        (node) => node.uuid != activeNode.uuid
      );
      setOutlineNodes(recursiveNodeSort(updatedOutlineNodes));
    }
    closeOutlineMenu();
  };

  /**
   * Renames the active outline node
   *
   * @param {string} newName for the outline node
   */
  const renameOutlineNode = (newName) => {
    setOutlineNodes((prevOutlineNodes) => {
      const newOutlineNodes = cloneDeep(prevOutlineNodes);
      const nodeToUpdate = getReferenceToNode(
        activePathToNode,
        newOutlineNodes
      );
      nodeToUpdate.name = newName;
      return newOutlineNodes;
    });
    closeOutlineMenu();
  };

  /**
   * Append node to the root of the outline or under
   * the active node

   * @param {string} newSubheaderName name for a new outline node
   * @param {boolean} addToTreeRoot true to add to the end of the tree, false to append under the active node
   * @param {ITreeData} reportNode use a report generating node instead of a default header node
   */
  const appendNode = (newSubheaderName, addToTreeRoot = false, reportNode) => {
    const newNode = reportNode || {
      name: newSubheaderName,
      type: REPORT_OUTLINE_ITEM,
      children: [],
      uuid: uuidv4(),
      sortOrder: 0,
      parentUuid: "",
    };

    setOutlineNodes((prevOutlineNodes) => {
      let newOutlineNodes = cloneDeep(prevOutlineNodes);
      if (addToTreeRoot) {
        newNode.sortOrder = newOutlineNodes.length;
        newOutlineNodes.push(newNode);
      } else {
        const parentNode = getReferenceToNode(
          activePathToNode,
          newOutlineNodes
        );
        newNode.parentUuid = parentNode?.uuid;
        newNode.sortOrder = parentNode?.children?.length
          ? parentNode.children[parentNode.children.length - 1].sortOrder + 1
          : 1;
        parentNode.children.push(newNode);
      }

      return recursiveNodeSort(newOutlineNodes);
    });
    setExpanded([...expanded, newNode.uuid]);
    closeOutlineMenu();
  };

  return (
    /**
     * This should be added to the root of the app
     * so that drag and drop context is available across
     * all content
     */
    <>
      <div className="App">
        <h1>Report Outline</h1>
      </div>
      <Box>
        <Button onClick={resetOutline}>Reset Outline</Button>
        <AddHeader appendNode={appendNode} />
        <AddReportContent appendNode={appendNode} reportNodes={reportNodes} />
      </Box>
      <TreeView
        treeData={outlineNodes}
        activeTreeItem={activeNode && anchorEl ? activeNode : null}
        onActionsCallback={onActionsClick}
        onReorder={onReorder}
        expanded={expanded}
        setExpanded={setExpanded}
        dropRelationships={{
          canDropNodesInto: [REPORT_OUTLINE_ITEM],
          dropTargetsAcceptTypes: [REPORT_OUTLINE_ITEM],
        }}
        treeActions={null}
        iconMap={iconMap}
        searchPlaceholder="Search for outline item..."
      />
      {/* Popoover for inidivual node action menus */}
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box padding={1}>
          <Typography variant="h5">{activeNode?.name}</Typography>
          {activeNode && activePathToNode && (
            <OutlineItemMenu
              deleteOutlineNode={deleteOutlineNode}
              renameOutlineNode={renameOutlineNode}
              appendNode={appendNode}
              initialName={activeNode.name}
              outlineNodes={outlineNodes}
              moveOutlineNode={moveOutlineNode}
              pathToActiveNode={activePathToNode}
              reportNodes={reportNodes}
            />
          )}
        </Box>
      </Popover>
    </>
  );
};

export default ReportOutline;
