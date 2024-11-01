export type MerchListResponse = {
    id: number;
    price: string;
    product_name: string;
    product_status_id: number;
    slug: string;
    qty: number;
    created_by: string;
    description: string;
    product_image: {
        id: number;
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
        product_varian_category: {
            id: number;
            varian_name: string;
        }
    }[];
    // creator_id: number;
    // slug: string;
    // sku: string;
    // product_category_id: number;
    // product_brand_id: number;
    // barcode_id: number;
    // unit_id: number;
    // selling_price: string;
    // variation_price: string;
    // status: number;
    // order: number;
    // can_purchasable: number;
    // show_stock_out: number;
    // maximum_purchase_quantity: number;
    // low_stock_quantity_warning: number;
    // weight: string;
    // refundable: number;
    // description: string;
    // shipping_and_return: string;
    // add_to_flash_sale: number;
    // discount: string;
    // offer_start_date: string;
    // offer_end_date: string;
    // is_product_quantity_multiply: number;
    // editor_type: string;
    // editor_id: number;
    // created_by: string;
    // updated_by: null | string;
    // deleted_at: null | string;
    // created_at: string;
    // updated_at: null | string;
};