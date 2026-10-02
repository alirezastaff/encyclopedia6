<?php
/**
 * Administration screens for encyclopedia editorial content.
 */

defined( 'ABSPATH' ) || exit;

function sse_admin_can_manage() {
    return current_user_can( 'edit_sse_articles' ) || current_user_can( 'manage_options' );
}

function sse_admin_article_meta_defaults() {
    return array(
        'language'          => 'en',
        'translation_group' => '',
        'title_en'          => '',
        'title_fa'          => '',
        'description_en'    => '',
        'description_fa'    => '',
        'content_en'        => '',
        'content_fa'        => '',
        'author_text'       => '',
        'start_page'        => 0,
        'translation_status' => 'not-started',
        'review_status'     => 'not-reviewed',
        'reviewer'          => '',
        'reviewed_at'       => '',
        'related_slugs'     => '',
        'references'        => '',
    );
}

function sse_admin_article_meta( $post_id ) {
    $meta = sse_admin_article_meta_defaults();
    foreach ( $meta as $key => $default ) {
        $value = get_post_meta( $post_id, '_sse_' . $key, true );
        if ( '' !== $value && null !== $value ) {
            $meta[ $key ] = $value;
        }
    }

    if ( ! $meta['translation_group'] ) $meta['translation_group'] = get_post_meta( $post_id, '_sse_translation_group_id', true );
    if ( ! $meta['language'] ) $meta['language'] = get_post_meta( $post_id, '_sse_language', true ) ?: 'en';
    if ( ! $meta['author_text'] ) $meta['author_text'] = get_post_meta( $post_id, '_sse_author_text', true );
    if ( ! $meta['start_page'] ) $meta['start_page'] = get_post_meta( $post_id, '_sse_start_page', true );

    return $meta;
}

function sse_admin_register_menu() {
    if ( ! sse_admin_can_manage() ) return;
    add_menu_page( 'SSE Encyclopedia', 'SSE Encyclopedia', 'edit_sse_articles', 'sse-encyclopedia', 'sse_admin_dashboard', 'dashicons-book-alt', 25 );
    add_submenu_page( 'sse-encyclopedia', 'Dashboard', 'Dashboard', 'edit_sse_articles', 'sse-encyclopedia', 'sse_admin_dashboard' );
    add_submenu_page( 'sse-encyclopedia', 'Homepage', 'Homepage', 'edit_sse_articles', 'sse-homepage', 'sse_admin_homepage_page' );
    add_submenu_page( 'sse-encyclopedia', 'All entries', 'All entries', 'edit_sse_articles', 'edit.php?post_type=sse_article' );
    add_submenu_page( 'sse-encyclopedia', 'Add entry', 'Add entry', 'edit_sse_articles', 'post-new.php?post_type=sse_article' );
    add_submenu_page( 'sse-encyclopedia', 'Case Studies', 'Case Studies', 'edit_posts', 'edit.php?post_type=sse_case_study' );
    add_submenu_page( 'sse-encyclopedia', 'Add Case Study', 'Add Case Study', 'edit_posts', 'post-new.php?post_type=sse_case_study' );
    add_submenu_page( 'sse-encyclopedia', 'Marginal notes', 'Marginal notes', 'moderate_comments', 'sse-marginal-notes', 'sse_admin_marginal_notes_page' );
    add_submenu_page( 'sse-encyclopedia', 'Parts and sections', 'Parts and sections', 'manage_categories', 'sse-encyclopedia-parts', 'sse_admin_parts_page' );
}
add_action( 'admin_menu', 'sse_admin_register_menu' );

function sse_homepage_admin_field( $label, $name, $value, $textarea = false ) {
    $value = is_scalar( $value ) ? $value : '';
    if ( $textarea ) {
        printf( '<label class="sse-admin-field"><strong>%s</strong><textarea name="%s" rows="4">%s</textarea></label>', esc_html( $label ), esc_attr( $name ), esc_textarea( $value ) );
    } else {
        printf( '<label class="sse-admin-field"><strong>%s</strong><input type="text" name="%s" value="%s"></label>', esc_html( $label ), esc_attr( $name ), esc_attr( $value ) );
    }
}

function sse_homepage_admin_json_field( $label, $name, $value ) {
    printf( '<label class="sse-admin-field"><strong>%s</strong><textarea name="%s" rows="8" class="large-text code">%s</textarea><span class="description">Use JSON rows with label/title, href, text/icon, and enabled fields as appropriate.</span></label>', esc_html( $label ), esc_attr( $name ), esc_textarea( wp_json_encode( $value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE ) ) );
}

function sse_homepage_admin_clean_value( $value ) {
    if ( is_array( $value ) ) {
        $clean = array();
        foreach ( $value as $key => $item ) $clean[ sanitize_key( $key ) ] = sse_homepage_admin_clean_value( $item );
        return $clean;
    }
    return sanitize_textarea_field( wp_unslash( (string) $value ) );
}

