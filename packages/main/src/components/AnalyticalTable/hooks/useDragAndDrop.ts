import { enrichEventWithDetails } from '@ui5/webcomponents-react-base/lib/Utils';
import { useCallback, useState } from 'react';

const getColumnId = (column) => {
  return typeof column.accessor === 'string' ? column.accessor : column.id;
};

export const useDragAndDrop = (props, setColumnOrder, columnOrder, resizeInfo, columns: any[]) => {
  const { onColumnsReordered } = props;

  const [dragOver, setDragOver] = useState('');

  const handleDragStart = useCallback(
    (e) => {
      if (resizeInfo.isResizingColumn === e.currentTarget.dataset.columnId) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData('colId', e.currentTarget.dataset.columnId);
    },
    [resizeInfo.isResizingColumn]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDragEnter = useCallback((e) => {
    setDragOver(e.currentTarget.dataset.columnId);
  }, []);

  const handleOnDrop = useCallback(
    (e) => {
      setDragOver('');

      const droppedColId = e.currentTarget.dataset.columnId;
      const draggedColId = e.dataTransfer.getData('colId');
      if (droppedColId === draggedColId) return;

      const internalColumnOrder = columnOrder.length > 0 ? columnOrder : columns.map((col) => getColumnId(col));
      const droppedColIdx = internalColumnOrder.findIndex((col) => col === droppedColId);
      const draggedColIdx = internalColumnOrder.findIndex((col) => col === draggedColId);

      const tempCols = [...internalColumnOrder];
      tempCols.splice(droppedColIdx, 0, tempCols.splice(draggedColIdx, 1)[0]);
      setColumnOrder(tempCols);

      const columnsNewOrder = tempCols.map((tempColId) => columns.find((col) => getColumnId(col) === tempColId));
      onColumnsReordered(
        enrichEventWithDetails(e, {
          columnsNewOrder,
          column: columns[draggedColIdx]
        })
      );
    },
    [columnOrder, onColumnsReordered]
  );

  const handleOnDragEnd = useCallback(() => {
    setDragOver('');
  }, [dragOver]);

  return [dragOver, handleDragEnter, handleDragStart, handleDragOver, handleOnDrop, handleOnDragEnd];
};
