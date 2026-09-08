import { Flex, MantineColor, Pagination as MantinePagination, Select, Text } from "@mantine/core";

interface TablePaginationProps {
  /** Halaman aktif (1-based) */
  page: number;
  onPageChange: (page: number) => void;
  /** Total baris setelah filter */
  total: number;
  /** Jumlah baris per halaman */
  rowsPerPage: number;
  onRowsPerPageChange?: (value: number) => void;
  /** Opsi rows-per-page (default 10/20/50/100) */
  rowsPerPageOptions?: string[];
  /** Label satuan data, mis. "transaksi" (default tanpa satuan) */
  unit?: string;
  /** Reset ke halaman 1 saat rows-per-page berubah */
  color?: MantineColor;
}

/**
 * Standar pagination tabel mengikuti dashboard/my-event/report.tsx:
 * - Info "Menampilkan X sampai Y dari Z [unit]" di atas tabel
 * - Footer: "Halaman X dari Y" + Mantine Pagination withEdges + "X–Y / Z"
 * - Select rows-per-page opsional (standar venue-transaction toolbar)
 */
const TablePagination = ({
  page,
  onPageChange,
  total,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = ["10", "20", "50", "100"],
  unit,
  color = "blue",
}: TablePaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = total > 0 ? (page - 1) * rowsPerPage + 1 : 0;
  const end = Math.min(page * rowsPerPage, total);

  return (
    <>
      {onRowsPerPageChange && (
        <Select
          value={String(rowsPerPage)}
          onChange={(val) => {
            if (val) onRowsPerPageChange(Number(val));
          }}
          data={rowsPerPageOptions}
          style={{ width: 70 }}
          size="sm"
          aria-label="Rows per page"
        />
      )}

      <Text size="xs" c="gray">
        Menampilkan {start} sampai {end} dari {total} {unit ?? ""}
      </Text>

      <Flex
        justify={{ base: "center", sm: "space-between" }}
        align="center"
        direction={{ base: "column", sm: "row" }}
        gap="xs"
        mt={10}
        px={4}
        py={14}
        style={{
          borderTop: "1px solid #ebebeb",
          backgroundColor: "#fafafa",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <Text size="xs" c="dimmed" className="hidden sm:block">
          Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
        </Text>
        <MantinePagination
          total={totalPages}
          value={page > totalPages ? 1 : page}
          onChange={onPageChange}
          size="sm"
          radius="xl"
          withEdges
          color={color}
          styles={{ control: { border: "1px solid #e0e0e0", fontWeight: 600 } }}
        />
        <Text size="xs" c="dimmed" ta={{ base: "center", sm: "right" }}>
          Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>{" "}
          <span className="sm:hidden">·</span>{" "}
          {total > 0 ? `${start}\u2013${end}` : "0"} / {total}
        </Text>
      </Flex>
    </>
  );
};

export default TablePagination;
