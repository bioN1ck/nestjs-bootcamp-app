// https://wanago.io/2020/09/07/api-nestjs-elasticsearch/

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import PostEntity from './post.entity';
import { PostSearchBody } from './types/post-search-body.interface';

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

  async search(text: string): Promise<PostSearchBody[]> {
    const { hits } = await this.elasticSearchService.search<PostSearchBody>({
      index: this.index,
      query: {
        multi_match: {
          query: text,
          fields: ['title', 'content'],
        },
      },
    });

    return hits.hits.map((item) => item._source);
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
