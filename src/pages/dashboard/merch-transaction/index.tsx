import React, { useEffect, useState, useCallback } from 'react'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Input, Pagination } from '@nextui-org/react';
import { Card } from '@mantine/core';
import { Get } from '@/utils/REST';

interface MerchandiseTransactionData {
  id: number;
  invoice_no: string;
  total_qty: number;
  total_price: number;
  transaction_status_id: number;
  ppn: number;
}

const MerchandiseTransaction = () => {
  
  const [data, setData] = useState<MerchandiseTransactionData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterValue, setFilterValue] = useState('');
  const [page, setPage] = useState(1);

  const onSearchChange = useCallback((e: { target: { value: React.SetStateAction<string>; }; }) => {
    setFilterValue(e.target.value);
  }, []);

  useEffect(() => {
    getData();
  }, [])

  const getData = () => {
    setLoading(true);
    Get('order-bycreator', {})
      .then((res: any) => {
        setData(res.data);
        setLoading(false);
        setError(null);
      })
      .catch((err: any) => {
        setLoading(false);
        setError(err.message);
      });
  }

  const fi = new Proxy(data, {
    get(target, prop, receiver) {
      if (prop === 'filter') {
        return (callback: any) => {
          return Array.prototype.filter.call(target, (item: MerchandiseTransactionData) =>
            item.invoice_no.toLowerCase().includes(filterValue.toLowerCase())
          );
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  }).filter(() => true);

  const totalPages = Math.ceil(fi.length / rowsPerPage);
  const paginatedItems = fi.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }
  
  function onRowsPerPageChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  }

  return (
    <>
      <Card className={`!overflow-auto`} p={20} m={10} withBorder>
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
          <Input
            type="text"
            placeholder="Search by Invoice"
            value={filterValue}
            onChange={onSearchChange}
          />
          <select
            onChange={onRowsPerPageChange}
            value={rowsPerPage}
            className="border border-light-grey p-2 rounded-md w-full md:w-auto"
          >
            {/*<option value={1}>1</option>*/}
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        {
          data.length > 0 ? (
            <>
              <Table
                aria-label="Merchandise Transaction Table"
                style={{
                  height: "auto",
                  minWidth: "100%",
                  backgroundColor: 'white',
                  borderRadius: '0px',
                  padding: '0px',
                }}
              >
                <TableHeader>
                  <TableColumn>Invoice Number</TableColumn>
                  <TableColumn>Total Qty</TableColumn>
                  <TableColumn>Total Price</TableColumn>
                  <TableColumn>Transcation Status ID</TableColumn>
                  <TableColumn>PPN</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item: MerchandiseTransactionData) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.invoice_no}</TableCell>
                      <TableCell>{item.total_qty}</TableCell>
                      <TableCell>{item.total_price}</TableCell>
                      <TableCell>{item.transaction_status_id}</TableCell>
                      <TableCell>{item.ppn}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-start items-center gap-2 mt-4">
                <Pagination
                  page={page}
                  total={totalPages}
                  onChange={setPage}
                  className="items-center"
                />
              </div>
            </>
          ) : (
            <div>No data available</div>
          )
        }
      </Card>
    </>
  )
}

export default MerchandiseTransaction