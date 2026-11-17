import { a } from './card-helpers.js';

export const extraAttributes = [
  a('list', 'list', '入力の自由さはそのままに、候補の一覧を関連付ける。',
    '<label for="topic">学びたいこと</label>\n<input id="topic" list="topics" placeholder="候補から選ぶ・自由に入力">\n<datalist id="topics">\n  <option value="HTML">\n  <option value="CSS">\n  <option value="アクセシビリティ">\n</datalist>', {
      bcd: 'html.elements.input.type_text.list', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/input#list',
      usage: 'input の list に datalist のidを指定すると、入力候補を関連付けられます。候補以外の値も入力できます。選択肢を限定するなら select や検証を検討します。',
      note: 'HTMLやCSSを入力して候補の出方を確認しましょう。候補UIの見た目や読み上げの対応はブラウザーによって異なります。',
    }),
  a('wrap', 'wrap', 'テキスト欄の折り返しと、送信される改行の扱いを指定する。',
    '<label for="message">折り返しを比べるメモ</label>\n<textarea id="message" rows="3" cols="24" wrap="soft">This is a long line in a little notebook. Try changing the number of columns.</textarea>', {
      bcd: 'html.elements.textarea.wrap', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/textarea#wrap',
      usage: 'soft は画面で折り返しても、その位置の改行を送信値に追加しません。hard は cols に応じた改行を送信値に加えるため、cols の指定も必要です。どちらも手入力した改行は保持します。',
      note: 'soft と hard は見た目が同じ場合があります。このプレビューはフォーム送信を行わないため、送信値の違いは実際のフォームで確認してください。',
    }),
  a('size', 'size', '入力欄のおおよその文字数幅。CSSの横幅指定とは別のヒント。',
    '<label for="short">短いコード</label>\n<input id="short" size="8" value="NOTE-042">\n<label for="long">長めの題名</label>\n<input id="long" size="24" value="小さなウェブのノート">', {
      bcd: 'html.elements.input.size', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/input#size',
      usage: 'textやemailなどのinputで、表示するおおよその文字数幅を指定します。入力可能な最大文字数ではありません。実際の幅はフォントに依存し、CSSのwidth指定が優先されます。',
      note: '8 を 16 にして比べましょう。入力文字数を制限したい場合は maxlength、画面に合わせたレイアウトにはCSSを使います。',
    }),
  a('rows-cols', 'rows / cols', '複数行の入力欄に、行数と文字数による初期サイズを伝える。',
    '<label for="memo">今日のノート</label>\n<textarea id="memo" rows="3" cols="26">1行目\n2行目\n3行目</textarea>', {
      bcd: 'html.elements.textarea.rows', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/textarea#rows',
      usage: 'rows は見える行数、cols は平均的な文字幅によるおおよその横幅です。どちらも入力できる量の上限ではありません。CSSのheightやwidthを指定すると表示サイズはそちらに影響されます。',
      note: 'rows を 5 にすると欄が縦に広がります。対応表はrowsの情報です。ラベルを関連付け、placeholderだけで項目を説明しないようにします。',
    }),
  a('details-name', 'details の name', '同じ名前の折りたたみを、一度にひとつだけ開く。',
    '<details name="lesson" open>\n  <summary>HTMLとは？</summary><p>内容の意味と構造を表します。</p>\n</details>\n<details name="lesson">\n  <summary>CSSとは？</summary><p>見た目や配置を指定します。</p>\n</details>', {
      bcd: 'html.elements.details.name', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/details#name',
      css: 'details { border: 1px solid #c4d4b2; padding: 10px; border-radius: 6px; }\ndetails + details { margin-top: 8px; }\nsummary { font-weight: 700; cursor: pointer; }\np { font-size: 12px; }',
      usage: '同じname値を持つdetailsを排他的なグループにします。ひとつを開くと、他の開いている項目が閉じます。隣接していなくても同じ名前ならグループになります。',
      note: 'CSSとは？を開くと、HTMLとは？が閉じます。nameを片方だけ変えると別のグループになります。未対応環境では通常のdetailsとして複数を開ける場合があります。',
    }),
  a('datetime', 'datetime', '見える日付と、プログラムが読む日付を分けて書く。',
    '<p>公開：<time datetime="2026-11-17">2026年11月17日</time></p>\n<p>所要時間：<time datetime="PT30M">30分</time></p>', {
      bcd: 'html.elements.time.datetime', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/time#datetime',
      usage: 'timeのdatetimeは機械可読の日時や期間です。日付ならYYYY-MM-DD、期間ならPT30Mなどを指定します。del / ins にも同名の属性がありますが、値の意味や許される形式は要素ごとに確認します。',
      note: '画面に出るのはtime内の文章です。属性を変えるだけでは文章は変わりません。日時には必要に応じて +09:00 のようなタイムゾーンも指定します。',
      seo: '日付の解釈を助ける情報ですが、検索結果への採用は保証されません。表示日付とdatetimeを一致させ、架空の更新日時にしないようにしましょう。',
    }),
  a('reversed-start', 'ol の start / reversed', '番号を途中から始めたり、カウントダウンの順番にしたりする。',
    '<ol start="3" reversed>\n  <li>下書きする</li>\n  <li>表示を確かめる</li>\n  <li>できあがり</li>\n</ol>', {
      bcd: 'html.elements.ol.reversed', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/ol#reversed',
      css: 'ol { margin: 0; padding-left: 32px; }\nli { padding: 6px; }\nli::marker { color: #678b44; font-weight: 700; }',
      usage: 'startは開始番号を整数で指定し、reversedは降順にします。reversedは真偽属性なので、reversed="false"でも存在すれば有効です。特定の項目の番号にはliのvalueも使えます。',
      note: 'reversedを外すと3、4、5になります。表示順自体はHTMLの記述順のままです。対応表はreversedの情報です。',
    }),
  a('colspan-rowspan', 'colspan / rowspan', '表のセルを、横や縦にまとめる。結合した数だけ配置も調整。',
    '<table>\n  <caption>ノートの時間割</caption>\n  <thead><tr><th scope="col">時間</th><th scope="col">内容</th></tr></thead>\n  <tbody>\n    <tr><td>午前</td><td>HTML</td></tr>\n    <tr><td colspan="2">お昼休み</td></tr>\n    <tr><td>午後</td><td>CSS</td></tr>\n  </tbody>\n</table>', {
      bcd: 'html.elements.td.colspan', mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/td#colspan',
      css: 'table { border-collapse: collapse; width: 100%; font-size: 12px; }\ncaption { margin-bottom: 6px; }\nth, td { border: 1px solid #bfceaf; padding: 8px; text-align: center; }\nth, td[colspan] { background: #e5eed8; }',
      usage: 'td / thで、colspanは何列分、rowspanは何行分を占めるか指定します。結合した位置に重複してセルを置かないようにします。表はデータの関係を表すために使い、ページ全体の配置には使いません。',
      note: 'この例の昼休みは2列分です。複雑な表では見出しとデータの関連付けが重要になります。対応表はtdのcolspanの情報です。',
    }),
];