function sse_homepage_admin_page() {
    if ( ! current_user_can( 'edit_sse_articles' ) ) wp_die( esc_html__( 'You do not have permission to manage the homepage.', 'sse-encyclopedia' ) );
    $content = function_exists( 'sse_homepage_content' ) ? sse_homepage_content() : array();
    $defaults = function_exists( 'sse_homepage_defaults' ) ? sse_homepage_defaults() : array();
    if ( isset( $_POST['sse_homepage_save'] ) ) {
        check_admin_referer( 'sse_homepage_save' );
        foreach ( array( 'fa', 'en' ) as $locale ) {
            $input = (array) ( $_POST['sse_homepage'][ $locale ] ?? array() );
            $saved = $defaults[ $locale ];
            foreach ( array( 'brandTitle', 'brandSubtitle', 'eyebrow', 'heroTitle', 'heroTitleAccent', 'heroDescription', 'searchTitle', 'searchPlaceholder', 'sourceLabel', 'sourceText', 'introTitle', 'introText', 'teamLabel', 'teamText', 'goalsTitle', 'footerCopyright' ) as $key ) {
                $saved[ $key ] = sanitize_textarea_field( $input[ $key ] ?? '' );
            }
            foreach ( array( 'nav', 'heroActions', 'quickLinks', 'infoItems', 'introLinks', 'features' ) as $key ) {
                $decoded = json_decode( wp_unslash( $input[ $key ] ?? '' ), true );
                $saved[ $key ] = is_array( $decoded ) ? sse_homepage_admin_clean_value( $decoded ) : $defaults[ $locale ][ $key ];
            }
            $goals = preg_split( '/\r\n|\r|\n/', wp_unslash( $input['goals'] ?? '' ) );
            $saved['goals'] = array_values( array_filter( array_map( 'sanitize_textarea_field', $goals ) ) );
            $content[ $locale ] = $saved;
        }
        update_option( 'sse_homepage_content', $content, false );
        echo '<div class="notice notice-success is-dismissible"><p>Homepage content saved.</p></div>';
    }
    ?>
    <div class="wrap" dir="ltr">
        <h1>Homepage content</h1>
        <p>Manage the public Persian and English homepage content. Changes are published through the homepage API.</p>
        <form method="post">
            <?php wp_nonce_field( 'sse_homepage_save' ); ?>
            <div class="sse-homepage-locale-grid">
            <?php foreach ( array( 'fa' => 'فارسی', 'en' => 'English' ) as $locale => $label ) : $data = wp_parse_args( $content[ $locale ] ?? array(), $defaults[ $locale ] ); ?>
                <section class="sse-admin-card"<?php echo 'fa' === $locale ? ' dir="rtl"' : ''; ?>><h2><?php echo esc_html( $label ); ?></h2>
                <?php sse_homepage_admin_field( 'Brand title', 'sse_homepage[' . $locale . '][brandTitle]', $data['brandTitle'] ); ?>
                <?php sse_homepage_admin_field( 'Brand subtitle', 'sse_homepage[' . $locale . '][brandSubtitle]', $data['brandSubtitle'] ); ?>
                <?php sse_homepage_admin_field( 'Hero eyebrow', 'sse_homepage[' . $locale . '][eyebrow]', $data['eyebrow'] ); ?>
                <?php sse_homepage_admin_field( 'Hero title', 'sse_homepage[' . $locale . '][heroTitle]', $data['heroTitle'] ); ?>
                <?php sse_homepage_admin_field( 'Hero title accent', 'sse_homepage[' . $locale . '][heroTitleAccent]', $data['heroTitleAccent'] ); ?>
                <?php sse_homepage_admin_field( 'Hero description', 'sse_homepage[' . $locale . '][heroDescription]', $data['heroDescription'], true ); ?>
                <?php sse_homepage_admin_field( 'Search title', 'sse_homepage[' . $locale . '][searchTitle]', $data['searchTitle'] ); ?>
                <?php sse_homepage_admin_field( 'Search placeholder', 'sse_homepage[' . $locale . '][searchPlaceholder]', $data['searchPlaceholder'] ); ?>
                <?php sse_homepage_admin_field( 'Source label', 'sse_homepage[' . $locale . '][sourceLabel]', $data['sourceLabel'] ); ?>
                <?php sse_homepage_admin_field( 'Source text', 'sse_homepage[' . $locale . '][sourceText]', $data['sourceText'], true ); ?>
                <?php sse_homepage_admin_json_field( 'Top navigation JSON', 'sse_homepage[' . $locale . '][nav]', $data['nav'] ); ?>
                <?php sse_homepage_admin_json_field( 'Hero buttons JSON', 'sse_homepage[' . $locale . '][heroActions]', $data['heroActions'] ); ?>
                <?php sse_homepage_admin_json_field( 'Quick links JSON', 'sse_homepage[' . $locale . '][quickLinks]', $data['quickLinks'] ); ?>
                <?php sse_homepage_admin_json_field( 'Numbered items JSON', 'sse_homepage[' . $locale . '][infoItems]', $data['infoItems'] ); ?>
                <?php sse_homepage_admin_field( 'Project section title', 'sse_homepage[' . $locale . '][introTitle]', $data['introTitle'] ); ?>
                <?php sse_homepage_admin_field( 'Project section text', 'sse_homepage[' . $locale . '][introText]', $data['introText'], true ); ?>
                <?php sse_homepage_admin_field( 'Team label', 'sse_homepage[' . $locale . '][teamLabel]', $data['teamLabel'] ); ?>
                <?php sse_homepage_admin_field( 'Team text', 'sse_homepage[' . $locale . '][teamText]', $data['teamText'] ); ?>
                <?php sse_homepage_admin_json_field( 'Project links JSON', 'sse_homepage[' . $locale . '][introLinks]', $data['introLinks'] ); ?>
                <?php sse_homepage_admin_field( 'Goals section title', 'sse_homepage[' . $locale . '][goalsTitle]', $data['goalsTitle'] ); ?>
                <?php sse_homepage_admin_field( 'Goals, one per line', 'sse_homepage[' . $locale . '][goals]', implode( "\n", $data['goals'] ), true ); ?>
                <?php sse_homepage_admin_json_field( 'Feature cards JSON', 'sse_homepage[' . $locale . '][features]', $data['features'] ); ?>
                <?php sse_homepage_admin_field( 'Footer copyright', 'sse_homepage[' . $locale . '][footerCopyright]', $data['footerCopyright'] ); ?>
                <?php sse_homepage_admin_json_field( 'Footer links JSON', 'sse_homepage[' . $locale . '][footerLinks]', $data['footerLinks'] ); ?>
                </section>
            <?php endforeach; ?>
            </div>
            <p><button class="button button-primary" type="submit" name="sse_homepage_save" value="1">Save homepage content</button></p>
        </form>
    </div>
    <?php
}

