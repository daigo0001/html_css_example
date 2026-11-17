import { h, c } from './card-helpers.js';
import { extraElements } from './html-elements.js';
import { attributes } from './html-attributes.js';
import { extraCss } from './css-examples.js';
import { extraAttributes } from './html-attribute-examples.js';

// 説明と実行可能な最小例。互換性は scripts/compat.mjs で MDN BCD から生成する。
export const categories = [
  { id: 'all', label: 'すべて', icon: 'grid' },
  { id: 'structure', label: '文書・セマンティクス', icon: 'file' },
  { id: 'text', label: 'テキスト・装飾', icon: 'type' },
  { id: 'layout', label: 'レイアウト', icon: 'layout' },
  { id: 'foundations', label: 'CSSの基本・条件', icon: 'code' },
  { id: 'attributes', label: '属性・データ', icon: 'sliders' },
  { id: 'forms', label: 'フォーム・操作', icon: 'cursor' },
  { id: 'media', label: '画像・メディア', icon: 'image' },
  { id: 'motion', label: '動き・演出', icon: 'sparkles' },
];

const blocks = '<div class="boxes"><span>01</span><span>02</span><span>03</span></div>';
const boxStyle = '.boxes span { display: grid; place-items: center; min-height: 42px; padding: 10px; background: #e6efde; border: 1px solid #cadbbd; border-radius: 8px; color: #31523e; font-weight: 700; }';

