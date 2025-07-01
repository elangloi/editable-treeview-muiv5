/**
 * Helper to flatten heavily nested nodes for simple searching
 *
 * @param {ITreeData[]} result results to return
 * @param {ITreeNode[]} nodes array of nodes to flatten
 * @returns list of flattened nodes
 */
export const flattenNodes = (result, nodes) => {
  if (nodes == null) {
    return result;
  } else if (Array.isArray(nodes)) {
    return nodes.reduce(flattenNodes, result);
  }
  result.push(nodes);
  return flattenNodes(result, nodes.children);
};

/**
 * Helper function to provide reference to a node within the data tree
 *
 * @param {string[]} pathToNode of IDs to node
 * @param {ITreeData[]} tree tree view data
 */
export const getReferenceToNode = (pathToNode, tree) => {
  // Find root node in the list
  let currNode = tree.find((node) => node.uuid === pathToNode[0]);
  // Traverse tree to new node position
  for (let i = 1; i < pathToNode.length; i++) {
    currNode = currNode.children.find((node) => node.uuid === pathToNode[i]);
  }
  return currNode;
};

/**
 * Given a tree node, append the path history and add
 * the new UUID to it then add the full path to the aggregated paths list
 *
 * @param {ITreeData} node current tree node
 * @param {{ uuid: string; name: string }[][]} paths  all paths in the tree
 * @param {{ uuid: string; name: string }[]} appendPath path through the tree up to the current node
 * @param {string} baseNodeUuid deepest node UUID in the active path used to prevent move to self or children of self
 * @param {string} parentNodeUuid parent node UUID of the active node used
 * @param {string[]} dropTargetsAcceptTypes node types that can hold child nodes
 */
const getPathsHelper = (
  node,
  paths,
  appendPath,
  baseNodeUuid,
  parentNodeUuid,
  dropTargetsAcceptTypes
) => {
  if (
    node.uuid !== baseNodeUuid &&
    dropTargetsAcceptTypes.includes(node.type)
  ) {
    // Add current node UUID to the path
    const currPath = [
      ...appendPath.slice(),
      {
        uuid: node.uuid,
        name: node.name,
      },
    ];

    /**
     * Skip the path to the parent of the current node since
     * this move operation would do nothing
     */
    if (node.uuid !== parentNodeUuid) {
      paths.push(currPath);
    }

    // Try to add additional paths from the current node's children
    if (node.children.length > 0) {
      node.children.forEach((childNode) => {
        getPathsHelper(
          childNode,
          paths,
          currPath,
          baseNodeUuid,
          parentNodeUuid,
          dropTargetsAcceptTypes
        );
      });
    }
  }
};

/**
 * Given a path to an active node, return list of valid
 * paths that the active node can be moved to
 *
 * @param {string[]} pathToActiveNode array of IDs from root node to clicked node
 * @param {ITreeData[]} treeData all current nodes in the tree
 * @param {string[]} dropTargetsAcceptTypes node types that can hold child nodes
 */
export const getValidMoveOptions = (
  pathToActiveNode,
  treeData,
  dropTargetsAcceptTypes
) => {
  const paths = [];

  // Aggregate all paths to all folders
  treeData.forEach((node) => {
    getPathsHelper(
      node,
      paths,
      [],
      pathToActiveNode[pathToActiveNode.length - 1],
      pathToActiveNode.length > 1
        ? pathToActiveNode[pathToActiveNode.length - 2]
        : null,
      dropTargetsAcceptTypes
    );
  });

  return paths;
};

/**
 * Helper to recursively find a node from list of nested nodes
 *
 * @param {ITreeData[]} nodes list of nodes to search in
 * @param {string} uuid uuid of node to find
 * @returns node matching uuid
 */
export const recursiveNodeSearch = (nodes, uuid) => {
  const flatNodes = flattenNodes([], nodes);
  return flatNodes.find((node) => node.uuid == uuid);
};

/**
 *
 * Recursively sort the given nodes by sort order
 *
 * @param {ITreeData[]} nodes items to sort
 * @param {string} parentUuid parent item
 * @return list of sorted nodes
 */
export const recursiveNodeSort = (nodes, parentUuid) => {
  let result = [];

  if (!parentUuid) {
    parentUuid = ""; //set to empty
  }

  /**
   * Get every element whose parentUuid attribute matches the parent's id.
   */
  const children = nodes
    .filter((node) => node.parentUuid == parentUuid)
    .sort((a, b) => {
      return a?.sortOrder - b?.sortOrder;
    });

  /**
   * Recursively sort the children.
   */
  children.forEach((child) => {
    if (child?.children?.length) {
      child.children = recursiveNodeSort(child.children, child.uuid);
    }
    result = [...result, child];
  });

  return result;
};