function sse_admin_marginal_notes_page() {
    if ( ! current_user_can( 'moderate_comments' ) ) wp_die( esc_html__( 'You do not have permission to moderate marginal notes.', 'sse-encyclopedia' ) );
    $pending = get_comments( array( 'type' => 'sse_public_note', 'status' => 'hold', 'number' => 8, 'orderby' => 'comment_date_gmt', 'order' => 'DESC' ) );
    $pending_count = get_comments( array( 'type' => 'sse_public_note', 'status' => 'hold', 'count' => true ) );
    $published_count = get_comments( array( 'type' => 'sse_public_note', 'status' => 'approve', 'count' => true ) );
    ?>
    <div class="wrap" dir="rtl">
        <h1><?php esc_html_e( 'Marginal notes', 'sse-encyclopedia' ); ?></h1>
        <p><?php esc_html_e( 'Review public research discussions before they appear beside encyclopedia entries.', 'sse-encyclopedia' ); ?></p>
        <div class="sse-admin-grid">
            <div class="sse-admin-card"><h2><?php esc_html_e( 'Pending review', 'sse-encyclopedia' ); ?></h2><div class="sse-admin-stat"><?php echo esc_html( $pending_count ); ?></div></div>
            <div class="sse-admin-card"><h2><?php esc_html_e( 'Published notes', 'sse-encyclopedia' ); ?></h2><div class="sse-admin-stat"><?php echo esc_html( $published_count ); ?></div></div>
            <div class="sse-admin-card"><h2><?php esc_html_e( 'Moderation queue', 'sse-encyclopedia' ); ?></h2><p><a class="button button-primary" href="<?php echo esc_url( admin_url( 'edit-comments.php?comment_type=sse_public_note' ) ); ?>"><?php esc_html_e( 'Open all marginal notes', 'sse-encyclopedia' ); ?></a></p></div>
        </div>
        <div class="sse-admin-card" style="margin-top:18px"><h2><?php esc_html_e( 'Latest pending notes', 'sse-encyclopedia' ); ?></h2>
        <?php if ( ! $pending ) : ?><p><?php esc_html_e( 'The moderation queue is empty.', 'sse-encyclopedia' ); ?></p><?php else : ?><table class="widefat striped"><thead><tr><th><?php esc_html_e( 'Author', 'sse-encyclopedia' ); ?></th><th><?php esc_html_e( 'Note', 'sse-encyclopedia' ); ?></th><th><?php esc_html_e( 'Entry', 'sse-encyclopedia' ); ?></th><th><?php esc_html_e( 'Action', 'sse-encyclopedia' ); ?></th></tr></thead><tbody><?php foreach ( $pending as $comment ) : ?><tr><td><?php echo esc_html( $comment->comment_author ); ?></td><td><?php echo esc_html( wp_trim_words( $comment->comment_content, 20 ) ); ?></td><td><?php echo esc_html( get_the_title( $comment->comment_post_ID ) ); ?></td><td><a href="<?php echo esc_url( admin_url( 'comment.php?action=editcomment&c=' . (int) $comment->comment_ID ) ); ?>"><?php esc_html_e( 'Review', 'sse-encyclopedia' ); ?></a></td></tr><?php endforeach; ?></tbody></table><?php endif; ?></div>
    </div>
    <?php
}

function sse_admin_enqueue_assets( $hook ) {
    $screen = get_current_screen();
    if ( false === strpos( $hook, 'sse-encyclopedia' ) && false === strpos( $hook, 'sse-homepage' ) && ( ! $screen || ! in_array( $screen->post_type, array( 'sse_article', 'sse_case_study' ), true ) ) ) return;
    wp_enqueue_style( 'dashicons' );
    if ( $screen && 'sse_case_study' === $screen->post_type ) {
        wp_enqueue_media();
        $pdf_picker_script = <<<'JS'
jQuery(function($){$('.sse-pdf-picker').on('click',function(e){e.preventDefault();var button=$(this),frame=wp.media({title:button.data('title'),button:{text:'Use this PDF'},library:{type:'application/pdf'},multiple:false});frame.on('select',function(){var file=frame.state().get('selection').first().toJSON();$('#'+button.data('target')).val(file.id);button.siblings('.sse-pdf-name').text(file.filename||file.title);});frame.open();});});
JS;
        wp_add_inline_script( 'media-editor', $pdf_picker_script );
    }
    wp_add_inline_style( 'dashicons', '.sse-admin-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;max-width:1180px}.sse-homepage-locale-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;max-width:1500px}.sse-admin-card{background:#fff;border:1px solid #dcdcde;padding:18px;box-shadow:0 1px 2px rgba(0,0,0,.04)}.sse-admin-card h2,.sse-admin-card h3{margin-top:0}.sse-admin-stat{font-size:30px;font-weight:700;color:#8f1822}.sse-admin-muted{color:#646970}.sse-admin-bilingual{display:grid;grid-template-columns:1fr 1fr;gap:18px}.sse-admin-field{display:grid;gap:5px;margin:0 0 14px}.sse-admin-field input,.sse-admin-field select,.sse-admin-field textarea{width:100%}.sse-admin-field textarea{min-height:90px}.sse-admin-status{display:inline-block;padding:3px 8px;border-radius:12px;background:#f0f0f1}.sse-admin-warning{border-left:4px solid #dba617;padding:10px 12px;background:#fff8e5}@media(max-width:900px){.sse-admin-grid,.sse-admin-bilingual,.sse-homepage-locale-grid{grid-template-columns:1fr}}' );
}
add_action( 'admin_enqueue_scripts', 'sse_admin_enqueue_assets' );

