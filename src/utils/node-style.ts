import { DropZoneInformation } from '../contexts/DNDContextTypes';

interface DropLineInformation {
  startActualDropLine: boolean;
  midActualDropLine: boolean;
  endActualDropLine: boolean;
  actualDropLineDepth?: number;
}

/**
 * Retrieves the actual drop line information for a given node index based on the provided drop zone information.
 *
 * @param {number} nodeIndex - The index of the node for which to get the drop line information.
 * @param {DropZoneInformation | null} dropzoneInformation - The information about the drop zone, including the actual drop index and drop depth.
 * @returns {DropLineInformation} An object containing the drop line information, including whether to start, continue, or end the actual drop line, and the depth of the drop line.
 */
export function getActualDropLineInformation(
  nodeIndex: number,
  dropzoneInformation: DropZoneInformation | null,
): DropLineInformation {
  const showActualDropLines = dropzoneInformation
    ? (dropzoneInformation.actualDropIndex || -1) >
      dropzoneInformation.dropIndex + 1
    : false;

  const droplineInformation: DropLineInformation = {
    startActualDropLine: false,
    midActualDropLine: false,
    endActualDropLine: false,
    actualDropLineDepth: undefined,
  };

  if (showActualDropLines) {
    if (dropzoneInformation) {
      if (nodeIndex === dropzoneInformation.dropIndex) {
        droplineInformation.startActualDropLine = true;
      }
      if (
        nodeIndex > dropzoneInformation.dropIndex &&
        nodeIndex + 1 < (dropzoneInformation.actualDropIndex || -1)
      ) {
        droplineInformation.midActualDropLine = true;
      }
      if (nodeIndex + 1 === dropzoneInformation.actualDropIndex) {
        droplineInformation.endActualDropLine = true;
      }
      droplineInformation.actualDropLineDepth =
        (dropzoneInformation.dropDepth || 1) - 1;
    }
  }

  return droplineInformation;
}
