export const REPORT_OUTLINE_ANALYSIS_DETAILS_ID = "ANALYSIS_DETAILS";
export const REPORT_OUTLINE_BACKGROUND_ID = "BACKGROUND";
export const REPORT_OUTLINE_ITEM = "OUTLINE_ITEM";
export const REPORT_OUTLINE_SIGNAL_PARAMETERS_ID = "SIGNAL_PARAMETERS";
export const REPORT_OUTLINE_TITLE_ID = "OUTLINE_TITLE";

/**
 * Defines default outline options for report generator
 */

const titleNode = {
  name: "Title",
  type: REPORT_OUTLINE_ITEM,
  children: [],
  uuid: REPORT_OUTLINE_TITLE_ID,
  parentUuid: "",
  sortOrder: 1,
};

export const backgroundNode = {
  name: "Background",
  type: REPORT_OUTLINE_ITEM,
  children: [],
  uuid: REPORT_OUTLINE_BACKGROUND_ID,
  subType: REPORT_OUTLINE_BACKGROUND_ID,
  parentUuid: "",
  sortOrder: 2,
};

export const signalParametersNode = {
  name: "Signal Parameters",
  type: REPORT_OUTLINE_ITEM,
  children: [],
  uuid: REPORT_OUTLINE_SIGNAL_PARAMETERS_ID,
  subType: REPORT_OUTLINE_SIGNAL_PARAMETERS_ID,
  parentUuid: "",
  sortOrder: 3,
};

export const analysisDetailsNode = {
  name: "Analysis Details",
  type: REPORT_OUTLINE_ITEM,
  children: [],
  uuid: REPORT_OUTLINE_ANALYSIS_DETAILS_ID,
  subType: REPORT_OUTLINE_ANALYSIS_DETAILS_ID,
  parentUuid: "",
  sortOrder: 4,
};

export const defaultOutline = [
  titleNode,
  backgroundNode,
  signalParametersNode,
  analysisDetailsNode,
];
