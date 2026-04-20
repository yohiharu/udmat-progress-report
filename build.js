const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content');
const outputFile = path.join(__dirname, 'index.html');

// content/[文字]-[数字].md にマッチするファイルを降順で取得
const files = fs.readdirSync(contentDir)
  .filter(f => /^[a-zA-Z\u3040-\u9FFF]+-\d+\.md$/.test(f))
  .sort((a, b) => {
    const numA = parseInt(a.match(/-(\d+)\.md$/)[1], 10);
    const numB = parseInt(b.match(/-(\d+)\.md$/)[1], 10);
    return numB - numA; // 降順
  });

if (files.length === 0) {
  console.error('content/ に [文字]-[数字].md ファイルが見つかりません');
  process.exit(1);
}

const sections = files.map(file => {
  const content = fs.readFileSync(path.join(contentDir, file), 'utf-8');
  // reveal.js の data-markdown はバッククォートをエスケープする必要がある
  const escaped = content.replace(/`/g, '\\`');
  return `    <section data-markdown><textarea data-template>\n${content}\n    </textarea></section>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Progress Report</title>
  <link rel="stylesheet" href="node_modules/reveal.js/dist/reset.css">
  <link rel="stylesheet" href="node_modules/reveal.js/dist/reveal.css">
  <link rel="stylesheet" href="node_modules/reveal.js/dist/theme/black.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
${sections}
    </div>
  </div>
  <script src="node_modules/reveal.js/dist/reveal.js"></script>
  <script src="node_modules/reveal.js/plugin/markdown/markdown.js"></script>
  <script src="node_modules/reveal.js/plugin/highlight/highlight.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      plugins: [ RevealMarkdown, RevealHighlight ]
    });
  </script>
</body>
</html>
`;

fs.writeFileSync(outputFile, html, 'utf-8');
console.log(`生成完了: ${outputFile}`);
console.log('スライド順 (降順):');
files.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
