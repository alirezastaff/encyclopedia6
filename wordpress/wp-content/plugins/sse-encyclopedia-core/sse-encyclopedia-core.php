<?php
/**
 * Plugin Name: SSE Encyclopedia Core
 * Description: Content model, private reading data, public article notes, REST API, and migration support for the SSE Encyclopedia.
 * Version: 0.1.0
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * Text Domain: sse-encyclopedia
 */

defined( 'ABSPATH' ) || exit;

define( 'SSE_ENCYCLOPEDIA_VERSION', '0.1.0' );
define( 'SSE_ENCYCLOPEDIA_FILE', __FILE__ );

require_once plugin_dir_path( __FILE__ ) . 'admin/encyclopedia-admin.php';

function sse_encyclopedia_table( $name ) {
    global $wpdb;
    return $wpdb->prefix . 'sse_' . $name;
}

function sse_encyclopedia_register_content() {
    register_post_type( 'sse_article', array(
        'labels' => array(
            'name'          => __( 'Articles', 'sse-encyclopedia' ),
            'singular_name' => __( 'Article', 'sse-encyclopedia' ),
        ),
        'public'             => true,
        'show_in_rest'       => true,
        'has_archive'        => true,
        'rewrite'            => array( 'slug' => 'articles', 'with_front' => false ),
        'supports'           => array( 'title', 'editor', 'excerpt', 'author', 'thumbnail', 'revisions', 'custom-fields' ),
        'menu_icon'          => 'dashicons-book-alt',
        'capability_type'    => array( 'sse_article', 'sse_articles' ),
        'map_meta_cap'       => true,
    ) );

    register_taxonomy( 'sse_category', array( 'sse_article' ), array(
        'labels'       => array( 'name' => __( 'Article Categories', 'sse-encyclopedia' ) ),
        'public'       => true,
        'show_in_rest' => true,
        'hierarchical' => true,
        'rewrite'      => array( 'slug' => 'article-category' ),
    ) );

    register_taxonomy( 'sse_part', array( 'sse_article' ), array(
        'labels'       => array( 'name' => __( 'Encyclopedia Parts', 'sse-encyclopedia' ) ),
        'public'       => true,
        'show_in_rest' => true,
        'hierarchical' => true,
        'rewrite'      => array( 'slug' => 'encyclopedia-part' ),
    ) );

    register_taxonomy( 'sse_topic', array( 'sse_article' ), array(
        'labels'       => array( 'name' => __( 'Article Topics', 'sse-encyclopedia' ) ),
        'public'       => true,
        'show_in_rest' => true,
        'hierarchical' => false,
        'rewrite'      => array( 'slug' => 'article-topic' ),
    ) );

        register_post_type( 'sse_country', array(
            'labels' => array(
                'name'          => __( 'Country Explorer', 'sse-encyclopedia' ),
                'singular_name' => __( 'Country Profile', 'sse-encyclopedia' ),
                'add_new_item'  => __( 'Add Country Profile', 'sse-encyclopedia' ),
                'edit_item'     => __( 'Edit Country Profile', 'sse-encyclopedia' ),
            ),
            'public'             => false,
            'show_ui'            => true,
            'show_in_rest'       => false,
            'supports'           => array( 'title', 'editor', 'thumbnail', 'revisions' ),
            'menu_icon'          => 'dashicons-admin-site-alt3',
            'capability_type'    => 'post',
            'map_meta_cap'       => true,
        ) );

    register_post_type( 'sse_case_study', array(
        'labels' => array(
            'name'          => __( 'Case Studies', 'sse-encyclopedia' ),
            'singular_name' => __( 'Case Study', 'sse-encyclopedia' ),
            'add_new_item'  => __( 'Add Case Study', 'sse-encyclopedia' ),
            'edit_item'     => __( 'Edit Case Study', 'sse-encyclopedia' ),
        ),
        'public'             => false,
        'show_ui'            => true,
        'show_in_rest'       => false,
        'supports'           => array( 'title', 'author', 'thumbnail', 'revisions' ),
        'menu_icon'          => 'dashicons-media-document',
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
    ) );

    register_taxonomy( 'sse_case_category', array( 'sse_case_study' ), array(
        'labels'       => array( 'name' => __( 'Case Study Categories', 'sse-encyclopedia' ) ),
        'public'       => false,
        'show_ui'      => true,
        'show_in_rest' => false,
        'hierarchical' => true,
    ) );

    register_post_type( 'sse_impact_scenario', array(
        'labels' => array(
            'name'          => __( 'Impact Scenarios', 'sse-encyclopedia' ),
            'singular_name' => __( 'Impact Scenario', 'sse-encyclopedia' ),
            'add_new_item'  => __( 'Add Impact Scenario', 'sse-encyclopedia' ),
            'edit_item'     => __( 'Edit Impact Scenario', 'sse-encyclopedia' ),
        ),
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => false,
        'supports'           => array( 'title', 'author', 'revisions' ),
        'menu_icon'          => 'dashicons-chart-area',
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
    ) );

    register_post_type( 'sse_impact_report', array(
        'labels' => array(
            'name'          => __( 'Impact Reports', 'sse-encyclopedia' ),
            'singular_name' => __( 'Impact Report', 'sse-encyclopedia' ),
            'add_new_item'  => __( 'Add Impact Report', 'sse-encyclopedia' ),
            'edit_item'     => __( 'Edit Impact Report', 'sse-encyclopedia' ),
        ),
        'public'             => false,
        'show_ui'            => true,
        'show_in_menu'       => false,
        'supports'           => array( 'title', 'author', 'revisions' ),
        'menu_icon'          => 'dashicons-media-spreadsheet',
        'capability_type'    => 'post',
        'map_meta_cap'       => true,
    ) );
}
add_action( 'init', 'sse_encyclopedia_register_content' );

function sse_country_meta_defaults() {
    return array(
        'iso_a3' => '',
        'english_name' => '',
        'persian_name' => '',
        'latitude' => '',
        'longitude' => '',
        'map_enabled' => 1,
        'map_status' => 'published',
        'title_en' => '',
        'summary_en' => '',
        'article_en' => '',
        'title_fa' => '',
        'summary_fa' => '',
        'article_fa' => '',
        'translation_status' => 'draft',
        'published_en' => 0,
        'published_fa' => 0,
        'statistics' => array(),
        'sources' => array(),
        'editor' => '',
        'last_updated' => '',
    );
}

function sse_country_get_meta( $post_id ) {
    $defaults = sse_country_meta_defaults();
    foreach ( $defaults as $key => $default ) {
        $value = get_post_meta( $post_id, '_sse_country_' . $key, true );
        if ( '' !== $value && null !== $value ) $defaults[ $key ] = is_array( $default ) ? (array) maybe_unserialize( $value ) : $value;
    }
    return $defaults;
}

function sse_country_register_meta_boxes() {
    add_meta_box( 'sse-country-identity', 'Country identity and map', 'sse_country_identity_box', 'sse_country', 'normal', 'high' );
    add_meta_box( 'sse-country-content', 'Bilingual country content', 'sse_country_content_box', 'sse_country', 'normal', 'high' );
    add_meta_box( 'sse-country-data', 'Indicators, sources, and publication', 'sse_country_data_box', 'sse_country', 'normal', 'default' );
}
add_action( 'add_meta_boxes', 'sse_country_register_meta_boxes' );

function sse_country_field( $label, $name, $value, $type = 'text', $dir = '' ) {
    $attributes = $dir ? ' dir="' . esc_attr( $dir ) . '"' : '';
    if ( 'textarea' === $type ) {
        printf( '<label class="sse-impact-field"%s><strong>%s</strong><textarea name="%s" rows="5">%s</textarea></label>', $attributes, esc_html( $label ), esc_attr( $name ), esc_textarea( $value ) );
    } else {
        printf( '<label class="sse-impact-field"%s><strong>%s</strong><input type="%s" name="%s" value="%s"></label>', $attributes, esc_html( $label ), esc_attr( $type ), esc_attr( $name ), esc_attr( $value ) );
    }
}

function sse_country_identity_box( $post ) {
    $meta = sse_country_get_meta( $post->ID );
    wp_nonce_field( 'sse_country_save', 'sse_country_nonce' );
    echo '<div class="sse-impact-grid">';
    sse_country_field( 'ISO A3 code', 'sse_country[iso_a3]', $meta['iso_a3'] );
    sse_country_field( 'English country name', 'sse_country[english_name]', $meta['english_name'] );
    sse_country_field( 'نام کشور فارسی (اختیاری)', 'sse_country[persian_name]', $meta['persian_name'], 'text', 'rtl' );
    sse_country_field( 'Latitude', 'sse_country[latitude]', $meta['latitude'], 'number' );
    sse_country_field( 'Longitude', 'sse_country[longitude]', $meta['longitude'], 'number' );
    echo '<label class="sse-impact-field"><strong>Map status</strong><select name="sse_country[map_status]"><option value="published" ' . selected( $meta['map_status'], 'published', false ) . '>Published</option><option value="draft" ' . selected( $meta['map_status'], 'draft', false ) . '>Draft</option><option value="hidden" ' . selected( $meta['map_status'], 'hidden', false ) . '>Hidden</option></select></label>';
    echo '<label><input type="checkbox" name="sse_country[map_enabled]" value="1" ' . checked( $meta['map_enabled'], 1, false ) . '> Show this country on the map</label>';
    echo '</div>';
}

function sse_country_content_box( $post ) {
    $meta = sse_country_get_meta( $post->ID );
    echo '<div class="sse-impact-grid">';
    echo '<div class="sse-impact-card">';
    echo '<h3>English</h3>';
    sse_country_field( 'Article title', 'sse_country[title_en]', $meta['title_en'] );
    sse_country_field( 'Short social and economic snapshot', 'sse_country[summary_en]', $meta['summary_en'], 'textarea' );
    echo '<p><strong>Full country article</strong></p>';
    wp_editor( $meta['article_en'], 'sse_country_article_en', array( 'textarea_name' => 'sse_country[article_en]', 'textarea_rows' => 16, 'media_buttons' => true ) );
    echo '</div><div class="sse-impact-card" dir="rtl">';
    echo '<h3>فارسی</h3>';
    sse_country_field( 'عنوان مقاله', 'sse_country[title_fa]', $meta['title_fa'], 'text', 'rtl' );
    sse_country_field( 'خلاصه وضعیت اجتماعی و اقتصادی', 'sse_country[summary_fa]', $meta['summary_fa'], 'textarea', 'rtl' );
    echo '<p><strong>مقاله کامل کشور</strong></p>';
    wp_editor( $meta['article_fa'], 'sse_country_article_fa', array( 'textarea_name' => 'sse_country[article_fa]', 'textarea_rows' => 16, 'media_buttons' => true, 'tinymce' => array( 'directionality' => 'rtl' ) ) );
    echo '<label><input type="checkbox" name="sse_country[published_fa]" value="1" ' . checked( $meta['published_fa'], 1, false ) . '> انتشار نسخه فارسی</label></div>';
    echo '<label><input type="checkbox" name="sse_country[published_en]" value="1" ' . checked( $meta['published_en'], 1, false ) . '> Publish English version</label></div>';
}