function sse_admin_dashboard() {
    if ( ! sse_admin_can_manage() ) wp_die( esc_html__( 'You do not have permission to access this page.', 'sse-encyclopedia' ) );
    $counts = wp_count_posts( 'sse_article' );
    $articles = get_posts( array( 'post_type' => 'sse_article', 'post_status' => 'any', 'posts_per_page' => -1 ) );
    $languages = array( 'en' => 0, 'fa' => 0 );
    $translation_due = 0;
    $review_due = 0;
    foreach ( $articles as $article ) {
        $meta = sse_admin_article_meta( $article->ID );
        if ( isset( $languages[ $meta['language'] ] ) ) $languages[ $meta['language'] ]++;
        if ( in_array( $meta['translation_status'], array( 'not-started', 'in-progress', 'needs-review' ), true ) ) $translation_due++;
        if ( 'approved' !== $meta['review_status'] ) $review_due++;
    }
    $recent = get_posts( array( 'post_type' => 'sse_article', 'post_status' => 'any', 'posts_per_page' => 8, 'orderby' => 'modified', 'order' => 'DESC' ) );
    ?>
    <div class="wrap" dir="ltr">
        <h1>SSE Encyclopedia</h1>
        <p>Manage bilingual entries, the archive structure, translation workflow, and editorial review from one place.</p>
        <div class="sse-admin-grid">
            <div class="sse-admin-card"><h2>Total entries</h2><div class="sse-admin-stat"><?php echo esc_html( array_sum( (array) $counts ) ); ?></div><a href="<?php echo esc_url( admin_url( 'edit.php?post_type=sse_article' ) ); ?>">Open entries</a></div>
            <div class="sse-admin-card"><h2>English / فارسی</h2><div class="sse-admin-stat"><?php echo esc_html( $languages['en'] . ' / ' . $languages['fa'] ); ?></div><span class="sse-admin-muted">Entries by language</span></div>
            <div class="sse-admin-card"><h2>Needs attention</h2><div class="sse-admin-stat"><?php echo esc_html( $translation_due + $review_due ); ?></div><span class="sse-admin-muted"><?php echo esc_html( $translation_due ); ?> translation, <?php echo esc_html( $review_due ); ?> review</span></div>
        </div>
        <div class="sse-admin-grid" style="margin-top:18px;grid-template-columns:2fr 1fr">
            <div class="sse-admin-card"><h2>Recently changed</h2><table class="widefat striped"><thead><tr><th>Entry</th><th>Language</th><th>Status</th><th>Modified</th></tr></thead><tbody>
            <?php foreach ( $recent as $article ) : $meta = sse_admin_article_meta( $article->ID ); ?>
                <tr><td><a href="<?php echo esc_url( get_edit_post_link( $article->ID ) ); ?>"><?php echo esc_html( get_the_title( $article ) ?: '(untitled)' ); ?></a></td><td><?php echo esc_html( strtoupper( $meta['language'] ) ); ?></td><td><span class="sse-admin-status"><?php echo esc_html( $meta['review_status'] ); ?></span></td><td><?php echo esc_html( get_the_modified_date( '', $article ) ); ?></td></tr>
            <?php endforeach; ?>
            </tbody></table></div>
            <div class="sse-admin-card"><h2>Editorial workflow</h2><p>Use the entry editor to keep both languages, sources, related entries, and review decisions attached to one record.</p><p><a class="button button-primary" href="<?php echo esc_url( admin_url( 'post-new.php?post_type=sse_article' ) ); ?>">Create an entry</a></p><p><a class="button" href="<?php echo esc_url( admin_url( 'edit-tags.php?taxonomy=sse_part&post_type=sse_article' ) ); ?>">Manage parts</a></p></div>
        </div>
    </div>
    <?php
}

function sse_admin_register_meta_boxes() {
    add_meta_box( 'sse-admin-identity', 'Entry identity and archive placement', 'sse_admin_identity_box', 'sse_article', 'normal', 'high' );
    add_meta_box( 'sse-admin-bilingual', 'Bilingual content', 'sse_admin_bilingual_box', 'sse_article', 'normal', 'high' );
    add_meta_box( 'sse-admin-workflow', 'Translation and editorial workflow', 'sse_admin_workflow_box', 'sse_article', 'side', 'high' );
    add_meta_box( 'sse-admin-links', 'Related entries and references', 'sse_admin_links_box', 'sse_article', 'normal', 'default' );
}
add_action( 'add_meta_boxes', 'sse_admin_register_meta_boxes' );

function sse_admin_field( $label, $name, $value, $type = 'text', $dir = '' ) {
    $direction = $dir ? ' dir="' . esc_attr( $dir ) . '"' : '';
    if ( 'textarea' === $type ) {
        printf( '<label class="sse-admin-field"%s><strong>%s</strong><textarea name="%s" rows="4">%s</textarea></label>', $direction, esc_html( $label ), esc_attr( $name ), esc_textarea( $value ) );
    } else {
        printf( '<label class="sse-admin-field"%s><strong>%s</strong><input type="%s" name="%s" value="%s"></label>', $direction, esc_html( $label ), esc_attr( $type ), esc_attr( $name ), esc_attr( $value ) );
    }
}

