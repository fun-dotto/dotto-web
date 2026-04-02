# dotto-web

## セットアップ

1. `.env.example` を参考に `.env.local` を作成
2. 依存関係をインストール
3. 開発サーバーを起動

```bash
pnpm install
pnpm dev
```

## Firebase App Check

このプロジェクトは Firebase App Check（reCAPTCHA v3）を利用します。

- `NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY` を設定すると App Check が有効になります
- ローカル検証では `NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN` が利用できます
  - `true` を設定するとデバッグトークンを自動生成
  - 固定値を設定するとその値を利用

App Check トークンは自動リフレッシュを有効化しています。