function sse_country_data_box( $post ) {
    $meta = sse_country_get_meta( $post->ID );
    echo '<div class="sse-impact-grid">';
    sse_country_field( 'Indicators JSON', 'sse_country[statistics]', wp_json_encode( $meta['statistics'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ), 'textarea' );
    sse_country_field( 'Sources JSON', 'sse_country[sources]', wp_json_encode( $meta['sources'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ), 'textarea' );
    sse_country_field( 'Translation status', 'sse_country[translation_status]', $meta['translation_status'] );
    sse_country_field( 'Editor / translator', 'sse_country[editor]', $meta['editor'] );
    sse_country_field( 'Last reviewed date', 'sse_country[last_updated]', $meta['last_updated'], 'date' );
    echo '<p class="description">Statistics JSON example: [{"label":"Cooperatives","value":"120","year":"2025","unit":"organizations"}]</p>';
    echo '<p class="description">Sources JSON example: [{"title":"National report","organization":"Example organization","url":"https://example.org","year":"2025","type":"report","note":"Methodology note"}]</p>';
    echo '</div>';
}

function sse_country_save_meta( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( 'sse_country' !== get_post_type( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) return;
    if ( empty( $_POST['sse_country_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sse_country_nonce'] ) ), 'sse_country_save' ) ) return;
    $input = (array) ( $_POST['sse_country'] ?? array() );
    $text_fields = array( 'iso_a3', 'english_name', 'persian_name', 'title_en', 'title_fa', 'editor', 'last_updated', 'map_status', 'translation_status' );
    foreach ( $text_fields as $key ) update_post_meta( $post_id, '_sse_country_' . $key, sanitize_text_field( $input[ $key ] ?? '' ) );
    foreach ( array( 'latitude', 'longitude' ) as $key ) update_post_meta( $post_id, '_sse_country_' . $key, (float) ( $input[ $key ] ?? 0 ) );
    foreach ( array( 'summary_en', 'article_en', 'summary_fa', 'article_fa' ) as $key ) update_post_meta( $post_id, '_sse_country_' . $key, 'summary_en' === $key || 'summary_fa' === $key ? sanitize_textarea_field( $input[ $key ] ?? '' ) : wp_kses_post( $input[ $key ] ?? '' ) );
    foreach ( array( 'statistics', 'sources' ) as $key ) {
        $decoded = json_decode( wp_unslash( $input[ $key ] ?? '' ), true );
        update_post_meta( $post_id, '_sse_country_' . $key, is_array( $decoded ) ? $decoded : array() );
    }
    update_post_meta( $post_id, '_sse_country_map_enabled', empty( $input['map_enabled'] ) ? 0 : 1 );
    update_post_meta( $post_id, '_sse_country_published_en', empty( $input['published_en'] ) ? 0 : 1 );
    update_post_meta( $post_id, '_sse_country_published_fa', empty( $input['published_fa'] ) ? 0 : 1 );
}
add_action( 'save_post_sse_country', 'sse_country_save_meta' );

function sse_impact_default_variables() {
    return array(
        'budget' => array( 'type' => 'currency', 'label_en' => 'Annual budget / initial investment', 'label_fa' => 'بودجه سالانه / سرمایه‌گذاری اولیه', 'help_en' => 'Direct cash committed to the program.', 'help_fa' => 'وجه نقد مستقیمی که به برنامه اختصاص یافته است.', 'unit_en' => 'USD', 'unit_fa' => 'ریال', 'default_en' => 100000, 'default_fa' => 1000000000, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'volunteer_hours' => array( 'type' => 'number', 'label_en' => 'Volunteer hours', 'label_fa' => 'ساعت‌های داوطلبانه', 'help_en' => 'Unpaid time contributed by people.', 'help_fa' => 'زمانی که افراد بدون دریافت دستمزد اختصاص داده‌اند.', 'unit_en' => 'hours', 'unit_fa' => 'ساعت', 'default_en' => 1200, 'default_fa' => 1200, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'hourly_rate' => array( 'type' => 'currency', 'label_en' => 'Base hourly rate', 'label_fa' => 'نرخ پایه ساعتی', 'help_en' => 'A conservative value for one volunteer hour.', 'help_fa' => 'ارزش محافظه‌کارانه برای یک ساعت کار داوطلبانه.', 'unit_en' => 'USD', 'unit_fa' => 'ریال', 'default_en' => 12, 'default_fa' => 500000, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'beneficiaries' => array( 'type' => 'number', 'label_en' => 'Direct beneficiaries', 'label_fa' => 'ذی‌نفعان مستقیم', 'help_en' => 'People directly reached, trained, or supported.', 'help_fa' => 'افرادی که مستقیماً به آن‌ها دسترسی پیدا شده یا حمایت شده‌اند.', 'unit_en' => 'people', 'unit_fa' => 'نفر', 'default_en' => 240, 'default_fa' => 240, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'jobs' => array( 'type' => 'number', 'label_en' => 'Sustainable jobs created', 'label_fa' => 'مشاغل پایدار ایجادشده', 'help_en' => 'Jobs created for underserved groups.', 'help_fa' => 'مشاغل ایجادشده برای گروه‌های کمتر برخوردار.', 'unit_en' => 'jobs', 'unit_fa' => 'شغل', 'default_en' => 18, 'default_fa' => 18, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'waste' => array( 'type' => 'number', 'label_en' => 'Waste diverted', 'label_fa' => 'پسماند منحرف‌شده', 'help_en' => 'Material recovered through the intervention.', 'help_fa' => 'موادی که از طریق مداخله بازیابی شده‌اند.', 'unit_en' => 'kg', 'unit_fa' => 'کیلوگرم', 'default_en' => 800, 'default_fa' => 800, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'change_rate' => array( 'type' => 'percent', 'label_en' => 'Qualitative change rate', 'label_fa' => 'نرخ تغییر کیفی', 'help_en' => 'Measured or evidenced estimate of change.', 'help_fa' => 'برآورد سنجیده یا مستند از میزان تغییر.', 'unit_en' => '%', 'unit_fa' => 'درصد', 'default_en' => 65, 'default_fa' => 65, 'min' => 0, 'max' => 100, 'required' => 1, 'enabled' => 1 ),
        'social_proxy' => array( 'type' => 'currency', 'label_en' => 'Social proxy per beneficiary', 'label_fa' => 'نمایگر اجتماعی به ازای هر ذی‌نفع', 'help_en' => 'Estimated avoided health or welfare cost.', 'help_fa' => 'هزینه سلامت یا رفاهی که از آن جلوگیری شده است.', 'unit_en' => 'USD', 'unit_fa' => 'ریال', 'default_en' => 450, 'default_fa' => 2000000, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'environmental_proxy' => array( 'type' => 'currency', 'label_en' => 'Environmental proxy per kg', 'label_fa' => 'نمایگر زیست‌محیطی به ازای هر کیلوگرم', 'help_en' => 'Avoided collection cost plus stored carbon value.', 'help_fa' => 'هزینه اجتناب‌شده جمع‌آوری به‌علاوه ارزش کربن ذخیره‌شده.', 'unit_en' => 'USD', 'unit_fa' => 'ریال', 'default_en' => 30, 'default_fa' => 50000, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'economic_proxy' => array( 'type' => 'currency', 'label_en' => 'Economic proxy per job', 'label_fa' => 'نمایگر اقتصادی به ازای هر شغل', 'help_en' => 'Estimated public and household value of stable work.', 'help_fa' => 'ارزش برآوردشده عمومی و خانوار برای کار پایدار.', 'unit_en' => 'USD', 'unit_fa' => 'ریال', 'default_en' => 8500, 'default_fa' => 200000000, 'min' => 0, 'max' => 0, 'required' => 1, 'enabled' => 1 ),
        'deadweight' => array( 'type' => 'percent', 'label_en' => 'Deadweight', 'label_fa' => 'وزن مرده', 'help_en' => 'Change likely without your intervention.', 'help_fa' => 'تغییری که احتمالاً بدون مداخله شما رخ می‌داد.', 'unit_en' => '%', 'unit_fa' => 'درصد', 'default_en' => 15, 'default_fa' => 15, 'min' => 0, 'max' => 100, 'required' => 1, 'enabled' => 1 ),
        'attribution' => array( 'type' => 'percent', 'label_en' => 'Attribution', 'label_fa' => 'سهم دیگران', 'help_en' => 'Success attributable to other organizations.', 'help_fa' => 'موفقیتی که به سازمان‌های دیگر نسبت داده می‌شود.', 'unit_en' => '%', 'unit_fa' => 'درصد', 'default_en' => 10, 'default_fa' => 10, 'min' => 0, 'max' => 100, 'required' => 1, 'enabled' => 1 ),
        'displacement' => array( 'type' => 'percent', 'label_en' => 'Displacement', 'label_fa' => 'جابه‌جایی', 'help_en' => 'Positive value that creates harm elsewhere.', 'help_fa' => 'ارزش مثبتی که در جای دیگری زیان ایجاد می‌کند.', 'unit_en' => '%', 'unit_fa' => 'درصد', 'default_en' => 5, 'default_fa' => 5, 'min' => 0, 'max' => 100, 'required' => 1, 'enabled' => 1 ),
        'dropoff' => array( 'type' => 'percent', 'label_en' => 'Drop-off', 'label_fa' => 'افت تدریجی', 'help_en' => 'Annual reduction in outcome value over time.', 'help_fa' => 'کاهش سالانه ارزش پیامد در طول زمان.', 'unit_en' => '%', 'unit_fa' => 'درصد', 'default_en' => 8, 'default_fa' => 8, 'min' => 0, 'max' => 100, 'required' => 1, 'enabled' => 1 ),
    );
}

function sse_impact_settings_defaults() {
    return array(
        'title_en' => 'Social Impact Assessment Tool',
        'title_fa' => 'ابزار ارزیابی اثر اجتماعی',
        'currency_en' => 'USD',
        'currency_fa' => 'IRR',
        'number_locale_en' => 'en-US',
        'number_locale_fa' => 'fa-IR',
        'formula_en' => 'Net value = outcome value × change rate × (1 − deadweight) × (1 − attribution) × (1 − displacement) × (1 − drop-off)',
        'formula_fa' => 'ارزش خالص = ارزش پیامد × نرخ تغییر × تعدیلات',
    );
}

function sse_impact_get_settings() {
    return wp_parse_args( (array) get_option( 'sse_impact_settings', array() ), sse_impact_settings_defaults() );
}

function sse_impact_get_variables() {
    $defaults = sse_impact_default_variables();
    $saved    = (array) get_option( 'sse_impact_variables', array() );
    foreach ( $defaults as $key => $variable ) {
        if ( isset( $saved[ $key ] ) && is_array( $saved[ $key ] ) ) {
            $defaults[ $key ] = wp_parse_args( $saved[ $key ], $variable );
        }
    }
    return $defaults;
}

function sse_impact_admin_menu() {
    add_menu_page( 'Impact Calculator', 'Impact Calculator', 'manage_options', 'sse-impact', 'sse_impact_settings_page', 'dashicons-chart-area', 26 );
    add_submenu_page( 'sse-impact', 'Settings', 'Settings', 'manage_options', 'sse-impact', 'sse_impact_settings_page' );
    add_submenu_page( 'sse-impact', 'Variables', 'Variables', 'manage_options', 'sse-impact-variables', 'sse_impact_variables_page' );
    add_submenu_page( 'sse-impact', 'Scenarios', 'Scenarios', 'edit_posts', 'edit.php?post_type=sse_impact_scenario' );
    add_submenu_page( 'sse-impact', 'Reports', 'Reports', 'edit_posts', 'edit.php?post_type=sse_impact_report' );
}
add_action( 'admin_menu', 'sse_impact_admin_menu' );

function sse_impact_admin_styles() {
    $page = sanitize_key( $_GET['page'] ?? '' );
    $post_type = sanitize_key( $_GET['post_type'] ?? '' );
    if ( 0 !== strpos( $page, 'sse-impact' ) && 'sse_country' !== $post_type ) return;
    echo '<style>.sse-impact-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:1100px}.sse-impact-card{background:#fff;border:1px solid #dcdcde;padding:18px;box-shadow:0 1px 2px rgba(0,0,0,.04)}.sse-impact-card h2{margin-top:0}.sse-impact-field{display:grid;gap:5px;margin:0 0 14px}.sse-impact-field input,.sse-impact-field textarea,.sse-impact-field select{width:100%}.sse-impact-table{max-width:1200px}.sse-impact-table input{width:100%}.sse-impact-table th{white-space:nowrap}.sse-impact-muted{color:#646970;font-size:12px}@media(max-width:900px){.sse-impact-grid{grid-template-columns:1fr}}</style>';
}
add_action( 'admin_head', 'sse_impact_admin_styles' );

function sse_impact_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;
    $settings = sse_impact_get_settings();
    if ( isset( $_POST['sse_impact_save_settings'] ) ) {
        check_admin_referer( 'sse_impact_settings' );
        foreach ( array_keys( sse_impact_settings_defaults() ) as $key ) {
            $settings[ $key ] = sanitize_textarea_field( wp_unslash( $_POST[ $key ] ?? '' ) );
        }
        $settings['currency_en'] = strtoupper( sanitize_key( $settings['currency_en'] ) );
        $settings['currency_fa'] = strtoupper( sanitize_key( $settings['currency_fa'] ) );
        update_option( 'sse_impact_settings', $settings );
        echo '<div class="notice notice-success is-dismissible"><p>Impact calculator settings saved.</p></div>';
    }
    ?>
    <div class="wrap">
        <h1>Impact Calculator</h1>
        <p>Manage the shared calculation settings for the English and Persian calculators. Currency conversion is intentionally not automatic.</p>
        <form method="post">
            <?php wp_nonce_field( 'sse_impact_settings' ); ?>
            <div class="sse-impact-grid">
                <div class="sse-impact-card">
                    <h2>English</h2>
                    <?php sse_impact_text_field( 'English title', 'title_en', $settings['title_en'] ); ?>
                    <?php sse_impact_text_field( 'Currency code', 'currency_en', $settings['currency_en'] ); ?>
                    <?php sse_impact_text_field( 'Number locale', 'number_locale_en', $settings['number_locale_en'] ); ?>
                    <?php sse_impact_textarea_field( 'Formula shown to users', 'formula_en', $settings['formula_en'] ); ?>
                </div>
                <div class="sse-impact-card" dir="rtl">
                    <h2>فارسی</h2>
                    <?php sse_impact_text_field( 'عنوان ابزار', 'title_fa', $settings['title_fa'] ); ?>
                    <?php sse_impact_text_field( 'کد ارز', 'currency_fa', $settings['currency_fa'] ); ?>
                    <?php sse_impact_text_field( 'قالب اعداد', 'number_locale_fa', $settings['number_locale_fa'] ); ?>
                    <?php sse_impact_textarea_field( 'فرمول نمایش‌داده‌شده به کاربر', 'formula_fa', $settings['formula_fa'] ); ?>
                </div>
            </div>
            <p><button class="button button-primary" name="sse_impact_save_settings" value="1">Save settings</button></p>
        </form>
    </div>
    <?php
}

function sse_impact_text_field( $label, $name, $value ) {
    printf( '<label class="sse-impact-field"><strong>%s</strong><input type="text" name="%s" value="%s"></label>', esc_html( $label ), esc_attr( $name ), esc_attr( $value ) );
}

function sse_impact_textarea_field( $label, $name, $value ) {
    printf( '<label class="sse-impact-field"><strong>%s</strong><textarea name="%s" rows="3">%s</textarea></label>', esc_html( $label ), esc_attr( $name ), esc_textarea( $value ) );
}

function sse_impact_variables_page() {
    if ( ! current_user_can( 'manage_options' ) ) return;
    $variables = sse_impact_get_variables();
    if ( isset( $_POST['sse_impact_save_variables'] ) ) {
        check_admin_referer( 'sse_impact_variables' );
        foreach ( $variables as $key => $variable ) {
            foreach ( array( 'label_en', 'label_fa', 'help_en', 'help_fa', 'unit_en', 'unit_fa' ) as $text_key ) {
                $variables[ $key ][ $text_key ] = sanitize_textarea_field( wp_unslash( $_POST[ $key ][ $text_key ] ?? '' ) );
            }
            foreach ( array( 'default_en', 'default_fa', 'min', 'max' ) as $number_key ) {
                $variables[ $key ][ $number_key ] = (float) ( $_POST[ $key ][ $number_key ] ?? 0 );
            }
            $variables[ $key ]['required'] = empty( $_POST[ $key ]['required'] ) ? 0 : 1;
            $variables[ $key ]['enabled']  = empty( $_POST[ $key ]['enabled'] ) ? 0 : 1;
        }
        update_option( 'sse_impact_variables', $variables );
        echo '<div class="notice notice-success is-dismissible"><p>Impact variables saved.</p></div>';
    }
    ?>
    <div class="wrap">
        <h1>Impact Variables</h1>
        <p>Each variable has independent English and Persian labels, help text, units, defaults, and validation limits.</p>
        <form method="post">
            <?php wp_nonce_field( 'sse_impact_variables' ); ?>
            <table class="widefat striped sse-impact-table">
                <thead><tr><th>Key / type</th><th>English</th><th>فارسی</th><th>Defaults</th><th>Validation</th><th>State</th></tr></thead>
                <tbody>
                <?php foreach ( $variables as $key => $variable ) : ?>
                    <tr>
                        <td><strong><?php echo esc_html( $key ); ?></strong><br><span class="sse-impact-muted"><?php echo esc_html( $variable['type'] ); ?></span></td>
                        <td><?php sse_impact_variable_text_inputs( $key, $variable, 'en' ); ?></td>
                        <td dir="rtl"><?php sse_impact_variable_text_inputs( $key, $variable, 'fa' ); ?></td>
                        <td><input type="number" step="any" name="<?php echo esc_attr( $key ); ?>[default_en]" value="<?php echo esc_attr( $variable['default_en'] ); ?>"><input type="number" step="any" name="<?php echo esc_attr( $key ); ?>[default_fa]" value="<?php echo esc_attr( $variable['default_fa'] ); ?>"></td>
                        <td><input type="number" step="any" name="<?php echo esc_attr( $key ); ?>[min]" value="<?php echo esc_attr( $variable['min'] ); ?>" placeholder="Min"><input type="number" step="any" name="<?php echo esc_attr( $key ); ?>[max]" value="<?php echo esc_attr( $variable['max'] ); ?>" placeholder="Max"></td>
                        <td><label><input type="checkbox" name="<?php echo esc_attr( $key ); ?>[required]" value="1" <?php checked( $variable['required'], 1 ); ?>> Required</label><br><label><input type="checkbox" name="<?php echo esc_attr( $key ); ?>[enabled]" value="1" <?php checked( $variable['enabled'], 1 ); ?>> Enabled</label></td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
            <p><button class="button button-primary" name="sse_impact_save_variables" value="1">Save variables</button></p>
        </form>
    </div>
    <?php
}

function sse_impact_variable_text_inputs( $key, $variable, $locale ) {
    $label_key = 'label_' . $locale;
    $help_key  = 'help_' . $locale;
    $unit_key  = 'unit_' . $locale;
    printf( '<input type="text" name="%s[%s]" value="%s" placeholder="Label"><textarea name="%s[%s]" rows="2" placeholder="Help">%s</textarea><input type="text" name="%s[%s]" value="%s" placeholder="Unit">', esc_attr( $key ), esc_attr( $label_key ), esc_attr( $variable[ $label_key ] ), esc_attr( $key ), esc_attr( $help_key ), esc_textarea( $variable[ $help_key ] ), esc_attr( $key ), esc_attr( $unit_key ), esc_attr( $variable[ $unit_key ] ) );
}

function sse_impact_register_meta_boxes() {
    add_meta_box( 'sse-impact-scenario-fields', 'Scenario inputs', 'sse_impact_scenario_box', 'sse_impact_scenario', 'normal', 'high' );
    add_meta_box( 'sse-impact-report-fields', 'Report summary', 'sse_impact_report_box', 'sse_impact_report', 'normal', 'high' );
}
add_action( 'add_meta_boxes', 'sse_impact_register_meta_boxes' );

function sse_impact_scenario_box( $post ) {
    wp_nonce_field( 'sse_impact_scenario_save', 'sse_impact_scenario_nonce' );
    $values    = (array) get_post_meta( $post->ID, '_sse_impact_values', true );
    $variables = sse_impact_get_variables();
    echo '<p>Save a reusable set of English and Persian assumptions. Values are stored as data and can later be consumed by the frontend calculator.</p><div class="sse-impact-grid">';
    foreach ( $variables as $key => $variable ) {
        if ( empty( $variable['enabled'] ) ) continue;
        echo '<div class="sse-impact-card"><h3>' . esc_html( $variable['label_en'] ) . ' / ' . esc_html( $variable['label_fa'] ) . '</h3>';
        foreach ( array( 'en' => 'English value', 'fa' => 'مقدار فارسی' ) as $locale => $label ) {
            $value = $values[ $locale ][ $key ] ?? ( 'fa' === $locale ? $variable['default_fa'] : $variable['default_en'] );
            printf( '<label class="sse-impact-field"%s><strong>%s</strong><input type="number" step="any" min="%s" %s name="sse_impact_values[%s][%s]" value="%s"></label>', 'fa' === $locale ? ' dir="rtl"' : '', esc_html( $label ), esc_attr( $variable['min'] ), $variable['max'] > 0 ? 'max="' . esc_attr( $variable['max'] ) . '"' : '', esc_attr( $locale ), esc_attr( $key ), esc_attr( $value ) );
        }
        echo '<span class="sse-impact-muted">' . esc_html( $variable['unit_en'] ) . ' / ' . esc_html( $variable['unit_fa'] ) . '</span></div>';
    }
    echo '</div>';
}

function sse_impact_report_box( $post ) {
    wp_nonce_field( 'sse_impact_report_save', 'sse_impact_report_nonce' );
    $fields = array(
        'language' => array( 'Language / زبان', get_post_meta( $post->ID, '_sse_impact_language', true ) ?: 'en' ),
        'scenario_id' => array( 'Scenario ID', get_post_meta( $post->ID, '_sse_impact_scenario_id', true ) ),
        'investment' => array( 'Total investment / کل سرمایه‌گذاری', get_post_meta( $post->ID, '_sse_impact_investment', true ) ),
        'value' => array( 'Net social value / ارزش خالص اجتماعی', get_post_meta( $post->ID, '_sse_impact_value', true ) ),
        'social_value' => array( 'Social value / ارزش اجتماعی', get_post_meta( $post->ID, '_sse_impact_social_value', true ) ),
        'environmental_value' => array( 'Environmental value / ارزش زیست‌محیطی', get_post_meta( $post->ID, '_sse_impact_environmental_value', true ) ),
        'economic_value' => array( 'Economic value / ارزش اقتصادی', get_post_meta( $post->ID, '_sse_impact_economic_value', true ) ),
        'adjustment' => array( 'Adjustment factor / ضریب تعدیل', get_post_meta( $post->ID, '_sse_impact_adjustment', true ) ),
        'ratio' => array( 'SROI ratio / نسبت بازگشت سرمایه اجتماعی', get_post_meta( $post->ID, '_sse_impact_ratio', true ) ),
        'source' => array( 'Sources and assumptions / منابع و فرض‌ها', get_post_meta( $post->ID, '_sse_impact_source', true ) ),
    );
    echo '<p>Reports are snapshots. Keep the source assumptions with each result so it can be audited later.</p><div class="sse-impact-grid">';
    foreach ( $fields as $key => $field ) {
        if ( 'source' === $key ) {
            printf( '<label class="sse-impact-field"><strong>%s</strong><textarea name="sse_impact_report[%s]" rows="4">%s</textarea></label>', esc_html( $field[0] ), esc_attr( $key ), esc_textarea( $field[1] ) );
        } else {
            printf( '<label class="sse-impact-field"><strong>%s</strong><input type="text" name="sse_impact_report[%s]" value="%s"></label>', esc_html( $field[0] ), esc_attr( $key ), esc_attr( $field[1] ) );
        }
    }
    echo '</div>';
}

function sse_impact_save_meta( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( ! current_user_can( 'edit_post', $post_id ) ) return;
    $post_type = get_post_type( $post_id );
    if ( 'sse_impact_scenario' === $post_type && isset( $_POST['sse_impact_scenario_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sse_impact_scenario_nonce'] ) ), 'sse_impact_scenario_save' ) ) {
        $variables = sse_impact_get_variables();
        $values    = array( 'en' => array(), 'fa' => array() );
        foreach ( $variables as $key => $variable ) {
            foreach ( array( 'en', 'fa' ) as $locale ) {
                $raw = $_POST['sse_impact_values'][ $locale ][ $key ] ?? 0;
                $num = (float) $raw;
                $num = max( (float) $variable['min'], $num );
                if ( $variable['max'] > 0 ) $num = min( (float) $variable['max'], $num );
                $values[ $locale ][ $key ] = $num;
            }
        }
        update_post_meta( $post_id, '_sse_impact_values', $values );
    }
    if ( 'sse_impact_report' === $post_type && isset( $_POST['sse_impact_report_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sse_impact_report_nonce'] ) ), 'sse_impact_report_save' ) ) {
        $report = (array) ( $_POST['sse_impact_report'] ?? array() );
        update_post_meta( $post_id, '_sse_impact_language', sanitize_key( $report['language'] ?? 'en' ) === 'fa' ? 'fa' : 'en' );
        update_post_meta( $post_id, '_sse_impact_scenario_id', absint( $report['scenario_id'] ?? 0 ) );
        update_post_meta( $post_id, '_sse_impact_investment', (float) ( $report['investment'] ?? 0 ) );
        update_post_meta( $post_id, '_sse_impact_value', (float) ( $report['value'] ?? 0 ) );
        update_post_meta( $post_id, '_sse_impact_social_value', (float) ( $report['social_value'] ?? 0 ) );
        update_post_meta( $post_id, '_sse_impact_environmental_value', (float) ( $report['environmental_value'] ?? 0 ) );
        update_post_meta( $post_id, '_sse_impact_economic_value', (float) ( $report['economic_value'] ?? 0 ) );
        update_post_meta( $post_id, '_sse_impact_adjustment', (float) ( $report['adjustment'] ?? 0 ) );
        update_post_meta( $post_id, '_sse_impact_ratio', sanitize_text_field( $report['ratio'] ?? '' ) );
        update_post_meta( $post_id, '_sse_impact_source', sanitize_textarea_field( $report['source'] ?? '' ) );
    }
}
add_action( 'save_post', 'sse_impact_save_meta' );

function sse_encyclopedia_activate() {
    sse_encyclopedia_register_content();
    sse_encyclopedia_create_tables();
    sse_encyclopedia_create_pages();
    flush_rewrite_rules();
}
register_activation_hook( SSE_ENCYCLOPEDIA_FILE, 'sse_encyclopedia_activate' );
register_deactivation_hook( SSE_ENCYCLOPEDIA_FILE, 'flush_rewrite_rules' );

function sse_encyclopedia_create_pages() {
    $pages = array(
        'archive' => array( 'title' => 'Archive', 'template' => '' ),
        'profile' => array( 'title' => 'Profile', 'template' => 'page-profile.php' ),
        'login' => array( 'title' => 'Login', 'template' => 'page-login.php' ),
        'register' => array( 'title' => 'Register', 'template' => 'page-register.php' ),
        'country-explorer' => array( 'title' => 'Country Explorer', 'template' => 'page-country-explorer.php' ),
        'case-studies' => array( 'title' => 'Case Studies', 'template' => 'page-case-studies.php' ),
        'impact-calculator' => array( 'title' => 'Impact Calculator', 'template' => 'page-impact-calculator.php' ),
        'marginal-notes' => array( 'title' => 'Marginal Notes', 'template' => 'page-marginal-notes.php' ),
    );
    foreach ( $pages as $slug => $page ) {
        $existing = get_page_by_path( $slug );
        $page_id = $existing ? $existing->ID : wp_insert_post( array( 'post_title' => $page['title'], 'post_name' => $slug, 'post_status' => 'publish', 'post_type' => 'page' ) );
        if ( $page_id && ! is_wp_error( $page_id ) && $page['template'] ) update_post_meta( $page_id, '_wp_page_template', $page['template'] );
    }
}
function sse_encyclopedia_maybe_upgrade() {
    if ( version_compare( (string) get_option( 'sse_encyclopedia_pages_version', '0' ), '1.1.0', '<' ) ) {
        sse_encyclopedia_create_pages();
        update_option( 'sse_encyclopedia_pages_version', '1.1.0', false );
    }
}
add_action( 'plugins_loaded', 'sse_encyclopedia_maybe_upgrade' );

function sse_encyclopedia_create_tables() {
    global $wpdb;
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    $charset = $wpdb->get_charset_collate();
    $tables  = array(
        'bookmarks' => "CREATE TABLE %s (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            article_id bigint(20) unsigned NOT NULL,
            translation_group_id varchar(190) NOT NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_article (user_id, translation_group_id),
            KEY article_id (article_id)
        ) %s;",
        'reading_list' => "CREATE TABLE %s (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            article_id bigint(20) unsigned NOT NULL,
            translation_group_id varchar(190) NOT NULL,
            status varchar(30) NOT NULL DEFAULT 'to-read',
            added_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_article (user_id, translation_group_id),
            KEY article_id (article_id)
        ) %s;",
        'reading_progress' => "CREATE TABLE %s (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            article_id bigint(20) unsigned NOT NULL,
            translation_group_id varchar(190) NOT NULL,
            progress_percent decimal(5,2) NOT NULL DEFAULT 0,
            scroll_position bigint(20) unsigned NOT NULL DEFAULT 0,
            last_section_id varchar(190) NOT NULL DEFAULT '',
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_article (user_id, translation_group_id),
            KEY article_id (article_id)
        ) %s;",
        'note_groups' => "CREATE TABLE %s (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            name varchar(190) NOT NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            UNIQUE KEY user_name (user_id, name)
        ) %s;",
        'private_notes' => "CREATE TABLE %s (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            article_id bigint(20) unsigned NOT NULL,
            translation_group_id varchar(190) NOT NULL,
            group_id bigint(20) unsigned NULL,
            section_id varchar(190) NOT NULL DEFAULT '',
            content longtext NOT NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY user_article (user_id, article_id),
            KEY group_id (group_id)
        ) %s;",
        'highlights' => "CREATE TABLE %s (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            user_id bigint(20) unsigned NOT NULL,
            article_id bigint(20) unsigned NOT NULL,
            translation_group_id varchar(190) NOT NULL,
            section_id varchar(190) NOT NULL DEFAULT '',
            selected_text longtext NOT NULL,
            prefix_text text NOT NULL,
            suffix_text text NOT NULL,
            start_offset int unsigned NOT NULL DEFAULT 0,
            end_offset int unsigned NOT NULL DEFAULT 0,
            text_hash char(64) NOT NULL DEFAULT '',
            note longtext NULL,
            created_at datetime NOT NULL,
            updated_at datetime NOT NULL,
            PRIMARY KEY  (id),
            KEY user_article (user_id, article_id)
        ) %s;",
        'migration_log' => "CREATE TABLE %s (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            source_type varchar(50) NOT NULL,
            source_id varchar(190) NOT NULL,
            target_id bigint(20) unsigned NULL,
            status varchar(30) NOT NULL,
            message text NULL,
            created_at datetime NOT NULL,
            PRIMARY KEY (id),
            UNIQUE KEY source_record (source_type, source_id)
        ) %s;",
    );
    foreach ( $tables as $name => $sql ) {
        dbDelta( sprintf( $sql, sse_encyclopedia_table( $name ), $charset ) );
    }
    update_option( 'sse_encyclopedia_db_version', SSE_ENCYCLOPEDIA_VERSION );
}

