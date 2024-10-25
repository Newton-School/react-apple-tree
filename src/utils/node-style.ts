import { DropZoneInformation } from '../contexts/DNDContextTypes';

export function getActualDropLineInformation(
  nodeIndex: number,
  dropzoneInformation: DropZoneInformation | null,
) {
  const showActualDropLines = dropzoneInformation
    ? (dropzoneInformation.actualDropIndex || -1) >
      dropzoneInformation.dropIndex + 1
    : false;
  const startActualDropLine =
    showActualDropLines &&
    dropzoneInformation &&
    nodeIndex === dropzoneInformation.dropIndex;
  const midActualDropLine =
    showActualDropLines &&
    dropzoneInformation &&
    nodeIndex > dropzoneInformation.dropIndex &&
    nodeIndex + 1 < (dropzoneInformation.actualDropIndex || -1);
  const endActualDropLine =
    showActualDropLines &&
    dropzoneInformation &&
    nodeIndex + 1 === dropzoneInformation.actualDropIndex;
  const checkMultipleDropLine =
    (startActualDropLine && midActualDropLine) ||
    (startActualDropLine && endActualDropLine) ||
    (midActualDropLine && endActualDropLine);
  const actualDropLineDepth =
    showActualDropLines && (dropzoneInformation?.dropDepth || 1) - 1;

  return {
    startActualDropLine,
    midActualDropLine,
    endActualDropLine,
    checkMultipleDropLine,
    actualDropLineDepth,
  };
}
