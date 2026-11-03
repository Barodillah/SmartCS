/**
 * SmartCS Unified Markdown Parser
 * 
 * Provides two variants:
 * - parseChatMarkdown(text)    → Compact styling for chat bubbles (VirtualCS, ChatHistory, PanelChat)
 * - parseArticleMarkdown(text) → Full-width article styling (ArticleDetail)
 */

export const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const clean = url.split('?')[0].toLowerCase().trim();
    return clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.ogg') || clean.endsWith('.mov') || clean.endsWith('.m4v');
};

const escapeHtml = (text) => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

const parseTables = (html, context = 'chat') => {
    // Find blocks of text that look like tables
    const blocks = html.split(/\n\s*\n/);
    
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        if (block.includes('|') && block.includes('\n')) {
            const lines = block.split('\n');
            // Check if it looks like a table (at least 2 lines, second line is mostly dashes and pipes)
            if (lines.length >= 2 && /^[\|\-\:\s]+$/.test(lines[1])) {
                const isArticle = context === 'article';
                const tableClass = isArticle 
                    ? "w-full text-left border-collapse my-6 bg-white border border-gray-200 shadow-sm rounded-lg" 
                    : "w-full text-left border-collapse my-2 text-[11px] bg-white border border-gray-200 rounded";
                    
                const thClass = isArticle
                    ? "border-b-2 border-gray-200 py-3 px-4 font-bold text-gray-900 bg-gray-50 text-sm uppercase tracking-wider"
                    : "border-b-2 border-gray-200 py-1.5 px-2 font-bold text-gray-900 bg-gray-50";
                    
                const tdClass = isArticle
                    ? "border-b border-gray-100 py-3 px-4 text-gray-700"
                    : "border-b border-gray-100 py-1.5 px-2 text-gray-700";

                let htmlTable = `<div class="overflow-x-auto"><table class="${tableClass}">`;
                let thead = '<thead><tr>';
                let tbody = '<tbody class="divide-y divide-gray-100">';
                
                lines.forEach((line, index) => {
                    if (index === 1) return; // Skip separator
                    
                    let cleanLine = line.trim();
                    if (cleanLine.startsWith('|')) cleanLine = cleanLine.substring(1);
                    if (cleanLine.endsWith('|')) cleanLine = cleanLine.substring(0, cleanLine.length - 1);
                    
                    const cells = cleanLine.split('|').map(c => c.trim());
                    
                    if (index === 0) {
                        cells.forEach(cell => {
                            thead += `<th class="${thClass}">${cell}</th>`;
                        });
                        thead += '</tr></thead>';
                    } else {
                        tbody += `<tr class="hover:bg-gray-50 transition-colors">`;
                        cells.forEach(cell => {
                            tbody += `<td class="${tdClass}">${cell}</td>`;
                        });
                        tbody += `</tr>`;
                    }
                });
                
                tbody += '</tbody>';
                htmlTable += thead + tbody + '</table></div>';
                
                blocks[i] = htmlTable;
            }
        }
    }
    
    return blocks.join('\n\n');
};