/**
 *
 * Recursively filter the given nodes based on passed filter function
 *
 * @param {ITreeData[]} nodes items to filter
 * @param {(node: ITreeData) => boolean} filterFn function to filter by
 * @return list of filtered nodes
 */
export const recursiveNodeFilter = (nodes, filterFn) => {
  let result = [];

  /**
   * Get every element matching filter
   */
  const children = nodes.filter(filterFn);

  /**
   * Recursively filter the children.
   */
  children.forEach((child) => {
    if (child?.children?.length) {
      child.children = recursiveNodeFilter(child.children, filterFn);
    }
    result = [...result, child];
  });

  return result;
};

/**
 *
 * Recursively update the given nodes in main node set
 *
 * @param {ITreeData[]} nodes items to update
 * @param {ITreeData[]} updatedNodes updated items
 * @return list of updated nodes
 */
export const recursiveNodeUpdate = (nodes, updatedNodes) => {
  let result = [];

  /**
   * Get every element matching filter
   */
  const children = nodes.map((node) => {
    const updatedNode = updatedNodes.find((uNode) => uNode.uuid == node.uuid);
    if (updatedNode) {
      node = updatedNode;
    }
    return node;
  });

  /**
   * Recursively filter the children.
   */
  children.forEach((child) => {
    if (child?.children?.length) {
      child.children = recursiveNodeUpdate(child.children, updatedNodes);
    }
    result = [...result, child];
  });

  return result;
};

/**
 * Helper to handle outline item move for same level parent
 *
 * @param {ITreeData[]} nodes outline items
 * @param {string} parentUuid unique identifier for parent
 * @param {number} originPosition origin order
 * @param {number} targetPosition target order
 * @returns outline items with new sort orders applied
 */
export const commonParentMove = (
  nodes,
  parentUuid,
  originPosition,
  targetPosition
) => {
  const minSortOrder = Math.min(originPosition, targetPosition);
  const maxSortOrder = Math.max(originPosition, targetPosition);
  const filteredNodes = flattenNodes([], nodes).filter((node) => {
    return (
      node.parentUuid == parentUuid &&
      node.sortOrder >= minSortOrder &&
      node.sortOrder <= maxSortOrder
    );
  });
  filteredNodes.forEach((node) => {
    let sortOrder = node.sortOrder;
    if (sortOrder == originPosition) {
      sortOrder = targetPosition;
    } else if (sortOrder == targetPosition) {
      sortOrder = sortOrder < originPosition ? sortOrder + 1 : sortOrder - 1;
    } else if (sortOrder < targetPosition) {
      sortOrder -= 1;
    } else {
      sortOrder += 1;
    }
    node.sortOrder = sortOrder;
  });
  return recursiveNodeUpdate(nodes, filteredNodes);
};

/**
 * Helper to handle outline item move for different level parent
 *
 * @param {ITreeData[]} nodes outline items
 * @param {ITreeData} originPositionNode  origin item
 * @param {ITreeData} targetPositionNode  target item
 * @returns outline items with new sort orders applied
 */
export const differentParentMove = (
  nodes,
  originPositionNode,
  targetPositionNode
) => {
  //delete source node from node list
  const filteredNodes = recursiveNodeFilter(nodes, (node) => {
    return node.uuid != originPositionNode.uuid;
  });

  const nodesToUpdate = [];

  // update source parent children
  const originParentNode = recursiveNodeSearch(
    filteredNodes,
    originPositionNode.parentUuid
  );
  if (originParentNode) {
    // remove the origin node from parent's children
    originParentNode.children = originParentNode.children.filter((node) => {
      return node.uuid != originPositionNode.uuid;
    });
    nodesToUpdate.push(originParentNode);
  }

  // update origin node's sort order and parentUuid
  originPositionNode.parentUuid = targetPositionNode.parentUuid;
  originPositionNode.sortOrder = targetPositionNode.sortOrder;
  nodesToUpdate.push(originPositionNode);

  // if target is main level, update main level sort orders
  if (targetPositionNode.parentUuid == "") {
    filteredNodes.map((node) => {
      if (node.sortOrder >= targetPositionNode.sortOrder) {
        node.sortOrder = node.sortOrder + 1;
        nodesToUpdate.push(node);
      }
    });
    filteredNodes.push(originPositionNode);
  } else {
    // update target parent children
    const targetParentNode = recursiveNodeSearch(
      filteredNodes,
      targetPositionNode.parentUuid
    );
    if (targetParentNode) {
      targetParentNode.children.map((node) => {
        if (node.sortOrder >= targetPositionNode.sortOrder) {
          node.sortOrder = node.sortOrder + 1;
          nodesToUpdate.push(node);
        }
      });
      targetParentNode.children.push(originPositionNode);
      nodesToUpdate.push(targetParentNode);
    }
  }

  // recursively update affected nodes
  return recursiveNodeUpdate(filteredNodes, nodesToUpdate);
};
