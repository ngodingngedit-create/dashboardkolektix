export type MerchListResponse = {
  id: number;
  creator_id: number;
  admin_fee: string;
  average_star: string;
  total_sold: number;
  total_review: number;
  price: string;
  weight: string;
  product_name: string;
  product_status_id: number;
  slug: string;
  qty: number;
  created_by: string;
  description: string;
  add_to_flash_sale: 0 | 1;
  is_delivery: number;
  is_pickup_instore: number;
  product_image: {
    id: number;
    image_url: string;
  }[];
  has_store_location: {
    city_id: number;
    store_name: string;
  };
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
    };
  }[];
  creator: {
    id: number;
    name: string;
    image_url: string;
  };
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

export type MerchPromoResponse = {
  id: number;
  promo_id: number;
  promo_name: string;
  promo_slug: string;
  promo_banner: string;
  promo_banner_url: string;
  start_date: string;
  end_date: string;
  products: PromoProduct[];
};

export type PromoProduct = {
  id: number;
  store_location_id: number;
  creator_id: number;
  product_status_id: number;
  slug: string;
  product_name: string;
  description: string;
  sku: string;
  product_category_id: number | null;
  product_brand_id: number | null;
  is_product_varian: number;
  weight: string;
  show_stock_out: number;
  max_purchase_quantity: number;
  low_quantity_warning: number;
  add_to_flash_sale: number;
  discount: string;
  discount_start_date: string | null;
  discount_end_date: string | null;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  price: string;
  qty: number;
  average_star: string;
  total_review: number;
  total_sold: number;
  product_image: {
    id: number;
    image_url: string;
  }[];
  creator: {
    id: number;
    name: string;
    image_url: string;
  };
  has_store_location: {
    store_name: string;
  };
};
