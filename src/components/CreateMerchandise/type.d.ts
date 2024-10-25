type MerchandiseState = {
    name: string;
    sku: string;
    price: number;
    description: string;
    image: Blob[];
    variant: {
        name: string;
        value: string[];
    }[];
    variantdetail: {
        sku: string;
        price: number;
        weight: number;
        stock: number;
        status: boolean;
    }[];
};

type ComponentProps = {
    onClose?: () => void;
};

type MerchandiseStoreRequest = {
    creator_id: number;
    name: string;
    sku: string;
    // product_category_id: number;
    // product_brand_id: number;
    // barcode_id: number;
    // unit_id: number;
    buying_price: number;
    selling_price: number;
    variation_price: number;
    status: number;
    order: number;
    can_purchasablze: boolean;
    show_stock_out: boolean;
    maximum_purchase_quantity: number;
    low_stock_quantity_warning: number;
    // weight: number;
    refundable: boolean;
    description: string;
    // shipping_and_return: string;
    add_to_flash_sale: boolean;
    discount: number;
    // offer_start_date: string;
    // offer_end_date: string;
    is_product_quantity_multiply: boolean;
    // editor_type: string;
    // editor_id: number;
    image: Blob[];
};

type VariantStoreRequest = {
    creator_id: number;
    product_id: number;
    product_attribute_id: number;
    product_attribute_option_id: number;
    price: number;
    sku: string;
    qty: number;
    status: 'active' | 'inactive';
};
