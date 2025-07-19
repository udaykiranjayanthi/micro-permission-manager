import { ExtensionPermissions } from "../common/types";

chrome.runtime.onInstalled.addListener(() => {
  const defaultState: { permissions: ExtensionPermissions } = {
    permissions: {},
  };
  chrome.storage.local.set(defaultState);
});