function sse_admin_identity_box( $post ) {
    $meta = sse_admin_article_meta( $post->ID );
    wp_nonce_field( 'sse_admin_save_article', 'sse_admin_article_nonce' );
    echo '<div class="sse-admin-bilingual">';
    echo '<div>';
    sse_admin_field( 'Language of this record', 'sse_admin[language]', $meta['language'], 'text' );
    sse_admin_field( 'Translation group ID', 'sse_admin[translation_group]', $meta['translation_group'] );
    sse_admin_field( 'Author(s)', 'sse_admin[author_text]', $meta['author_text'] );
    echo '</div><div dir="rtl">';
    sse_admin_field( 'شماره صفحه آغازین', 'sse_admin[start_page]', $meta['start_page'], 'number' );
    echo '<p class="description">The translation group connects the Persian and English records. Use the same value for both versions.</p>';
    echo '</div></div>';
}

function sse_admin_bilingual_box( $post ) {
    $meta = sse_admin_article_meta( $post->ID );
    echo '<div class="sse-admin-bilingual">';
    echo '<div><h3>English</h3>';
    sse_admin_field( 'Title', 'sse_admin[title_en]', $meta['title_en'] );
    sse_admin_field( 'Short description', 'sse_admin[description_en]', $meta['description_en'], 'textarea' );
    echo '<p><strong>Full entry</strong></p>';
    wp_editor( $meta['content_en'], 'sse_admin_content_en', array( 'textarea_name' => 'sse_admin[content_en]', 'textarea_rows' => 14, 'media_buttons' => false, 'teeny' => false ) );
    echo '</div><div dir="rtl"><h3>فارسی</h3>';
    sse_admin_field( 'عنوان', 'sse_admin[title_fa]', $meta['title_fa'], 'text', 'rtl' );
    sse_admin_field( 'توضیح کوتاه', 'sse_admin[description_fa]', $meta['description_fa'], 'textarea', 'rtl' );
    echo '<p><strong>متن کامل مدخل</strong></p>';
    wp_editor( $meta['content_fa'], 'sse_admin_content_fa', array( 'textarea_name' => 'sse_admin[content_fa]', 'textarea_rows' => 14, 'media_buttons' => false, 'teeny' => false, 'tinymce' => array( 'directionality' => 'rtl' ) ) );
    echo '</div></div>';
}

function sse_admin_workflow_box( $post ) {
    $meta = sse_admin_article_meta( $post->ID );
    $translation = array( 'not-started' => 'Not started', 'in-progress' => 'In progress', 'needs-review' => 'Needs review', 'approved' => 'Approved' );
    $review = array( 'not-reviewed' => 'Not reviewed', 'in-review' => 'In review', 'changes-requested' => 'Changes requested', 'approved' => 'Approved' );
    echo '<label class="sse-admin-field"><strong>Translation status</strong><select name="sse_admin[translation_status]">';
    foreach ( $translation as $key => $label ) echo '<option value="' . esc_attr( $key ) . '" ' . selected( $meta['translation_status'], $key, false ) . '>' . esc_html( $label ) . '</option>';
    echo '</select></label><label class="sse-admin-field"><strong>Review status</strong><select name="sse_admin[review_status]">';
    foreach ( $review as $key => $label ) echo '<option value="' . esc_attr( $key ) . '" ' . selected( $meta['review_status'], $key, false ) . '>' . esc_html( $label ) . '</option>';
    echo '</select></label>';
    sse_admin_field( 'Reviewer', 'sse_admin[reviewer]', $meta['reviewer'] );
    sse_admin_field( 'Reviewed at', 'sse_admin[reviewed_at]', $meta['reviewed_at'], 'date' );
}

function sse_admin_links_box( $post ) {
    $meta = sse_admin_article_meta( $post->ID );
    sse_admin_field( 'Related entry slugs (one per line)', 'sse_admin[related_slugs]', $meta['related_slugs'], 'textarea' );
    sse_admin_field( 'References (one per line)', 'sse_admin[references]', $meta['references'], 'textarea' );
}

function sse_admin_clean_meta( $input ) {
    $clean = sse_admin_article_meta_defaults();
    $clean['language'] = 'fa' === sanitize_key( $input['language'] ?? '' ) ? 'fa' : 'en';
    foreach ( array( 'translation_group', 'title_en', 'title_fa', 'author_text', 'reviewer', 'reviewed_at' ) as $key ) $clean[ $key ] = sanitize_text_field( $input[ $key ] ?? '' );
    foreach ( array( 'description_en', 'description_fa', 'related_slugs', 'references' ) as $key ) $clean[ $key ] = sanitize_textarea_field( $input[ $key ] ?? '' );
    foreach ( array( 'content_en', 'content_fa' ) as $key ) $clean[ $key ] = wp_kses_post( $input[ $key ] ?? '' );
    $clean['start_page'] = max( 0, absint( $input['start_page'] ?? 0 ) );
    $clean['translation_status'] = in_array( $input['translation_status'] ?? '', array( 'not-started', 'in-progress', 'needs-review', 'approved' ), true ) ? $input['translation_status'] : 'not-started';
    $clean['review_status'] = in_array( $input['review_status'] ?? '', array( 'not-reviewed', 'in-review', 'changes-requested', 'approved' ), true ) ? $input['review_status'] : 'not-reviewed';
    return $clean;
}

