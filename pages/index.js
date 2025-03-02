import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Navbar, Select, Table } from 'heroui';
import Swal from 'sweetalert2';
import styles from '../styles/Home.module.css';

const Home = () => {
  const [tables, setTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [originalColumns, setOriginalColumns] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      const response = await fetch('/api/tables');
      const tablesData = await response.json();
      setTables(tablesData);
    };
    fetchTables();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTable) return;
      const response = await fetch(`/api/data?table=${selectedTable}`);
      const fetchedData = await response.json();
      setData(fetchedData);
      const columns = Object.keys(fetchedData[0] || {});
      setOriginalColumns(columns);
      setSelectedColumns(columns);
    };
    fetchData();
  }, [selectedTable]);

  const filteredTables = tables.filter(table =>
    table.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleColumnChange = (column) => {
    setSelectedColumns(prevSelectedColumns =>
      prevSelectedColumns.includes(column)
        ? prevSelectedColumns.filter(col => col !== column)
        : [...prevSelectedColumns, column]
    );
  };

  const downloadCSV = () => {
    const headers = selectedColumns.join(',');
    const csvData = data.map(row => selectedColumns.map(col => row[col]).join(',')).join('\n');
    const csvContent = `${headers}\n${csvData}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadText = () => {
    const headers = selectedColumns.join('\t');
    const textData = data.map(row => selectedColumns.map(col => row[col]).join('\t')).join('\n');
    const textContent = `${headers}\n${textData}`;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const showDownloadOptions = () => {
    Swal.fire({
      title: '다운로드 옵션',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: 'CSV로 다운로드',
      denyButtonText: '텍스트로 다운로드',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        downloadCSV();
      } else if (result.isDenied) {
        downloadText();
      }
    });
  };

  const sortedSelectedColumns = originalColumns.filter(col => selectedColumns.includes(col));

  return (
    <div className={styles.container}>
      <Navbar className="bg-primary text-white px-8 py-4">
        <h1 className={styles.logo}>MySQL Database Viewer</h1>
      </Navbar>
      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <Card className="p-4">
            <Input
              className="mb-3"
              placeholder="Search tables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              className="mb-3"
              onChange={(e) => setSelectedTable(e.target.value)}
              value={selectedTable}
            >
              <option value="">Select a table</option>
              {filteredTables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </Select>
            {selectedTable && (
              <div className={styles.columnContainer}>
                <h3 className="text-xl font-semibold mb-2">Columns</h3>
                {originalColumns.map(column => (
                  <div key={column} className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id={column}
                      checked={selectedColumns.includes(column)}
                      onChange={() => handleColumnChange(column)}
                    />
                    <label htmlFor={column} className="ml-2">{column}</label>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </aside>
        <div className={styles.content}>
          {selectedTable && (
            <Card className="flex items-center justify-between mb-4 p-4">
              <h2 className="text-lg font-semibold">Table: {selectedTable}</h2>
              <Button variant="primary" onClick={showDownloadOptions}>다운로드</Button>
            </Card>
          )}
          {data.length > 0 && (
            <>
              <Card className="mb-4 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Data Table</h2>
              </Card>
              <Table>
                <thead>
                  <tr>
                    {sortedSelectedColumns.map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index}>
                      {sortedSelectedColumns.map((col, idx) => (
                        <td key={idx}>{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;