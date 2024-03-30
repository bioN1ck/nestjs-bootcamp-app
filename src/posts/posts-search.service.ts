import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  SearchRequest,
  SearchTotalHits,
} from '@elastic/elasticsearch/lib/api/types';

import PostEntity from './post.entity';
import PostSearchBody from './types/post-search-body.interface';

@Injectable()
export default class PostsSearchService {
  index = 'posts';

  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async indexPost(post: PostEntity) {
    return this.elasticSearchService.index<PostSearchBody>({
      index: this.index,
      document: {
        id: post.id,
        title: post.title,
        content: post.paragraphs.reduce((acc, cur) => `${acc} ${cur}`, ''),
        authorId: post.author.id,
      },
    });
  }

  async count(query: string, fields: string[]) {
    const { count } = await this.elasticSearchService.count({
      index: this.index,
      query: {
        multi_match: {
          query,
          fields,
        },
      },
    });

    return count;
  }

  async search(
    text: string,
    offset?: number,
    limit?: number,
    startId = 0,
  ): Promise<{ results: PostSearchBody[]; count: number }> {
    const searchParams: SearchRequest = {
      index: this.index,
      from: offset, // Only for offset mode
      size: limit,
      query: {
        multi_match: {
          query: text,
          fields: ['title', 'content'],
        },
      },
      sort: {
        id: {
          order: 'asc',
        },
      },
    };
    let separateCount = 0;
    if (startId) {
      searchParams.search_after = [startId];
      searchParams.from = 0; // Priority of keyset over offset pagination.
      separateCount = await this.count(text, ['title', 'content']);
    }

    const { hits } =
      await this.elasticSearchService.search<PostSearchBody>(searchParams);

    const count = (hits.total as SearchTotalHits).value;
    const results = hits.hits.map((item) => item._source);

    return {
      results,
      count: startId ? separateCount : count,
    };
  }

  async update(post: PostEntity) {
    const script = Object.entries(post).reduce((result, [key, value]) => {
      if (key !== 'id') {
        return `${result} ctx._source.${key}='${value}';`;
      }

      return result;
    }, '');

    return this.elasticSearchService.updateByQuery({
      index: this.index,
      query: {
        match: {
          id: post.id,
        },
      },
      script: {
        source: script,
      },
    });
  }

  async remove(postId: number): Promise<void> {
    await this.elasticSearchService.deleteByQuery({
      index: this.index,
      query: {
        match: {
          id: postId,
        },
      },
    });
  }
}