function sse_admin_save_article( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( 'sse_article' !== get_post_type( $post_id ) || ! sse_admin_can_manage() ) return;
    if ( empty( $_POST['sse_admin_article_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sse_admin_article_nonce'] ) ), 'sse_admin_save_article' ) ) return;
    $meta = sse_admin_clean_meta( (array) ( $_POST['sse_admin'] ?? array() ) );
    foreach ( $meta as $key => $value ) update_post_meta( $post_id, '_sse_' . $key, $value );
    update_post_meta( $post_id, '_sse_language', $meta['language'] );
    update_post_meta( $post_id, '_sse_translation_group_id', $meta['translation_group'] ?: (string) $post_id );
    update_post_meta( $post_id, '_sse_author_text', $meta['author_text'] );
    update_post_meta( $post_id, '_sse_start_page', $meta['start_page'] );

    $title = 'fa' === $meta['language'] ? $meta['title_fa'] : $meta['title_en'];
    $description = 'fa' === $meta['language'] ? $meta['description_fa'] : $meta['description_en'];
    $content = 'fa' === $meta['language'] ? $meta['content_fa'] : $meta['content_en'];
    if ( $title || $description || $content ) {
        remove_action( 'save_post_sse_article', 'sse_admin_save_article' );
        wp_update_post( array( 'ID' => $post_id, 'post_title' => $title ?: get_the_title( $post_id ), 'post_excerpt' => $description, 'post_content' => $content ) );
        add_action( 'save_post_sse_article', 'sse_admin_save_article' );
    }
}
add_action( 'save_post_sse_article', 'sse_admin_save_article' );

function sse_admin_article_columns( $columns ) {
    return array_merge( array( 'cb' => $columns['cb'], 'title' => 'Entry', 'sse_language' => 'Language', 'sse_part' => 'Part', 'sse_page' => 'Page', 'sse_translation' => 'Translation', 'sse_review' => 'Review' ), array_diff_key( $columns, array( 'cb' => true, 'title' => true, 'date' => true ) ), array( 'date' => $columns['date'] ) );
}
add_filter( 'manage_sse_article_posts_columns', 'sse_admin_article_columns' );

function sse_admin_article_column( $column, $post_id ) {
    $meta = sse_admin_article_meta( $post_id );
    if ( 'sse_language' === $column ) echo esc_html( strtoupper( $meta['language'] ) );
    if ( 'sse_page' === $column ) echo esc_html( $meta['start_page'] ?: '-' );
    if ( 'sse_translation' === $column ) echo esc_html( $meta['translation_status'] );
    if ( 'sse_review' === $column ) echo esc_html( $meta['review_status'] );
    if ( 'sse_part' === $column ) echo esc_html( implode( ', ', wp_get_post_terms( $post_id, 'sse_part', array( 'fields' => 'names' ) ) ) ?: '-' );
}
add_action( 'manage_sse_article_posts_custom_column', 'sse_admin_article_column', 10, 2 );

function sse_admin_article_filters() {
    global $typenow;
    if ( 'sse_article' !== $typenow ) return;
    $value = sanitize_key( $_GET['sse_language'] ?? '' );
    echo '<select name="sse_language"><option value="">All languages</option><option value="en" ' . selected( $value, 'en', false ) . '>English</option><option value="fa" ' . selected( $value, 'fa', false ) . '>فارسی</option></select>';
}
add_action( 'restrict_manage_posts', 'sse_admin_article_filters' );

function sse_admin_article_filter_query( $query ) {
    if ( ! is_admin() || ! $query->is_main_query() || 'sse_article' !== $query->get( 'post_type' ) ) return;
    if ( ! empty( $_GET['sse_language'] ) ) $query->set( 'meta_query', array( array( 'key' => '_sse_language', 'value' => sanitize_key( $_GET['sse_language'] ) ) ) );
}
add_action( 'pre_get_posts', 'sse_admin_article_filter_query' );

function sse_case_study_admin_field( $label, $name, $value, $type = 'text', $dir = '' ) {
    $direction = $dir ? ' dir="' . esc_attr( $dir ) . '"' : '';
    if ( 'textarea' === $type ) printf( '<label class="sse-admin-field"%s><strong>%s</strong><textarea name="%s" rows="4">%s</textarea></label>', $direction, esc_html( $label ), esc_attr( $name ), esc_textarea( $value ) );
    else printf( '<label class="sse-admin-field"%s><strong>%s</strong><input type="%s" name="%s" value="%s"></label>', $direction, esc_html( $label ), esc_attr( $type ), esc_attr( $name ), esc_attr( $value ) );
}

function sse_case_study_admin_meta_boxes() {
    add_meta_box( 'sse-case-identity', 'Case study identity', 'sse_case_study_identity_box', 'sse_case_study', 'normal', 'high' );
    add_meta_box( 'sse-case-content', 'Bilingual content', 'sse_case_study_content_box', 'sse_case_study', 'normal', 'high' );
    add_meta_box( 'sse-case-pdfs', 'Bilingual PDF attachments', 'sse_case_study_pdf_box', 'sse_case_study', 'normal', 'default' );
    add_meta_box( 'sse-case-publication', 'Publication', 'sse_case_study_publication_box', 'sse_case_study', 'side', 'high' );
}
add_action( 'add_meta_boxes', 'sse_case_study_admin_meta_boxes' );

function sse_case_study_admin_meta( $post_id ) {
    $meta = function_exists( 'sse_case_study_get_meta' ) ? sse_case_study_get_meta( $post_id ) : array();
    foreach ( array( 'title_en', 'title_fa' ) as $key ) $meta[ $key ] = get_post_meta( $post_id, '_sse_case_' . $key, true );
    return $meta;
}

