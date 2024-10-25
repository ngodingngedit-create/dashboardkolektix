import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Tooltip,
  ChipProps,
  Input,
  Pagination,
} from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";



// Define dummy columns and user data
const columns = [
  { name: "INVOICE NO", uid: "invoice_no" },
  { name: "EVENT NAME", uid: "event_name" },
  { name: "PAYMENT STATUS", uid: "payment_status" },
  { name: "TOTAL PRICE", uid: "total_price" },
  { name: "ACTIONS", uid: "actions" },
];

// Data array based on your provided structure
const users = [
  {
    id: 1332,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Hardcore Romance Showcase",
    payment_status: "Verified",
    total_price: "1000",
  },
  // Add more dummy data based on the provided structure, creating similar objects
  {
    id: 1333,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Another Event",
    payment_status: "Pending",
    total_price: "2000",
  },
  {
    id: 1334,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Music Concert",
    payment_status: "Verified",
    total_price: "1500",
  },
  {
    id: 1335,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Art Exhibition",
    payment_status: "Failed",
    total_price: "3000",
  },
  {
    id: 1336,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Tech Conference",
    payment_status: "Verified",
    total_price: "2500",
  },
  {
    id: 1337,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Food Festival",
    payment_status: "Refunded",
    total_price: "4000",
  },
  {
    id: 1338,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Movie Premiere",
    payment_status: "Verified",
    total_price: "1200",
  },
  {
    id: 1339,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Charity Gala",
    payment_status: "Pending",
    total_price: "3500",
  },
  {
    id: 1340,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Sports Day",
    payment_status: "Cancelled",
    total_price: "500",
  },
  {
    id: 1341,
    invoice_no: "KL-17261926895S8ITL",
    event_name: "Networking Event",
    payment_status: "Verified",
    total_price: "700",
  },
];

// Define a mapping of payment status to colors
const paymentStatusColorMap: Record<string, ChipProps["color"]> = {
  Verified: "success",
  Pending: "warning",
  Failed: "danger",
  Cancelled: "danger",
};

// Define the TableDummy component
const TableDummy = () => {
  // State management for search, filter, and pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Number of items per page

  // Handle search input change
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Filter data based on search input
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.event_name.toLowerCase().includes(search.toLowerCase()) ||
      user.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      user.payment_status.toLowerCase().includes(search.toLowerCase()) ||
      user.total_price.includes(search) // assuming total_price can be searched as string
    );
  }, [search]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Function to render each cell based on the column
  const renderCell = React.useCallback((user: any, columnKey: string) => {
    const cellValue = user[columnKey as keyof typeof user];

    switch (columnKey) {
      case "event_name":
        return <p className="text-sm">{cellValue}</p>;
      case "payment_status":
        return (
          <Chip color={paymentStatusColorMap[cellValue] || "default"}>
            {cellValue}
          </Chip>
        );
      case "total_price":
        return <p className="text-sm">{cellValue}</p>;
      case "actions":
        return (
          <div className="flex justify-center">
            <Tooltip content="View">
              <span className="cursor-pointer">
                <FontAwesomeIcon icon={faEye} />
              </span>
            </Tooltip>
            <Tooltip content="Edit">
              <span className="mx-2 cursor-pointer">
                <FontAwesomeIcon icon={faPen} />
              </span>
            </Tooltip>
            <Tooltip content="Delete">
              <span className="cursor-pointer">
                <FontAwesomeIcon icon={faTrash} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, [search]);

  return (
    <div className="container mx-auto p-4 text-dark">
      <h1 className="text-2xl font-bold mb-4">Event Data Table</h1>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          placeholder="Search by invoice no, event name, or payment status"
          value={search}
          onChange={handleSearch}
          fullWidth
          aria-label="Search"
        />
      </div>

      {/* Table Component */}
      <Table aria-label="Event Data Table">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align={column.uid === "actions" ? "center" : "start"}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={paginatedData}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey.toString())}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <Pagination
          total={totalPages}
          initialPage={1}
          page={currentPage}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default TableDummy;