export const cards = [
  h('details', 'details / summary', 'forms', 'JavaScriptなしで、開いたり閉じたり。補足情報をすっきりまとめる。',
    '<details open>\n  <summary>このアトリエについて</summary>\n  <p>コードを少し変えて、試してみよう。</p>\n</details>', {
      css: 'details { padding: 16px; border: 1px solid #d5dfcf; border-radius: 10px; background: #f4f8ee; }\nsummary { cursor: pointer; font-weight: 700; color: #38563b; }\np { margin-bottom: 0; font-size: 13px; }',
      usage: 'summary を最初の子要素に置き、開閉ボタンの見出しにします。open 属性があると最初から展開します。FAQや補足に便利です。',
      seo: '折りたたみの中にも意味のあるテキストを置けます。重要な情報を見つけにくくしないことが大切です。FAQの構造化データや検索結果の表示が自動で付くわけではありません。',
      note: 'summary をクリック、または Tab で選んで Enter / Space を押してみてください。', featured: true,
    }),
  c('grid-template-columns', 'CSS Grid', 'layout', '縦も横も、気持ちよく整列。2次元レイアウトを少ないコードで。', blocks,
    '.boxes {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}\n' + boxStyle, {
      bcd: 'css.properties.grid-template-columns', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/CSS_grid_layout',
      usage: '親を display: grid にし、grid-template-columns で列の幅を決めます。repeat(3, 1fr) は同じ幅の3列。2 に変えると折り返しを確認できます。',
      seo: 'レイアウトの見た目を変えてもDOMの読み順は変わりません。視覚上の配置と読み上げ・キーボードの順序を揃えましょう。', featured: true,
    }),
  c('border-radius', 'border-radius', 'text', 'ほんの少しの丸みで、印象が変わる。角丸からまんまるまで。',
    '<div class="shapes"><span>8px</span><span>24px</span><span>50%</span></div>',
    '.shapes { display: flex; justify-content: center; gap: 16px; }\n.shapes span { display: grid; place-items: center; width: 68px; height: 68px; background: #eddfce; color: #805932; font-size: 12px; }\n.shapes span:nth-child(1) { border-radius: 8px; }\n.shapes span:nth-child(2) { border-radius: 24px; }\n.shapes span:nth-child(3) { border-radius: 50%; }', {
      usage: '要素の角を丸めます。px は固定の丸み、% は要素の大きさに対する割合。正方形に 50% を指定すると円になります。', featured: true,
    }),
  h('dialog', 'dialog', 'forms', 'ブラウザー標準のダイアログ。モーダルの土台を、もっとシンプルに。',
    '<dialog open>\n  <strong>ちょっと、ひと休み。</strong>\n  <p>これは標準のダイアログです。</p>\n  <form method="dialog">\n    <button>閉じる</button>\n  </form>\n</dialog>', {
      css: 'dialog { position: relative; margin: 0 auto; border: 1px solid #d3dccd; border-radius: 12px; padding: 18px; box-shadow: 0 8px 20px #233c2410; }\np { font-size: 12px; }',
      usage: 'この例の open は非モーダル表示です。ページ全体をブロックするモーダルには JavaScript の showModal() を使います。form method="dialog" で閉じられます。',
      note: '閉じるを押すとプレビューから消えます。「コードを試す」のリセットで戻せます。open 属性だけでは背景を操作不能にはしません。',
    }),
  c('text-wrap', 'text-wrap: balance', 'text', '見出しの改行を、ちょうどよく。行ごとの長さを自然にそろえる。',
    '<h2>余白からはじまる、\n心地よいウェブづくり。</h2>',
    'h2 {\n  text-wrap: balance;\n  max-width: 240px;\n  margin: auto;\n  font-size: 23px;\n  line-height: 1.6;\n  color: #365c48;\n}', {
      bcd: 'css.properties.text-wrap.balance',
      usage: '短い見出しの行の長さを均等に近づけます。改行の結果は幅やフォントで変わります。長文の本文より、数行の見出し向きです。',
      note: '未対応環境では通常の折り返しになります。text-wrap: wrap をフォールバックとして先に書けます。',
    }),
  h('mark', 'mark', 'text', '「ここに注目」をさりげなく。検索語や文脈に関係する部分を強調。',
    '<p>新しいことは、<br>\n  <mark>使ってみる</mark>とわかる。\n</p>', {
      css: 'p { font-size: 21px; line-height: 2; margin: 0; }\nmark { background: #e1edac; color: #344223; padding: 3px 6px; border-radius: 3px; }',
      usage: '検索に一致した箇所など、今の文脈で関連性があるテキストに使います。重要性を示す strong や、単なる背景色と使い分けましょう。',
      seo: '検索キーワードに mark を付けても順位向上を保証しません。読者が文脈の中の該当箇所を見つけるための意味付けです。',
    }),
  h('article', 'article', 'structure', '記事やレビューなど、それだけでも独立して読めるコンテンツに。',
    '<article>\n  <small>FIELD NOTES — 01</small>\n  <h2>小さな発見を、ひとつ。</h2>\n  <p>独立して読める、ひとまとまりの記事。</p>\n</article>', {
      css: 'article { border-left: 3px solid #89a77b; padding-left: 18px; }\nsmall { color: #73816d; font-size: 10px; letter-spacing: .12em; }\nh2 { font-size: 18px; }\np { font-size: 12px; }',
      usage: '記事、投稿、レビューのように、単独で再利用や配信ができる内容に使います。一般的なまとまりには section、装飾用の箱には div を選びます。',
      seo: '記事という構造を伝えますが、article 自体が順位を押し上げるわけではありません。見出し、著者情報、本文の質を整えることが基本です。',
    }),
  c('display', 'Flexbox', 'layout', '横並びも、中央寄せも。1方向の並びをしなやかにコントロール。', blocks,
    '.boxes {\n  display: flex;\n  gap: 10px;\n  justify-content: space-between;\n  align-items: center;\n}\n.boxes span { flex: 1; }\n' + boxStyle, {
      bcd: 'css.properties.display.flex', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/CSS_flexible_box_layout',
      usage: '親に display: flex を指定。主軸は justify-content、交差軸は align-items で揃えます。flex-direction: column にすると縦並びになります。',
      note: 'order や row-reverse で視覚順を変えても、DOMやキーボードの順序は変わりません。',
    }),
  h('progress', 'progress', 'forms', 'アップロードやタスクの進み具合を、意味のあるバーで表現する。',
    '<label for="upload">アップロード中 — 65%</label>\n<progress id="upload" value="65" max="100">65%</progress>', {
      css: 'label { display: block; margin-bottom: 14px; font-size: 13px; }\nprogress { width: 100%; height: 16px; accent-color: #668650; }',
      usage: 'value が現在値、max が完了値です。value を省くと不確定状態になります。範囲内の測定値（容量など）には meter を使います。',
      seo: '検索順位向けではなく、進捗の意味をブラウザーや支援技術に伝える要素です。label で何の進捗か分かる名前を付けます。',
    }),
  c('box-shadow', 'box-shadow', 'text', '光と影で、奥行きをつくる。カードやボタンに自然な立体感を。',
    '<div class="note">A little depth.<small>小さな影、大きな違い。</small></div>',
    '.note {\n  padding: 22px;\n  background: white;\n  border-radius: 12px;\n  box-shadow: 0 8px 24px #324a2820;\n  text-align: center;\n  font-weight: 700;\n}\nsmall { display: block; margin-top: 8px; color: #7b8377; font-weight: 400; }'),
  c('aspect-ratio', 'aspect-ratio', 'media', '画像や動画の比率をキープ。高さを固定せず、きれいな比率に。',
    '<div class="frame"><span>16 / 9</span></div>',
    '.frame {\n  aspect-ratio: 16 / 9;\n  max-width: 220px;\n  margin: auto;\n  display: grid;\n  place-items: center;\n  border-radius: 10px;\n  background: linear-gradient(135deg, #b9cdb3, #e5edcb);\n  color: #40533a;\n}', {
      usage: '幅から高さを計算する際の推奨比率です。width と height の両方を明示すると効かない場合があります。1 / 1 で正方形を試せます。',
      seo: '画像や動画の領域を先に確保すると、読み込み時のレイアウトずれを減らせます。Core Web Vitals の CLS 改善に役立つ場合がありますが、順位向上は保証されません。',
    }),
  h('center', 'center', 'layout', '昔ながらの中央寄せ。今はCSSの text-align やFlexboxに置き換える。',
    '<center>\n  <strong>昔の中央寄せ</strong>\n  <p>今なら CSS で書こう。</p>\n</center>', {
      note: '廃止された要素です。互換性のため表示されても、新しいページには使わないでください。文字は text-align: center、箱は Grid / Flexbox で配置します。',
      seo: '見た目の中央寄せに意味的なSEO効果はありません。装飾はCSSに分離し、適切な見出しや段落の要素を使いましょう。',
      legacy: true,
    }),
  h('section', 'section', 'structure', '見出しを持つ、テーマごとのまとまり。ページの内容を整理する。',
    '<section aria-labelledby="topic">\n  <h2 id="topic">今日のテーマ</h2>\n  <p>意味のある区切りをつくろう。</p>\n</section>', {
      usage: '通常は見出しを伴う、テーマ別のまとまりです。単なる装飾用のラッパーには div。独立して配信できる内容なら article を検討します。',
      seo: '見出しと内容を対応させ、文書の構造を整理します。section を増やすだけで検索順位が上がるわけではありません。',
    }),
  h('nav', 'nav', 'structure', 'サイトやページ内の、主要なナビゲーションを示す。',
    '<nav aria-label="メインメニュー">\n  <a href="#home">ホーム</a>\n  <a href="#notes">ノート</a>\n  <a href="#about">このサイト</a>\n</nav>', {
      css: 'nav { display: flex; flex-wrap: wrap; gap: 18px; padding: 20px; border-bottom: 1px solid #dce4d5; }\na { color: #4d7045; font-size: 13px; }',
      seo: 'リンク構造はページ発見の手がかりになります。nav は主要な移動のまとまりを示します。リンク先が分かるテキストと実在するURLを使いましょう。',
      note: 'この例のリンクはプレビュー内のダミーのページ内リンクです。',
    }),
  h('main', 'main', 'structure', 'ページ固有の、主役になる内容を示すランドマーク。',
    '<main>\n  <h2>このページの主役</h2>\n  <p>繰り返しのメニュー以外の主要な内容。</p>\n</main>', {
      usage: 'ページの主要内容を囲みます。hidden でない main は原則ひとつにし、ヘッダーやナビゲーションなどの反復部分は外に置きます。',
      seo: '主要内容の範囲を支援技術などに伝えます。main タグ自体に独立した順位ボーナスがあるとはいえません。',
    }),
  h('header', 'header / footer', 'structure', '導入と締めくくり。ページ全体にも、記事の中にも使える。',
    '<article>\n  <header><h2>アトリエだより</h2></header>\n  <p>今日の小さな発見をまとめました。</p>\n  <footer><small>文：Web Notes 編集部</small></footer>\n</article>', {
      usage: 'header は導入やナビゲーション、footer は著者や関連情報に。ページ全体だけでなく article や section 内にも置けます。',
      seo: 'コンテンツの役割を明示する構造要素です。著者や関連情報を読み手に分かりやすく示せますが、タグの存在だけでSEO効果は決まりません。',
    }),
  h('heading_elements', 'h1 〜 h6', 'structure', '見た目の大きさではなく、内容の階層で見出しを選ぶ。',
    '<h1>ウェブのノート</h1>\n<h2>HTMLについて</h2>\n<h3>見出しの使い方</h3>', {
      bcd: 'html.elements.h1', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/Heading_Elements',
      css: 'h1 { font-size: 24px; margin: 0 0 10px; }\nh2 { font-size: 18px; margin: 0 0 10px; color: #668158; }\nh3 { font-size: 14px; margin: 0; color: #87917e; }',
      usage: 'h1 が最上位、h6 が最下位。文字サイズのために段階を飛ばさず、階層を作ります。表示サイズはCSSで自由に変えられます。',
      seo: '検索エンジンや読み手が内容を理解する手がかりです。ページを的確に表す主見出しと自然な階層を作り、キーワードを詰め込まないようにしましょう。',
    }),
  h('p', 'p', 'text', '文章のひとまとまりを、段落として表現する基本の要素。',
    '<p>最初の段落です。ひとつの考えをまとめます。</p>\n<p>話題が変わったら、新しい段落へ。</p>', {
      usage: 'テキストの段落に使います。空白を空けるための空の p や br の連打は避け、余白はCSSで調整します。div などのブロック要素は中に入れません。',
    }),
  h('a', 'a', 'text', '別のページや、ページ内の場所へ。ウェブをつなぐリンク。',
    '<a href="#destination">続きのノートを読む →</a>\n<p id="destination">ここがリンク先です。</p>', {
      usage: 'href に行き先を指定。画面内の操作なら button、移動なら a を使います。新しいタブを使う際は、そのことが分かる表現にしましょう。',
      seo: '有効な href を持つリンクはクローラーのページ発見を助けます。「こちら」だけではなく、リンク先を説明する自然なテキストを使いましょう。',
    }),
  h('strong', 'strong / em', 'text', '重要性と、言葉の強調。太字や斜体にする以上の意味がある。',
    '<p><strong>大事なお知らせ</strong>です。</p>\n<p>今日は<em>少しだけ</em>試してみよう。</p>', {
      usage: 'strong は重要・深刻・緊急な内容、em は発話の強勢を示します。意味を変えず見た目だけ変えるならCSSの font-weight / font-style を使います。',
      seo: 'テキストの意味を明確にします。キーワードをすべて strong にするような使い方に、検索順位改善の保証はありません。',
    }),
  h('ul', 'ul / ol / li', 'text', '順番のある手順と、順不同の項目。箇条書きにも意味がある。',
    '<ol>\n  <li>カードを選ぶ</li>\n  <li>コードを変える</li>\n  <li>表示を確かめる</li>\n</ol>', {
      usage: '順番に意味があるときは ol、ないときは ul。直接の項目は li で書きます。手順や一覧の構造を読み上げにも伝えられます。',
      seo: '一覧や手順の構造を明確にできます。検索結果での強調表示を保証するものではありません。',
    }),
  h('dl', 'dl / dt / dd', 'text', '用語と説明、名前と値。対応関係のある情報を整理する。',
    '<dl>\n  <dt>HTML</dt><dd>内容の意味と構造</dd>\n  <dt>CSS</dt><dd>見た目とレイアウト</dd>\n</dl>', {
      css: 'dl { display: grid; grid-template-columns: 70px 1fr; gap: 14px; margin: 0; }\ndt { font-weight: 700; color: #4c7341; }\ndd { margin: 0; font-size: 13px; }',
      usage: 'dt が名前や用語、dd が値や説明です。単なる2列の見た目ではなく、項目同士に名前・説明の関係があるときに使います。',
    }),
  h('blockquote', 'blockquote', 'text', '他の出典からの、まとまった引用を明示する。',
    '<figure>\n  <blockquote cite="https://example.com/note">\n    <p>学ぶことは、試すことから。</p>\n  </blockquote>\n  <figcaption>— 架空のアトリエノートより</figcaption>\n</figure>', {
      css: 'figure { margin: 0; }\nblockquote { margin: 0 0 10px; padding: 3px 18px; border-left: 3px solid #92ac7d; }\nfigcaption { font-size: 11px; color: #7b8375; }',
      usage: '長めの引用に使い、短い文中の引用は q を使います。cite 属性は出典URLですが通常画面に表示されないため、出典は本文にも書きます。',
      seo: '引用と自分の文章を区別します。cite 属性を付けるだけで外部リンクや評価の移転が発生するわけではありません。',
    }),
  h('code', 'code / pre', 'text', 'コードをコードとして、空白や改行もそのまま表示する。',
    '<p>色を変えるには <code>color</code> を使います。</p>\n<pre><code>.note {\n  color: green;\n}</code></pre>', {
      usage: 'code はコードの断片、pre は空白や改行を保持する整形済みテキストです。HTMLコードの < は &lt; のようにエスケープして表示します。',
    }),
  h('time', 'time', 'structure', '人が読む日付に、機械が読める日時を添える。',
    '<p>公開日：\n  <time datetime="2026-11-16">2026年11月16日</time>\n</p>', {
      usage: 'datetime に標準形式の日時を書きます。表示上の自由な日本語と、プログラムが読める値を分けられます。タイムゾーンが必要な日時にはオフセットも書きます。',
      seo: '日時の解釈を助けますが、検索結果に日付が採用される保証はありません。実際の公開日・更新日と整合させましょう。',
    }),
  h('img', 'img', 'media', '意味のある画像には代替テキストを。サイズ指定でレイアウトも安定。',
    '<img src="./assets/landscape.svg"\n  alt="丘の向こうに朝日がのぼるイラスト"\n  width="320" height="160">', {
      css: 'img { display: block; width: 100%; max-width: 270px; height: auto; margin: auto; border-radius: 10px; }',
      usage: 'alt は画像の意味を説明し、装飾だけの画像なら alt="" に。width / height は縦横比の確保にも役立ちます。画面外の画像は loading="lazy" を検討します。',
      seo: 'alt と周囲の文章が画像理解の手がかりになります。キーワードの羅列は避けましょう。適切なサイズや読み込みの最適化も大切です。',
    }),
  h('figure', 'figure / figcaption', 'media', '画像やコード、グラフに、対応するキャプションを添える。',
    '<figure>\n  <img src="./assets/landscape.svg" alt="緑の丘と朝日" width="320" height="160">\n  <figcaption>朝の色を集めた、小さな風景。</figcaption>\n</figure>', {
      css: 'figure { margin: 0; text-align: center; }\nimg { width: 180px; height: 90px; border-radius: 8px; }\nfigcaption { margin-top: 8px; font-size: 11px; color: #74826b; }',
      seo: '画像などと説明文の関係を明示します。キャプションは文脈の理解を助けますが、画像の alt を置き換えるものではありません。',
    }),
  h('picture', 'picture', 'media', '画面幅や画像形式に合わせて、ぴったりの画像を選ばせる。',
    '<picture>\n  <source media="(min-width: 500px)" srcset="./assets/landscape.svg">\n  <img src="./assets/landscape.svg" alt="丘と朝日のイラスト" width="320" height="160">\n</picture>', {
      css: 'img { width: 100%; max-width: 260px; height: auto; display: block; margin: auto; border-radius: 10px; }',
      usage: 'source を上から評価し、条件に合う画像を選びます。最後の img は必須のフォールバックで alt もここに書きます。例では同じ画像ですが、別の画像URLに変えて試せます。',
      seo: '最適な画像の配信は転送量や表示速度の改善に役立ちます。クローラーにも読者にも意味のある img の alt と有効なフォールバックを用意します。',
    }),
  h('video', 'video', 'media', '動画プレイヤーを標準要素で。字幕や操作手段も忘れずに。',
    '<video controls width="280"\n  poster="./assets/landscape.svg"\n  aria-label="サンプル動画（動画ファイル未設定）">\n  動画の再生には対応ブラウザーが必要です。\n</video>', {
      usage: 'src か source に動画を設定し、controls で操作UIを表示します。この例はポスターのみ。実際には字幕の track も用意します。自動再生はブラウザーで制限されます。',
      seo: 'ポスターだけの例なので動画としての検証はできません。実際の動画にはタイトル、説明、字幕を用意し、必要に応じて仕様に合う VideoObject を検討します。',
      note: '大きな動画の不要な先読みを避けるには preload="metadata" や "none" を検討します。',
    }),
  h('input', 'input / label', 'forms', '入力欄には名前を。type を変えると、入力の手助けも変わる。',
    '<label for="email">メールアドレス</label>\n<input id="email" type="email"\n  placeholder="hello@example.com" autocomplete="email">', {
      css: 'label { display: block; margin-bottom: 10px; font-size: 12px; font-weight: 700; }\ninput { width: 100%; padding: 11px; border: 1px solid #b7c8aa; border-radius: 7px; font: inherit; box-sizing: border-box; }',
      usage: 'label の for と input の id を一致させます。placeholder はラベルの代わりになりません。type="email" は検証とモバイルキーボードに役立ちます。',
      seo: '入力のしやすさとアクセシビリティのための要素です。フォームの内容は自動で検索対象になるとは限りません。',
    }),
  h('button', 'button', 'forms', '押して何かを操作するなら、クリックできる div より button。',
    '<button type="button">やってみる →</button>\n<button type="button" disabled>準備中</button>', {
      usage: 'フォーム送信以外なら type="button" を明示します。標準のキーボード操作、フォーカス、無効状態を使えます。この例のボタンに処理は登録していません。',
      seo: '画面内の操作用です。ページへの移動やクロールさせたいリンクには href を持つ a を使います。',
    }),
  h('select', 'select / option', 'forms', '候補からひとつ選ぶ。OS標準の操作をそのまま使える。',
    '<label for="theme">好きなテーマ</label>\n<select id="theme">\n  <option>ナチュラル</option>\n  <option>モノトーン</option>\n  <option>カラフル</option>\n</select>', {
      css: 'label { display: block; margin-bottom: 10px; font-size: 13px; }\nselect { padding: 10px; width: 100%; border: 1px solid #c4d1b9; border-radius: 7px; font: inherit; background: #fff; }',
      usage: 'option が選択肢です。関連する候補は optgroup で分類できます。選択肢が少ない場合はラジオボタンも検討しましょう。',
    }),
  h('datalist', 'datalist', 'forms', '候補は見せる。でも自由入力もできる。入力のヒントを添える。',
    '<label for="color">好きな色</label>\n<input id="color" list="colors" placeholder="クリックして候補を見る">\n<datalist id="colors">\n  <option value="セージグリーン">\n  <option value="クリーム">\n  <option value="テラコッタ">\n</datalist>', {
      usage: 'input の list と datalist の id を対応させます。select と違い、候補以外も入力できます。候補表示や支援技術の対応に差があるため、重要な入力では代替手段も検討します。',
      note: '入力欄をクリック、または文字を入力してみてください。候補UIはブラウザーによって異なります。',
    }),
  h('meter', 'meter', 'forms', '容量やスコアなど、既知の範囲にある測定値を表す。',
    '<label for="storage">ストレージの使用量：40%</label>\n<meter id="storage" min="0" max="100"\n  low="20" high="80" optimum="10" value="40">40%</meter>', {
      css: 'label { display: block; margin-bottom: 12px; font-size: 12px; }\nmeter { width: 100%; height: 24px; }',
      usage: 'min / max が値の範囲。low / high / optimum は良い状態の判断に使います。処理の進み具合には progress を選んでください。',
    }),
  h('ruby', 'ruby / rt', 'text', '漢字の読みなど、文字に小さな注釈を添える。',
    '<p><ruby>余白<rt>よはく</rt></ruby>を楽しむ。</p>', {
      css: 'p { font-size: 28px; text-align: center; letter-spacing: .08em; }\nrt { font-size: 11px; color: #718967; }',
      usage: 'ruby の中で元の文字を書き、rt に読みを書きます。読み上げ方は支援技術や設定で違うため、分かりやすい文章も大切です。',
    }),
  h('table', 'table', 'structure', '行と列に意味があるデータを、見出しと一緒に整理する。',
    '<table>\n  <caption>役割のちがい</caption>\n  <tr><th scope="col">言語</th><th scope="col">担当</th></tr>\n  <tr><th scope="row">HTML</th><td>意味と構造</td></tr>\n  <tr><th scope="row">CSS</th><td>見た目</td></tr>\n</table>', {
      css: 'table { border-collapse: collapse; width: 100%; font-size: 12px; }\ncaption { text-align: left; margin-bottom: 8px; font-weight: 700; }\nth, td { padding: 7px 12px; border: 1px solid #d8e1cf; text-align: left; }\nth { background: #eff4e7; }',
      usage: '表形式データに使います。caption で内容、th と scope で見出しと方向を示します。ページ全体のレイアウトには使いません。',
      seo: '表データの関係を明示します。正しい表は理解を助けますが、検索結果への特別な表示を保証するものではありません。',
    }),
  h('font', 'font', 'text', '文字の色やサイズをHTMLで指定していた時代。今ならCSSで。',
    '<font color="#7f9859" size="5">昔の文字装飾</font>\n<p>色もサイズも、今はCSSの担当。</p>', {
      legacy: true,
      note: '廃止された要素です。color、font-size、font-family などCSSのプロパティに置き換えてください。',
      seo: '見た目だけの要素です。重要性には strong、強調には em など、内容に合う要素を使い、装飾はCSSに分離します。',
    }),
  h('marquee', 'marquee', 'motion', '流れる文字の懐かしい表現。標準外の要素を今から使わないために。',
    '<marquee scrollamount="3">こんにちは、昔のウェブ。</marquee>\n<p>新規実装には使いません。</p>', {
      legacy: true,
      note: '廃止された非標準要素です。必要な動きはCSSで実装し、停止手段と prefers-reduced-motion への配慮を用意しましょう。',
      seo: '動く文字にSEO上の特別な利点はありません。読みにくさや注意を妨げる動きは避けてください。',
    }),
  c('gap', 'gap', 'layout', '要素の間だけに余白をつくる。外側に余白が付かないのが便利。', blocks,
    '.boxes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }\n' + boxStyle, {
      usage: 'Grid・Flexboxなどの子要素の間隔を指定します。gap: 10px 20px は行間10px、列間20px。要素の外側には付かないので margin と使い分けます。',
      note: 'ここで示す対応情報は gap 自体のものです。Flexboxでの対応開始はGridより遅いブラウザーがあるため、用途別の詳細はMDNで確認してください。',
    }),
  c('position', 'position: sticky', 'layout', '普段は普通に、スクロールしたらぴたっと止まる見出し。',
    '<div class="scroll"><strong>スクロールしてみよう ↓</strong><p>ノート 01</p><p>ノート 02</p><p>ノート 03</p><p>ノート 04</p></div>',
    '.scroll { height: 110px; overflow: auto; background: #f4f7ef; border-radius: 8px; }\nstrong { position: sticky; top: 0; display: block; padding: 10px; background: #dfe9d2; font-size: 12px; }\np { padding: 8px 14px; font-size: 12px; }', {
      bcd: 'css.properties.position.sticky',
      usage: 'top などの境界を指定すると、その位置でスクロールコンテナーに張り付きます。祖先の overflow とコンテナーの高さに影響されます。',
      note: '小さな枠の中をスクロールして動きを確認できます。固定ヘッダーで内容やフォーカスを隠さないようにしましょう。',
    }),
  c('overflow', 'overflow', 'layout', 'はみ出した内容をどうする？スクロール・切り取り・そのまま表示。',
    '<div class="overflow">長いノートがこの中に入っています。<br><br>スクロールすると、続きが見えます。<br><br>余白のあるウェブへ。</div>',
    '.overflow { height: 90px; overflow: auto; padding: 14px; border: 1px solid #c9d6bd; border-radius: 8px; line-height: 1.8; font-size: 13px; }', {
      usage: 'auto は必要なときスクロール、hidden は切り取り、visible ははみ出しを表示。スクロール可能にするには高さや幅などの制約も必要です。',
    }),
  c('object-fit', 'object-fit', 'media', '写真を引き伸ばさず、枠に収める。cover と contain を比べよう。',
    '<div class="photos"><img class="cover" src="./assets/landscape.svg" alt="cover の例"><img class="contain" src="./assets/landscape.svg" alt="contain の例"></div>',
    '.photos { display: flex; justify-content: center; gap: 16px; }\nimg { width: 100px; height: 100px; background: #edf0e8; border: 1px solid #d5ddca; border-radius: 8px; }\n.cover { object-fit: cover; }\n.contain { object-fit: contain; }', {
      usage: '置換要素の中身の収め方を指定します。cover は枠を埋めて一部を切り取り、contain は全体を収めて余白ができます。object-position で基準位置も指定できます。',
    }),
  c('clamp', 'clamp()', 'text', '最小値と最大値の間で、画面幅に合わせてサイズを変える。',
    '<h2>ちょうどいい、文字。</h2><p>幅に合わせて、しなやかに。</p>',
    'h2 { font-size: clamp(18px, 4vw, 32px); line-height: 1.5; color: #567744; margin: 0; }\np { font-size: 12px; color: #87917d; }', {
      bcd: 'css.types.clamp', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Values/clamp',
      usage: 'clamp(最小値, 推奨値, 最大値)。推奨値に vw などを使うと可変になります。本文の文字ではユーザーの拡大設定を尊重するため rem との組み合わせも検討します。',
    }),
  c('color', 'color', 'text', '文字やアイコンの色を変える。コントラストにも目を向けよう。',
    '<p class="sage">Sage green</p><p class="clay">Terracotta</p>',
    '.sage { color: #526e43; }\n.clay { color: #a45e42; }\np { font-size: 24px; font-weight: 700; margin: 8px; }', {
      usage: '文字色を指定し、子要素に継承されます。16進数、rgb()、hsl() などが使えます。色だけで情報を伝えず、背景との十分なコントラストを確保しましょう。',
    }),
  c('background-image', 'linear-gradient()', 'text', '画像を用意せず、色の移り変わりを背景に描く。',
    '<div class="gradient">A softer gradient.</div>',
    '.gradient {\n  padding: 36px 12px;\n  border-radius: 12px;\n  background-image: linear-gradient(120deg, #dfeac4, #c4d8c5, #e9d4bf);\n  text-align: center;\n  color: #38513a;\n}', {
      bcd: 'css.types.gradient.linear-gradient', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Values/gradient/linear-gradient',
      usage: 'linear-gradient(角度, 色, 色...) でグラデーション画像を生成します。background-color ではなく background-image や background に指定します。',
      seo: '装飾用です。意味のある画像をCSS背景だけにすると alt を付けられないため、内容を伝える画像は img を検討してください。',
    }),
  c('opacity', 'opacity', 'text', '要素全体を透明にする。文字や子要素もまとめて薄くなる。',
    '<div class="swatches"><span>1</span><span>0.6</span><span>0.3</span></div>',
    '.swatches { display: flex; gap: 14px; justify-content: center; }\nspan { padding: 20px; border-radius: 10px; background: #6f8d57; color: white; }\nspan:nth-child(2) { opacity: .6; }\nspan:nth-child(3) { opacity: .3; }', {
      usage: '0 は透明、1 は不透明。子要素も一緒に合成されます。背景だけ透かしたい場合は透明度付きの色を使います。opacity: 0 でもクリックやフォーカスは残ります。',
    }),
  c('transform', 'transform', 'motion', '回す、動かす、拡大する。レイアウトを崩さず、見た目を変える。',
    '<div class="tile">HELLO</div>',
    '.tile { width: 110px; margin: 12px auto; padding: 24px 8px; background: #e5eccc; text-align: center; border-radius: 10px; color: #53683d; transform: rotate(-8deg); }', {
      usage: 'rotate()、translate()、scale() などを組み合わせます。周囲の通常フロー上の領域は元のままなので、重なりに注意してください。',
    }),
  c('transition', 'transition', 'motion', '状態の変化をなめらかに。ホバーだけでなくフォーカス時にも。',
    '<button class="soft">カーソルをのせてみる</button>',
    '.soft { transition: background-color .25s, transform .25s; }\n.soft:hover, .soft:focus-visible { background: #c8dda7; transform: translateY(-3px); }\n@media (prefers-reduced-motion: reduce) { .soft { transition: none; transform: none; } }', {
      usage: '変化するプロパティ、時間、タイミングを指定。不要な対象まで動かさないよう、all より具体的なプロパティを選ぶと制御しやすくなります。',
      note: 'ホバーまたは Tab キーでフォーカスして確認できます。動きを減らすOS設定ではアニメーションを抑えています。',
    }),
  c('animation', 'animation / @keyframes', 'motion', '時間に沿った変化を定義して、小さな動きをつくる。',
    '<div class="pulse" aria-label="ゆっくり点滅する円"></div>',
    '.pulse { width: 50px; height: 50px; border-radius: 50%; background: #96b179; margin: 20px auto; animation: breathe 3s ease-in-out 2; }\n@keyframes breathe { 50% { transform: scale(1.25); opacity: .5; } }\n@media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }', {
      usage: '@keyframes に経過ごとの状態を書き、animation で時間や回数を設定します。この例は2回で停止。動きが苦手な方の設定や停止手段にも配慮しましょう。',
    }),
  c('filter', 'filter', 'media', '画像にぼかしや彩度の変化を。元素材を変えずに雰囲気をつくる。',
    '<div class="photos"><img src="./assets/landscape.svg" alt="元の風景"><img class="mono" src="./assets/landscape.svg" alt="白黒の風景"></div>',
    '.photos { display: flex; gap: 10px; }\nimg { width: calc(50% - 5px); border-radius: 8px; }\n.mono { filter: grayscale(1); }', {
      usage: 'grayscale()、blur()、brightness() などを指定します。大きな要素や頻繁な変化は描画の負荷にも注意してください。',
    }),
  c('backdrop-filter', 'backdrop-filter', 'text', 'すりガラスのように、背後の景色をやわらかくぼかす。',
    '<div class="scene"><div class="glass">A little frosted glass.</div></div>',
    '.scene { padding: 24px; border-radius: 10px; background: repeating-linear-gradient(45deg, #97b185 0 20px, #e8dcc2 20px 40px); }\n.glass { padding: 18px 10px; border-radius: 8px; background: #ffffff70; backdrop-filter: blur(8px); text-align: center; font-size: 13px; }', {
      usage: '要素の背後にフィルターをかけます。背景に透明度がないと効果が見えません。未対応環境でも読める背景色を用意しましょう。',
      note: 'Safariの古い版には -webkit- 接頭辞が必要です。表は接頭辞なしでの対応を示します。',
    }),
  c('float', 'float', 'layout', '文章を画像に回り込ませる。ページ全体のレイアウトには使わない。',
    '<div class="thumb">IMG</div><p>小さな写真のまわりを、文章が自然に回り込みます。float は古くからありますが、文章の回り込みには今も使えます。</p>',
    '.thumb { float: left; padding: 20px; background: #e2eacd; margin: 0 14px 8px 0; border-radius: 8px; color: #718157; }\np { line-height: 1.9; font-size: 12px; margin: 0; }', {
      usage: 'left / right で左右に浮かせ、後続のインライン内容を回り込ませます。親の高さを保つなら display: flow-root などを使います。',
      note: '古い機能ですが廃止・非推奨ではありません。カラム配置ならGridやFlexbox、文章の回り込みならfloatと使い分けます。',
    }),
  c('box-sizing', 'box-sizing', 'layout', '指定した幅に、余白と枠を含める。サイズ計算の基本。',
    '<div class="box">幅 100% + padding + border</div>',
    '.box { box-sizing: border-box; width: 100%; padding: 20px; border: 3px solid #a9bd91; background: #f1f5e8; border-radius: 8px; font-size: 12px; }', {
      usage: 'border-box は width / height に padding と border を含めます。初期値 content-box は含めないため、指定サイズからはみ出すことがあります。',
    }),
  c('custom-property', 'CSS変数 var()', 'text', '色や余白をひとつの場所で管理。繰り返し使う値に名前を付ける。',
    '<div class="theme"><strong>ひとつ変えると、</strong><button>まとめて変わる</button></div>',
    '.theme { --accent: #68884c; color: var(--accent); }\n.theme strong { display: block; margin-bottom: 14px; }\n.theme button { background: var(--accent); color: white; }', {
      bcd: 'css.properties.custom-property', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/--*',
      usage: '--名前: 値 で定義し、var(--名前, 代替値) で使います。通常は子孫へ継承されるため、コンポーネントのテーマにも使えます。',
    }),
  c('container-type', 'コンテナークエリー', 'layout', '画面幅ではなく、部品が置かれた場所の幅に合わせて変化。',
    '<div class="container"><div class="card"><b>▧</b><span>この部品の幅で<br>レイアウトを切り替え</span></div></div>',
    '.container { container-type: inline-size; }\n.card { display: grid; gap: 12px; padding: 16px; border-radius: 10px; background: #edf3e4; font-size: 12px; }\nb { font-size: 30px; color: #7b9861; }\n@container (min-width: 260px) { .card { grid-template-columns: 40px 1fr; align-items: center; } }', {
      usage: '祖先に container-type: inline-size を指定し、子孫を @container で条件分岐します。プレビューの幅を変えると、配置が変わります。',
      note: 'メディアクエリーは画面幅、コンテナークエリーは近いクエリーコンテナーの幅を見ます。',
    }),
  c('has', ':has()', 'forms', '中にある要素の状態で、親の見た目を変えられるセレクター。',
    '<label class="choice"><input type="checkbox"> このカードを選ぶ</label>',
    '.choice { display: flex; align-items: center; gap: 10px; padding: 20px; border: 1px solid #d0dac5; border-radius: 10px; font-size: 13px; }\n.choice:has(input:checked) { background: #e1efce; border-color: #8dac70; color: #3c6232; }\ninput { accent-color: #68884c; }', {
      bcd: 'css.selectors.has', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Selectors/:has',
      usage: '関係セレクターです。引数の相対セレクターに一致する要素を含む親などを選択できます。例ではチェック済みの input を含む label に色が付きます。',
      note: 'チェックボックスを操作してみてください。未対応環境では通常のラベルのままになります。',
    }),
  c('subgrid', 'subgrid', 'layout', '入れ子のGridでも、親の列や行にぴったり揃える。',
    '<div class="parent"><div class="row"><b>HTML</b><span>意味と構造</span></div><div class="row"><b>CSS</b><span>見た目</span></div></div>',
    '.parent { display: grid; grid-template-columns: 70px 1fr; gap: 12px; }\n.row { display: grid; grid-column: span 2; grid-template-columns: subgrid; padding: 12px; background: #eff4e7; border-radius: 7px; font-size: 12px; }', {
      bcd: 'css.properties.grid-template-columns.subgrid', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/CSS_grid_layout/Subgrid',
      usage: '子Gridの grid-template-columns または rows に subgrid を指定し、親のトラック定義を共有します。親で何列・何行を占めるかも指定します。',
    }),
  c('color-mix', 'color-mix()', 'text', 'ふたつの色をCSSで混ぜる。テーマ色から、自然な濃淡を。',
    '<div class="mix"><span>20%</span><span>50%</span><span>80%</span></div>',
    '.mix { display: flex; gap: 10px; }\nspan { flex: 1; text-align: center; padding: 22px 6px; border-radius: 10px; font-size: 12px; color: #273c26; }\nspan:nth-child(1) { background: color-mix(in srgb, #779959 20%, white); }\nspan:nth-child(2) { background: color-mix(in srgb, #779959 50%, white); }\nspan:nth-child(3) { background: color-mix(in srgb, #779959 80%, white); }', {
      bcd: 'css.types.color.color-mix', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Values/color_value/color-mix',
      usage: '混色する色空間と2色の割合を指定します。srgb と oklab などでは混ざり方が異なります。古い環境向けに通常の色も先に指定すると安心です。',
    }),
  c('accent-color', 'accent-color', 'forms', '標準のフォーム部品を、サイトのテーマ色にそっと合わせる。',
    '<div class="controls"><label><input type="checkbox" checked> チェック</label><label><input type="radio" checked name="sample"> ラジオ</label><input type="range" aria-label="サンプルの値"></div>',
    '.controls { accent-color: #879f5e; display: grid; gap: 16px; font-size: 13px; }\nlabel { display: flex; gap: 8px; align-items: center; }', {
      usage: 'チェックボックス、ラジオ、range など、対応する標準コントロールの強調色を変えます。すべての部品や状態に同じように効くとは限りません。',
    }),
  c('scroll-snap-type', 'CSS Scroll Snap', 'motion', '横スクロールを、カードごとに気持ちよく止める。',
    '<div class="slides"><div>01 — HTML</div><div>02 — CSS</div><div>03 — TRY</div></div>',
    '.slides { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 12px; padding-bottom: 10px; }\n.slides div { flex: 0 0 80%; scroll-snap-align: start; padding: 32px 20px; background: #e8efda; border-radius: 10px; box-sizing: border-box; font-size: 14px; }', {
      usage: 'スクロールコンテナーに scroll-snap-type、子に scroll-snap-align を指定します。mandatory は必ず吸着、proximity は近い場合に吸着します。',
      note: '横にスクロールしてみてください。大きなコンテンツを必須吸着で読めなくしないように注意します。',
    }),
  c('writing-mode', 'writing-mode', 'text', '縦書きと横書き。日本語の表現に、もうひとつの方向を。',
    '<div class="vertical">余白を楽しむ。<br>ことばを味わう。</div>',
    '.vertical { writing-mode: vertical-rl; height: 110px; margin: auto; line-height: 2; font-size: 19px; letter-spacing: .13em; color: #49633b; }', {
      usage: 'vertical-rl は右から左へ列を進める縦書き。インラインとブロックの方向が変わるため、margin-inline などの論理プロパティも便利です。',
    }),
  c('margin-inline', '論理プロパティ', 'layout', '左右ではなく、文章の流れに沿って余白を指定する。',
    '<div class="logical">文章の方向に沿った余白</div>',
    '.logical { margin-inline: auto; padding-inline: 20px; padding-block: 18px; max-inline-size: 200px; border-inline-start: 3px solid #8ca66b; background: #f0f5e8; font-size: 13px; }', {
      usage: 'inline は文字の進む方向、block は行が積まれる方向です。横書き・縦書き、右から左の言語への対応がしやすくなります。',
    }),
  c('text-overflow', 'text-overflow: ellipsis', 'text', '長い1行を「…」で省略。必要な3つの指定をセットで。',
    '<p class="ellipsis">この長いタイトルは、カードの幅に合わせて末尾が省略されます。</p>',
    '.ellipsis { width: 210px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; padding: 12px; background: #f0f4e9; border-radius: 7px; font-size: 13px; }', {
      usage: '幅の制約、overflow、折り返し制御が必要です。省略は表示だけで、元のテキストはDOMに残ります。全文を確認する手段も用意しましょう。',
    }),
  c('outline', ':focus-visible', 'forms', 'キーボードでの操作場所を、はっきり見せるフォーカスリング。',
    '<button class="focus">Tab キーで選んでみよう</button>',
    '.focus:focus-visible { outline: 3px solid #7a9951; outline-offset: 5px; }', {
      bcd: 'css.selectors.focus-visible', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Selectors/:focus-visible',
      usage: 'ユーザーにフォーカス表示が必要だとブラウザーが判断した状態で一致します。outline を一律に消さず、キーボード利用者の操作位置を示します。',
      seo: '直接の順位向上を狙う指定ではありません。キーボードで利用できるUIを作るために大切です。',
    }),
  c('nesting', 'CSS Nesting', 'text', '関連するセレクターを入れ子に。素のCSSでも、近くにまとめられる。',
    '<div class="note"><b>Native nesting</b><p>関係するスタイルを、そばに。</p></div>',
    '.note {\n  padding: 20px;\n  background: #f0f5e6;\n  border-radius: 10px;\n  & b { color: #68814c; }\n  & p { font-size: 12px; margin-bottom: 0; }\n}', {
      bcd: 'css.selectors.nesting', mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/CSS_nesting/Using_CSS_nesting',
      usage: '& は親セレクターを表します。Sassと完全に同じではありません。ブラウザーの初期対応には構文上の制限があるため、対象環境の詳細も確認しましょう。',
    }),
  c('anchor-name', 'CSS Anchor Positioning', 'layout', '別の要素を基準に配置する、新しいツールチップの土台。',
    '<div class="anchor-wrap"><button class="anchor">基準になるボタン</button><span class="tip">ボタンの下に配置</span></div>',
    '.anchor-wrap { min-height: 100px; }\n.anchor { anchor-name: --target; }\n.tip { position: absolute; position-anchor: --target; top: anchor(bottom); left: anchor(left); margin-top: 8px; background: #e5edce; padding: 8px 12px; border-radius: 6px; font-size: 11px; }', {
      usage: 'anchor-name で基準要素に名前を付け、position-anchor で関連付けます。anchor() でその辺を参照できます。利用環境での対応確認が特に必要です。',
      note: '互換性表は anchor-name の情報です。position-anchor や anchor() を含む関連機能すべての対応を保証しません。未対応時の配置も別途用意してください。',
    }),
  h('div', 'div / span', 'structure', '特別な意味を持たない、汎用の箱。意味のある要素が合わないときに。',
    '<div class="box">\n  ここはひとつの箱。\n  <span>ここだけ色を変える。</span>\n</div>', {
      css: '.box { padding: 20px; border: 1px solid #d2dfc3; border-radius: 9px; background: #f5f8ef; }\nspan { color: #8f613c; font-weight: 700; }',
      usage: 'div は汎用コンテナー、span は文中の汎用コンテナーです。初期表示はdivがブロック、spanがインライン。見出しやボタンなど意味に合う要素があればそちらを使います。',
      seo: 'div / span 自体に特別な意味はありません。何でもdivにせず、h1、nav、buttonなど内容や操作に合う要素を選びます。',
    }),
  h('form', 'form', 'forms', '入力をまとめて送信する仕組み。ブラウザー標準の入力チェックも。',
    '<form>\n  <label for="contact">メールアドレス（必須）</label>\n  <input id="contact" name="email" type="email" required>\n  <button type="submit">入力をチェック</button>\n</form>', {
      css: 'form { display: grid; gap: 8px; font-size: 11px; }\ninput { padding: 6px; border: 1px solid #c0d0b0; border-radius: 5px; }\nbutton { justify-self: start; }',
      usage: 'action に送信先、method に方式を指定します。送信に使う入力には name が必要です。required や type="email" の検証はブラウザーが行いますが、サーバーでも検証が必要です。',
      note: '空欄やメールアドレス以外を入れて送信を押すと、標準の入力チェックを試せます。この図鑑ではフォーム送信自体をブロックしているため、実際の登録や送信は行いません。',
      seo: 'フォームは主に利用者の入力操作のためのものです。送信後だけ表示される情報を、検索エンジンが必ず取得できるとは限りません。',
    }),
  h('textarea', 'textarea', 'forms', '何行でも書ける、自由なテキストの入力欄。',
    '<label for="note">今日の発見</label>\n<textarea id="note" name="note" rows="3"\n  placeholder="小さな気づきを書いてみよう"></textarea>', {
      css: 'label { display: block; margin-bottom: 8px; font-size: 12px; }\ntextarea { width: 100%; padding: 10px; border: 1px solid #bdcdae; border-radius: 7px; font: inherit; resize: vertical; }',
      usage: '複数行の文字を入力します。初期値はvalue属性ではなくタグの中に書きます。labelを関連付け、必要ならmaxlengthなどの制約も指定します。',
      seo: '利用者の入力欄です。placeholder をページ本文の代わりにしたり、SEOキーワードの置き場にしたりしないようにしましょう。',
    }),
  h('title', 'title', 'structure', 'ブラウザーのタブと、検索結果のタイトル候補。ページの名前を付ける。',
    '<title>余白のつくり方 | Web Notes</title>\n<p>title は画面内には表示されません。</p>\n<p>本来は文書の head の中に置きます。</p>', {
      usage: '文書のheadにひとつ置くページタイトルです。画面内の見出しはh1などを使い、titleとは役割を分けます。プレビューでは埋め込み文書のタイトルに作用し、アプリのタブ名は変わりません。',
      seo: '検索結果のタイトルリンクを生成するときの情報源のひとつです。具体的でページ内容に合う名前にしましょう。検索エンジンが別の文章を採用する場合もあります。',
      note: '画面内の見た目を変える要素ではありません。このカードのプレビューは配置先の説明を表示しています。',
    }),
  h('meta', 'meta', 'structure', '画面には見えない、ページの情報。説明文や表示幅などを伝える。',
    '<!-- 本来は head 内に配置します -->\n<meta name="description" content="HTMLとCSSを実際の表示で学べる日本語のカード図鑑。">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<p>meta の内容は画面の本文には表示されません。</p>', {
      usage: '文書のheadで文字コードやメタデータを宣言します。name="description" はページの要約、viewport はモバイル表示領域の設定。目的によってnameやcontentが変わります。',
      seo: 'description は検索スニペットの候補ですが、そのまま使われる保証はなく、直接の順位シグナルとも限りません。meta keywords へのキーワード列挙はGoogle検索で順位に利用されません。',
      note: 'この図鑑はプレビュー内のmetaを安全のため除去します。metaの配置・内容はコードで確認してください。画面上の本文を装飾する要素ではありません。',
    }),

  ...extraElements,
  ...attributes,
  ...extraCss,
  ...extraAttributes,
];

export const cardById = new Map(cards.map(card => [card.id, card]));
