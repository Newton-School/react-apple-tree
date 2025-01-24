import { DropZoneInformation } from '../contexts/DNDContextTypes';

interface DropLineInformation {
  startActualDropLine: boolean;
  midActualDropLine: boolean;
  endActualDropLine: boolean;
  actualDropLineDepth?: number;
}

export function getActualDropLineInformation(
  nodeIndex: number,
  dropzoneInformation: DropZoneInformation | null,
) {
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
