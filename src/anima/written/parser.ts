/**
 * Simple parser that extracts Written Word.
 */

// Line-based indentation (2+ spaces, 4+ is recommended)
function isCode(line: string) { return line.match(/^[ ]{2,}[^+\-*>].*$/i) }
// Block indentation using triple ticks ```
function isCodeDelimiter(line: string) { return line.match(/^\s*```.*$/i) }


/**
 * Extract Written Word from the given input text.
 * Currently supported formats are as in Markdown:
 * - line-based indentation (2+ spaces, 4+ is recommended);
 * - triple-backtick block indentation.
 */
export function getChunks(input) {
    let lines = input.split("\n");
    lines.push("");
    let inCode = false;
    let pushChunk = false;
    let chunks = [];
    let chunk  = [];
    let lineNo = 0;
    for (let line of lines) {
        pushChunk = true;
        if (inCode && isCodeDelimiter(line)) {
            inCode = false;
        } else 
        if (!inCode && isCodeDelimiter(line)) {
            inCode = true;
        } else
        if (inCode || isCode(line)) {
            chunk.push(line);
            pushChunk = false;
        }
        if (pushChunk && chunk.length > 0) {
            chunks.push({
                data: chunk.join("\n"),
                endsAt: lineNo,
            });
            chunk = [];            
        }
        lineNo++;
    }
    if (chunk.length > 0) {
        chunks.push({
            data: chunk.join("\n"),
            endsAt: lineNo,
        });
    }
    return chunks;
}


