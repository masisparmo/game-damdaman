#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to build a professional, rich-text HTML/CSS version of the Dam-Daman eBook
from EBOOK_PANDUAN_DAM_DAMAN.md into public/ebook.html.
"""

import os
import re
import html

def slugify(text):
    text = text.lower()
    text = re.sub(r'[*_`]', '', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    return text.strip('-')

def parse_markdown_to_html(md_text):
    lines = md_text.splitlines()
    html_out = []
    toc_items = []
    
    in_code_block = False
    code_fence = ""
    code_lang = ""
    code_lines = []
    
    in_list = False
    list_type = None # 'ul' or 'ol'
    list_indent = 0
    
    in_blockquote = False
    blockquote_lines = []
    
    def format_inline(text):
        # Escape basic HTML first, but protect our tags
        text = html.escape(text)
        
        # Inline code `code`
        text = re.sub(r'`([^`]+)`', r'<code class="inline-code">\1</code>', text)
        
        # Bold **text**
        text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
        
        # Italic *text*
        text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
        
        # Links [text](url)
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank" rel="noopener noreferrer">\1</a>', text)
        
        return text

    def close_list():
        nonlocal in_list, list_type
        if in_list:
            html_out.append(f'</{list_type}>')
            in_list = False
            list_type = None

    def close_blockquote():
        nonlocal in_blockquote, blockquote_lines
        if in_blockquote:
            content = format_inline('\n'.join(blockquote_lines))
            html_out.append(f'<div class="callout callout-info"><div class="callout-icon">💡</div><div class="callout-body">{content}</div></div>')
            in_blockquote = False
            blockquote_lines = []

    # First pass: collect headings for Table of Contents
    for line in lines:
        match_h = re.match(r'^(#{1,3})\s+(.+)$', line)
        if match_h:
            level = len(match_h.group(1))
            title = match_h.group(2).strip()
            # Clean title
            clean_title = re.sub(r'[*_`]', '', title)
            slug = slugify(clean_title)
            if clean_title.upper() != 'DAFTAR ISI' and not clean_title.startswith('EBOOK:'):
                toc_items.append({'level': level, 'title': clean_title, 'slug': slug})

    # Second pass: convert content
    skip_table_of_contents = False

    for i, line in enumerate(lines):
        # Handle multi-backtick code blocks (``` or ````)
        code_start_match = re.match(r'^(`{3,4})\s*(\w*)', line)
        
        if in_code_block:
            if line.strip() == code_fence:
                # End of code block
                code_content = html.escape('\n'.join(code_lines))
                lang_label = code_lang.upper() if code_lang else 'CODE'
                html_out.append(f'''
<div class="code-wrapper">
  <div class="code-header">
    <span class="code-lang">{lang_label}</span>
    <button class="copy-btn" onclick="copyCode(this)" title="Salin Kode">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      <span>Salin</span>
    </button>
  </div>
  <pre><code class="language-{code_lang}">{code_content}</code></pre>
</div>''')
                in_code_block = False
                code_fence = ""
                code_lang = ""
                code_lines = []
            else:
                code_lines.append(line)
            continue
        elif code_start_match:
            close_list()
            close_blockquote()
            in_code_block = True
            code_fence = code_start_match.group(1)
            code_lang = code_start_match.group(2)
            code_lines = []
            continue

        stripped = line.strip()

        # Skip original markdown Table of Contents section since we generate an interactive sidebar & sticky TOC
        if stripped == '## DAFTAR ISI':
            skip_table_of_contents = True
            continue
        if skip_table_of_contents:
            if stripped.startswith('## PRAKATA') or stripped.startswith('## BAB 1:'):
                skip_table_of_contents = False
            else:
                continue

        # Horizontal Rule
        if stripped in ['---', '***', '___']:
            close_list()
            close_blockquote()
            html_out.append('<hr class="divider" />')
            continue

        # Headings
        h_match = re.match(r'^(#{1,4})\s+(.+)$', line)
        if h_match:
            close_list()
            close_blockquote()
            level = len(h_match.group(1))
            heading_text = h_match.group(2).strip()
            clean_title = re.sub(r'[*_`]', '', heading_text)
            slug = slugify(clean_title)

            # Styling specific levels
            if level == 1:
                html_out.append(f'<h1 id="{slug}" class="heading-1">{format_inline(heading_text)}</h1>')
            elif level == 2:
                # Chapter header styling
                html_out.append(f'''
<div class="chapter-header-box">
  <h2 id="{slug}" class="heading-2">{format_inline(heading_text)}</h2>
</div>''')
            elif level == 3:
                html_out.append(f'<h3 id="{slug}" class="heading-3">{format_inline(heading_text)}</h3>')
            elif level == 4:
                html_out.append(f'<h4 id="{slug}" class="heading-4">{format_inline(heading_text)}</h4>')
            continue

        # Blockquote (> text)
        if stripped.startswith('>'):
            close_list()
            in_blockquote = True
            bq_text = re.sub(r'^>\s?', '', line).strip()
            blockquote_lines.append(bq_text)
            continue
        elif in_blockquote:
            close_blockquote()

        # Unordered or Ordered Lists
        ul_match = re.match(r'^(\s*)[*-]\s+(.+)$', line)
        ol_match = re.match(r'^(\s*)\d+\.\s+(.+)$', line)

        if ul_match:
            indent = len(ul_match.group(1))
            content = format_inline(ul_match.group(2))
            if not in_list or list_type != 'ul':
                close_list()
                in_list = True
                list_type = 'ul'
                html_out.append('<ul class="content-list">')
            html_out.append(f'  <li class="list-item">{content}</li>')
            continue
        elif ol_match:
            indent = len(ol_match.group(1))
            content = format_inline(ol_match.group(2))
            if not in_list or list_type != 'ol':
                close_list()
                in_list = True
                list_type = 'ol'
                html_out.append('<ol class="content-ordered-list">')
            html_out.append(f'  <li class="list-item">{content}</li>')
            continue
        else:
            close_list()

        # Empty line
        if not stripped:
            continue

        # Paragraph text
        formatted_p = format_inline(line)
        html_out.append(f'<p class="paragraph">{formatted_p}</p>')

    close_list()
    close_blockquote()

    return '\n'.join(html_out), toc_items

def generate_full_html():
    with open('EBOOK_PANDUAN_DAM_DAMAN.md', 'r', encoding='utf-8') as f:
        md_text = f.read()

    body_html, toc_items = parse_markdown_to_html(md_text)

    # Build TOC HTML
    toc_html = ['<ul class="toc-list">']
    for item in toc_items:
        indent_class = f"toc-level-{item['level']}"
        toc_html.append(f'  <li class="{indent_class}"><a href="#{item["slug"]}" class="toc-link">{item["title"]}</a></li>')
    toc_html.append('</ul>')
    toc_markup = '\n'.join(toc_html)

    full_page = f'''<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ebook: Permainan Dam-Daman Online — Panduan Lengkap Cara Main Hingga Cara Membuatnya</title>
  <meta name="description" content="Ebook Resmi Panduan Lengkap Permainan Tradisional Dam-Daman Online: Etnomatematika, Teori Graf, Aturan Main, Arsitektur React TypeScript, AI Engine, Multiplayer Supabase, dan Master Prompt Blueprint.">
  <meta name="author" content="Isparmo (masisparmo)">
  
  <!-- Favicons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  
  <!-- Open Graph -->
  <meta property="og:title" content="Ebook: Permainan Dam-Daman Online">
  <meta property="og:description" content="Panduan Lengkap Cara Main Hingga Cara Membuat Game Dam-Daman dengan Etnomatematika, React TypeScript, AI Engine, dan Supabase.">
  <meta property="og:image" content="/logo.png">
  <meta property="og:url" content="https://damdaman.isparmo.com/ebook.html">
  <meta property="og:type" content="article">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap" rel="stylesheet">

  <style>
    /* ====================================================================
       MODERN LUXURY EDITORIAL DESIGN SYSTEM
       Theme: Deep Obsidian & Emerald Velvet with Golden Amber Accents
       ==================================================================== */
    :root {{
      --font-heading: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-serif: 'Merriweather', Georgia, serif;
      --font-code: 'Fira Code', monospace;

      /* Dark Theme (Default) */
      --bg-canvas: #090d16;
      --bg-surface: #101726;
      --bg-surface-elevated: #162034;
      --bg-card: rgba(22, 32, 52, 0.7);
      --bg-sidebar: #0b111e;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-strong: rgba(245, 158, 11, 0.3);
      --border-focus: #f59e0b;

      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --text-muted: #64748b;
      --text-accent: #fbbf24;

      --color-emerald-deep: #064e3b;
      --color-emerald-accent: #10b981;
      --color-amber-gold: #f59e0b;
      --color-amber-glow: rgba(245, 158, 11, 0.15);

      --code-bg: #070b12;
      --code-border: #1e293b;
      --code-text: #38bdf8;

      --sidebar-width: 320px;
      --header-height: 64px;
      --content-max-width: 900px;
    }}

    /* Light Theme */
    html.light {{
      --bg-canvas: #f8fafc;
      --bg-surface: #ffffff;
      --bg-surface-elevated: #f1f5f9;
      --bg-card: #ffffff;
      --bg-sidebar: #f8fafc;
      --border-subtle: #e2e8f0;
      --border-strong: #cbd5e1;
      --border-focus: #d97706;

      --text-primary: #0f172a;
      --text-secondary: #475569;
      --text-muted: #64748b;
      --text-accent: #d97706;

      --color-emerald-deep: #065f46;
      --color-emerald-accent: #059669;
      --color-amber-gold: #d97706;
      --color-amber-glow: rgba(217, 119, 6, 0.12);

      --code-bg: #0f172a;
      --code-border: #cbd5e1;
      --code-text: #0284c7;
    }}

    /* Reset & Base */
    *, *::before, *::after {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    html {{
      scroll-behavior: smooth;
      font-size: 16px;
      color-scheme: dark light;
    }}

    body {{
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      font-family: var(--font-body);
      line-height: 1.75;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
    }}

    /* Reading Progress Bar */
    #progress-container {{
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: transparent;
      z-index: 100;
    }}

    #progress-bar {{
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #10b981, #f59e0b, #fbbf24);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
      transition: width 0.1s ease;
    }}

    /* Top Sticky Navigation */
    .top-navbar {{
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--header-height);
      background: rgba(11, 17, 30, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      z-index: 90;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      transition: all 0.2s ease;
    }}

    html.light .top-navbar {{
      background: rgba(255, 255, 255, 0.9);
      border-bottom: 1px solid var(--border-subtle);
    }}

    .navbar-brand {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--text-primary);
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1.1rem;
    }}

    .navbar-logo {{
      width: 36px;
      height: 36px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-strong);
      object-contain: contain;
    }}

    .navbar-actions {{
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }}

    .nav-btn {{
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--border-subtle);
    }}

    .nav-btn-primary {{
      background: linear-gradient(135deg, #059669, #047857);
      color: #ffffff;
      border: 1px solid rgba(16, 185, 129, 0.4);
      box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
    }}

    .nav-btn-primary:hover {{
      background: linear-gradient(135deg, #10b981, #059669);
      transform: translateY(-1px);
    }}

    .nav-btn-ghost {{
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
    }}

    .nav-btn-ghost:hover {{
      color: var(--text-primary);
      border-color: var(--border-strong);
    }}

    /* Mobile Sidebar Toggle Button */
    .menu-toggle-btn {{
      display: none;
      background: transparent;
      border: none;
      color: var(--text-primary);
      cursor: pointer;
      padding: 0.5rem;
    }}

    /* App Layout */
    .app-layout {{
      display: flex;
      margin-top: var(--header-height);
      min-height: calc(100vh - var(--header-height));
    }}

    /* Sidebar Navigation (TOC) */
    .sidebar-toc {{
      width: var(--sidebar-width);
      position: fixed;
      top: var(--header-height);
      bottom: 0;
      left: 0;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-subtle);
      overflow-y: auto;
      padding: 1.5rem 1rem 3rem 1.25rem;
      z-index: 80;
    }}

    .sidebar-header {{
      font-family: var(--font-heading);
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-accent);
      margin-bottom: 1rem;
      padding-left: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }}

    .toc-list {{
      list-style: none;
    }}

    .toc-link {{
      display: block;
      padding: 0.4rem 0.6rem;
      border-radius: 8px;
      font-size: 0.825rem;
      line-height: 1.4;
      text-decoration: none;
      color: var(--text-secondary);
      transition: all 0.15s ease;
      border-left: 2px solid transparent;
    }}

    .toc-link:hover {{
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.04);
    }}

    .toc-level-1 {{
      font-weight: 700;
      margin-top: 0.8rem;
    }}

    .toc-level-2 {{
      font-weight: 600;
      margin-top: 0.6rem;
      color: var(--text-primary);
    }}

    .toc-level-3 {{
      font-size: 0.8rem;
      padding-left: 1.2rem;
      color: var(--text-muted);
    }}

    .toc-link.active {{
      color: #fbbf24;
      background: var(--color-amber-glow);
      border-left: 2px solid var(--color-amber-gold);
      font-weight: 600;
    }}

    /* Main Article Container */
    .main-container {{
      margin-left: var(--sidebar-width);
      flex: 1;
      padding: 2.5rem 3.5rem 6rem;
      display: flex;
      justify-content: center;
    }}

    .article-content {{
      width: 100%;
      max-width: var(--content-max-width);
    }}

    /* Hero Book Banner */
    .book-hero-banner {{
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.7), rgba(15, 23, 42, 0.9)), radial-gradient(circle at top right, rgba(245, 158, 11, 0.15), transparent);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      margin-bottom: 3.5rem;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4);
      position: relative;
      overflow: hidden;
    }}

    .book-hero-banner::after {{
      content: "";
      position: absolute;
      top: -50px;
      right: -50px;
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
      pointer-events: none;
    }}

    .hero-badge {{
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.3rem 0.8rem;
      border-radius: 9999px;
      margin-bottom: 1.25rem;
    }}

    .hero-title {{
      font-family: var(--font-heading);
      font-size: 2.4rem;
      font-weight: 800;
      line-height: 1.2;
      color: #ffffff;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }}

    .hero-subtitle {{
      font-size: 1.15rem;
      color: #cbd5e1;
      margin-bottom: 1.5rem;
      font-weight: 400;
      line-height: 1.5;
    }}

    .hero-metadata {{
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: #94a3b8;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.25rem;
    }}

    .hero-meta-item {{
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }}

    .hero-meta-item strong {{
      color: #f1f5f9;
    }}

    /* Typography & Hierarchy */
    .heading-1 {{
      font-family: var(--font-heading);
      font-size: 2.2rem;
      font-weight: 800;
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
      letter-spacing: -0.02em;
      scroll-margin-top: calc(var(--header-height) + 1.5rem);
    }}

    .chapter-header-box {{
      margin-top: 4.5rem;
      margin-bottom: 1.75rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--border-strong);
    }}

    .heading-2 {{
      font-family: var(--font-heading);
      font-size: 1.65rem;
      font-weight: 800;
      color: #fbbf24;
      line-height: 1.3;
      letter-spacing: -0.01em;
      scroll-margin-top: calc(var(--header-height) + 1.5rem);
    }}

    .heading-3 {{
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 700;
      margin-top: 2.5rem;
      margin-bottom: 1rem;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      scroll-margin-top: calc(var(--header-height) + 1.5rem);
    }}

    .heading-3::before {{
      content: "";
      display: inline-block;
      width: 6px;
      height: 18px;
      background: var(--color-amber-gold);
      border-radius: 3px;
    }}

    .heading-4 {{
      font-family: var(--font-heading);
      font-size: 1.05rem;
      font-weight: 700;
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
      color: var(--text-accent);
      scroll-margin-top: calc(var(--header-height) + 1.5rem);
    }}

    .paragraph {{
      margin-bottom: 1.25rem;
      font-size: 1rem;
      color: var(--text-primary);
      line-height: 1.8;
    }}

    .paragraph strong {{
      color: #ffffff;
      font-weight: 600;
    }}

    html.light .paragraph strong {{
      color: #0f172a;
    }}

    /* Lists */
    .content-list, .content-ordered-list {{
      margin: 1rem 0 1.5rem 1.5rem;
      color: var(--text-primary);
    }}

    .list-item {{
      margin-bottom: 0.6rem;
      padding-left: 0.3rem;
      line-height: 1.7;
    }}

    .list-item strong {{
      color: #fbbf24;
      font-weight: 600;
    }}

    /* Inline Code */
    .inline-code {{
      font-family: var(--font-code);
      background: rgba(245, 158, 11, 0.12);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: 6px;
      padding: 0.15rem 0.4rem;
      font-size: 0.85em;
    }}

    /* Code Blocks */
    .code-wrapper {{
      background: var(--code-bg);
      border: 1px solid var(--code-border);
      border-radius: 14px;
      margin: 1.5rem 0 2rem;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }}

    .code-header {{
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid var(--code-border);
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}

    .code-lang {{
      font-family: var(--font-code);
      font-size: 0.75rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}

    .copy-btn {{
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      border-radius: 6px;
      padding: 0.25rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }}

    .copy-btn:hover {{
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.25);
    }}

    .code-wrapper pre {{
      padding: 1.25rem;
      overflow-x: auto;
      font-family: var(--font-code);
      font-size: 0.85rem;
      line-height: 1.6;
      color: #e2e8f0;
    }}

    /* Callout Boxes */
    .callout {{
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      margin: 1.75rem 0;
      display: flex;
      gap: 1rem;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-left: 4px solid #10b981;
    }}

    .callout-icon {{
      font-size: 1.3rem;
      flex-shrink: 0;
      line-height: 1;
    }}

    .callout-body {{
      font-size: 0.925rem;
      color: #cbd5e1;
      line-height: 1.7;
    }}

    html.light .callout-body {{
      color: #334155;
    }}

    .divider {{
      border: none;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border-subtle), transparent);
      margin: 3.5rem 0;
    }}

    /* Floating Back to Top Button */
    .back-to-top {{
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
      z-index: 90;
    }}

    .back-to-top.visible {{
      opacity: 1;
      visibility: visible;
    }}

    .back-to-top:hover {{
      color: #ffffff;
      border-color: var(--color-amber-gold);
      transform: translateY(-2px);
    }}

    /* Print Styles */
    @media print {{
      .top-navbar, .sidebar-toc, .back-to-top, .copy-btn {{
        display: none !important;
      }}
      .main-container {{
        margin-left: 0 !important;
        padding: 0 !important;
      }}
      body {{
        background: #ffffff !important;
        color: #000000 !important;
        font-size: 12pt;
      }}
      .heading-2 {{
        page-break-before: always;
      }}
      .code-wrapper {{
        border: 1px solid #ccc !important;
        page-break-inside: avoid;
      }}
    }}

    /* Responsive Breakpoints */
    @media (max-width: 1024px) {{
      .sidebar-toc {{
        transform: translateX(-100%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
      }}

      .sidebar-toc.open {{
        transform: translateX(0);
      }}

      .main-container {{
        margin-left: 0;
        padding: 2rem 1.5rem 5rem;
      }}

      .menu-toggle-btn {{
        display: inline-flex;
      }}
    }}

    @media (max-width: 640px) {{
      .book-hero-banner {{
        padding: 2rem 1.5rem;
      }}
      .hero-title {{
        font-size: 1.8rem;
      }}
      .heading-1 {{
        font-size: 1.8rem;
      }}
      .heading-2 {{
        font-size: 1.4rem;
      }}
    }}
  </style>
</head>
<body>

  <!-- Top Scroll Progress Bar -->
  <div id="progress-container">
    <div id="progress-bar"></div>
  </div>

  <!-- Sticky Top Navigation Bar -->
  <header class="top-navbar">
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <button class="menu-toggle-btn" id="sidebarToggle" aria-label="Toggle Daftar Isi">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
      <a href="https://damdaman.isparmo.com" class="navbar-brand">
        <img src="/logo.png" alt="Dam-Daman Logo" class="navbar-logo">
        <span>Maen Dam-Daman</span>
      </a>
    </div>

    <div class="navbar-actions">
      <a href="https://damdaman.isparmo.com" class="nav-btn nav-btn-primary">
        <span>🎮 Mainkan Game</span>
      </a>
      <a href="https://github.com/masisparmo/game-damdaman" target="_blank" rel="noopener" class="nav-btn nav-btn-ghost">
        <span>GitHub</span>
      </a>
      <button class="nav-btn nav-btn-ghost" id="themeToggle" title="Ganti Tema">
        <span id="themeIcon">☀️</span>
      </button>
      <button class="nav-btn nav-btn-ghost" onclick="window.print()" title="Cetak atau Simpan PDF">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      </button>
    </div>
  </header>

  <!-- App Body Layout -->
  <div class="app-layout">
    
    <!-- Left Sidebar: Table of Contents -->
    <aside class="sidebar-toc" id="sidebar">
      <div class="sidebar-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        <span>Daftar Isi Buku</span>
      </div>
      {toc_markup}
    </aside>

    <!-- Main Content -->
    <main class="main-container">
      <article class="article-content">

        <!-- Hero Header Card -->
        <div class="book-hero-banner">
          <div class="hero-badge">📖 Living Document Ebook v1.0.0</div>
          <h1 class="hero-title">EBOOK: Permainan Dam-Daman Online</h1>
          <p class="hero-subtitle">Panduan Lengkap Cara Main Hingga Cara Membuatnya — Mengintegrasikan Warisan Etnomatematika Nusantara, AI Engine Cerdas, dan Arsitektur Web Modern</p>
          
          <div class="hero-metadata">
            <div class="hero-meta-item">
              <span>✍️ Penulis:</span>
              <strong>Isparmo (masisparmo)</strong>
            </div>
            <div class="hero-meta-item">
              <span>🌐 Website:</span>
              <a href="https://damdaman.isparmo.com" target="_blank" rel="noopener" style="color: #fbbf24; text-decoration: none;">damdaman.isparmo.com</a>
            </div>
            <div class="hero-meta-item">
              <span>📦 Open Source:</span>
              <a href="https://github.com/masisparmo/game-damdaman" target="_blank" rel="noopener" style="color: #60a5fa; text-decoration: none;">github.com/masisparmo/game-damdaman</a>
            </div>
          </div>
        </div>

        <!-- Rendered Book Content -->
        {body_html}

        <!-- Bottom Footer -->
        <div style="margin-top: 5rem; padding-top: 2rem; border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; color: var(--text-muted); font-size: 0.85rem;">
          <p>© 2026 Isparmo (masisparmo). Hak Cipta Dilindungi Undang-Undang.</p>
          <p>Dibuat dengan ❤️ untuk Pelestarian Budaya Tradisional Nusantara.</p>
        </div>

      </article>
    </main>

  </div>

  <!-- Floating Back to Top Button -->
  <button class="back-to-top" id="backToTop" aria-label="Kembali ke atas">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"></polyline></svg>
  </button>

  <!-- Interactive Client-side Script -->
  <script>
    // 1. Reading Progress Bar
    window.addEventListener('scroll', () => {{
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      document.getElementById('progress-bar').style.width = progress + '%';

      // Back to top visibility
      const btt = document.getElementById('backToTop');
      if (scrollTop > 400) {{
        btt.classList.add('visible');
      }} else {{
        btt.classList.remove('visible');
      }}
    }});

    // 2. Back to Top Click
    document.getElementById('backToTop').addEventListener('click', () => {{
      window.scrollTo({{ top: 0, behavior: 'smooth' }});
    }});

    // 3. Mobile Sidebar Toggle
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggle');
    if (toggleBtn) {{
      toggleBtn.addEventListener('click', () => {{
        sidebar.classList.toggle('open');
      }});
    }}

    // Close sidebar when clicking any TOC link on mobile
    document.querySelectorAll('.toc-link').forEach(link => {{
      link.addEventListener('click', () => {{
        if (window.innerWidth <= 1024) {{
          sidebar.classList.remove('open');
        }}
      }});
    }});

    // 4. Dark/Light Mode Switcher
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const htmlElem = document.documentElement;

    // Load saved preference
    const savedTheme = localStorage.getItem('damdaman_ebook_theme');
    if (savedTheme === 'light') {{
      htmlElem.classList.remove('dark');
      htmlElem.classList.add('light');
      themeIcon.textContent = '🌙';
    }}

    themeToggle.addEventListener('click', () => {{
      if (htmlElem.classList.contains('dark')) {{
        htmlElem.classList.remove('dark');
        htmlElem.classList.add('light');
        themeIcon.textContent = '🌙';
        localStorage.setItem('damdaman_ebook_theme', 'light');
      }} else {{
        htmlElem.classList.remove('light');
        htmlElem.classList.add('dark');
        themeIcon.textContent = '☀️';
        localStorage.setItem('damdaman_ebook_theme', 'dark');
      }}
    }});

    // 5. One-click Copy Code Button
    function copyCode(btn) {{
      const codeWrapper = btn.closest('.code-wrapper');
      const codeElement = codeWrapper.querySelector('code');
      if (!codeElement) return;

      navigator.clipboard.writeText(codeElement.innerText).then(() => {{
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span style="color: #10b981; font-weight: 700;">✓ Tersalin!</span>';
        setTimeout(() => {{
          btn.innerHTML = originalText;
        }}, 2000);
      }});
    }}

    // 6. ScrollSpy for Sidebar TOC
    const headings = Array.from(document.querySelectorAll('.heading-1, .heading-2, .heading-3'));
    const tocLinks = Array.from(document.querySelectorAll('.toc-link'));

    window.addEventListener('scroll', () => {{
      const scrollPos = window.scrollY + 100;
      let currentId = '';

      for (let i = 0; i < headings.length; i++) {{
        if (headings[i].offsetTop <= scrollPos) {{
          currentId = headings[i].id;
        }}
      }}

      if (currentId) {{
        tocLinks.forEach(link => {{
          if (link.getAttribute('href') === '#' + currentId) {{
            link.classList.add('active');
          }} else {{
            link.classList.remove('active');
          }}
        }});
      }}
    }});
  </script>
</body>
</html>'''

    os.makedirs('public', exist_ok=True)
    out_path = os.path.join('public', 'ebook.html')
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(full_page)

    print(f"Successfully generated {out_path} ({len(full_page)} bytes, {len(toc_items)} TOC items)")

if __name__ == '__main__':
    generate_full_html()
