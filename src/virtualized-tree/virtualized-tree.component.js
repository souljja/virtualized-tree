import React, { useRef } from "react";
import { AutoSizer, List } from "react-virtualized";

const ROW_HEIGHT = 20;

const getExpandedItemCount = item => {
  let count = 1;

  if (item.expanded) {
    count += item.children
      .map(getExpandedItemCount)
      .reduce((total, count) => total + count, 0);
  }

  return count;
};

export const VirtualizedTree = React.memo(({ data }) => {
  const listRef = useRef(null);

  const renderItem = (item, keyPrefix) => {
    const onClick = event => {
      event.stopPropagation();
      item.expanded = !item.expanded;
      listRef.current.recomputeRowHeights();
    };

    const props = { key: keyPrefix };
    let children = [];
    let itemText;

    if (item.expanded) {
      props.onClick = onClick;
      itemText = "[-] " + item.name;
      children = item.children.map((child, index) =>
        renderItem(child, keyPrefix + "-" + index)
      );
    } else if (item.children.length) {
      props.onClick = onClick;
      itemText = "[+] " + item.name;
    } else {
      itemText = "    " + item.name;
    }
    children.unshift(
      <div
        key={`${keyPrefix}-label`}
        className="item"
        style={{
          cursor: item.children.length ? "pointer" : "auto"
        }}
      >
        {itemText}
      </div>
    );

    return (
      <ul>
        <li {...props}>{children}</li>
      </ul>
    );
  };

  const cellRenderer = params => (
    <ul key={params.key} style={params.style}>
      {renderItem(data[params.index], params.index)}
    </ul>
  );

  const rowHeight = params =>
    getExpandedItemCount(data[params.index]) * ROW_HEIGHT;
  return (
    <div style={{ width: 500, height: 500 }}>
      <AutoSizer>
        {({ width, height }) => (
          <List
            height={height}
            overscanRowCount={10}
            ref={listRef}
            rowHeight={rowHeight}
            rowRenderer={cellRenderer}
            rowCount={data.length}
            width={width}
          />
        )}
      </AutoSizer>
    </div>
  );
});
