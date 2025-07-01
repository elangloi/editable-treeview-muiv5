import { useState } from "react";
import { Popover, Box, Typography, Button, TextField } from "@mui/material";

/**
 * Add a header node to the root of the outline tree
 *
 * @param {(newSubheaderName: string, addToRoot: boolean) => void} appendNode 
 *  callback to append a node to the outline
 */
const AddHeader = ({ appendNode }) => {
  const [showAddHeaderForm, setShowAddHeaderForm] = useState(null);
  const [newHeaderName, setNewHeaderName] = useState("");

  const closeAddHeaderForm = () => {
    setShowAddHeaderForm(null);
    setNewHeaderName("");
  };

  return (
    <>
      <Button onClick={(event) => setShowAddHeaderForm(event.currentTarget)}>
        Add Header
      </Button>

      {/* Popover for creating new top level header */}
      <Popover
        open={!!showAddHeaderForm}
        anchorEl={showAddHeaderForm}
        onClose={closeAddHeaderForm}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Box padding={1}>
          <Box marginBottom={1}>
            <Typography variant="h5">Add Header</Typography>
          </Box>
          <TextField
            value={newHeaderName}
            onChange={(event) => setNewHeaderName(event.target.value)}
            placeholder="Header Name..."
            label="Header"
          />
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            marginTop={1}
          >
            <Button variant="outlined" onClick={closeAddHeaderForm}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                appendNode(newHeaderName, true);
                closeAddHeaderForm();
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

export default AddHeader;