const applyInlineFormatting = (html, context = 'chat') => {
    // Code blocks (must come before inline code)
    html = html.replace(/```([\s\S]*?)```/g, (_, code) =>
        `<pre class="bg-gray-100 rounded p-2 my-1 text-[11px] overflow-x-auto"><code>${code}</code></pre>`
    );
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-[#E60012] px-1 rounded text-[11px]">$1</code>');

    // Sisipan Media Khusus: [img:link|caption], [video:link|caption], [vidio:link|caption]
    html = html.replace(/\[(img|video|vidio):([^\|\]]+)(?:\|([^\]]*))?\]/gi, (_, tag, url, caption) => {
        const cleanUrl = (url || '').trim();
        const cleanCaption = (caption || '').trim();
        const isVideo = tag.toLowerCase() === 'video' || tag.toLowerCase() === 'vidio' || isVideoUrl(cleanUrl);
        const altText = cleanCaption || (isVideo ? 'Video Artikel' : 'Gambar Artikel');

        if (isVideo) {
            if (context === 'article') {
                return `<figure class="my-8 my-article-figure my-article-video text-center">
                    <div class="relative w-full max-h-[550px] rounded-xl overflow-hidden shadow-md border border-gray-100 bg-black mx-auto">
                        <video src="${cleanUrl}" controls playsinline preload="metadata" class="w-full max-h-[550px] rounded-xl object-contain mx-auto bg-black" onerror="this.parentElement.parentElement.style.display='none'"></video>
                    </div>
                    ${cleanCaption ? `<figcaption class="mt-2.5 text-center text-sm text-gray-500 italic font-body">${cleanCaption}</figcaption>` : ''}
                </figure>`;
            }
            return `<figure class="my-2 my-article-figure my-article-video text-center">
                <div class="relative max-w-full max-h-[300px] rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-black mx-auto">
                    <video src="${cleanUrl}" controls playsinline preload="metadata" class="max-w-full max-h-[300px] rounded-lg object-contain mx-auto bg-black" onerror="this.parentElement.parentElement.style.display='none'"></video>
                </div>
                ${cleanCaption ? `<figcaption class="text-[11px] text-gray-500 italic mt-1 font-body">${cleanCaption}</figcaption>` : ''}
            </figure>`;
        }

        if (context === 'article') {
            return `<figure class="my-8 my-article-figure text-center">
                <img src="${cleanUrl}" alt="${altText}" loading="lazy" decoding="async" class="w-full max-h-[550px] object-cover rounded-xl shadow-md border border-gray-100 mx-auto cursor-zoom-in hover:opacity-95 transition-opacity" onerror="this.parentElement.style.display='none'" />
                ${cleanCaption ? `<figcaption class="mt-2.5 text-center text-sm text-gray-500 italic font-body">${cleanCaption}</figcaption>` : ''}
            </figure>`;
        }
        return `<figure class="my-2 my-article-figure text-center">
            <img src="${cleanUrl}" alt="${altText}" loading="lazy" decoding="async" class="max-w-full max-h-[300px] object-contain rounded-lg my-1 shadow-sm border border-gray-200 mx-auto cursor-zoom-in hover:opacity-95 transition-opacity" onerror="this.parentElement.style.display='none'" />
            ${cleanCaption ? `<figcaption class="text-[11px] text-gray-500 italic mt-1 font-body">${cleanCaption}</figcaption>` : ''}
        </figure>`;
    });

    // Images (BEFORE bold/italic so underscores in URLs don't get mangled)
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" loading="lazy" decoding="async" class="max-w-full max-h-[300px] object-contain rounded-lg my-2 shadow-sm border border-gray-200 bg-white/5" />'
    );

    // Links (BEFORE bold/italic so underscores in URLs don't get mangled)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#E60012] underline hover:text-[#B5000F]">$1</a>'
    );

    // Bold + Italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');
    // Strikethrough
    html = html.replace(/~~(.+?)~~/g, '<del class="text-gray-400">$1</del>');

    return html;
};

/**
 * Compact markdown for chat bubbles.
 * Small font sizes, tight spacing — used in VirtualCS, ChatHistory, PanelChat.
 */
