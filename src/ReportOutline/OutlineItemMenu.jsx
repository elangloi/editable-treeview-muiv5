import React, { useState, useMemo, useEffect } from "react";
import { Box, Button, TextField, Select, MenuItem } from "@mui/material";
import { getValidMoveOptions } from "./utils";
import { REPORT_OUTLINE_ITEM } from "../mockReportData";

/**
 * Renders action menu for a single outline node
 *
 * @param {string} initialName of the node
 * @param {() => void} deleteOutlineNode callback to delete the node
 * @param {(name: string) => void} renameOutlineNode callback to rename the node
 * @param {(name: string) => void} appendNode callback to append a child node
 * @param {ITreeData[]} outlineNodes list of all outline nodes in the tree
 * @param {(targetPath: string[]) => void} moveOutlineNode callback to move the outline node to a new path
 * @param {string[]} pathToActiveNode UUID path through the outline tree to the active node
 * @param {ITreeData[]} reportNodes list of all available report nodes not curently in the outline
 */
const OutlineItemMenu = ({
  initialName,
  deleteOutlineNode,
  renameOutlineNode,
  appendNode,
  outlineNodes,
  moveOutlineNode,
  pathToActiveNode,
  reportNodes,
}) => {
  const [showSubheaderForm, setShowSubheaderForm] = useState(false);
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [showMoveForm, setShowMoveForm] = useState(false);
  const [showAddReportNodeForm, setShowAddReportNodeForm] = useState(null);

  const [newSubheaderName, setNewSubheaderName] = useState("");
  const [newName, setNewName] = useState(initialName);

  const [selectedPath, setSelectedPath] = useState(null);

  const [selectedReportNodeUuid, setSelectedReportNodeUuid] = useState("");

  // Build list of valid paths for select menu
  const paths = useMemo(() => {
    const currPaths = getValidMoveOptions(pathToActiveNode, outlineNodes, [
      REPORT_OUTLINE_ITEM,
    ]);
    return currPaths.map((path) => ({
      label: path.map((node) => node.name).join("/"),
      // Generates a unique string value as the path from root to the target node
      value: path.map((node) => node.uuid).join(","),
    }));
  }, [pathToActiveNode, outlineNodes]);

  // Move the node to the selected path
  const onMove = () => {
    moveOutlineNode(selectedPath.split(","));
    setSelectedPath(null);
  };

  /**
   * Try to select some path by default
   */
  useEffect(() => {
    if (selectedPath === null && paths.length > 0) {
      setSelectedPath(paths[0].value);
    }
  }, [paths, selectedPath]);

  // Try to autoselect a node when report nodes updates
  useEffect(() => {
    if (reportNodes?.length) {
      setSelectedReportNodeUuid(reportNodes[0].uuid);
    }
  }, [reportNodes]);

  return (
    <Box display="flex" flexDirection="column" alignItems="start">
      <Button
        onClick={() => setShowAddReportNodeForm(true)}
        disabled={!reportNodes?.length}
        variant="text"
      >
        Append Report Content
      </Button>
      {showAddReportNodeForm && (
        <Box margin={1} marginLeft={2}>
          {reportNodes?.length && (
            <Select
              value={selectedReportNodeUuid}
              onChange={(event) => {
                setSelectedReportNodeUuid(event.target.value);
              }}
            >
              {reportNodes.map((node) => {
                return <MenuItem value={node.uuid}>{node.name}</MenuItem>;
              })}
            </Select>
          )}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            marginTop={1}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setShowAddReportNodeForm(false);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disabled={!selectedReportNodeUuid}
              onClick={() => {
                const nodeToAdd = reportNodes.find(
                  (n) => n.uuid === selectedReportNodeUuid
                );
                appendNode(null, false, nodeToAdd);
              }}
            >
              Append
            </Button>
          </Box>
        </Box>
      )}
      <Button onClick={() => setShowSubheaderForm(true)} variant="text">
        Append Subheader
      </Button>
      {showSubheaderForm && (
        <Box margin={1} marginLeft={2}>
          <TextField
            value={newSubheaderName}
            onChange={(event) => setNewSubheaderName(event.target.value)}
            placeholder="Subheader Name..."
            label="Subheader"
          />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            marginTop={1}
          >
            <Button
              variant="outlined"
              onClick={() => setShowSubheaderForm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => appendNode(newSubheaderName)}
            >
              Append
            </Button>
          </Box>
        </Box>
      )}

      <Button onClick={() => setShowRenameForm(true)} variant="text">
        Rename '{initialName}'
      </Button>
      {showRenameForm && (
        <Box margin={1} marginLeft={2}>
          <TextField
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Name..."
            label="Name"
          />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            marginTop={1}
          >
            <Button variant="outlined" onClick={() => setShowRenameForm(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => renameOutlineNode(newName)}
            >
              Rename
            </Button>
          </Box>
        </Box>
      )}
      <Button onClick={() => setShowMoveForm(true)} variant="text">
        Move '{initialName}' Into
      </Button>
      {showMoveForm && (
        <Box margin={1} marginLeft={2}>
          <Select
            value={selectedPath}
            label="Move Into this Header"
            onChange={(event) => {
              setSelectedPath(event.target.value);
            }}
          >
            {paths.map((path) => {
              return (
                <MenuItem key={path.value} value={path.value}>
                  {path.label}
                </MenuItem>
              );
            })}
          </Select>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            marginTop={1}
          >
            <Button variant="outlined" onClick={() => setShowMoveForm(false)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onMove}>
              Move
            </Button>
          </Box>
        </Box>
      )}
      <Button onClick={deleteOutlineNode} variant="text">
        Delete '{initialName}'
      </Button>
    </Box>
  );
};

export default OutlineItemMenu;