function sse_encyclopedia_article_group( $article_id ) {
    $group = get_post_meta( $article_id, '_sse_translation_group_id', true );
    return $group ? (string) $group : (string) $article_id;
}

function sse_encyclopedia_article_id( $value ) {
    if ( is_numeric( $value ) ) {
        $post = get_post( (int) $value );
        return $post && 'sse_article' === $post->post_type ? (int) $post->ID : 0;
    }
    $posts = get_posts( array(
        'post_type'      => 'sse_article',
        'name'           => sanitize_title( $value ),
        'post_status'    => 'publish',
        'posts_per_page' => 1,
        'fields'         => 'ids',
    ) );
    return $posts ? (int) $posts[0] : 0;
}

function sse_encyclopedia_find_imported_article( $slug, $locale ) {
    $posts = get_posts( array(
        'post_type'      => 'sse_article',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'fields'         => 'ids',
        'meta_query'     => array(
            'relation' => 'AND',
            array( 'key' => '_sse_legacy_slug', 'value' => sanitize_title( $slug ) ),
            array( 'key' => '_sse_language', 'value' => sanitize_key( $locale ) ),
        ),
    ) );

    return $posts ? (int) $posts[0] : 0;
}

function sse_encyclopedia_require_user( WP_REST_Request $request ) {
    if ( ! is_user_logged_in() ) {
        return new WP_Error( 'sse_unauthorized', __( 'Authentication required.', 'sse-encyclopedia' ), array( 'status' => 401 ) );
    }
    return true;
}