export const parseChatMarkdown = (text) => {
    if (!text) return '';

    let html = escapeHtml(text);
    html = parseTables(html, 'chat');

    // Headings
    html = html.replace(/^###### (.+)$/gm, '<h6 class="font-bold text-[11px] mt-2 mb-1 uppercase tracking-wide">$1</h6>');
    html = html.replace(/^##### (.+)$/gm, '<h5 class="font-bold text-[12px] mt-2 mb-1">$1</h5>');
    html = html.replace(/^#### (.+)$/gm, '<h4 class="font-bold text-[13px] mt-3 mb-1">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="font-bold text-[14px] mt-3 mb-1">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="font-bold text-[15px] mt-3 mb-1">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="font-bold text-[16px] mt-3 mb-1">$1</h2>');

    // Horizontal rules
    html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr class="my-2 border-t border-gray-300" />');

    // Blockquotes
    html = html.replace(/^&gt;&gt; (.+)$/gm, '<blockquote class="border-l-2 border-gray-400 pl-2 ml-3 my-1 italic text-gray-500">$1</blockquote>');
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-[#E60012] pl-2 my-1 italic text-gray-600">$1</blockquote>');

    // Lists BEFORE inline formatting so the wrapping regex can match raw text inside <li>
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="md-li-ol ml-4 list-decimal text-[12px] leading-relaxed" value="$1">$2</li>');
    html = html.replace(/^[\-\*\+] (.+)$/gm, '<li class="md-li-ul ml-4 list-disc text-[12px] leading-relaxed">$1</li>');

    // Wrap consecutive <li> in <ul> or <ol>
    html = html.replace(/((?:<li class="md-li-ul[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-1 space-y-0.5">$1</ul>');
    html = html.replace(/((?:<li class="md-li-ol[^>]*>.*<\/li>\n?)+)/g, '<ol class="my-1 space-y-0.5">$1</ol>');

    // Inline formatting (after list wrapping so bold/italic renders inside <li>)
    html = applyInlineFormatting(html, 'chat');

    // Line breaks (don't break html tags)
    let inTag = false;
    let newHtml = '';
    for(let i=0; i<html.length; i++) {
        if(html[i] === '<') inTag = true;
        if(html[i] === '>') { inTag = false; newHtml += html[i]; continue; }
        if(!inTag && html[i] === '\n') newHtml += '<br />';
        else newHtml += html[i];
    }
    html = newHtml;

    return html;
};

/**
 * Full-width markdown for article pages.
 * Larger fonts, generous spacing — used in ArticleDetail.
 * Note: `# Heading` is demoted to <h2> so the page retains a single canonical <h1>.
 */
export const parseArticleMarkdown = (text) => {
    if (!text) return '';

    // Pastikan heading dan sisipan media [img:...] / [video:...] berada di baris tersendiri agar menjadi blok terpisah yang bersih
    let preprocessed = text.replace(/\[(img|video|vidio):([^\|\]]+)(?:\|([^\]]*))?\]/gi, '\n\n$&\n\n');
    preprocessed = preprocessed.replace(/^(#{1,6}\s+.+)$/gm, '\n\n$1\n\n');

    let html = escapeHtml(preprocessed);
    html = parseTables(html, 'article');

    // Headings (# is rendered as <h2> to preserve single <h1> per page rule)
    html = html.replace(/^#### (.+)$/gm, '<h4 class="font-display font-bold text-xl md:text-2xl text-[#111111] mt-8 mb-3">$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3 class="font-display font-bold text-2xl md:text-3xl text-[#111111] mt-10 mb-4">$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2 class="font-display font-bold text-3xl md:text-4xl text-[#111111] mt-12 mb-6">$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="font-display font-bold text-3xl md:text-4xl text-[#111111] mt-12 mb-6">$1</h2>');

    // Horizontal rules
    html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr class="my-8 border-t border-gray-300" />');

    // Blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-[#E60012] pl-4 my-6 italic text-xl text-gray-600 bg-gray-50 py-3 pr-3 rounded-r-lg">$1</blockquote>');

    // Lists BEFORE inline formatting so the wrapping regex can match raw text inside <li>
    html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="md-li-ol ml-6 list-decimal text-lg text-gray-700 leading-relaxed mb-2" value="$1">$2</li>');
    html = html.replace(/^[\-\*\+] (.+)$/gm, '<li class="md-li-ul ml-6 list-disc text-lg text-gray-700 leading-relaxed mb-2">$1</li>');

    // Wrap consecutive <li>
    html = html.replace(/((?:<li class="md-li-ul[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-4 space-y-2">$1</ul>');
    html = html.replace(/((?:<li class="md-li-ol[^>]*>.*<\/li>\n?)+)/g, '<ol class="my-4 space-y-2">$1</ol>');

    // Inline formatting (after list wrapping so bold/italic renders inside <li>)
    html = applyInlineFormatting(html, 'article');
    // Override link style for article context
    html = html.replace(/class="text-\[#E60012\] underline hover:text-\[#B5000F\]"/g,
        'class="text-[#E60012] font-semibold hover:underline"'
    );

    // Paragraphs (double newline → <p>)
    const blocks = html.split(/\n\s*\n/);
    html = blocks.map(block => {
        const trimmed = block.trim();
        if (!trimmed || trimmed.startsWith('<')) return trimmed;
        return `<p class="text-lg text-gray-700 leading-relaxed mb-6">${trimmed.replace(/\n/g, '<br />')}</p>`;
    }).join('\n\n');

    return html;
};
