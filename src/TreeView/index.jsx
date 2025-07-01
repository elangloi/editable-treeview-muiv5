import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import { ArrowDropDown, ArrowRight } from "@mui/icons-material";
import MuiTreeView from "@mui/lab/TreeView";
import React, { useCallback, useEffect, useState } from "react";
import TreeNode from "./TreeNode";

/**
 * Generic editable TreeView
 *
 * @param {ITreeProps} props
 */
const TreeView = ({
  treeData,
  activeTreeItem,
  emptyTreeMessage = "No Data Found",
  onActionsCallback,
  useFilter = true,
  onReorder,
  dropRelationships,
  treeActions,
  iconMap,
  expanded: controlledExpanded,
  setExpanded: setControlledExpanded,
  searchPlaceholder,
  disableSearch = false,
}) => {
  // Ids of expanded treeview nodes
  const [expandedInternal, setExpandedInternal] = useState([]);

  const expanded = controlledExpanded || expandedInternal;
  const setExpanded = setControlledExpanded || setExpandedInternal;

  // Filtered set of tree nodes
  const [filteredTreeData, setFilteredTreeData] = useState(null);

  // Current search text for the tree
  const [searchText, setSearchText] = useState("");

  /**
   * Sets expanded nodes in transmitter tree on single click
   *
   * @param _ original source of the event
   * @param {string[]} nodeIds see MUI docs
   */
  const handleTreeViewToggle = (_, nodeIds) => {
    setExpanded(nodeIds);
  };

  /**
   * Handles updates from textfield search
   * @param {string} text from user entry
   */
  const onSearch = (text) => {
    setSearchText(text);
  };

  /**
   * Clears search text
   */
  const clearSearch = () => {
    setSearchText("");
  };

  /**
   * Recursive helper function to filter the treeview against search text
   *
   * @param {ITreeData[]} treeNodes nodes to filter
   * @param {string[]} expandedMatches accumulated list of nodes to expand
   */
  const filterTreeNodes = useCallback(
    (treeNodes, expandedMatches) => {
      return !treeNodes
        ? []
        : treeNodes.reduce((filteredArr, node) => {
            // Filter child nodes by search text
            const filteredChildren = filterTreeNodes(
              node.children,
              expandedMatches
            );

            // If the current node matches text, include it and all children
            if (
              !searchText ||
              node.displayName
                ?.toLowerCase()
                ?.includes(searchText.toLowerCase()) ||
              node.name.toLowerCase().includes(searchText.toLowerCase())
            ) {
              // Note that matching parent may expand nothing, first level of children, or all children
              // Currently includes first level of children
              expandedMatches.push(node.uuid);
              filteredArr.push(node);
            }
            // If current node does not match text but a child does, include it with filtered children
            else if (filteredChildren.length > 0) {
              // Mark this parent node for auto expansion
              expandedMatches.push(node.uuid);

              // Update node to include filtered children
              const filteredNode = {
                ...node,
                children: filteredChildren,
              };
              filteredArr.push(filteredNode);
            }

            return filteredArr;
          }, []);
    },
    [searchText]
  );

  /**
   * Filters tree view when search text is changed
   */
  useEffect(() => {
    const expandedMatches = [];

    // Apply filters and reset expanded structure when search text changes
    const filtered = filterTreeNodes(treeData, expandedMatches);
    setExpanded(expandedMatches);

    // Update filtered tree data
    setFilteredTreeData(filtered);
  }, [treeData, searchText, filterTreeNodes, setExpanded]);

  /**
   * Groups view rendering logic for displaying all tree data, filtered tree data
   * or empty tree message
   */
  const renderTree = () => {
    const visibleTreeData = filteredTreeData || treeData;

    if (!visibleTreeData || visibleTreeData.length === 0) {
      return <Box>{emptyTreeMessage}</Box>;
    } else {
      return (
        <MuiTreeView
          defaultCollapseIcon={
            <IconButton {...{ "aria-label": "Collapse Tree Node" }}>
              <ArrowDropDown />
            </IconButton>
          }
          defaultExpandIcon={
            <IconButton {...{ "aria-label": "Expand Tree Node" }}>
              <ArrowRight />
            </IconButton>
          }
          onNodeToggle={handleTreeViewToggle}
          expanded={expanded}
        >
          {visibleTreeData.map((node) => (
            <TreeNode
              key={`tree-node-${node.uuid}`}
              node={node}
              onActionsCallback={onActionsCallback}
              pathToNode={[node.uuid]}
              onReorder={onReorder}
              dropRelationships={dropRelationships}
              activeTreeItem={activeTreeItem}
              iconMap={iconMap}
            />
          ))}
        </MuiTreeView>
      );
    }
  };

  const renderSearchArea = () => {
    return !disableSearch ? (
      <Box
        marginBottom={1}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems="center"
      >
        <TextField
          variant="outlined"
          value={searchText}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={searchPlaceholder || "Search..."}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment:
              searchText?.length > 0 ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={clearSearch}
                    {...{ "aria-label": "Close Search" }}
                  >
                    <Close style={{ fill: "#ffffff6b" }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
          }}
          inputProps={{ "aria-label": `Search Text` }}
        />
        <Box>{treeActions}</Box>
      </Box>
    ) : null;
  };

  return (
    <Box>
      {useFilter && renderSearchArea()}
      {renderTree()}
    </Box>
  );
};

export default TreeView;
