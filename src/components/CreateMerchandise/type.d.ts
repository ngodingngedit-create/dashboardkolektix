type MerchandiseState = {
    name: string;
    sku: string;
    price: number;
    stock: number;
    weight: number;
    description: string;
    image: (Blob | string)[];
    status: boolean;
    variant_name: number;
    is_variant: boolean;
    store_location_id: number | null;
    variant: {
        id?: number;
        name: string;
        sku?: string;
        price?: number;
        weight?: number;
        stock?: number;
        status?: boolean;
        sub_name?: string;
    }[];
};

type ComponentProps = {
    onClose?: () => void;
    id?: string;
};

type MerchandiseShowResponse = {
    id: number,
    creator_id: number,
    slug: string,
    product_name: string,
    description?: string,
    sku: string,
    product_category_id?: number,
    price: string,
    qty: number,
    product_brand_id?: number,
    is_product_varian: 1 | 0,
    weight: string,
    show_stock_out: 1 | 0,
    max_purchase_quantity: number,
    low_quantity_warning: number,
    add_to_flash_sale: 1 | 0,
    discount?: string,
    discount_start_date?: string,
    discount_end_date?: string,
    created_by: string,
    updated_by: null | string,
    deleted_at: null | string,
    created_at: string,
    updated_at: null | string
    product_image: {
        id: number;
        product_id: number;
        name: string;
        image: string;
        image_url: string;
    }[];
    product_varian: {
        id: number;
        product_id: number;
        varian_category_id: number;
        varian_name: string;
        sku: string;
        price: string;
        weight: string;
        stock_qty: number;
        product_variant_category: {
            id: number;
            varian_name: string;
        }
    }[];

    // buying_price: string,
    // selling_price: string,
    // variation_price: string,
    // status: number,
    // order: number,
    // can_purchasable: number,
    // refundable: number,
    // description: string,
    // shipping_and_return: string,
    // offer_start_date: string,
    // offer_end_date: string,
    // is_product_quantity_multiply: number,
    // editor_type: string,
    // editor_id: number,
};

type MerchandiseStoreRequest = {
    creator_id: number;
    product_status_id: number;
    product_name: string;
    qty: number;
    sku: string;
    price: number;
    weight: string | number;
    show_stock_out: 1 | 0;
    max_purchase_quantity: number;
    low_quantity_warning: number;
    add_to_flash_sale: 1 | 0;
    discount: number;
    description: string;
    is_product_varian: 1 | 0;
    store_location_id?: number | null;
    image: string[];
    product_variant: VariantStoreRequest[] | string;
};

type VariantStoreRequest = {
    id?: number;
    varian_name: string;
    sku: string;
    price: number;
    weight: number;
    stock_qty: number;
    varian_category_id: number;
    status_product: "active" | "inactive";
};

type VariantCategoryListResponse = {
    id: number;
    varian_name: string;
}