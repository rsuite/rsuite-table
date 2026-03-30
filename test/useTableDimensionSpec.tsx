import React, { useState } from 'react';
import { render, act } from '@testing-library/react';
import Table from '../src/Table';
import Column from '../src/Column';
import Cell from '../src/Cell';
import HeaderCell from '../src/HeaderCell';
import '../src/less/index.less';

const createColumns = (count: number) => {
  return Array.from({ length: count }, (_, i) => (
    <Column width={200} key={i}>
      <HeaderCell>Header {i}</HeaderCell>
      <Cell dataKey={`key${i}`} />
    </Column>
  ));
};

const mockData = (size: number) => {
  return Array.from({ length: size }, (_, i) => ({
    id: i,
    name: `name${i}`,
    key0: `cell${i}-0`,
    key1: `cell${i}-1`,
    key2: `cell${i}-2`,
    key3: `cell${i}-3`
  }));
};

describe('useTableDimension', () => {
  describe('autoHeight with different data sizes', () => {
    it('Should calculate proper height with small data size (size=1)', () => {
      const { container } = render(
        <Table autoHeight data={mockData(1)} rowHeight={46} headerHeight={40}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      // 1 row + header = 46 + 40 = 86px (without scrollbar)
      expect(table).to.exist;
      const height = parseInt(table.style.height);
      expect(height).to.be.greaterThan(0);
    });

    it('Should calculate proper height with larger data size (size=10)', () => {
      const { container } = render(
        <Table autoHeight data={mockData(10)} rowHeight={46} headerHeight={40}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      // 10 rows + header = 460 + 40 = 500px (without scrollbar)
      const height = parseInt(table.style.height);
      // Should be larger than size=1 case
      expect(height).to.be.greaterThan(100);
    });

    it('Should respect maxHeight when autoHeight is enabled', () => {
      const { container } = render(
        <Table autoHeight data={mockData(100)} rowHeight={46} headerHeight={40} maxHeight={200}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      // Should not exceed maxHeight
      expect(height).to.be.at.most(200);
    });

    it('Should respect minHeight when autoHeight is enabled', () => {
      const { container } = render(
        <Table autoHeight data={mockData(1)} rowHeight={46} headerHeight={40} minHeight={500}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      // Should be at least minHeight
      expect(height).to.be.at.least(500);
    });
  });

  describe('horizontal scrollbar scenarios', () => {
    it('Should NOT show horizontal scrollbar when content width < table width', () => {
      const { container } = render(
        <Table autoHeight data={mockData(1)} rowHeight={46} headerHeight={40} width={1000}>
          {createColumns(2)} {/* 2 columns * 200px = 400px < 1000px */}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const scrollbar = container.querySelector('.rs-table-scrollbar-horizontal');
      
      expect(table).to.exist;
      // Horizontal scrollbar should not be visible or have minimal width
      if (scrollbar) {
        expect(scrollbar.clientWidth).to.be.at.most(10);
      }
    });

    it('Should show horizontal scrollbar when content width > table width', () => {
      const { container } = render(
        <Table autoHeight data={mockData(1)} rowHeight={46} headerHeight={40} width={200}>
          {createColumns(4)} {/* 4 columns * 200px = 800px > 200px */}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      expect(table).to.exist;
      
      // Check if horizontal scrollbar exists and is scrollable
      const scrollbar = container.querySelector('.rs-table-scrollbar-horizontal');
      expect(scrollbar).to.exist;
    });

    it('Should add SCROLLBAR_WIDTH to contentHeight when horizontal scrollbar exists with autoHeight', () => {
      const { container } = render(
        <Table autoHeight data={mockData(1)} rowHeight={46} headerHeight={40} width={200}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      
      // Height should include scrollbar width when horizontal scrollbar exists
      // 1 row (46) + header (40) + scrollbar (~10) = ~96px
      expect(height).to.be.at.least(86);
    });

    it('Should handle autoHeight=false with horizontal scrollbar', () => {
      const { container } = render(
        <Table autoHeight={false} data={mockData(5)} rowHeight={46} headerHeight={40} height={200} width={200}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      expect(table).to.exist;
      
      // Should have fixed height
      const height = parseInt(table.style.height);
      expect(height).to.equal(200);
    });
  });

  describe('combined scenarios - data size x scrollbar', () => {
    it('Should handle size=1, autoHeight=true, no horizontal scrollbar', () => {
      const { container } = render(
        <Table autoHeight data={mockData(1)} rowHeight={46} headerHeight={40} width={1000}>
          {createColumns(2)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      
      // 1 row + header = 46 + 40 = 86px
      expect(height).to.be.at.least(80);
    });

    it('Should handle size=1, autoHeight=true, with horizontal scrollbar', () => {
      const { container } = render(
        <Table autoHeight data={mockData(1)} rowHeight={46} headerHeight={40} width={200}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      
      // Should have height including scrollbar
      expect(height).to.be.at.least(86);
    });

    it('Should handle size=10, autoHeight=true, no horizontal scrollbar', () => {
      const { container } = render(
        <Table autoHeight data={mockData(10)} rowHeight={46} headerHeight={40} width={1000}>
          {createColumns(2)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      
      // 10 rows + header = 460 + 40 = 500px
      expect(height).to.be.at.least(400);
    });

    it('Should handle size=10, autoHeight=true, with horizontal scrollbar', () => {
      const { container } = render(
        <Table autoHeight data={mockData(10)} rowHeight={46} headerHeight={40} width={200}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      
      // Should have height for content
      expect(height).to.be.at.least(100);
    });

    it('Should handle size=10, autoHeight=true, maxHeight=200, with horizontal scrollbar', () => {
      const { container } = render(
        <Table autoHeight data={mockData(10)} rowHeight={46} headerHeight={40} maxHeight={200} width={200}>
          {createColumns(4)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      
      // Should respect maxHeight
      expect(height).to.be.at.most(200);
    });
  });

  describe('scroll operations', () => {
    it('Should have vertical scrollbar when content exceeds height', () => {
      const { container } = render(
        <Table 
          data={mockData(50)} 
          rowHeight={46} 
          headerHeight={40} 
          height={200} 
          width={800}
        >
          {createColumns(2)}
        </Table>
      );

      // Check if vertical scrollbar exists
      const verticalScrollbar = container.querySelector('.rs-table-scrollbar-vertical');
      expect(verticalScrollbar).to.exist;
    });

    it('Should have horizontal scrollbar when content exceeds width', () => {
      const { container } = render(
        <Table 
          data={mockData(10)} 
          rowHeight={46} 
          headerHeight={40} 
          height={400} 
          width={200}
        >
          {createColumns(4)}
        </Table>
      );

      // Check if horizontal scrollbar exists
      const horizontalScrollbar = container.querySelector('.rs-table-scrollbar-horizontal');
      expect(horizontalScrollbar).to.exist;
    });
  });

  describe('getTableHeight edge cases', () => {
    it('Should return default height when data is empty and autoHeight is enabled', () => {
      // Tests: if (data?.length === 0 && autoHeight) { return heightProp; }
      const { container } = render(
        <Table autoHeight data={[]} rowHeight={46} headerHeight={40} height={200}>
          {createColumns(2)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);

      // Should use default height for empty state
      expect(height).to.equal(200);
    });

    it('Should fill container height when fillHeight is enabled', () => {
      const { container } = render(
        <div style={{ height: 400 }}>
          <Table fillHeight height={300} data={mockData(5)}>
            {createColumns(2)}
          </Table>
        </div>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);

      // Should fill the container height (400px), not the prop height (300px)
      expect(height).to.equal(400);
    });

    it('Should handle bordered table with autoHeight', () => {
      const { container } = render(
        <Table autoHeight bordered data={mockData(3)} rowHeight={46} headerHeight={40}>
          {createColumns(2)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      
      expect(height).to.be.greaterThan(0);
    });

    it('Should handle showHeader=false with autoHeight', () => {
      const { container } = render(
        <Table autoHeight showHeader={false} data={mockData(3)} rowHeight={46} headerHeight={40}>
          {createColumns(2)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);
      
      // Without header, height should be just the rows
      expect(height).to.be.greaterThan(0);
    });

    it('Should add SCROLLBAR_WIDTH when maxHeight exists, height < maxHeight, and contentWidth > tableWidth', () => {
      // This tests the fix for: https://github.com/rsuite/rsuite/issues/557
      const { container } = render(
        <Table 
          autoHeight 
          data={mockData(3)} 
          rowHeight={46} 
          headerHeight={40} 
          maxHeight={500}  // maxHeight exists and is larger than actual height
          width={200}  // Narrow table to force contentWidth > tableWidth
        >
          {createColumns(4)}  // 4 columns * 200px = 800px {'>'} 200px table width
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const heightWithScrollbar = parseInt(table.style.height);
      
      // 计算预期高度：3 rows * 46 + header 40 = 178px
      // 有横向滚动条时：178 + 10 (SCROLLBAR_WIDTH) = 188px
    //   console.log('有横向滚动条的高度:', heightWithScrollbar);
    //   console.log('预期高度 (3 行 + header + scrollbar):', 3 * 46 + 40 + 10);
      
      // Compare with a table that doesn't have horizontal scrollbar
      const { container: container2 } = render(
        <Table 
          autoHeight 
          data={mockData(3)} 
          rowHeight={46} 
          headerHeight={40} 
          maxHeight={500}
          width={1000}  // Wide table, no horizontal scrollbar
        >
          {createColumns(2)}
        </Table>
      );

      const table2 = container2.querySelector('.rs-table') as HTMLDivElement;
      const heightWithoutScrollbar = parseInt(table2.style.height);
      
    //   console.log('无横向滚动条的高度:', heightWithoutScrollbar);
    //   console.log('预期高度 (3 行 + header):', 3 * 46 + 40);
    //   console.log('高度差值:', heightWithScrollbar - heightWithoutScrollbar);
      
      // The height with horizontal scrollbar should be larger by SCROLLBAR_WIDTH (~10px)
      // Or at least different because of the scrollbar
      expect(heightWithScrollbar).to.be.greaterThan(heightWithoutScrollbar);
    });

    it('Should return tableHeight.current when fillHeight is true', () => {
      // Tests: if (fillHeight) { return tableHeight.current; }
      const { container } = render(
        <div style={{ height: 400 }}>
          <Table fillHeight height={300} data={mockData(5)}>
            {createColumns(2)}
          </Table>
        </div>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);

      // Should fill the container height (400px), not the prop height (300px)
      expect(height).to.equal(400);
    });

    it('Should return heightProp when autoHeight is false', () => {
      // Tests: height = autoHeightProp ? headerHeight + contentHeight.current : heightProp
      const { container } = render(
        <Table autoHeight={false} data={mockData(10)} rowHeight={46} headerHeight={40} height={300}>
          {createColumns(2)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);

      // Should use heightProp (300px), not calculated autoHeight (10*46+40=500px)
      expect(height).to.equal(300);
    });

    it('Should return maxHeight when calculated height > maxHeight', () => {
      // Tests: if (maxHeight && height > maxHeight) { return maxHeight; }
      const { container } = render(
        <Table autoHeight data={mockData(100)} rowHeight={46} headerHeight={40} maxHeight={200}>
          {createColumns(2)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);

      // Calculated height would be 100*46+40=4640px, but should be capped at maxHeight (200px)
      expect(height).to.equal(200);
    });

    it('Should return minHeight when calculated height < minHeight', () => {
      // Tests: if (minHeight && height < minHeight) { return minHeight; }
      const { container } = render(
        <Table autoHeight data={mockData(1)} rowHeight={46} headerHeight={40} minHeight={500}>
          {createColumns(2)}
        </Table>
      );

      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const height = parseInt(table.style.height);

      // Calculated height would be 1*46+40=86px, but should be at least minHeight (500px)
      expect(height).to.equal(500);
    });
  });

  describe('dynamic data changes', () => {
    it('Should recalculate height when data changes', () => {
      const DynamicTable = () => {
        const [size, setSize] = useState(1);
        
        return (
          <div>
            <button onClick={() => setSize(size + 1)}>Add Row</button>
            <Table autoHeight data={mockData(size)} rowHeight={46} headerHeight={40}>
              {createColumns(2)}
            </Table>
          </div>
        );
      };

      const { container, getByText } = render(<DynamicTable />);
      
      const initialTable = container.querySelector('.rs-table') as HTMLDivElement;
      const initialHeight = parseInt(initialTable.style.height);
      
      // Add a row
      act(() => {
        getByText('Add Row').click();
      });

      const updatedTable = container.querySelector('.rs-table') as HTMLDivElement;
      const updatedHeight = parseInt(updatedTable.style.height);
      
      // Height should increase
      expect(updatedHeight).to.be.greaterThan(initialHeight);
    });

    it('Should handle autoHeight toggle', () => {
      const ToggleTable = () => {
        const [autoHeight, setAutoHeight] = useState(true);
        
        return (
          <div>
            <button onClick={() => setAutoHeight(!autoHeight)}>Toggle autoHeight</button>
            <Table autoHeight={autoHeight} data={mockData(10)} rowHeight={46} headerHeight={40} height={200}>
              {createColumns(2)}
            </Table>
          </div>
        );
      };

      const { container, getByText } = render(<ToggleTable />);
      
      const table = container.querySelector('.rs-table') as HTMLDivElement;
      const autoHeightHeight = parseInt(table.style.height);
      
      // Toggle to fixed height
      act(() => {
        getByText('Toggle autoHeight').click();
      });

      const fixedHeightTable = container.querySelector('.rs-table') as HTMLDivElement;
      const fixedHeight = parseInt(fixedHeightTable.style.height);
      
      // Fixed height should be 200
      expect(fixedHeight).to.equal(200);
    });
  });
});
