type MerchandiseState = {
    name: string;
    sku: string;
    price: number;
    description: string;
    image: Blob[];
    status: boolean;
    variant_name: string;
    variant: {
        name: string;
        sku?: string;
        price?: number;
        weight?: number;
        stock?: number;
        status?: boolean;
    }[];
};

type ComponentProps = {
    onClose?: () => void;
    id?: number;
};

type MerchandiseShowResponse = {
    id: number,
    creator_id: number,
    name: string,
    slug: string,
    sku: string,
    product_category_id: number,
    product_brand_id: number,
    barcode_id: number,
    unit_id: number,
    buying_price: string,
    selling_price: string,
    variation_price: string,
    status: number,
    order: number,
    can_purchasable: number,
    show_stock_out: number,
    maximum_purchase_quantity: number,
    low_stock_quantity_warning: number,
    weight: string,
    refundable: number,
    description: string,
    shipping_and_return: string,
    add_to_flash_sale: number,
    discount: string,
    offer_start_date: string,
    offer_end_date: string,
    is_product_quantity_multiply: number,
    editor_type: string,
    editor_id: number,
    created_by: string,
    updated_by: null | string,
    deleted_at: null | string,
    created_at: string,
    updated_at: null | string
};

type MerchandiseStoreRequest = {
    creator_id: number;
    product_name: string;
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
    can_purchasable: 1 | 0;
    show_stock_out: 1 | 0;
    maximum_purchase_quantity: number;
    low_stock_quantity_warning: number;
    // weight: number;
    refundable: 1 | 0;
    description: string;
    // shipping_and_return: string;
    add_to_flash_sale: 1 | 0;
    discount: number;
    // offer_start_date: string;
    // offer_end_date: string;
    is_product_quantity_multiply: 1 | 0;
    // editor_type: string;
    // editor_id: number;
    image: Blob[];
    variant: {
        varian_name: string;
        sku: string;
        price: number;
        weight: number;
        stock_qty: number;
        varian_category_id: number;
        product_status: "active" | "inactive";
    }[];
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
