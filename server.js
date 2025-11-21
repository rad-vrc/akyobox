const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Unity WebGLのBrotli圧縮ファイル(.br)へのリクエストを処理
    if (pathname.startsWith('/games/') && pathname.endsWith('.br')) {
      const filePath = path.join(__dirname, 'public', pathname);

      // ファイルが存在するか確認
      if (fs.existsSync(filePath)) {
        // 拡張子に基づいてContent-Typeを設定
        if (pathname.endsWith('.wasm.br')) {
          res.setHeader('Content-Type', 'application/wasm');
        } else if (pathname.endsWith('.js.br')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (pathname.endsWith('.data.br')) {
          res.setHeader('Content-Type', 'application/octet-stream');
        }

        // Brotli圧縮であることを明示
        res.setHeader('Content-Encoding', 'br');

        // ファイルを読み込んでレスポンスとして返す
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        return;
      }
    }

    // それ以外のリクエストはNext.jsに任せる
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
