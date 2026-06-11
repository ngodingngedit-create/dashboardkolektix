type MerchandiseState = {
    name: string;
    sku: string;
    price: number;
    stock: number;
    weight: number;
    description: string;
    image: (Blob | string)[];
    size_chart: (Blob | string)[];
    status: boolean;
    variant_name: number;
    is_variant: boolean;
    store_location_id: number | null;
    is_delivery: boolean;
    is_pickup_instore: boolean;
    is_preorder: boolean;
    pickup_store_id: number | null;
    preorder_date_start: string | null;
    preorder_start_time: string | null;
    preorder_date_end: string | null;
    preorder_end_time: string | null;
    is_promo: boolean;
    promo_title: string | null;
    promo_price: number | null;
    promo_start_date: string | null;
    promo_end_date: string | null;
    promo_start_time: string | null;
    promo_end_time: string | null;
    variant: {
        id?: number;
        name: string;
        sku?: string;
        price?: number;
        weight?: number;
        stock?: number;
        status?: boolean;
        sub_name?: string;
        is_promo?: boolean;
        promo_title?: string | null;
        promo_price?: number | null;
        promo_start_date?: string | null;
        promo_end_date?: string | null;
        promo_start_time?: string | null;
        promo_end_time?: string | null;
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
    is_delivery?: number,
    is_pickup_instore?: number,
    is_preorder?: number,
    pickup_store_id?: number | null,
    preorder_date_start?: string | null,
    preorder_start_time?: string | null,
    preorder_date_end?: string | null,
    preorder_end_time?: string | null,
    is_promo?: number,
    promo_title?: string | null,
    promo_price?: number | null,
    promo_start_date?: string | null,
    promo_end_date?: string | null,
    promo_start_time?: string | null,
    promo_end_time?: string | null,
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
    product_size_chart?: {
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
        };
        is_promo?: number;
        promo_title?: string | null;
        promo_price?: string | null;
        promo_start_date?: string | null;
        promo_end_date?: string | null;
        promo_start_time?: string | null;
        promo_end_time?: string | null;
    }[];
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
    is_delivery: number;
    is_pickup_instore: number;
    is_preorder: number;
    pickup_store_id?: number | null;
    preorder_date_start?: string | null;
    preorder_start_time?: string | null;
    preorder_date_end?: string | null;
    preorder_end_time?: string | null;
    is_promo?: number;
    promo_title?: string | null;
    promo_price?: number | null;
    promo_start_date?: string | null;
    promo_end_date?: string | null;
    promo_start_time?: string | null;
    promo_end_time?: string | null;
    image: string[];
    size_chart?: string[];
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
    is_promo?: number;
    promo_title?: string | null;
    promo_price?: number | null;
    promo_start_date?: string | null;
    promo_end_date?: string | null;
    promo_start_time?: string | null;
    promo_end_time?: string | null;
};

type VariantCategoryListResponse = {
    id: number;
    varian_name: string;
}