const fs = require("node:fs");
const path = require("node:path");

const { articlesBatch2Part2 } = require("./generate_part2.cjs");
const { articlesBatch2Part3 } = require("./generate_part3.cjs");

const expansion2Path = path.resolve("./src/lib/blogPostsExpansion2.ts");
const originalContent = fs.readFileSync(expansion2Path, "utf-8");

// Cut originalContent before export const expansionPosts2
const cutIndex = originalContent.indexOf("export const expansionPosts2: BlogPost[] = [");
if (cutIndex === -1) {
  throw new Error("Could not find export const expansionPosts2 in blogPostsExpansion2.ts");
}

const part1Code = originalContent.slice(0, cutIndex).trimEnd();

function serializeArticle(a, idx) {
  return `  // --------------------------------------------------------------------------
  // Article ${idx}: ${a.slug}
  // --------------------------------------------------------------------------
  {
    slug: ${JSON.stringify(a.slug)},
    lang: "fa",
    title: ${JSON.stringify(a.title)},
    description: ${JSON.stringify(a.description)},
    category: ${JSON.stringify(a.category)},
    categoryEn: ${JSON.stringify(a.categoryEn)},
    publishedAt: ${JSON.stringify(a.publishedAt)},
    readTime: ${JSON.stringify(a.readTime)},
    author: ${JSON.stringify(a.author)},
    icon: ${JSON.stringify(a.icon)},
    gradient: ${JSON.stringify(a.gradient)},
    keywords: ${JSON.stringify(a.keywords, null, 6).replace(/\n\s*\]/, ",\n    ]")},
    primaryKeyword: ${JSON.stringify(a.primaryKeyword)},
    cluster: ${JSON.stringify(a.cluster)},
    publishedAtIso: ${JSON.stringify(a.publishedAtIso)},
    alternateSlug: ${JSON.stringify(a.alternateSlug)},
    faqs: [
${a.faqs.map(f => `      {
        question: ${JSON.stringify(f.question)},
        answer: ${JSON.stringify(f.answer)},
      },`).join("\n")}
    ],
    content: \`${a.content.replace(/`/g, "\\`").replace(/\${/g, "\\${")}\`,
  },`;
}

const part2Code = `
const articlesBatch2Part2: BlogPost[] = [
${articlesBatch2Part2.map((a, i) => serializeArticle(a, i + 33)).join("\n\n")}
]
`;

const part3Code = `
const articlesBatch2Part3: BlogPost[] = [
${articlesBatch2Part3.map((a, i) => serializeArticle(a, i + 42)).join("\n\n")}
]
`;

const exportCode = `
export const expansionPosts2: BlogPost[] = [
  ...articlesBatch2Part1,
  ...articlesBatch2Part2,
  ...articlesBatch2Part3,
]
`;

const fullCode = `${part1Code}\n\n${part2Code}\n${part3Code}\n${exportCode}\n`;

fs.writeFileSync(expansion2Path, fullCode, "utf-8");
console.log("Successfully wrote updated src/lib/blogPostsExpansion2.ts");
