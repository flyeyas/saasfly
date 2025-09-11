// Dictionary type definition based on actual JSON structure
export interface Dictionary {
  price: {
    title: string;
    pricing: string;
    slogan: string;
    monthly_bill: string;
    annual_bill: string;
    annual_info: string;
    monthly_info: string;
    mo: string;
    contact: string;
    contact_2: string;
    faq: string;
    faq_detail: string;
    signup: string;
    upgrade: string;
    manage_subscription: string;
    go_to_dashboard: string;
    "": string;
  };
  marketing: {
    introducing: string;
    title: string;
    sub_title: string;
    get_started: string;
    view_on_github: string;
    explore_product: string;
    features: string;
    sub_features: string;
    k8s_features: string;
    devops_features: string;
    price_features: string;
    main_nav_features: string;
    main_nav_pricing: string;
    main_nav_products: string;
    main_nav_blog: string;
    main_nav_documentation: string;
    login: string;
    signup: string;
    "": string;
    contributors: {
      contributors_desc: string;
      developers_first: string;
      developers_second: string;
    };
    right_side: {
      deploy_on_vercel_title: string;
      deploy_on_vercel_desc: string;
      ship_on_cloudflare_title: string;
      ship_on_cloudflare_desc: string;
    };
  };
  search: {
    title: string;
    search_results_for: string;
    search_placeholder: string;
    filter_by_category: string;
    all_categories: string;
    sort_by: string;
    sort_relevance: string;
    sort_name: string;
    sort_rating: string;
    sort_newest: string;
    sort_oldest: string;
    sort_popular: string;
    view_mode: string;
    grid_view: string;
    list_view: string;
    no_results: string;
    results_count: string;
    showing_results: string;
    games_found: string;
    search_title: string;
    search_description: string;
    search_results_title: string;
    search_results_description: string;
    "": string;
  };
  game_detail: {
    back_to_home: string;
    back_to_games: string;
    unknown_category: string;
    single_player: string;
    rating: string;
    start_game: string;
    favorite_game: string;
    share_game: string;
    report_game: string;
    about_this_game: string;
    no_description_available: string;
    game_features: string;
    feature_free_to_play: string;
    feature_no_download: string;
    feature_instant_play: string;
    feature_mobile_friendly: string;
    ratings_reviews: string;
    total_plays: string;
    category: string;
    tags: string;
    game_controls: string;
    control_move: string;
    control_jump: string;
    control_action: string;
    control_pause: string;
    related_games: string;
  };
  // Allow for additional properties that might exist in the dictionary
  [key: string]: any;
}

export type Locale = 'en' | 'zh' | 'ko' | 'ja';