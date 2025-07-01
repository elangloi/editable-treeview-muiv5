/**
 * @typedef {Object} ITreeData
 * @property {string} uuid - Unique identifier for tree node (does not need to be a true UUID, just a unique string)
 * @property {string} type - Type of tree node
 * @property {string} name - Name of tree node
 * @property {ITreeData[]} children - Children nodes of tree node
 * @property {boolean} [loading] - Indicator of tree node loading state
 * @property {number} [sortOrder] - Tree node sort order
 * @property {string} [parentUuid] - Parent identifier of tree node
 * @property {string} [subType] - Optional secondary type of a node
 * @property {string} [displayName] - Optional display name to show instead of the stored name
 * @property {Object.<string, any>} [nodeProperty] - Any other custom properties
 */

/**
 * @typedef {Object} DropRelationships
 * @property {string[]} canDropNodesInto - Node types that can receive dropped nodes
 * @property {string[]} dropTargetsAcceptTypes - Accepted node types for drop targets
 */

/**
 * @typedef {Object} SharedTreeProps
 * @property {(x: React.SyntheticEvent, y: string[], z: ITreeData) => void} onActionsCallback - Support 3-dot action icon click on a tree item
 * @property {ITreeData} activeTreeItem - Optional active tree item
 * @property {(x: string[], y: string[], z: string) => void} [onReorder] - Function to enable node reordering
 * @property {DropRelationships} [dropRelationships] - Describe valid drag/drop behavior between nodes
 * @property {(type: string) => React.ComponentType} [iconMap] - Map node type to icon component
 */

/**
 * @typedef {SharedTreeProps & {
 *   node: ITreeData,
 *   pathToNode: string[]
 * }} ITreeNode
 */

/**
 * @typedef {SharedTreeProps & {
 *   treeData: ITreeData[],
 *   emptyTreeMessage?: string,
 *   useFilter?: boolean,
 *   treeActions?: any,
 *   expanded?: string[],
 *   setExpanded?: (x: string[]) => void,
 *   searchPlaceholder?: string,
 *   disableSearch?: boolean
 * }} ITreeView
 */