function sse_case_study_identity_box( $post ) {
    $meta = sse_case_study_admin_meta( $post->ID );
    wp_nonce_field( 'sse_case_study_save', 'sse_case_study_nonce' );
    echo '<div class="sse-admin-bilingual"><div>';
    sse_case_study_admin_field( 'Place / location', 'sse_case[place]', $meta['place'] );
    sse_case_study_admin_field( 'English title', 'sse_case[title_en]', $meta['title_en'] );
    sse_case_study_admin_field( 'English type', 'sse_case[type_en]', $meta['type_en'] );
    echo '</div><div dir="rtl">';
    sse_case_study_admin_field( 'مکان', 'sse_case[place_fa]', $meta['place_fa'], 'text', 'rtl' );
    sse_case_study_admin_field( 'عنوان فارسی', 'sse_case[title_fa]', $meta['title_fa'], 'text', 'rtl' );
    sse_case_study_admin_field( 'نوع مطالعه', 'sse_case[type_fa]', $meta['type_fa'], 'text', 'rtl' );
    sse_case_study_admin_field( 'دسته‌بندی فارسی', 'sse_case[category_fa]', $meta['category_fa'], 'text', 'rtl' );
    echo '</div></div>';
}

function sse_case_study_content_box( $post ) {
    $meta = sse_case_study_admin_meta( $post->ID );
    echo '<div class="sse-admin-bilingual"><div><h3>English</h3>';
    sse_case_study_admin_field( 'Card summary', 'sse_case[summary_en]', $meta['summary_en'], 'textarea' );
    sse_case_study_admin_field( 'Featured metric', 'sse_case[metric_en]', $meta['metric_en'] );
    echo '<p><strong>Full case study</strong></p>';
    wp_editor( get_post_meta( $post->ID, '_sse_case_content_en', true ), 'sse_case_content_en', array( 'textarea_name' => 'sse_case[content_en]', 'textarea_rows' => 12, 'media_buttons' => true ) );
    echo '</div><div dir="rtl"><h3>فارسی</h3>';
    sse_case_study_admin_field( 'خلاصه کارت', 'sse_case[summary_fa]', $meta['summary_fa'], 'textarea', 'rtl' );
    sse_case_study_admin_field( 'شاخص اصلی', 'sse_case[metric_fa]', $meta['metric_fa'], 'text', 'rtl' );
    echo '<p><strong>متن کامل مطالعه موردی</strong></p>';
    wp_editor( get_post_meta( $post->ID, '_sse_case_content_fa', true ), 'sse_case_content_fa', array( 'textarea_name' => 'sse_case[content_fa]', 'textarea_rows' => 12, 'media_buttons' => true, 'tinymce' => array( 'directionality' => 'rtl' ) ) );
    echo '</div></div>';
}

function sse_case_study_pdf_box( $post ) {
    $meta = sse_case_study_admin_meta( $post->ID );
    echo '<p>Attach the complete case study PDF for each language. Only PDF files are accepted.</p>';
    foreach ( array( 'en' => 'English PDF', 'fa' => 'فایل PDF فارسی' ) as $locale => $label ) {
        $id = (int) $meta[ 'pdf_' . $locale ];
        $name = $id ? get_the_title( $id ) : 'No PDF selected';
        echo '<div class="sse-pdf-row"' . ( 'fa' === $locale ? ' dir="rtl"' : '' ) . '><strong>' . esc_html( $label ) . '</strong><input type="hidden" id="sse-case-pdf-' . esc_attr( $locale ) . '" name="sse_case[pdf_' . esc_attr( $locale ) . ']" value="' . esc_attr( $id ) . '"><button type="button" class="button sse-pdf-picker" data-target="sse-case-pdf-' . esc_attr( $locale ) . '" data-title="' . esc_attr( $label ) . '">Choose PDF</button> <span class="sse-pdf-name">' . esc_html( $name ) . '</span></div><br>';
    }
}

function sse_case_study_publication_box( $post ) {
    $meta = sse_case_study_admin_meta( $post->ID );
    echo '<label><input type="checkbox" name="sse_case[published_en]" value="1" ' . checked( $meta['published_en'], 1, false ) . '> Publish English version</label><br><label dir="rtl"><input type="checkbox" name="sse_case[published_fa]" value="1" ' . checked( $meta['published_fa'], 1, false ) . '> انتشار نسخه فارسی</label>';
    sse_case_study_admin_field( 'Display order', 'sse_case[display_order]', $meta['display_order'], 'number' );
}

function sse_case_study_save_admin( $post_id ) {
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
    if ( 'sse_case_study' !== get_post_type( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) return;
    if ( empty( $_POST['sse_case_study_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sse_case_study_nonce'] ) ), 'sse_case_study_save' ) ) return;
    $input = (array) ( $_POST['sse_case'] ?? array() );
    foreach ( array( 'place', 'place_fa', 'title_en', 'title_fa', 'type_en', 'type_fa', 'category_fa', 'metric_en', 'metric_fa' ) as $key ) update_post_meta( $post_id, '_sse_case_' . $key, sanitize_text_field( $input[ $key ] ?? '' ) );
    foreach ( array( 'summary_en', 'summary_fa' ) as $key ) update_post_meta( $post_id, '_sse_case_' . $key, sanitize_textarea_field( $input[ $key ] ?? '' ) );
    foreach ( array( 'content_en', 'content_fa' ) as $key ) update_post_meta( $post_id, '_sse_case_' . $key, wp_kses_post( $input[ $key ] ?? '' ) );
    foreach ( array( 'pdf_en', 'pdf_fa' ) as $key ) update_post_meta( $post_id, '_sse_case_' . $key, absint( $input[ $key ] ?? 0 ) );
    update_post_meta( $post_id, '_sse_case_display_order', absint( $input['display_order'] ?? 0 ) );
    update_post_meta( $post_id, '_sse_case_published_en', empty( $input['published_en'] ) ? 0 : 1 );
    update_post_meta( $post_id, '_sse_case_published_fa', empty( $input['published_fa'] ) ? 0 : 1 );
    $title = sanitize_text_field( $input['title_en'] ?? $input['title_fa'] ?? '' );
    if ( $title ) { remove_action( 'save_post_sse_case_study', 'sse_case_study_save_admin' ); wp_update_post( array( 'ID' => $post_id, 'post_title' => $title ) ); add_action( 'save_post_sse_case_study', 'sse_case_study_save_admin' ); }
}
add_action( 'save_post_sse_case_study', 'sse_case_study_save_admin' );

