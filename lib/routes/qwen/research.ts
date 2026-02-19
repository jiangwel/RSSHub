import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface Article {
    title: string;
    path: string;
    content: string;
    extra: {
        date: string;
        author: string;
        tags: string[];
    };
}

interface ApiResponse {
    data: {
        articles: Article[];
    };
}

export const route: Route = {
    path: '/research',
    categories: ['blog'],
    example: '/qwen/research',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['qwen.ai/research'],
        },
    ],
    name: 'Research',
    maintainers: ['DIYgod'],
    description: 'Get the latest research updates from Qwen team',
    handler: async () => {
        const response = await ofetch<ApiResponse>('https://qwen.ai/api/v2/article/retrieval?type=qwen_ai&language=zh-CN');
        const items = response.data.articles.map((item) => ({
            title: item.title,
            link: `https://qwen.ai/research/${item.path}`,
            description: item.content,
            pubDate: parseDate(item.extra.date),
            author: item.extra.author,
            category: item.extra.tags,
        }));

        return {
            title: 'Qwen Research',
            link: 'https://qwen.ai/research',
            item: items,
        };
    },
};
