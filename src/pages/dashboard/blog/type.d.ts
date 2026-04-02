export interface Blog {
    id: number;
    creator_id: number;
    category_id: number;
    title: string;
    slug: string;
    slug_url: string;
    excerpt: string;
    content: string;
    featured_image: string;
    status: string;
    published_at: string;
    views: number;
    reading_time: number;
    allow_comments: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    creator: any | null;
    category: any | null;
}

export interface BlogListResponse {
    current_page: number;
    data: Blog[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface BlogStoreRequest {
    creator_id: number;
    category_id: number;
    title: string;
    excerpt: string;
    content: string;
    featured_image: string | Blob;
    status: string;
    published_at: string;
    reading_time: number;
    allow_comments: number;
}
