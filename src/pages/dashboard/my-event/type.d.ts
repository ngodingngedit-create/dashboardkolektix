export type TransactionListResponse = {
  id: number;
  event_id: string;
  invoice_no: string;
  user_id: string;
  total_qty: string;
  total_price: string;
  grandtotal: string;
  admin_fee: string;
  ppn: null | string;
  payment_method: {
    id: number;
    payment_type_id: number;
    payment_name: string;
    account_no: string;
    account_name: string;
    account_branch: string;
    description: string;
    status: string;
    image: null | string;
    created_by: null | number;
    updated_by: null | number;
    created_at: null | string;
    updated_at: null | string;
    deleted_at: null | string;
    logo: string;
  };
  payment_status: string;
  payment_channel_id: null | string;
  total_payment_charge: null | string;
  created_by: null | number;
  updated_by: null | number;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  check_in_status: null | string;
  type_transaction: string;
  xendit_url: null | string;
  admin_fee_plus: null | string;
  transaction_status_id: number;
  payment_date: null | string;
  has_user: {
    id: number;
    name: string;
    email: string;
    email_verified_at: string;
    otp_code: null | string;
    otp_expiry_time: null | string;
    created_at: string;
    updated_at: string;
  };
  has_event: null | object; // Can define a specific structure if exists for events.
  identities: Array<{
    id: number;
    transaction_id: string;
    event_ticket_id: null | string;
    is_pemesan: number;
    identity_type_id: number;
    nik: string;
    full_name: string;
    email: string;
    no_telp: string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
  }>;
  tickets: Array<{
    id: number;
    transaction_id: string;
    event_id: string;
    etiket_number: string;
    event_ticket_id: string;
    qty_ticket: number;
    price: number;
    subtotal_price: number;
    payment_status: string;
    ticket_checkin_status: number;
    created_by: null | number;
    updated_by: null | number;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    code: string;
    has_event_ticket: {
      id: number;
      event_id: string;
      ticket_type_id: number;
      ticket_category: null | string;
      name: string;
      description: null | string;
      qty: number;
      sold_qty: number;
      price: number;
      event_schedule_date: null | string;
      ticket_date: string;
      starting_time: null | string;
      ticket_end: string;
      ending_time: null | string;
      is_soldout: number;
      is_finish: number;
      is_ready: number;
      created_by: null | number;
      updated_by: null | number;
      created_at: null | string;
      updated_at: null | string;
      deleted_at: null | string;
      max_buy_ticket: null | number;
      ticket_sold: null | number;
      ticket_type: null | object; // Can define a specific structure if exists for ticket types.
    };
  }>;
};

export type EventListResponse = {
  id: number;
  creator_id: string;
  event_social_media_id: null | string;
  category_id: null | string;
  name: string;
  slug: string;
  image: string;
  image_thumbnail: null | string;
  event_format_id: number;
  event_topic_id: number;
  tag: string;
  event_type_id: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  zone_time: string;
  organization_method: string;
  location_name: string;
  location_city: string;
  location_address: string;
  location_map: string;
  longitude: null | string;
  latitude: null | string;
  is_name: number;
  is_phone_number: number;
  is_birthdate: number;
  is_email: number;
  is_noidentity: number;
  is_gender: number;
  one_email_ticket: string;
  one_id_one_ticket: string;
  max_buy_ticket: number;
  ppn: null | string;
  admin_fee: null | string;
  admin_fee_plus: null | string;
  starting_price: number;
  description: string; // HTML content expected
  term_condition: string; // HTML content expected
  save_as_draft: string;
  event_status_id: number;
  activity_status: number;
  allowed_payment_method: null | string;
  created_by: string;
  updated_by: null | string;
  main_status: null | string;
  upcoming: null | string;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
  payment_method_custom: null | string;
  image_url: string;
  thumbnail_url: string;

  has_creator: {
    id: number;
    user_id: string;
    category_id: string;
    slug: string;
    name_event_organizer: string;
    name: string;
    image: string;
    phone_number: string;
    description: null | string;
    longitude: null | string;
    latitude: null | string;
    website: null | string;
    status: string;
    verified: null | string;
    created_by: string;
    updated_by: null | string;
    event_coordinator_name: null | string;
    event_cordinator_phone: null | string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    email: string;
    location: string;
    image_url: string;
  };

  has_event_status: {
    id: number;
    name: string;
    description: string;
    created_by: string;
    updated_by: null | string;
    created_at: null | string;
    updated_at: null | string;
    deleted_at: null | string;
    status: string;
  };

  has_event_ticket: Array<{
    id: number;
    event_id: string;
    ticket_type_id: number;
    ticket_category: string;
    name: string;
    description: string;
    qty: number;
    sold_qty: number;
    price: number;
    event_schedule_date: string;
    ticket_date: string;
    starting_time: null | string;
    ticket_end: string;
    ending_time: null | string;
    is_soldout: number;
    is_finish: number;
    is_ready: number;
    created_by: null | string;
    updated_by: null | string;
    created_at: string;
    updated_at: string;
    deleted_at: null | string;
    max_buy_ticket: null | number;
    ticket_sold: null | number;
    ticket_type: string;
  }>;

  has_event_format: null | object; // Can define a specific structure if exists for event formats.
  has_event_topic: null | object; // Can define a specific structure if exists for event topics.
  has_event_type: null | object; // Can define a specific structure if exists for event types.
  has_event_social_media: null | object; // Can define a specific structure if exists for social media.
  has_event_payment_method: Array<object>; // Can define a specific structure if exists for payment methods.
};

export type TransactionStatusResponse = {
  id: number;
  name: string;
  description: string;
  bgcolor: string;
};

export type EticketListResponse = {
  id: number;
  eticket_number: string;
  is_checkin: number;
  checkin_date: string;
  event_id: number;
  event_ticket_id: number | null;
  transaction_id: number;
  transaction_ticket_id: number | null;
  transaction_identity_id: number | null;
  is_checkout: number | null;
  status: string;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  transaction_status_id: number;
};

export type EventData = {
  creator_id: string;
  event_name: string;
  slug: string;
  total_admin_fee: number;
  total_buy: number;
  total_offline: number;
  total_online: number;
  total_paid: number;
  total_price_sell: number;
  total_price_sell_offline: number;
  total_price_sell_online: number;
  total_ticket: number;
  total_unpaid: number;
  total_views: number;
  total_withdraw: number;
  total_ticket_failed: number;
  total_ticket_pending: number;
  total_ticket_sold: number;
  total_pendapatan: number;
};
