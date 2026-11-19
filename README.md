# Web Notes — HTMLとCSSのカード図鑑

[![Pages](https://github.com/daigo0001/html_css_example/actions/workflows/pages.yml/badge.svg?branch=main)](https://github.com/daigo0001/html_css_example/actions/workflows/pages.yml)
[![Version](https://github.com/daigo0001/html_css_example/actions/workflows/release.yml/badge.svg)](https://github.com/daigo0001/html_css_example/actions/workflows/release.yml)

**見て、触って、わかる。** HTML要素とCSSプロパティを、動くカードで確かめる日本語の小さな実験室です。

**[カード図鑑を開く ↗](https://daigo0001.github.io/html_css_example/)** · [Actionsの実行結果](https://github.com/daigo0001/html_css_example/actions)

## できること

- **219枚のカード**：HTML要素70件・HTML属性61件・CSS88件。余白・文字・Flexbox / Gridの基本から、セレクター、メディアクエリー、カスケードレイヤー、`:has()`、コンテナークエリー、Anchor Positioning、廃止された要素まで。
- **検索からすぐ使えるホーム**：紹介用のヒーローや案内バナーを省き、カード一覧を先頭に表示。「CSSの基本・条件」カテゴリーからセレクター・単位・条件付きルールをまとめて探せます。
- **属性・データ**：`data-*`と`dataset`、`id`・`class`、真偽値属性、入力の検証・補完、ARIA、画像の属性を解説。「属性」タブで絞り込めます。`<data>`要素との違いも掲載。
- **フォーム・操作**：フォームの送信設定、ファイル選択、`<label>`・`<option>`、ブラウザー標準の入力検証を掲載。`ValidityState` の読み方と `:user-invalid` の表示も確認できます。
- **本物の表示とコード**：プレビューの開閉や入力を操作し、HTML/CSSを書き換えて即時確認。リセット・コピー・幅の切り替え・カードへの共有リンク付き。
- **いつから使えるか**：MDNのデータをもとに、対応開始時期とChrome / Edge / Firefox / Safari / Chrome Android / Safari iOSの開始版を表示。
- **参考JavaScript**：`dataset`、`FormData`、属性の読み書きなどをコピーできる参考例として掲載。これらはプレビュー内では実行しません。
- **意味とSEO**：用途、意味、SEOとの関係、使うときの注意点、MDNへのリンクをカードごとに掲載。
- **探して集める**：日本語検索、言語・カテゴリ・対応状況の絞り込み、並び替え、ランダム表示。しおりは `localStorage` に保存。
- **ライト／ダーク切り替え**：右上の太陽・月ボタンで切り替え。初回はOS設定に従い、手動で選んだモードをこのブラウザーに保存します。フッターにはアプリのバージョンを表示します。

HTML＋CSS＋素のJavaScriptで実装。アプリ本体にCDN・フレームワーク・外部フォント・外部APIは不要です。開発とテストにのみnpmパッケージを使います。

## ローカルで開く

Python 3 があれば依存パッケージなしで動きます。

```sh
cd html_css_example
python3 -m http.server 8000 --bind 127.0.0.1
```

ブラウザーでポート8000を開いてください。`file://` で直接開くと、ES Modulesと互換性JSONの取得が動かないため、HTTPサーバーが必要です。

開発・テストには Node.js 24（`.nvmrc`）とPython 3を使います。

```sh
npm ci
npx playwright install --with-deps chromium
npm run check       # カタログ・出典・互換性データの整合性
npm test            # PC / スマホ幅のブラウザーテスト
npm run build       # 公開用ファイルを _site/ に出力
```

ローカルに `/usr/bin/chromium` があればテストはそれを利用します。任意の実行ファイルは `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` で指定できます。CIはPlaywrightのChromiumを使います。ブラウザーテストはPagesと同じ `/html_css_example/` のサブパスで動作を確認します。

## GitHub Pagesとワークフロー

最初の一度だけ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にしてください。Actionsが無効なら有効化し、`github-pages` 環境の保護ルールで `main` からのデプロイを許可してください。タグから直接公開する設定は不要です。通常の `GITHUB_TOKEN` はPages自体の初回有効化を行う権限を持たないため、この設定が必要です。

| ワークフロー | 実行タイミング | 内容 |
| --- | --- | --- |
| [Pages](.github/workflows/pages.yml) | `main` へのpush / 手動実行 | データ検証 → PC・スマホのブラウザーテスト → 静的ビルド → Pagesデプロイ |
| Pages | `main` 宛てのPR | 検証・ビルドのみ。公開はしない |
| [Version](.github/workflows/release.yml) | `v*` タグのpush | タグとpackageのバージョン・main履歴を照合 → テスト・ビルド。公開はmain更新時に実行 |
| Version | Actionsから手動実行 | patch / minor / major を選択 → mainのpackage・lockfileを更新・コミット → タグ → テスト・デプロイ |

README上部のバッジから直近のワークフロー結果を確認できます。ブラウザーテストのHTMLレポートはActionsのArtifactsに14日間保存します。

### バージョニングとリリース

安定版はSemVerの `vMAJOR.MINOR.PATCH`。初版は `v1.0.0` です。基本は **Actions → Version → Run workflow** でブランチを `main` にし、`patch`（修正）、`minor`（追加）、`major`（破壊的変更）を選びます。バージョン更新と公開の対象はmainです。

手元で準備してタグをpushする場合：

```sh
git switch main
git pull --ff-only
npm version patch       # package・lockfileを更新してコミットとタグを作成
git push --atomic origin main --follow-tags
```

タグの版と `package.json` が一致しない場合や、タグのコミットがmainの履歴にない場合は公開を停止します。GitHub Actions自身のpushは他のpushワークフローを起動しないため、VersionからPagesワークフローを明示的に再利用します。リリースノートやGitHub Releaseは自動作成せず、タグとフッターのバージョンで管理します。修正をmainへpushして新しいpatch版を作るか、設定の問題なら失敗ジョブを再実行してください。ブランチ保護でbotのmainへの書き込みが禁止されている場合は、手元で更新またはPRをマージしてからタグをpushしてください。バージョン更新と通常のmain更新を同時進行させず、公開完了を待って次の更新をpushしてください。

## カードと互換性データを追加する

1. カタログを追加。既存カードは[`assets/catalog.js`](assets/catalog.js)、追加HTML要素は[`assets/html-elements.js`](assets/html-elements.js)、属性は[`assets/html-attributes.js`](assets/html-attributes.js)と[`assets/html-attribute-examples.js`](assets/html-attribute-examples.js)、CSSの追加実例は[`assets/css-examples.js`](assets/css-examples.js)に分けています。共通の生成ヘルパーは[`assets/card-helpers.js`](assets/card-helpers.js)。説明・SEO・注意点・実例・MDN URL・BCDキーを指定し、必要に応じて参考JavaScriptの`js`を添えます。
2. `npm run compat:update` で [`assets/compatibility.json`](assets/compatibility.json) を生成。
3. `npm run test:all` で検証し、変更をmainへpush。

MDNデータを更新する場合は `npm install --save-dev --save-exact @mdn/browser-compat-data@<version>` → `npm run compat:update` → テスト。生成済みJSONをコミットするため、閲覧時の外部通信は不要です。

**対応表示の定義**：接頭辞・フラグ・部分対応を除き、主要4デスクトップブラウザー（Chrome / Edge / Firefox / Safari）の対応が揃った時期を示します。生成日から30か月以上前なら「安定対応」、それ以降なら「新しく対応」、揃わない場合は「一部対応・要確認」。廃止・非推奨は別表示です。**公式Baselineではなく図鑑独自の目安で、要素の誕生年・標準化の年ではありません。** データの「≤」は、その版までに対応していたという上限値です。複数要素やプロパティを使う例のすべての構文や、古いOSでの動作を保証しません。ARIAなど属性自体の導入版がBCDに収録されていない項目は「版数未収録」と表示し、未対応とは区別します。反映APIの導入版を属性の導入版として代用せず、理由とMDNへの参照を載せます。ブラウザーと支援技術の組み合わせでの確認も必要です。詳しくは各カードの出典を参照してください。

SEO欄は実装の意味を理解するための説明です。特定のタグやプロパティを使えば検索順位が上がる、と保証するものではありません。動画カードはポスターのみで、実際の動画ファイルは同梱していません。

## 編集プレビューと保存

プレビューは `iframe sandbox` とCSPで隔離し、HTMLのスクリプト・埋め込み・ナビゲーション・外部URLを除去します。JavaScript、外部画像や通信、フォーム送信は動きません。同梱の風景SVGのみ画像として利用できます。学習用HTML/CSSの表示が目的で、完全なウェブサイト実行環境ではありません。

しおりとテーマ選択をブラウザーに保存し、サーバーには送信しません。別ブラウザー・別端末には同期しません。プライベートモードや保存禁止設定では永続化できない場合があります。編集したコードは保存しないため、必要ならコピーしてください。

## 出典

- [MDN Web Docs](https://developer.mozilla.org/ja/)：要素・プロパティの仕様への参照。
- [MDN browser-compat-data](https://github.com/mdn/browser-compat-data)：ブラウザー対応情報。CC0-1.0。使用バージョンと生成日はアプリの「この図鑑について」に表示。
- 画像・アイコン・カードの説明とコード例はこのリポジトリ内に同梱しています。
