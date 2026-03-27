const fs = require('fs');
const path = require('path');

const deliveryPath = path.join(__dirname, '../src/pages/dashboard/delivery/index.tsx');
let deliveryContent = fs.readFileSync(deliveryPath, 'utf8');

// 1. Add useRouter and faPlus
deliveryContent = deliveryContent.replace(
  'import useLoggedUser from "@/utils/useLoggedUser";',
  'import useLoggedUser from "@/utils/useLoggedUser";\nimport { useRouter } from "next/router";'
);
deliveryContent = deliveryContent.replace('faTimes,', 'faTimes,\n  faPlus,');

// 2. Change component name
deliveryContent = deliveryContent.replace('const MerchandiseTransaction: React.FC = () => {', 'const DeliveryPage: React.FC = () => {\n  const router = useRouter();');
deliveryContent = deliveryContent.replace('export default MerchandiseTransaction;', 'export default DeliveryPage;');

// 3. Filter data for shipping
deliveryContent = deliveryContent.replace(
  'const mapped: MerchandiseTransactionData[] = filteredData.map((item: any) => {',
  `filteredData = filteredData.filter((item: any) => item.transaction_status_id === 2 && (item.address || (item.shipping_address && item.shipping_address !== "-")));\n\n      const mapped: MerchandiseTransactionData[] = filteredData.map((item: any) => {`
);

// 4. Remove Tabs wrapper
deliveryContent = deliveryContent.replace(
  /\<Tabs defaultValue="transaction"\>[\s\S]*?\<Tabs\.Panel value="transaction"\>/,
  ''
);
deliveryContent = deliveryContent.replace(
  /\<\/Tabs\.Panel\>[\s\S]*?\<Tabs\.Panel value="shipping"\>[\s\S]*?\<\/Tabs\.Panel\>[\s\S]*?\<\/Tabs\>/,
  ''
);

// 5. Update Actions in Table
const oldAksi = `<Tooltip label="Detail Invoice">
                                                            <ActionIcon 
                                                                variant="subtle" 
                                                                color="blue" 
                                                                onClick={() => handleViewDetail(item)}
                                                            >
                                                                <Icon icon="solar:eye-bold" width={18} />
                                                            </ActionIcon>
                                                        </Tooltip>`;
const newAksi = `<Tooltip label="Update Tracking">
                                                            <ActionIcon 
                                                                variant="subtle" 
                                                                color="green" 
                                                                onClick={() => router.push(\`/dashboard/resiupdate?invoice_no=\${item.invoice_no}\`)}
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} />
                                                            </ActionIcon>
                                                        </Tooltip>`;
deliveryContent = deliveryContent.replace(oldAksi, newAksi);

fs.writeFileSync(deliveryPath, deliveryContent);

// Merch Transaction File
const merchPath = path.join(__dirname, '../src/pages/dashboard/merch-transaction/index.tsx');
let merchContent = fs.readFileSync(merchPath, 'utf8');

// Remove Tabs wrapper
merchContent = merchContent.replace(
  /\<Tabs defaultValue="transaction"\>[\s\S]*?\<Tabs\.Panel value="transaction"\>/,
  ''
);
merchContent = merchContent.replace(
  /\<\/Tabs\.Panel\>[\s\S]*?\<Tabs\.Panel value="shipping"\>[\s\S]*?\<\/Tabs\.Panel\>[\s\S]*?\<\/Tabs\>/,
  ''
);

fs.writeFileSync(merchPath, merchContent);

console.log("Transformation complete!");