function sse_admin_part_edit_fields( $term ) {
    $fields = array(
        'title_en' => array( 'English title', 'text', get_term_meta( $term->term_id, '_sse_part_title_en', true ) ),
        'title_fa' => array( 'عنوان فارسی', 'text', get_term_meta( $term->term_id, '_sse_part_title_fa', true ) ),
        'part_number' => array( 'Part number', 'text', get_term_meta( $term->term_id, '_sse_part_number', true ) ),
        'part_order' => array( 'Display order', 'number', get_term_meta( $term->term_id, '_sse_part_order', true ) ),
    );
    echo '<tr class="form-field"><th scope="row">Archive labels</th><td><div style="max-width:480px">';
    foreach ( $fields as $key => $field ) sse_admin_field( $field[0], 'sse_part[' . $key . ']', $field[2], $field[1], 'title_fa' === $key ? 'rtl' : '' );
    echo '</div></td></tr>';
}
add_action( 'sse_part_edit_form_fields', 'sse_admin_part_edit_fields' );

function sse_admin_save_part_meta( $term_id ) {
    if ( ! current_user_can( 'manage_categories' ) ) return;
    $input = (array) ( $_POST['sse_part'] ?? array() );
    update_term_meta( $term_id, '_sse_part_title_en', sanitize_text_field( $input['title_en'] ?? '' ) );
    update_term_meta( $term_id, '_sse_part_title_fa', sanitize_text_field( $input['title_fa'] ?? '' ) );
    update_term_meta( $term_id, '_sse_part_number', sanitize_text_field( $input['part_number'] ?? '' ) );
    update_term_meta( $term_id, '_sse_part_order', absint( $input['part_order'] ?? 0 ) );
}
add_action( 'edited_sse_part', 'sse_admin_save_part_meta' );

function sse_admin_parts_page() {
    if ( ! current_user_can( 'manage_categories' ) ) wp_die( esc_html__( 'You do not have permission to access this page.', 'sse-encyclopedia' ) );
    if ( isset( $_POST['sse_admin_part_nonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['sse_admin_part_nonce'] ) ), 'sse_admin_part_save' ) ) {
        $name = sanitize_text_field( wp_unslash( $_POST['name'] ?? '' ) );
        $slug = sanitize_title( wp_unslash( $_POST['slug'] ?? $name ) );
        $term = $name ? wp_insert_term( $name, 'sse_part', array( 'slug' => $slug ) ) : new WP_Error( 'empty_name' );
        if ( ! is_wp_error( $term ) ) {
            update_term_meta( $term['term_id'], '_sse_part_title_en', sanitize_text_field( wp_unslash( $_POST['title_en'] ?? '' ) ) );
            update_term_meta( $term['term_id'], '_sse_part_title_fa', sanitize_text_field( wp_unslash( $_POST['title_fa'] ?? '' ) ) );
            update_term_meta( $term['term_id'], '_sse_part_number', sanitize_text_field( wp_unslash( $_POST['part_number'] ?? '' ) ) );
            update_term_meta( $term['term_id'], '_sse_part_order', absint( $_POST['part_order'] ?? 0 ) );
        }
    }
    $terms = get_terms( array( 'taxonomy' => 'sse_part', 'hide_empty' => false, 'orderby' => 'term_order', 'order' => 'ASC' ) );
    ?>
    <div class="wrap"><h1>Parts and sections</h1><p>These sections power the archive hierarchy. Store both public language labels and a stable order for the bilingual archive.</p><div class="sse-admin-grid" style="grid-template-columns:1fr 2fr"><div class="sse-admin-card"><h2>Add a part</h2><form method="post"><?php wp_nonce_field( 'sse_admin_part_save', 'sse_admin_part_nonce' ); ?><?php sse_admin_field( 'Internal name', 'name', '' ); ?><?php sse_admin_field( 'English title', 'title_en', '' ); ?><?php sse_admin_field( 'عنوان فارسی', 'title_fa', '', 'text', 'rtl' ); ?><?php sse_admin_field( 'Part number', 'part_number', '' ); ?><?php sse_admin_field( 'Display order', 'part_order', '', 'number' ); ?><?php sse_admin_field( 'Slug', 'slug', '' ); ?><button class="button button-primary" type="submit">Add part</button></form></div><div class="sse-admin-card"><h2>Current parts</h2><table class="widefat striped"><thead><tr><th>Part</th><th>English</th><th>فارسی</th><th>Order</th><th>Entries</th><th>Actions</th></tr></thead><tbody><?php foreach ( $terms as $term ) : ?><tr><td><?php echo esc_html( $term->name ); ?></td><td><?php echo esc_html( get_term_meta( $term->term_id, '_sse_part_title_en', true ) ?: '-' ); ?></td><td dir="rtl"><?php echo esc_html( get_term_meta( $term->term_id, '_sse_part_title_fa', true ) ?: '-' ); ?></td><td><?php echo esc_html( get_term_meta( $term->term_id, '_sse_part_order', true ) ?: '-' ); ?></td><td><?php echo esc_html( $term->count ); ?></td><td><a href="<?php echo esc_url( admin_url( 'term.php?taxonomy=sse_part&tag_ID=' . $term->term_id ) ); ?>">Edit</a></td></tr><?php endforeach; ?></tbody></table></div></div></div>
    <?php
}
