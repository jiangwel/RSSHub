import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import puppeteer from '@/utils/puppeteer';

export const route: Route = {
    path: '/news',
    categories: ['programming'],
    example: '/anthropic/news',
    parameters: {},
    features: {
        requirePuppeteer: true,
    },
    radar: [
        {
            source: ['www.anthropic.com/news', 'www.anthropic.com'],
        },
    ],
    name: 'News',
    maintainers: ['etShaw-zh', 'goestav'],
    handler,
    url: 'www.anthropic.com/news',
};

async function handler(ctx) {
    const link = 'https://www.anthropic.com/news';

    const browser = await puppeteer();
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'fetch' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
    });

    await page.goto(link, {
        waitUntil: 'networkidle2',
    });

    try {
        await page.waitForSelector('a[href^="/news/"]');
    } catch {
        // Ignore timeout if no news found, let cheerio handle empty list
    }

    const content = await page.content();
    await page.close();
    await browser.close();

    const $ = load(content);
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const list: DataItem[] = $('a[href^="/news/"]')
        .toArray()
        .map((el) => {
            const $el = $(el);
            const title = $el.find('h2, h3, span[class*="title"]').text().trim();
            const href = $el.attr('href') ?? '';
            const pubDate = $el.find('time').text().trim();
            const fullLink = href.startsWith('http') ? href : `https://www.anthropic.com${href}`;
            return {
                title,
                link: fullLink,
                pubDate,
            };
        })
        .filter((item) => item.title)
        .filter((item, index, self) => index === self.findIndex((t) => t.link === item.link))
        .slice(0, limit);

    const out = await pMap(
        list,
        (item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                const content = $('#main-content');

                // Remove meaningless information
                content.find('[class*="hero"], [class*="sidebar"], [class*="controls"], [class*="social-share"]').remove();

                content.find('img').each((_, e) => {
                    const $e = $(e);
                    $e.removeAttr('style srcset');
                    const src = $e.attr('src');
                    if (src) {
                        const params = new URLSearchParams(src.split('?')[1]);
                        const newSrc = params.get('/_next/image?url');
                        if (newSrc) {
                            $e.attr('src', newSrc);
                        }
                    }
                });

                item.description = content.html() ?? undefined;

                return item;
            }),
        { concurrency: 5 }
    );

    return {
        title: 'Anthropic News',
        link,
        description: 'Latest news from Anthropic',
        item: out,
    };
}
