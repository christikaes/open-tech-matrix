import { DisplayItem } from "~/types/techMatrix";
import styles from "./TechRadar.module.css";

interface HoverHighlightsProps {
  hoveredCell: { row: number; col: number } | null;
  numHierarchyColumns: number;
  matrixItems: DisplayItem[];
}

export function HoverHighlights({
  hoveredCell,
  numHierarchyColumns,
  matrixItems,
}: HoverHighlightsProps) {
  if (!hoveredCell) return null;

  return (
    <>
      {/* Row highlight */}
      {hoveredCell.row >= 0 && (
        <div
          className={styles.hoverHighlight}
          style={{
            gridColumn: `${numHierarchyColumns + 2} / span ${matrixItems.length}`,
            gridRow: hoveredCell.row + 2,
          }}
        />
      )}
      
      {/* Column highlight */}
      {hoveredCell.col >= 0 && (
        <div
          className={styles.hoverHighlight}
          style={{
            gridColumn: hoveredCell.col + numHierarchyColumns + 2,
            gridRow: `2 / span ${matrixItems.length}`,
          }}
        />
      )}
    </>
  );
}