function sse_encyclopedia_article_from_request( WP_REST_Request $request ) {
    $id = sse_encyclopedia_article_id( $request->get_param( 'article_id' ) ?: $request->get_param( 'article_slug' ) );
    return $id ? $id : new WP_Error( 'sse_article_not_found', __( 'Article not found.', 'sse-encyclopedia' ), array( 'status' => 404 ) );
}

function sse_encyclopedia_register_rest() {
    register_rest_route( 'sse/v1', '/me/data', array( 'methods' => 'GET', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_get_user_data' ) );
    register_rest_route( 'sse/v1', '/bookmarks/toggle', array( 'methods' => 'POST', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_toggle_bookmark' ) );
    register_rest_route( 'sse/v1', '/reading-list/toggle', array( 'methods' => 'POST', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_toggle_reading_list' ) );
    register_rest_route( 'sse/v1', '/reading-list/status', array( 'methods' => 'POST', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_update_reading_status' ) );
    register_rest_route( 'sse/v1', '/progress', array( 'methods' => 'POST', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_save_progress' ) );
    register_rest_route( 'sse/v1', '/highlights', array( 'methods' => 'GET', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_get_highlights' ) );
    register_rest_route( 'sse/v1', '/highlights', array( 'methods' => 'POST', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_create_highlight' ) );
    register_rest_route( 'sse/v1', '/private-notes', array( 'methods' => 'GET', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_get_private_notes' ) );
    register_rest_route( 'sse/v1', '/private-notes', array( 'methods' => 'POST', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_create_private_note' ) );
    register_rest_route( 'sse/v1', '/countries', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => 'sse_encyclopedia_get_countries', 'args' => array( 'locale' => array( 'default' => 'en', 'sanitize_callback' => 'sanitize_key' ) ) ) );
    register_rest_route( 'sse/v1', '/case-studies', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => 'sse_encyclopedia_get_case_studies', 'args' => array( 'locale' => array( 'default' => 'en', 'sanitize_callback' => 'sanitize_key' ) ) ) );
    register_rest_route( 'sse/v1', '/homepage', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => 'sse_encyclopedia_get_homepage', 'args' => array( 'locale' => array( 'default' => 'en', 'sanitize_callback' => 'sanitize_key' ) ) ) );
    register_rest_route( 'sse/v1', '/impact/config', array( 'methods' => 'GET', 'permission_callback' => '__return_true', 'callback' => 'sse_encyclopedia_get_impact_config', 'args' => array( 'locale' => array( 'default' => 'en', 'sanitize_callback' => 'sanitize_key' ) ) ) );
    register_rest_route( 'sse/v1', '/impact/reports', array( 'methods' => 'POST', 'permission_callback' => 'sse_encyclopedia_require_user', 'callback' => 'sse_encyclopedia_save_impact_report' ) );
}
add_action( 'rest_api_init', 'sse_encyclopedia_register_rest' );

function sse_homepage_defaults() {
    return array(
        'fa' => array(
            'brandTitle' => 'دانشنامه اقتصاد اجتماعی و همبستگی', 'brandSubtitle' => 'ترجمه فارسی مدخل‌های دانشنامه اقتصاد اجتماعی و همبستگی',
            'nav' => array( array( 'label' => 'مدخل‌ها', 'href' => '/fa/archive', 'enabled' => 1 ), array( 'label' => 'درباره پروژه', 'href' => '#project', 'enabled' => 1 ), array( 'label' => 'همکاری با ما', 'href' => '#collaborate', 'enabled' => 1 ) ),
            'eyebrow' => 'پروژه ترجمه و انتشار دانشنامه', 'heroTitle' => 'دسترسی فارسی به مفاهیم کلیدی', 'heroTitleAccent' => 'اقتصاد اجتماعی و همبستگی',
            'heroDescription' => 'این وب‌سایت ترجمه فارسی مدخل‌های «دانشنامه اقتصاد اجتماعی و همبستگی» را در اختیار پژوهشگران، دانشجویان و علاقه‌مندان قرار می‌دهد. این پروژه توسط گروهی از مترجمان و محققان اقتصاد اجتماعی در ایران انجام می‌شود.',
            'heroActions' => array( array( 'label' => 'مشاهده فهرست مدخل‌ها', 'href' => '/fa/archive', 'enabled' => 1 ), array( 'label' => 'وضعیت اقتصاد اجتماعی کشورها', 'href' => '/fa/country-explorer', 'enabled' => 1 ), array( 'label' => 'مطالعات موردی', 'href' => '/fa/case-studies', 'enabled' => 1 ), array( 'label' => 'محاسبه اثرگذاری', 'href' => '/fa/impact-calculator', 'enabled' => 1 ), array( 'label' => 'بایگانی', 'href' => '/fa/archive', 'enabled' => 1 ), array( 'label' => 'حاشیه نگاری', 'href' => '/fa/profile', 'enabled' => 1 ) ),
            'searchTitle' => 'جستجو در دانشنامه', 'searchPlaceholder' => 'نام مدخل یا کلیدواژه را وارد کنید',
            'quickLinks' => array( array( 'label' => 'مدخل‌ها', 'href' => '/fa/archive', 'enabled' => 1 ), array( 'label' => 'فهرست الفبایی', 'href' => '/fa/archive', 'enabled' => 1 ), array( 'label' => 'بایگانی', 'href' => '/fa/archive', 'enabled' => 1 ), array( 'label' => 'مدخل تصادفی', 'href' => '/fa/archive', 'enabled' => 1 ) ),
            'sourceLabel' => 'منبع اصلی:', 'sourceText' => 'دانشنامه تدوین‌شده توسط کارگروه اقتصاد اجتماعی و همبستگی سازمان ملل متحد.',
            'infoItems' => array( array( 'number' => '۰۱', 'text' => 'ترجمه و انتشار مدخل‌های تخصصی اقتصاد اجتماعی و همبستگی به زبان فارسی.', 'enabled' => 1 ), array( 'number' => '۰۲', 'text' => 'فعالیت علمی با همکاری گروهی از مترجمان و محققان اقتصاد اجتماعی در ایران.', 'enabled' => 1 ), array( 'number' => '۰۳', 'text' => 'فراهم‌کردن دسترسی آسان برای دانشجویان، پژوهشگران و علاقه‌مندان این حوزه.', 'enabled' => 1 ) ),
            'introTitle' => 'درباره پروژه ترجمه فارسی', 'introText' => 'این وب‌سایت ترجمه فارسی مدخل‌های «دانشنامه اقتصاد اجتماعی و همبستگی» را منتشر می‌کند. ما گروهی از مترجمان و محققان اقتصاد اجتماعی در ایران هستیم که مدخل‌های این دانشنامه را که توسط کارگروه اقتصاد اجتماعی و همبستگی سازمان ملل متحد تدوین شده است، به فارسی ترجمه، بازبینی و در اختیار مخاطبان فارسی‌زبان قرار می‌دهیم.', 'teamLabel' => 'گروه مترجمان و محققان:', 'teamText' => 'پژوهشگران اقتصاد اجتماعی در ایران',
            'introLinks' => array( array( 'label' => 'اعضای گروه', 'href' => '#team', 'enabled' => 1 ), array( 'label' => 'روش ترجمه و انتشار', 'href' => '#process', 'enabled' => 1 ) ), 'goalsTitle' => 'اهداف و فعالیت‌های این پروژه',
            'goals' => array( 'ترجمه و انتشار فارسی مدخل‌های دانشنامه اقتصاد اجتماعی و همبستگی برای استفاده پژوهشگران، دانشجویان و علاقه‌مندان.', 'گسترش ادبیات علمی اقتصاد اجتماعی و همبستگی در ایران از طریق ترجمه، ویرایش و بازنشر محتوای معتبر.', 'فعالیت علمی و پژوهشی با تکیه بر همکاری مترجمان و محققان حوزه اقتصاد اجتماعی و همبستگی.' ),
            'features' => array( array( 'icon' => '📘', 'title' => 'درباره دانشنامه', 'text' => 'این دانشنامه مجموعه‌ای از مدخل‌های تخصصی در حوزه اقتصاد اجتماعی و همبستگی است که توسط کارگروه اقتصاد اجتماعی و همبستگی سازمان ملل متحد تدوین شده است.', 'href' => '#encyclopedia', 'enabled' => 1 ), array( 'icon' => '✍️', 'title' => 'پروژه ترجمه فارسی', 'text' => 'در این پروژه، مدخل‌های منتخب دانشنامه با دقت علمی ترجمه، بازبینی و برای دسترسی مخاطبان فارسی‌زبان منتشر می‌شوند.', 'href' => '#project', 'enabled' => 1 ), array( 'icon' => '🧠', 'title' => 'پنل مطالعه پژوهشی', 'text' => 'نشانک‌ها، یادداشت‌ها و پیشرفت مطالعه خود را ذخیره کنید و هر زمان به ادامه پژوهش بازگردید.', 'href' => '/fa/profile', 'enabled' => 1 ) ),
            'footerCopyright' => '© ۱۴۰۵ دانشنامه اقتصاد اجتماعی و همبستگی', 'footerLinks' => array( array( 'label' => 'تماس با ما', 'href' => '#contact', 'enabled' => 1 ), array( 'label' => 'همکاری علمی', 'href' => '#collaborate', 'enabled' => 1 ), array( 'label' => 'سیاست انتشار', 'href' => '#policy', 'enabled' => 1 ) ),
        ),
        'en' => array(
            'brandTitle' => 'Social and Solidarity Economy Encyclopedia', 'brandSubtitle' => 'English translation and publication of encyclopedia entries',
            'nav' => array( array( 'label' => 'Entries', 'href' => '/en/archive', 'enabled' => 1 ), array( 'label' => 'About', 'href' => '#project', 'enabled' => 1 ), array( 'label' => 'Collaborate', 'href' => '#collaborate', 'enabled' => 1 ) ),
            'eyebrow' => 'Translation and publication project', 'heroTitle' => 'Accessible English entry points to the key concepts of', 'heroTitleAccent' => 'social and solidarity economy', 'heroDescription' => 'This website makes the English translations of the encyclopedia entries available to researchers, students, and interested readers. The project is carried out by a group of translators and researchers in the field.',
            'heroActions' => array( array( 'label' => 'Browse entries', 'href' => '/en/archive', 'enabled' => 1 ), array( 'label' => 'Country Explorer', 'href' => '/en/country-explorer', 'enabled' => 1 ), array( 'label' => 'Case Studies Hub', 'href' => '/en/case-studies', 'enabled' => 1 ), array( 'label' => 'Impact Calculator', 'href' => '/en/impact-calculator', 'enabled' => 1 ), array( 'label' => 'Archive', 'href' => '/en/archive', 'enabled' => 1 ) ),
            'searchTitle' => 'Search the encyclopedia', 'searchPlaceholder' => 'Search by keyword or title', 'quickLinks' => array( array( 'label' => 'Entries', 'href' => '/en/archive', 'enabled' => 1 ), array( 'label' => 'Alphabetical list', 'href' => '/en/archive', 'enabled' => 1 ), array( 'label' => 'Archive', 'href' => '/en/archive', 'enabled' => 1 ), array( 'label' => 'Random entry', 'href' => '/en/archive', 'enabled' => 1 ) ), 'sourceLabel' => 'Primary source:', 'sourceText' => 'Encyclopedia developed by the UN Social and Solidarity Economy working group.',
            'infoItems' => array( array( 'number' => '01', 'text' => 'Publishing specialized entries in English for the social and solidarity economy.', 'enabled' => 1 ), array( 'number' => '02', 'text' => 'Scientific collaboration among translators and researchers in this field.', 'enabled' => 1 ), array( 'number' => '03', 'text' => 'Providing accessible knowledge for students, researchers, and the public.', 'enabled' => 1 ) ), 'introTitle' => 'About the English translation project', 'introText' => 'This website publishes English translations of the encyclopedia entries on the social and solidarity economy. A group of researchers and translators work to review and share these materials with English-speaking audiences.', 'teamLabel' => 'Translation team:', 'teamText' => 'researchers in the social and solidarity economy', 'introLinks' => array( array( 'label' => 'Team members', 'href' => '#team', 'enabled' => 1 ), array( 'label' => 'Translation process', 'href' => '#process', 'enabled' => 1 ) ), 'goalsTitle' => 'Goals and activities', 'goals' => array( 'Translate and publish encyclopedia entries for researchers, students, and interested readers.', 'Expand the body of literature in the field through careful translation and review.', 'Support collaborative research and academic publication in social and solidarity economy.' ),
            'features' => array( array( 'icon' => '📘', 'title' => 'About the encyclopedia', 'text' => 'A professional reference work covering essential concepts, theories, and practices in the social and solidarity economy.', 'href' => '#encyclopedia', 'enabled' => 1 ), array( 'icon' => '✍️', 'title' => 'English translation project', 'text' => 'Select entries are translated carefully and made available for English-speaking audiences.', 'href' => '#project', 'enabled' => 1 ), array( 'icon' => '🧠', 'title' => 'Research workspace', 'text' => 'Save bookmarks, notes, and highlights, track reading progress, and return to your research dashboard anytime.', 'href' => '/en/profile', 'enabled' => 1 ) ), 'footerCopyright' => '© 2026 Social and Solidarity Economy Encyclopedia', 'footerLinks' => array( array( 'label' => 'Contact', 'href' => '#contact', 'enabled' => 1 ), array( 'label' => 'Scientific collaboration', 'href' => '#collaborate', 'enabled' => 1 ), array( 'label' => 'Publication policy', 'href' => '#policy', 'enabled' => 1 ) ),
        ),
    );
}

function sse_homepage_content() {
    return wp_parse_args( (array) get_option( 'sse_homepage_content', array() ), sse_homepage_defaults() );
}

function sse_encyclopedia_get_homepage( WP_REST_Request $request ) {
    $locale = 'fa' === $request->get_param( 'locale' ) ? 'fa' : 'en';
    $content = sse_homepage_content();
    return rest_ensure_response( $content[ $locale ] );
}

function sse_encyclopedia_get_impact_config( WP_REST_Request $request ) {
    $locale = 'fa' === $request->get_param( 'locale' ) ? 'fa' : 'en';
    $settings = sse_impact_get_settings();
    $variables = sse_impact_get_variables();
    $public_variables = array();
    foreach ( $variables as $key => $variable ) {
        if ( empty( $variable['enabled'] ) ) continue;
        $public_variables[ $key ] = array(
            'type' => $variable['type'], 'label' => $variable[ 'label_' . $locale ], 'help' => $variable[ 'help_' . $locale ],
            'unit' => $variable[ 'unit_' . $locale ], 'default' => (float) $variable[ 'default_' . $locale ], 'min' => (float) $variable['min'], 'max' => (float) $variable['max'], 'required' => ! empty( $variable['required'] ),
        );
    }
    return rest_ensure_response( array( 'title' => $settings[ 'title_' . $locale ], 'currency' => $settings[ 'currency_' . $locale ], 'numberLocale' => $settings[ 'number_locale_' . $locale ], 'formula' => $settings[ 'formula_' . $locale ], 'variables' => $public_variables ) );
}

function sse_encyclopedia_save_impact_report( WP_REST_Request $request ) {
    $payload = (array) $request->get_json_params();
    $locale = 'fa' === sanitize_key( $payload['language'] ?? '' ) ? 'fa' : 'en';
    $report_id = wp_insert_post( array( 'post_type' => 'sse_impact_report', 'post_status' => 'private', 'post_title' => sanitize_text_field( $payload['title'] ?? ( 'Impact report ' . current_time( 'Y-m-d H:i' ) ) ), 'post_author' => get_current_user_id() ), true );
    if ( is_wp_error( $report_id ) ) return $report_id;
    $fields = array( 'scenario_id', 'investment', 'value', 'social_value', 'environmental_value', 'economic_value', 'adjustment', 'ratio' );
    update_post_meta( $report_id, '_sse_impact_language', $locale );
    foreach ( $fields as $field ) update_post_meta( $report_id, '_sse_impact_' . $field, is_numeric( $payload[ $field ] ?? null ) ? (float) $payload[ $field ] : sanitize_text_field( $payload[ $field ] ?? '' ) );
    update_post_meta( $report_id, '_sse_impact_source', sanitize_textarea_field( $payload['source'] ?? '' ) );
    return new WP_REST_Response( array( 'id' => $report_id, 'saved' => true ), 201 );
}

function sse_encyclopedia_get_countries( WP_REST_Request $request ) {
    $locale = 'fa' === $request->get_param( 'locale' ) ? 'fa' : 'en';
    $posts  = get_posts( array( 'post_type' => 'sse_country', 'post_status' => 'publish', 'posts_per_page' => -1, 'orderby' => 'title', 'order' => 'ASC' ) );
    $result = array();
    foreach ( $posts as $post ) {
        $meta = sse_country_get_meta( $post->ID );
        $published = 'fa' === $locale ? $meta['published_fa'] : $meta['published_en'];
        if ( ! $meta['map_enabled'] || 'published' !== $meta['map_status'] || ! $published ) continue;
        $result[] = array(
            'id' => $meta['iso_a3'],
            'name' => $meta['english_name'] ?: $post->post_title,
            'persianName' => $meta['persian_name'],
            'summary' => 'fa' === $locale ? $meta['summary_fa'] : $meta['summary_en'],
            'article' => 'fa' === $locale ? $meta['article_fa'] : $meta['article_en'],
            'title' => 'fa' === $locale ? $meta['title_fa'] : $meta['title_en'],
            'latitude' => (float) $meta['latitude'],
            'longitude' => (float) $meta['longitude'],
            'statistics' => $meta['statistics'],
            'sources' => $meta['sources'],
            'translationStatus' => $meta['translation_status'],
            'lastUpdated' => $meta['last_updated'],
        );
    }
    return rest_ensure_response( $result );
}

function sse_case_study_meta_defaults() {
    return array(
        'place' => '', 'place_fa' => '', 'type_en' => '', 'type_fa' => '', 'category_fa' => '', 'summary_en' => '', 'summary_fa' => '',
        'metric_en' => '', 'metric_fa' => '', 'pdf_en' => 0, 'pdf_fa' => 0,
        'published_en' => 0, 'published_fa' => 0, 'display_order' => 0,
    );
}

function sse_case_study_get_meta( $post_id ) {
    $meta = sse_case_study_meta_defaults();
    foreach ( $meta as $key => $default ) {
        $value = get_post_meta( $post_id, '_sse_case_' . $key, true );
        if ( '' !== $value && null !== $value ) $meta[ $key ] = $value;
    }
    return $meta;
}

function sse_encyclopedia_get_case_studies( WP_REST_Request $request ) {
    $locale = 'fa' === $request->get_param( 'locale' ) ? 'fa' : 'en';
    $posts = get_posts( array( 'post_type' => 'sse_case_study', 'post_status' => 'publish', 'posts_per_page' => -1, 'orderby' => 'meta_value_num', 'meta_key' => '_sse_case_display_order', 'order' => 'ASC' ) );
    $result = array();
    foreach ( $posts as $post ) {
        $meta = sse_case_study_get_meta( $post->ID );
        if ( ! $meta[ 'published_' . $locale ] ) continue;
        $pdf_id = (int) $meta[ 'pdf_' . $locale ];
        $terms = wp_get_post_terms( $post->ID, 'sse_case_category', array( 'fields' => 'names' ) );
        $category = $terms ? $terms[0] : '';
        $result[] = array(
            'id' => (int) $post->ID, 'slug' => $post->post_name,
            'title' => get_post_meta( $post->ID, '_sse_case_title_' . $locale, true ),
            'place' => 'fa' === $locale && $meta['place_fa'] ? $meta['place_fa'] : $meta['place'], 'type' => $meta[ 'type_' . $locale ],
            'category' => 'fa' === $locale && $meta['category_fa'] ? $meta['category_fa'] : $category, 'summary' => $meta[ 'summary_' . $locale ],
            'metric' => $meta[ 'metric_' . $locale ], 'pdfUrl' => $pdf_id ? wp_get_attachment_url( $pdf_id ) : '',
        );
    }
    return rest_ensure_response( $result );
}

function sse_encyclopedia_get_user_data() {
    global $wpdb;
    $user_id = get_current_user_id();
    $data    = array();
    $order_by = array(
        'bookmarks'        => 'created_at DESC',
        'reading_list'     => 'updated_at DESC',
        'reading_progress' => 'updated_at DESC',
        'private_notes'    => 'updated_at DESC',
        'highlights'       => 'created_at DESC',
    );
    foreach ( $order_by as $table => $order ) {
        $data[ $table ] = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . sse_encyclopedia_table( $table ) . ' WHERE user_id = %d ORDER BY ' . $order, $user_id ), ARRAY_A );
    }
    $data['note_groups'] = $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . sse_encyclopedia_table( 'note_groups' ) . ' WHERE user_id = %d ORDER BY name ASC', $user_id ), ARRAY_A );
    return rest_ensure_response( $data );
}

function sse_encyclopedia_toggle_bookmark( WP_REST_Request $request ) {
    global $wpdb;
    $article = sse_encyclopedia_article_from_request( $request );
    if ( is_wp_error( $article ) ) return $article;
    $user  = get_current_user_id();
    $group = sse_encyclopedia_article_group( $article );
    $table = sse_encyclopedia_table( 'bookmarks' );
    $row   = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM {$table} WHERE user_id = %d AND translation_group_id = %s", $user, $group ) );
    if ( $row ) $wpdb->delete( $table, array( 'id' => $row->id ), array( '%d' ) );
    else $wpdb->insert( $table, array( 'user_id' => $user, 'article_id' => $article, 'translation_group_id' => $group, 'created_at' => current_time( 'mysql', true ) ), array( '%d', '%d', '%s', '%s' ) );
    return rest_ensure_response( array( 'active' => ! $row ) );
}

function sse_encyclopedia_toggle_reading_list( WP_REST_Request $request ) {
    global $wpdb;
    $article = sse_encyclopedia_article_from_request( $request );
    if ( is_wp_error( $article ) ) return $article;
    $user  = get_current_user_id();
    $group = sse_encyclopedia_article_group( $article );
    $table = sse_encyclopedia_table( 'reading_list' );
    $row   = $wpdb->get_row( $wpdb->prepare( "SELECT id FROM {$table} WHERE user_id = %d AND translation_group_id = %s", $user, $group ) );
    if ( $row ) $wpdb->delete( $table, array( 'id' => $row->id ), array( '%d' ) );
    else $wpdb->insert( $table, array( 'user_id' => $user, 'article_id' => $article, 'translation_group_id' => $group, 'status' => 'to-read', 'added_at' => current_time( 'mysql', true ), 'updated_at' => current_time( 'mysql', true ) ), array( '%d', '%d', '%s', '%s', '%s', '%s' ) );
    return rest_ensure_response( array( 'active' => ! $row ) );
}

function sse_encyclopedia_update_reading_status( WP_REST_Request $request ) {
    global $wpdb;
    $article = sse_encyclopedia_article_from_request( $request );
    if ( is_wp_error( $article ) ) return $article;
    $status = sanitize_key( (string) $request->get_param( 'status' ) );
    if ( ! in_array( $status, array( 'to-read', 'reading', 'completed' ), true ) ) return new WP_Error( 'sse_invalid_status', __( 'Invalid reading status.', 'sse-encyclopedia' ), array( 'status' => 400 ) );
    $user  = get_current_user_id();
    $group = sse_encyclopedia_article_group( $article );
    $table = sse_encyclopedia_table( 'reading_list' );
    $now   = current_time( 'mysql', true );
    $wpdb->query( $wpdb->prepare( "INSERT INTO {$table} (user_id, article_id, translation_group_id, status, added_at, updated_at) VALUES (%d, %d, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE status = VALUES(status), updated_at = VALUES(updated_at)", $user, $article, $group, $status, $now, $now ) );
    return rest_ensure_response( array( 'status' => $status ) );
}

function sse_encyclopedia_save_progress( WP_REST_Request $request ) {
    global $wpdb;
    $article = sse_encyclopedia_article_from_request( $request );
    if ( is_wp_error( $article ) ) return $article;
    $percent = max( 0, min( 100, (float) $request->get_param( 'progress_percent' ) ) );
    $scroll  = max( 0, (int) $request->get_param( 'scroll_position' ) );
    $section = sanitize_key( (string) $request->get_param( 'section_id' ) );
    $user    = get_current_user_id();
    $group   = sse_encyclopedia_article_group( $article );
    $now     = current_time( 'mysql', true );
    $table   = sse_encyclopedia_table( 'reading_progress' );
    $wpdb->query( $wpdb->prepare( "INSERT INTO {$table} (user_id, article_id, translation_group_id, progress_percent, scroll_position, last_section_id, updated_at) VALUES (%d, %d, %s, %f, %d, %s, %s) ON DUPLICATE KEY UPDATE progress_percent = VALUES(progress_percent), scroll_position = VALUES(scroll_position), last_section_id = VALUES(last_section_id), updated_at = VALUES(updated_at)", $user, $article, $group, $percent, $scroll, $section, $now ) );
    return rest_ensure_response( array( 'saved' => true ) );
}

function sse_encyclopedia_get_highlights() {
    global $wpdb;
    return rest_ensure_response( $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . sse_encyclopedia_table( 'highlights' ) . ' WHERE user_id = %d ORDER BY created_at DESC', get_current_user_id() ), ARRAY_A ) );
}

function sse_encyclopedia_create_highlight( WP_REST_Request $request ) {
    global $wpdb;
    $article = sse_encyclopedia_article_from_request( $request );
    if ( is_wp_error( $article ) ) return $article;
    $text = sanitize_textarea_field( (string) $request->get_param( 'selected_text' ) );
    if ( '' === $text ) return new WP_Error( 'sse_invalid_highlight', __( 'Selected text is required.', 'sse-encyclopedia' ), array( 'status' => 400 ) );
    $wpdb->insert( sse_encyclopedia_table( 'highlights' ), array(
        'user_id' => get_current_user_id(), 'article_id' => $article, 'translation_group_id' => sse_encyclopedia_article_group( $article ),
        'section_id' => sanitize_key( (string) $request->get_param( 'section_id' ) ), 'selected_text' => $text,
        'prefix_text' => sanitize_textarea_field( (string) $request->get_param( 'prefix_text' ) ), 'suffix_text' => sanitize_textarea_field( (string) $request->get_param( 'suffix_text' ) ),
        'start_offset' => max( 0, (int) $request->get_param( 'start_offset' ) ), 'end_offset' => max( 0, (int) $request->get_param( 'end_offset' ) ),
        'text_hash' => hash( 'sha256', $text ), 'note' => sanitize_textarea_field( (string) $request->get_param( 'note' ) ),
        'created_at' => current_time( 'mysql', true ), 'updated_at' => current_time( 'mysql', true ),
    ), array( '%d', '%d', '%s', '%s', '%s', '%s', '%s', '%d', '%d', '%s', '%s', '%s', '%s' ) );
    return new WP_REST_Response( array( 'id' => $wpdb->insert_id ), 201 );
}

function sse_encyclopedia_get_private_notes() {
    global $wpdb;
    return rest_ensure_response( $wpdb->get_results( $wpdb->prepare( 'SELECT * FROM ' . sse_encyclopedia_table( 'private_notes' ) . ' WHERE user_id = %d ORDER BY updated_at DESC', get_current_user_id() ), ARRAY_A ) );
}

function sse_encyclopedia_create_private_note( WP_REST_Request $request ) {
    global $wpdb;
    $article = sse_encyclopedia_article_from_request( $request );
    if ( is_wp_error( $article ) ) return $article;
    $content = sanitize_textarea_field( (string) $request->get_param( 'content' ) );
    if ( '' === $content ) return new WP_Error( 'sse_invalid_note', __( 'Note content is required.', 'sse-encyclopedia' ), array( 'status' => 400 ) );
    $now = current_time( 'mysql', true );
    $wpdb->insert( sse_encyclopedia_table( 'private_notes' ), array(
        'user_id' => get_current_user_id(), 'article_id' => $article, 'translation_group_id' => sse_encyclopedia_article_group( $article ),
        'group_id' => max( 0, (int) $request->get_param( 'group_id' ) ) ?: null, 'section_id' => sanitize_key( (string) $request->get_param( 'section_id' ) ),
        'content' => $content, 'created_at' => $now, 'updated_at' => $now,
    ), array( '%d', '%d', '%s', '%d', '%s', '%s', '%s', '%s' ) );
    return new WP_REST_Response( array( 'id' => $wpdb->insert_id ), 201 );
}

function sse_encyclopedia_public_note_type( $commentdata ) {
    if ( isset( $commentdata['comment_type'] ) && 'sse_public_note' === $commentdata['comment_type'] ) {
        $ip = sanitize_text_field( $commentdata['comment_author_IP'] ?? '' );
        $key = 'sse_note_rate_' . md5( $ip . '|' . strtolower( (string) ( $commentdata['comment_author_email'] ?? '' ) ) );
        if ( get_transient( $key ) ) return new WP_Error( 'sse_note_rate_limited', __( 'Please wait before submitting another note.', 'sse-encyclopedia' ) );
        set_transient( $key, 1, MINUTE_IN_SECONDS );
        $commentdata['comment_approved'] = 0;
    }
    return $commentdata;
}
add_filter( 'preprocess_comment', 'sse_encyclopedia_public_note_type' );

function sse_encyclopedia_expose_comment_meta( $response, $comment ) {
    $response->data['article_id'] = (int) $comment->comment_post_ID;
    return $response;
}
add_filter( 'rest_prepare_comment', 'sse_encyclopedia_expose_comment_meta', 10, 2 );

function sse_encyclopedia_import_log( $source_type, $source_id, $target_id, $status, $message = '' ) {
    global $wpdb;
    $table = sse_encyclopedia_table( 'migration_log' );
    $wpdb->query( $wpdb->prepare(
        "INSERT INTO {$table} (source_type, source_id, target_id, status, message, created_at) VALUES (%s, %s, %d, %s, %s, %s) ON DUPLICATE KEY UPDATE target_id = VALUES(target_id), status = VALUES(status), message = VALUES(message), created_at = VALUES(created_at)",
        sanitize_key( $source_type ), sanitize_text_field( $source_id ), (int) $target_id, sanitize_key( $status ), sanitize_textarea_field( $message ), current_time( 'mysql', true )
    ) );
}

function sse_encyclopedia_import_article( $record ) {
    $source_id = sanitize_text_field( (string) ( $record['source_id'] ?? $record['slug'] ?? '' ) );
    $locale    = sanitize_key( (string) ( $record['language'] ?? 'en' ) );
    $slug      = sanitize_title( (string) ( $record['slug'] ?? $source_id ) );
    $existing  = sse_encyclopedia_find_imported_article( $slug, $locale );
    $body      = is_array( $record['body'] ?? null ) ? $record['body'] : array( (string) ( $record['content'] ?? '' ) );
    $html      = '';
    foreach ( $body as $index => $section ) {
        $text = trim( wp_kses_post( (string) $section ) );
        if ( '' === $text ) continue;
        $is_heading = 0 === $index || preg_match( '/^(BOX|REFERENCES)\b/i', $text ) || ( strlen( $text ) < 90 && strtoupper( $text ) === $text );
        $html .= $is_heading ? '<h2 id="section-' . (int) $index . '">' . esc_html( $text ) . '</h2>' : '<p id="section-' . (int) $index . '">' . nl2br( esc_html( $text ) ) . '</p>';
    }
    $post_data = array(
        'post_type'    => 'sse_article', 'post_status' => 'publish', 'post_title' => sanitize_text_field( (string) ( $record['title'] ?? $slug ) ),
        'post_name'    => $slug, 'post_excerpt' => sanitize_textarea_field( (string) ( $record['description'] ?? '' ) ), 'post_content' => $html,
    );
    $post_id = $existing ? wp_update_post( array_merge( $post_data, array( 'ID' => $existing ) ), true ) : wp_insert_post( $post_data, true );
    if ( is_wp_error( $post_id ) ) {
        sse_encyclopedia_import_log( 'article', $locale . ':' . $source_id, 0, 'error', $post_id->get_error_message() );
        return $post_id;
    }
    update_post_meta( $post_id, '_sse_legacy_slug', $slug );
    update_post_meta( $post_id, '_sse_language', $locale );
    update_post_meta( $post_id, '_sse_translation_group_id', sanitize_text_field( (string) ( $record['translation_group_id'] ?? $source_id ) ) );
    update_post_meta( $post_id, '_sse_author_text', sanitize_text_field( (string) ( $record['author'] ?? '' ) ) );
    update_post_meta( $post_id, '_sse_start_page', max( 0, (int) ( $record['start_page'] ?? 0 ) ) );
    if ( ! empty( $record['category'] ) ) wp_set_object_terms( $post_id, sanitize_text_field( $record['category'] ), 'sse_category' );
    sse_encyclopedia_import_log( 'article', $locale . ':' . $source_id, $post_id, 'imported' );
    return $post_id;
}

function sse_encyclopedia_import_public_note( $record, $parent_id = 0 ) {
    $legacy_id = sanitize_text_field( (string) ( $record['id'] ?? '' ) );
    $post_id   = sse_encyclopedia_article_id( $record['article_slug'] ?? $record['article_id'] ?? '' );
    if ( ! $legacy_id || ! $post_id ) return 0;
    $existing = get_comments( array( 'meta_key' => '_sse_legacy_comment_id', 'meta_value' => $legacy_id, 'number' => 1, 'fields' => 'ids' ) );
    if ( $existing ) return (int) $existing[0];
    $comment_id = wp_insert_comment( array(
        'comment_post_ID' => $post_id, 'comment_author' => sanitize_text_field( (string) ( $record['name'] ?? '' ) ),
        'comment_author_email' => sanitize_email( (string) ( $record['email'] ?? '' ) ), 'comment_content' => wp_kses_post( (string) ( $record['content'] ?? '' ) ),
        'comment_type' => 'sse_public_note',
        'comment_date_gmt' => gmdate( 'Y-m-d H:i:s', strtotime( (string) ( $record['created_at'] ?? 'now' ) ) ), 'comment_parent' => (int) $parent_id, 'comment_approved' => 1,
    ) );
    if ( $comment_id ) { add_comment_meta( $comment_id, '_sse_legacy_comment_id', $legacy_id, true ); sse_encyclopedia_import_log( 'public_note', $legacy_id, $comment_id, 'imported' ); }
    return (int) $comment_id;
}

function sse_encyclopedia_import_user( $record ) {
    global $wpdb;
    $legacy_id = sanitize_text_field( (string) ( $record['id'] ?? '' ) );
    $email     = sanitize_email( (string) ( $record['email'] ?? '' ) );
    if ( ! $legacy_id || ! is_email( $email ) ) return 0;
    $existing = get_users( array( 'meta_key' => '_sse_legacy_user_id', 'meta_value' => $legacy_id, 'number' => 1, 'fields' => 'ids' ) );
    if ( $existing ) return (int) $existing[0];
    $email_user = get_user_by( 'email', $email );
    if ( $email_user ) {
        update_user_meta( $email_user->ID, '_sse_legacy_user_id', $legacy_id );
        sse_encyclopedia_import_log( 'user', $legacy_id, $email_user->ID, 'matched' );
        return (int) $email_user->ID;
    }
    $login = sanitize_user( (string) ( $record['name'] ?? '' ), true );
    if ( '' === $login ) $login = sanitize_user( current( explode( '@', $email ) ), true );
    if ( username_exists( $login ) ) $login .= '_' . substr( md5( $legacy_id ), 0, 8 );
    $user_id = wp_insert_user( array(
        'user_login' => $login, 'user_email' => $email, 'display_name' => sanitize_text_field( (string) ( $record['name'] ?? $login ) ),
        'user_pass' => wp_generate_password( 32, true, true ), 'role' => 'subscriber',
    ) );
    if ( is_wp_error( $user_id ) ) return 0;
    $password_hash = (string) ( $record['passwordHash'] ?? '' );
    if ( preg_match( '/^\$2[ayb]\$/', $password_hash ) ) {
        $wpdb->update( $wpdb->users, array( 'user_pass' => $password_hash ), array( 'ID' => (int) $user_id ), array( '%s' ), array( '%d' ) );
    }
    update_user_meta( $user_id, '_sse_legacy_user_id', $legacy_id );
    sse_encyclopedia_import_log( 'user', $legacy_id, $user_id, 'imported' );
    return (int) $user_id;
}

function sse_encyclopedia_import_private_data( $payload ) {
    global $wpdb;
    $users = array();
    foreach ( (array) ( $payload['users'] ?? array() ) as $record ) {
        $legacy_id = (string) ( $record['id'] ?? '' );
        $users[ $legacy_id ] = sse_encyclopedia_import_user( $record );
    }
    $groups = array();
    foreach ( (array) ( $payload['note_groups'] ?? array() ) as $record ) {
        $user = $users[ (string) ( $record['userId'] ?? '' ) ] ?? 0;
        $name = sanitize_text_field( (string) ( $record['name'] ?? '' ) );
        if ( ! $user || '' === $name ) continue;
        $existing_group = $wpdb->get_var( $wpdb->prepare( 'SELECT id FROM ' . sse_encyclopedia_table( 'note_groups' ) . ' WHERE user_id = %d AND name = %s', $user, $name ) );
        if ( $existing_group ) {
            $groups[ (string) ( $record['id'] ?? '' ) ] = (int) $existing_group;
            continue;
        }
        $created_at = gmdate( 'Y-m-d H:i:s', strtotime( (string) ( $record['createdAt'] ?? 'now' ) ) );
        $updated_at = gmdate( 'Y-m-d H:i:s', strtotime( (string) ( $record['updatedAt'] ?? $record['createdAt'] ?? 'now' ) ) );
        $wpdb->insert( sse_encyclopedia_table( 'note_groups' ), array( 'user_id' => $user, 'name' => $name, 'created_at' => $created_at, 'updated_at' => $updated_at ), array( '%d', '%s', '%s', '%s' ) );
        $groups[ (string) ( $record['id'] ?? '' ) ] = (int) $wpdb->insert_id;
    }
    foreach ( (array) ( $payload['bookmarks'] ?? array() ) as $record ) {
        $user = $users[ (string) ( $record['userId'] ?? '' ) ] ?? 0;
        $post = sse_encyclopedia_article_id( $record['articleSlug'] ?? '' );
        if ( ! $user || ! $post ) continue;
        $wpdb->query( $wpdb->prepare( 'INSERT IGNORE INTO ' . sse_encyclopedia_table( 'bookmarks' ) . ' (user_id, article_id, translation_group_id, created_at) VALUES (%d, %d, %s, %s)', $user, $post, sse_encyclopedia_article_group( $post ), gmdate( 'Y-m-d H:i:s', strtotime( (string) ( $record['createdAt'] ?? 'now' ) ) ) ) );
    }
    foreach ( (array) ( $payload['reading_list'] ?? array() ) as $record ) {
        $user = $users[ (string) ( $record['userId'] ?? '' ) ] ?? 0;
        $post = sse_encyclopedia_article_id( $record['articleSlug'] ?? '' );
        if ( ! $user || ! $post ) continue;
        $now = gmdate( 'Y-m-d H:i:s', strtotime( (string) ( $record['updatedAt'] ?? 'now' ) ) );
        $wpdb->query( $wpdb->prepare( 'INSERT IGNORE INTO ' . sse_encyclopedia_table( 'reading_list' ) . ' (user_id, article_id, translation_group_id, status, added_at, updated_at) VALUES (%d, %d, %s, %s, %s, %s)', $user, $post, sse_encyclopedia_article_group( $post ), sanitize_key( (string) ( $record['status'] ?? 'to-read' ) ), $now, $now ) );
    }
    foreach ( (array) ( $payload['progress'] ?? array() ) as $record ) {
        $user = $users[ (string) ( $record['userId'] ?? '' ) ] ?? 0;
        $post = sse_encyclopedia_article_id( $record['articleSlug'] ?? '' );
        if ( ! $user || ! $post ) continue;
        $wpdb->query( $wpdb->prepare( 'INSERT IGNORE INTO ' . sse_encyclopedia_table( 'reading_progress' ) . ' (user_id, article_id, translation_group_id, progress_percent, scroll_position, last_section_id, updated_at) VALUES (%d, %d, %s, %f, %d, %s, %s)', $user, $post, sse_encyclopedia_article_group( $post ), 0, max( 0, (int) ( $record['scrollPosition'] ?? 0 ) ), '', gmdate( 'Y-m-d H:i:s', strtotime( (string) ( $record['updatedAt'] ?? 'now' ) ) ) ) );
    }
    foreach ( (array) ( $payload['private_notes'] ?? array() ) as $record ) {
        $user = $users[ (string) ( $record['userId'] ?? '' ) ] ?? 0;
        $post = sse_encyclopedia_article_id( $record['articleSlug'] ?? '' );
        if ( ! $user || ! $post ) continue;
        $group_id = $groups[ (string) ( $record['groupId'] ?? '' ) ] ?? 0;
        $wpdb->query( $wpdb->prepare( 'INSERT IGNORE INTO ' . sse_encyclopedia_table( 'private_notes' ) . ' (user_id, article_id, translation_group_id, group_id, section_id, content, created_at, updated_at) VALUES (%d, %d, %s, %d, %s, %s, %s, %s)', $user, $post, sse_encyclopedia_article_group( $post ), $group_id, '', sanitize_textarea_field( (string) ( $record['content'] ?? '' ) ), gmdate( 'Y-m-d H:i:s', strtotime( (string) ( $record['createdAt'] ?? 'now' ) ) ), gmdate( 'Y-m-d H:i:s', strtotime( (string) ( $record['updatedAt'] ?? 'now' ) ) ) ) );
    }
}

if ( defined( 'WP_CLI' ) && WP_CLI ) {
    WP_CLI::add_command( 'sse import', function ( $args, $assoc ) {
        $file = $args[0] ?? '';
        if ( ! $file || ! is_readable( $file ) ) WP_CLI::error( 'Pass a readable normalized migration JSON file.' );
        $payload = json_decode( file_get_contents( $file ), true );
        if ( ! is_array( $payload ) ) WP_CLI::error( 'Migration JSON is invalid.' );
        foreach ( (array) ( $payload['articles'] ?? array() ) as $article ) sse_encyclopedia_import_article( $article );
        $public_notes = (array) ( $payload['public_notes'] ?? array() );
        foreach ( $public_notes as $note ) {
            if ( empty( $note['parent_id'] ) ) sse_encyclopedia_import_public_note( $note );
        }
        foreach ( $public_notes as $note ) {
            if ( ! empty( $note['parent_id'] ) ) {
                $parents = get_comments( array( 'meta_key' => '_sse_legacy_comment_id', 'meta_value' => sanitize_text_field( (string) $note['parent_id'] ), 'number' => 1, 'fields' => 'ids' ) );
                sse_encyclopedia_import_public_note( $note, $parents ? (int) $parents[0] : 0 );
            }
        }
        if ( ! empty( $assoc['private'] ) && is_readable( $assoc['private'] ) ) {
            $private = json_decode( file_get_contents( $assoc['private'] ), true );
            if ( is_array( $private ) ) sse_encyclopedia_import_private_data( $private );
        }
        WP_CLI::success( 'Content, public notes, and requested private data imported.' );
    } );
}
