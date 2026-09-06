import { Skeleton, Box } from "@mantine/core";

const headStyle: React.CSSProperties = {
  padding: "10px 14px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  color: "#777",
  whiteSpace: "nowrap",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const headStyleCenter: React.CSSProperties = { ...headStyle, textAlign: "center" };

const headStyleSticky: React.CSSProperties = {
  ...headStyleCenter,
  position: "sticky",
  right: 0,
  backgroundColor: "#f5f7fa",
  zIndex: 2,
  boxShadow: "-2px 0 5px rgba(0,0,0,0.07)",
};

const cellStyle: React.CSSProperties = {
  padding: "12px 14px",
  whiteSpace: "nowrap",
};

interface TableSkeletonProps {
  /** Jumlah baris skeleton (default 8) */
  rows?: number;
  /** Jumlah kolom data — kolom Aksi otomatis ditambah jika hasAction (default 6) */
  cols?: number;
  /** Render kolom Aksi sticky di kanan, meniru standar report.tsx */
  hasAction?: boolean;
}

/**
 * Skeleton tabel mengikuti standar dashboard/my-event/report.tsx:
 * header uppercase bg #f5f7fa + baris Mantine Skeleton.
 * Dipakai menggantikan teks "Memuat data..." / blank state saat fetch.
 */
const TableSkeleton = ({ rows = 8, cols = 6, hasAction = true }: TableSkeletonProps) => {
  return (
    <Box style={{ overflowX: "auto", position: "relative" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #f0f0f0" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e8e8e8", backgroundColor: "#f5f7fa" }}>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={`h${i}`} style={headStyle}>
                <Skeleton height={10} width={`${45 + ((i * 13) % 35)}%`} radius="sm" />
              </th>
            ))}
            {hasAction && (
              <th style={headStyleSticky}>
                <Skeleton height={10} width={30} radius="sm" />
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={`r${r}`} style={{ borderBottom: "1px solid #f0f0f0" }}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={`c${c}`} style={cellStyle}>
                  <Skeleton
                    height={12}
                    width={`${35 + ((r * 17 + c * 11) % 50)}%`}
                    radius="sm"
                    visible
                  />
                </td>
              ))}
              {hasAction && (
                <td
                  key="action"
                  style={{
                    ...cellStyle,
                    position: "sticky",
                    right: 0,
                    backgroundColor: "white",
                    zIndex: 1,
                    boxShadow: "-2px 0 5px rgba(0,0,0,0.07)",
                    textAlign: "center",
                  }}
                >
                  <Skeleton height={28} width={28} radius="sm" circle />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export default TableSkeleton;
