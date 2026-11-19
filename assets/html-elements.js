import { h } from './card-helpers.js';

export const extraElements = [
  h('data', 'data', 'attributes', '人が読む名前に、機械が読む値を添える。data-* 属性とは別の要素。',
    '<p>商品：<data value="SKU-042">森のノート</data></p>', {
      css: 'data { font-weight: 700; color: #527044; }\ndata::after { content: "商品コード: " attr(value); display: block; margin-top: 8px; font-size: 12px; font-weight: 400; color: #7b876b; }',
      usage: 'value 属性に機械可読の値、要素の中に人向けの表記を置きます。商品名と商品コードなどに使えます。日時は time、任意の補助データをどんな要素にも持たせたい場合は data-* 属性を使います。',
      seo: 'value を付けるだけで商品リッチリザルトが表示されるわけではありません。構造化データには別の要件があり、画面の内容と一致させる必要があります。',
      note: '通常は value は画面に出ません。この例はCSSの attr(value) で値も表示し、名前とコードの違いを見えるようにしています。',
      js: 'const product = document.querySelector("data");\nconsole.log(product.value); // "SKU-042"',
    }),
  h('abbr', 'abbr', 'text', '略語に、元の言葉を添える。HTMLの中の「HTML」にも説明を。',
    '<p><abbr title="HyperText Markup Language">HTML</abbr>で構造を作ります。</p>', {
      usage: '略語や頭字語に使います。title を付けるなら略さない表記を入れます。初出時は本文にも正式名称を書くと、タッチ操作や読み上げでも意味が伝わります。',
      note: '点線やツールチップの表示はブラウザー依存です。title の内容だけに必須の説明を置かないようにしましょう。',
    }),
  h('address', 'address', 'structure', '記事やページの連絡先を示す。住所なら何でも address、ではない。',
    '<article>\n  <h2>アトリエへのお問い合わせ</h2>\n  <address>Web Notes 編集部<br>平日 10:00〜17:00</address>\n</article>', {
      usage: '最も近い article、または文書全体の連絡先情報に使います。記事に登場する場所の住所や、単なる更新日時のための要素ではありません。',
      seo: '連絡先の役割を明示します。address だけで店舗の検索表示や地図掲載が成立するわけではありません。',
    }),
  h('aside', 'aside', 'structure', '本文に関連する、補足や関連情報。位置が横だからasideとは限らない。',
    '<aside aria-labelledby="related">\n  <h2 id="related">あわせて読みたい</h2>\n  <p>余白を整える、3つのヒント。</p>\n</aside>', {
      css: 'aside { padding: 16px; background: #edf3e3; border-left: 3px solid #91aa74; border-radius: 6px; }\nh2 { font-size: 16px; }\np { font-size: 12px; }',
      usage: '関連リンクやコラムなど、主内容から分離できる補足に使います。レイアウト上のサイドバーを作るためだけの意味はなく、見た目の位置はCSSで決めます。',
    }),
  h('b', 'b / i', 'text', '太字・斜体に見えても、strong・emとは伝える意味が違う。',
    '<p>道具：<b>ノート</b>、<b>ペン</b></p>\n<p>この植物の学名は <i lang="la">Camellia japonica</i>。</p>', {
      usage: 'b は重要性を追加せず注意を向ける語句、i は学名や別の声・語調など本文から区別する語句に使います。重要なら strong、発話の強勢なら em、装飾だけならCSSです。',
      seo: '太字や斜体の要素にキーワードを詰め込むための仕組みではありません。意味に合う要素を選びましょう。',
    }),
  h('br', 'br', 'text', '詩や住所のように、内容として必要な改行を入れる。',
    '<p>ひとつ書いて、<br>ひとつ試して、<br>ひとつわかる。</p>', {
      usage: '内容に意味のある改行に使います。閉じタグは不要です。段落は p、余白やレイアウトのための改行はCSSで作ります。',
      note: 'br を何個も重ねて余白を作ると、読み上げや画面幅変更で扱いにくくなります。',
    }),
  h('wbr', 'wbr', 'text', '長い単語の「ここなら折り返していい」を指定する。',
    '<p class="word">verylong<wbr>component<wbr>identifier</p>', {
      css: '.word { max-width: 150px; padding: 12px; border: 1px solid #d0ddc4; font-family: monospace; background: #f2f6ea; border-radius: 7px; }',
      usage: '長い識別子や語の途中に、任意の改行位置を示します。br と違い、幅が十分なら改行しません。CSSの overflow-wrap との使い分けもできます。',
    }),
  h('hr', 'hr', 'structure', 'ただの線ではなく、文章の話題が変わる区切りを示す。',
    '<p>第一章：書いてみる。</p>\n<hr>\n<p>第二章：見直してみる。</p>', {
      css: 'hr { border: 0; border-top: 1px solid #a5bb91; margin: 18px 0; }\np { font-size: 13px; }',
      usage: '場面や話題の切り替わりを示す区切りです。装飾用の線が欲しいだけなら border などを使います。閉じタグはありません。',
    }),
  h('small', 'small', 'text', '注記や著作権などの細則に。小さい文字にするだけのタグではない。',
    '<p>気軽に、小さな実験を。</p>\n<small>※ 表示はブラウザーによって異なる場合があります。</small>', {
      usage: '免責や著作権、補足の細則などに使います。本文全体を小さくするためには使いません。見た目が小さくても、読める文字サイズとコントラストを確保します。',
    }),
  h('sub', 'sub / sup', 'text', '下付き・上付きの文字。化学式や指数の表記を読みやすく。',
    '<p>水は H<sub>2</sub>O。</p>\n<p>面積は 12 m<sup>2</sup>。</p>', {
      usage: 'sub は下付き、sup は上付きです。意味として必要な組版に使います。複雑な数式はMathMLなどの適切な表現も検討してください。',
    }),
  h('s', 's', 'text', 'もう正しくない情報を示す。文書の修正履歴なら del に。',
    '<p><s>旧価格：1,200円</s></p>\n<p><strong>新価格：980円</strong></p>', {
      usage: '正確でなくなった内容や関連性を失った内容を示します。編集による削除を記録する場合は del を使います。',
      note: '取り消し線が読み上げで自動的に伝わるとは限りません。この例の「旧価格」「新価格」のように、文字でも状態を説明すると明確です。',
    }),
  h('del', 'del / ins', 'text', '消した内容と追加した内容。文書の変更を意味ごとに表す。',
    '<p>開催日：<del datetime="2026-11-16">11月20日</del> → <ins datetime="2026-11-16">11月22日</ins>に変更。</p>', {
      usage: 'del は削除、ins は追加です。datetime で変更日時、cite で変更理由の参照先を示せます。属性は通常、画面には表示されません。',
      seo: '更新前後の内容を明確にできますが、変更を示すタグが更新日の検索表示や順位改善を保証するわけではありません。',
    }),
  h('q', 'q', 'text', '文章の中の短い引用を、引用としてマークする。',
    '<p>ノートには <q>まず試してみよう</q> と書かれていました。</p>', {
      usage: '文章内の短い引用に使います。まとまった長い引用には blockquote。引用符の種類は言語やブラウザーで異なり、CSSの quotes でも調整できます。',
    }),
  h('cite', 'cite', 'text', '作品のタイトルを示す。著者名そのものではない。',
    '<p>今日の一冊：<cite>小さなウェブのつくり方</cite>（架空の書籍）</p>', {
      usage: '本・記事・映像などの作品名に使います。引用した人や著者の名前を入れるための要素ではありません。',
      seo: '作品への参照を明示します。cite 要素はリンクを作らないため、移動先を用意するなら別途 a を使います。',
    }),
  h('kbd', 'kbd / samp', 'text', 'キー操作の案内と、コンピューターからの出力を区別する。',
    '<p><kbd>Ctrl</kbd> + <kbd>S</kbd> で保存。</p>\n<p>結果：<samp>Saved successfully.</samp></p>', {
      css: 'kbd { padding: 3px 7px; border: 1px solid #c5d2b8; border-bottom-width: 3px; border-radius: 5px; background: #f3f6ed; font: 12px monospace; }\nsamp { color: #668445; font-size: 12px; }',
      usage: 'kbd はユーザーの入力、samp はシステムの出力例です。ソースコードは code にします。この例は操作案内を表示するだけで、ショートカットは登録しません。',
    }),
  h('output', 'output', 'forms', '計算や操作の結果を示す。outputだけでは自動計算されない。',
    '<label>一辺の長さ：<input id="width" type="number" min="1" value="6"></label>\n<p>計算例：<output for="width">36</output> cm²</p>', {
      css: 'input { width: 70px; padding: 5px; border: 1px solid #c4d5b3; border-radius: 5px; }\noutput { font-weight: 700; color: #608143; }',
      usage: '計算や利用者の操作の結果に使います。for に関連する入力のidを空白区切りで書けます。結果は output.value で更新します。計算結果は標準のフォーム送信データの対象外です。',
      js: 'const width = document.querySelector("#width");\nconst result = document.querySelector("output");\nwidth.addEventListener("input", () => {\n  const side = width.valueAsNumber;\n  result.value = width.validity.valid && Number.isFinite(side) ? side ** 2 : "—";\n});',
      note: '参考のJavaScriptはこの図鑑のプレビューでは実行しません。入力を変えても表示結果は自動更新されません。',
    }),
  h('fieldset', 'fieldset / legend', 'forms', '関連する入力を、まとまりの名前と一緒にグループ化する。',
    '<fieldset>\n  <legend>好きな余白</legend>\n  <label><input type="radio" name="space" value="small"> 小さめ</label>\n  <label><input type="radio" name="space" value="large" checked> 広め</label>\n</fieldset>', {
      css: 'fieldset { border: 1px solid #c3d4b0; border-radius: 8px; padding: 14px; font-size: 12px; }\nlegend { padding: 0 6px; font-weight: 700; }\nlabel { margin-right: 12px; }',
      usage: 'fieldset が入力のまとまり、最初の legend がその説明です。ラジオボタン群など、個々のlabelだけでは文脈が不足する場合に役立ちます。',
      note: '同じ name のラジオボタンを切り替えてみましょう。fieldset に disabled を付けると原則、まとまり全体を無効にできます。',
    }),
  h('optgroup', 'optgroup', 'forms', '長い選択肢を、意味のあるグループに分ける。',
    '<label for="lesson">学ぶテーマ（必須）</label>\n<select id="lesson" name="lesson" required>\n  <option value="">選んでください</option>\n  <optgroup label="HTML"><option>要素</option><option>属性</option></optgroup>\n  <optgroup label="CSS"><option>レイアウト</option><option>装飾</option></optgroup>\n</select>', {
      css: 'label { display: block; margin-bottom: 10px; font-size: 12px; }\nselect { width: 100%; padding: 9px; border: 1px solid #bfceae; border-radius: 6px; background: white; color: #40533b; }',
      usage: 'select 内の option を分類します。グループ名は label 属性で指定し、利用者が選択するのはグループ内の option です。通常の単一選択では、required と先頭の空の option を使って選択を必須にできます。',
    }),
  h('search', 'search', 'structure', '検索や絞り込みに関わる操作のまとまりを明示する。',
    '<search>\n  <label for="query">カードを探す</label>\n  <input id="query" type="search" placeholder="例：data-*">\n</search>', {
      css: 'label { display: block; margin-bottom: 10px; font-size: 12px; }\ninput { width: 100%; padding: 10px; border: 1px solid #c4d5b2; border-radius: 7px; }',
      usage: '検索・フィルターのフォーム部品などをまとめるセマンティックな要素です。検索処理を自動実装するものではありません。実際の検索には送信先やJavaScriptなどが必要です。',
      seo: 'サイト内検索の操作領域を示します。search を置くだけでGoogleのサイトリンク検索ボックスなどが生成されるわけではありません。',
    }),
  h('menu', 'menu', 'text', '操作に関する項目の一覧を表す。自動でメニューバーにはならない。',
    '<menu>\n  <li><button type="button">保存</button></li>\n  <li><button type="button">複製</button></li>\n</menu>', {
      css: 'menu { display: flex; gap: 10px; margin: 0; padding: 12px; list-style: none; background: #eef3e5; border-radius: 8px; }',
      usage: 'ユーザーが実行できる操作の項目リストに使えます。主要なページ移動にはnavが適します。ARIAの menu ロールに必要なキーボード操作は、HTMLのmenuだけでは実装されません。',
      note: 'この例は操作の配置を表示します。保存や複製の処理は登録していません。',
    }),
  h('bdi', 'bdi', 'text', '知らない言語の名前も、周囲の文章の方向と混ざらないように。',
    '<p>ユーザー <bdi>مريم</bdi>：12ポイント</p>\n<p>ユーザー <bdi>haru</bdi>：8ポイント</p>', {
      usage: '双方向テキストを周囲から分離します。ユーザー名のように言語や文字方向が事前に分からない文字列を埋め込むときに便利です。既定の方向判定はautoです。',
    }),
  h('bdo', 'bdo', 'text', '文字の表示方向を、明示的に上書きする。',
    '<p>通常：WEB NOTES</p>\n<p>上書き：<bdo dir="rtl">WEB NOTES</bdo></p>', {
      usage: 'dir="ltr" または "rtl" で双方向テキストの表示順を上書きします。未知のユーザー入力を周囲から分けたいだけなら bdi のほうが適しています。',
    }),
  h('u', 'u', 'text', '校正上の注記などを示す下線。リンクや強調とは使い分ける。',
    '<p>校正例：<u class="typo">HTMLL</u> → HTML</p>', {
      css: '.typo { text-decoration: red wavy underline; text-underline-offset: 4px; }',
      usage: 'つづり間違いなど、本文外の注釈を伴う語句に使います。単に装飾の下線が欲しいならCSSで指定し、リンクと誤解される表現は避けましょう。',
    }),
  h('dfn', 'dfn', 'text', '「この用語を、ここで定義する」という場所を示す。',
    '<p><dfn id="definition">セマンティクス</dfn>とは、要素が持つ意味のことです。</p>', {
      usage: '用語を定義している箇所の語句をマークします。周囲のpやsectionなどの中に説明を書く必要があり、dfnだけで定義の内容が自動生成されるわけではありません。',
    }),
  h('var', 'var', 'text', '式やコード中の、変数・引数に当たる名前を示す。',
    '<p>面積 = <var>width</var> × <var>height</var></p>', {
      usage: '数式やプログラムの変数名に使います。ブラウザーの初期表示は斜体が一般的ですが、目的は変数であるという意味付けです。JavaScriptの変数を宣言する要素ではありません。',
    }),
  h('hgroup', 'hgroup', 'structure', '見出しと、見出しに添える副題や短い説明をまとめる。',
    '<hgroup>\n  <h2>小さなウェブのノート</h2>\n  <p>書いて、試して、また書いて。</p>\n</hgroup>', {
      css: 'hgroup { border-left: 3px solid #a4bb81; padding-left: 16px; }\nh2 { font-size: 20px; }\np { font-size: 12px; color: #7d8d6c; }',
      usage: 'ひとつのh1〜h6と、関連する副題やリードのpをまとめます。昔の仕様とは内容モデルが変わっているため、現在の仕様に沿って使いましょう。',
      seo: '副題を見出し階層に無理に追加せず整理できます。独自の順位向上効果を狙って置く要素ではありません。',
    }),
  h('thead', 'thead / tbody / tfoot', 'structure', '表の見出し・本体・集計を、行のグループで整理する。',
    '<table>\n  <caption>ノートの冊数</caption>\n  <thead><tr><th scope="col">種類</th><th scope="col">数</th></tr></thead>\n  <tbody><tr><th scope="row">方眼</th><td>3</td></tr></tbody>\n  <tfoot><tr><th scope="row">合計</th><td>3</td></tr></tfoot>\n</table>', {
      css: 'table { width: 100%; border-collapse: collapse; font-size: 12px; }\ncaption { text-align: left; margin-bottom: 8px; }\nth, td { text-align: left; padding: 7px; border: 1px solid #d0ddc3; }\nthead, tfoot { background: #eaf2df; }',
      usage: '行を用途ごとにまとめる要素です。見出しセルにはthも必要です。tfootは集計などに使い、表示色や文字の太さはCSSで調整します。',
    }),
  h('template', 'template', 'structure', '後で使うHTMLのひな形。置くだけでは画面に表示しない。',
    '<template id="card-template">\n  <article><h2>新しいノート</h2></article>\n</template>\n<p>template の中身は、そのままでは表示されません。</p>', {
      usage: '通常のtemplateの中身は不活性なDocumentFragmentとして保持されます。JavaScriptでcontentを複製してDOMに追加できます。中身はテンプレートを置いただけでは通常の本文として描画されません。',
      js: 'const template = document.querySelector("#card-template");\nconst copy = template.content.cloneNode(true);\ndocument.body.append(copy);',
      note: 'この図鑑は安全のため、プレビュー内のtemplateを除去します。ここではコードと参考JavaScriptで使い方を確認してください。',
      seo: '検索対象にしたい主要本文を、未展開のtemplateの中にだけ置かないようにしましょう。',
    }),
  h('noscript', 'noscript', 'structure', 'JavaScriptが使えないときに、代わりの案内を表示する。',
    '<noscript>この機能にはJavaScriptが必要です。</noscript>\n<p>必要な情報は、可能な範囲でHTMLにも用意します。</p>', {
      usage: 'スクリプトが無効な環境などで代替内容を示します。配置先やスクリプトの有効・無効で解析方法が変わるため、特にhead内の書き方には制約があります。',
      note: 'このプレビューはスクリプト無効の文書なので、noscript内の案内が表示されます。図鑑本体にはJavaScriptが必要です。',
    }),
  h('acronym', 'acronym', 'text', '古い頭字語の表記。新しい文書では abbr に置き換える。',
    '<p><acronym title="World Wide Web">WWW</acronym> の昔の書き方。</p>', {
      legacy: true, usage: '廃止された要素です。略語にはabbrを使ってください。既存ページの読解・移行をするためのカードです。',
      note: '表示できても、現在の新規実装で採用するための要素ではありません。',
    }),
  h('big', 'big', 'text', '文字を一段大きくしていた古い要素。大きさはCSSで指定しよう。',
    '<p>いつもの文字と、<big>昔の大きな文字</big>。</p>', {
      legacy: true, usage: '廃止された要素です。大きさだけならfont-sizeを指定します。見出しとしての意味があるなら適切なh1〜h6を使いましょう。',
      note: 'strongや見出しは「大きく・太く見せる代替」ではなく、内容の意味を基準に選びます。',
    }),
];
