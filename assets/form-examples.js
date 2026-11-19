import { a, c, h } from './card-helpers.js';

const formCss = `form { display: grid; gap: 6px; }
label { font-size: 12px; font-weight: 600; }
input, select { width: 100%; min-width: 0; }
input:not([type="checkbox"]), select {
  padding: 6px;
  border: 1px solid #b7c8aa;
  border-radius: 6px;
  background: #fff;
  color: inherit;
}
button { justify-self: start; }`;

const emailForm = `<form>
  <label for="validation-email">メールアドレス（必須）</label>
  <input id="validation-email" name="email"
    type="email" autocomplete="email" required
    placeholder="name@example.com">
  <button type="submit">入力をチェック</button>
</form>`;

export const formExamples = [
  a('form-submission', 'action / method', 'フォームの送信先とHTTPメソッドを設定する。検索と登録で使い分けよう。',
    `<form action="/search" method="get">
  <label for="query">検索語</label>
  <input id="query" name="q" value="HTML" required>
  <button type="submit">検索する</button>
</form>`, {
      category: 'forms',
      bcd: 'html.elements.form.method',
      mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/form#method',
      css: formCss,
      usage: 'action は送信先です。method の既定値は get で、入力値は URL のクエリーに入ります。キーワード検索など、データを変更しない操作に向いています。post は入力値をリクエスト本文に入れ、登録や更新に使います。機密データを送る場合は HTTPS を使いましょう。',
      js: `const form = document.querySelector("form");
const submitter = form.querySelector('button[type="submit"]');
console.log(form.action, form.method); // 解決済みURLとメソッド
console.log(new URLSearchParams(new FormData(form, submitter)).toString());
// 初期値では q=HTML。値を取り出すだけなので通信は発生しない。`,
      note: '送信ボタンに formaction や formmethod を付けると、そのボタンから送るときの設定を上書きできます。プレビューでは送信をブロックします。対応表は form の method 属性を示します。',
    }),
  a('enctype', 'enctype / formenctype', 'POSTのデータ形式を指定する。ファイルを送るなら multipart/form-data。',
    `<form action="/attachments" method="post" enctype="multipart/form-data">
  <label for="attachment">添付ファイル</label>
  <input id="attachment" name="attachment" type="file" required>
  <button type="submit">添付する</button>
</form>`, {
      category: 'forms',
      bcd: 'html.elements.form.enctype',
      mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/form#enctype',
      css: formCss,
      usage: 'POST の既定の形式は application/x-www-form-urlencoded です。ファイルを送る場合は multipart/form-data を指定します。送信ボタンの formenctype で、そのボタンから送るときの形式を変更できます。',
      js: `const form = document.querySelector("form");
const data = new FormData(form);
console.log(form.enctype); // multipart/form-data
console.log(data.get("attachment")); // 選択したファイルを表す File`,
      note: 'プレビューではファイルを選択して入力チェックを試せます。ファイルのアップロードはブロックしています。fetch に FormData を渡す場合、境界文字列を含む Content-Type はブラウザーに設定させます。対応表は form の enctype 属性を示します。',
    }),
  a('form-owner', 'form（フォームとの関連付け）', '入力欄や送信ボタンを、フォームの外から関連付ける。',
    `<form id="signup">
  <label for="signup-name">名前（必須）</label>
  <input id="signup-name" name="name" required>
</form>
<button type="submit" form="signup">入力をチェック</button>`, {
      category: 'forms',
      bcd: 'html.elements.input.form',
      mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Attributes/form',
      css: formCss + '\nbutton { justify-self: start; margin-top: 8px; }',
      usage: 'form 属性には同じ文書内の form 要素の id を指定します。外にある input も、name があり有効ならそのフォームの送信データに含まれます。外に置いた送信ボタンでも、関連付けたフォームの標準検証が働きます。',
      js: `const button = document.querySelector('button[form="signup"]');
const form = button.form; // 関連付け先の HTMLFormElement
console.log(form.elements.namedItem("name")); // 名前の入力欄
console.log(new FormData(form).get("name"));`,
      note: '入力欄が空の状態で外側のボタンを押してみましょう。form 属性は子孫へ継承されないので、必要な部品ごとに指定します。対応表は input の form 属性を示します。',
    }),
  a('novalidate', 'novalidate / formnovalidate', 'フォーム全体、または特定の送信ボタンで、送信時の標準検証を省略する。',
    `<dialog open>
  <form method="dialog">
    <label for="draft-title">タイトル（必須）</label>
    <input id="draft-title" name="title" required>
    <button type="submit">確定</button>
    <button type="submit" formnovalidate>下書き</button>
  </form>
</dialog>`, {
      category: 'forms',
      bcd: 'html.elements.form.novalidate',
      mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/form#novalidate',
      css: formCss + '\ndialog { position: relative; margin: auto; width: 100%; max-width: 22rem; padding: 10px; border: 1px solid #b7c8aa; border-radius: 8px; }',
      usage: 'form の novalidate はフォーム全体に、送信ボタンの formnovalidate はそのボタンでの送信に適用されます。どちらも真偽値属性で、JavaScript では form.noValidate と button.formNoValidate です。制約そのものは残るので、checkValidity() や reportValidity() で明示的に検証できます。',
      js: `const form = document.querySelector("form");
const confirmButton = form.querySelector("button");
console.log(form.noValidate, form.checkValidity());
form.requestSubmit(confirmButton);
// requestSubmit は送信ボタンを押す場合と同じ手順。
// form.submit() は標準検証も submit イベントも省略する。`,
      note: '空欄で「確定」を押すと検証が働きます。続けて「下書き」を押すと閉じます。method="dialog" で検証の有無を比べる例で、データの保存や通信は行いません。リセットで再表示できます。対応表は form の novalidate 属性を示します。',
    }),
  a('email-validation', 'type="email" / required', '空欄と形式違いをブラウザー標準で判定し、ValidityState で理由を読む。',
    emailForm, {
      category: 'forms',
      bcd: 'html.elements.input.type_email',
      mdn: 'https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/input/email',
      css: formCss,
      usage: '制約は対象の input に置きます。required は空欄を、type="email" はメールアドレスの形式を検証します。JavaScript では input.required で必須か確認でき、input.validity.valueMissing / typeMismatch / valid で結果を読み取れます。willValidate はその入力欄が検証対象かを表します。',
      js: `const input = document.querySelector("#validation-email");
const { valueMissing, typeMismatch, valid } = input.validity;
console.log({ valueMissing, typeMismatch, valid });
console.log(input.validationMessage); // UAが表示する言語のエラー文
console.log(input.checkValidity()); // 検証結果を返す
input.reportValidity(); // 通常は無効時に標準のメッセージも表示`,
      note: '空欄、「abc」、「name@example.com」の順に入力して試しましょう。type="email" で確認できるのは形式です。実在性を確かめる用途には確認メールを使います。実際の送信はブロックしています。対応表は type="email" を示します。',
    }),
  h('label', 'label', 'forms', '入力欄の名前を、フォーカスやクリックが連動するラベルとして指定する。',
    `<p>
  <label for="display-name">表示名</label>
  <input id="display-name" name="displayName" autocomplete="nickname">
</p>
<label>
  <input type="checkbox" name="updates"> 更新通知を受け取る
</label>`, {
      css: formCss + '\ninput[type="checkbox"] { width: auto; }',
      usage: 'for に入力欄の id を指定するか、label の中に入力欄を置いて関連付けます。ラベルを押すとテキスト欄にフォーカスし、チェックボックスでは選択状態も切り替わります。入力の条件や補足は別のテキストを用意し、必要に応じて aria-describedby で結び付けます。',
      js: `const label = document.querySelector('label[for="display-name"]');
console.log(label.htmlFor); // display-name
console.log(label.control); // 対応する input`,
    }),
  h('option', 'option', 'forms', '表示する選択肢の名前と、フォームで送る値を分けて指定する。',
    `<label for="plan">受け取り方法</label>
<select id="plan" name="delivery">
  <option value="pickup" selected>店頭で受け取る</option>
  <option value="shipping">配送で受け取る</option>
</select>`, {
      css: formCss + '\nlabel { display: block; margin-bottom: 6px; }',
      usage: 'option の本文が表示名、value が選択時に送る値です。value を省略すると本文から値を取得します。selected 属性は初期選択を指定します。JavaScript では option.defaultSelected が初期設定、option.selected が現在の選択状態です。',
      js: `const select = document.querySelector("#plan");
select.addEventListener("change", () => {
  const option = select.selectedOptions[0];
  console.log(select.value, option.text, option.defaultSelected);
});`,
    }),
  c('invalid', ':valid / :invalid', 'forms', 'ブラウザーの検証結果に応じて入力欄を装飾する。',
    emailForm, formCss + '\ninput:invalid { border-color: #a63c39; }\ninput:valid { border-color: #397447; }', {
      bcd: 'css.selectors.invalid',
      mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Selectors/:invalid',
      usage: '制約を満たす入力は :valid、満たさない入力は :invalid に一致します。required の空欄はページを開いた直後から :invalid になります。必須条件や形式はラベルや説明文でも伝えましょう。',
      note: '空欄のままと正しいメール形式で枠線を比べられます。操作後に強調したい場合は :user-invalid のカードも参照してください。対応表は :invalid を示します。',
    }),
  c('user-invalid', ':user-valid / :user-invalid', 'forms', '入力や送信を試したあとに、検証結果に応じたスタイルを当てる。',
    emailForm, formCss + '\ninput:user-invalid { border-color: #a63c39; }\ninput:user-valid { border-color: #397447; }', {
      bcd: 'css.selectors.user-invalid',
      mdn: 'https://developer.mozilla.org/ja/docs/Web/CSS/Reference/Selectors/:user-invalid',
      usage: '利用者が入力欄を操作した後や送信を試みた後など、ブラウザーが操作済みと判断した制約違反の欄に :user-invalid が一致します。制約を満たした操作済みの欄には :user-valid が一致します。',
      note: '空欄のまま「入力をチェック」を押すと枠線が変わります。色の変化と標準の検証表示をあわせて確認できます。対応表は :user-invalid を示します。',
    }),
];
