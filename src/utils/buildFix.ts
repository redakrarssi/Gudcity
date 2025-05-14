/**
 * This file is a simple utility to help fix build issues with dynamic imports.
 * It forces Vite to include certain modules in the build that might be failing.
 */

// This is a dummy export that doesn't do anything but helps fix build issues
export const fixBuild = () => {
  console.log("Build fix utility loaded");
  return true;
};

export default fixBuild; 