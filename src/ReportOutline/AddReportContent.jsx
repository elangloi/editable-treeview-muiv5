import { useState, useEffect } from "react";
import {
  Popover,
  Box,
  Button,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";

/**
 * Add a report node to the root of the outline tree
 *
 * @param {(newSubheaderName: string, addToRoot: boolean) => void} appendNode
 *  callback to append a node to the outline
 * @param {ITreeData[]} reportNodes report generating node that are not currently in
 *  the outline
 */
const AddReportContent = ({ appendNode, reportNodes }) => {
  const [showAddReportNodeForm, setShowAddReportNodeForm] = useState(null);
  const [nodeUuid, setNodeUuid] = useState("");

  useEffect(() => {
    // Try to autoselect a node when report nodes updates
    if (reportNodes?.length) {
      setNodeUuid(reportNodes[0].uuid);
    }
  }, [reportNodes]);

  return (
    <>
      <Button
        disabled={!reportNodes.length}
        onClick={(event) => setShowAddReportNodeForm(event.currentTarget)}
      >
        Add Report Content
      </Button>

      <Popover
        open={!!showAddReportNodeForm}
        anchorEl={showAddReportNodeForm}
        onClose={() => setShowAddReportNodeForm(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box padding={1}>
          <Box marginBottom={1}>
            <Typography variant="h5">Add Report Content</Typography>
          </Box>
          {reportNodes.length && (
            <Select
              value={nodeUuid}
              placeholder="Add Report Content"
              label="Add Report Content"
              onChange={(event) => {
                setNodeUuid(event.target.value);
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
              disabled={!nodeUuid}
              onClick={() => {
                const nodeToAdd = reportNodes.find((n) => n.uuid === nodeUuid);
                appendNode(null, true, nodeToAdd);
                setShowAddReportNodeForm(false);
              }}
            >
              Append
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default AddReportContent;
