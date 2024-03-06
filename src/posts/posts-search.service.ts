// https://wanago.io/2020/09/07/api-nestjs-elasticsearch/

import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import PostEntity from './post.entity';
import { PostSearchResult } from './types/post-search-result.interface';
import { PostSearchBody } from './types/post-search-body.interface';

@Injectable()
export default class PostsSearchService {
  index = 'posts';

  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async indexPost(post: PostEntity) {
    return this.elasticSearchService.index<PostSearchResult, PostSearchBody>({
      index: this.index,
      body: {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.author.id,
      },
    });
  }

  async search(text: string) {
    const { body } = await this.elasticSearchService.search<PostSearchResult>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'content'],
          },
        },
      },
    });
    const hits = body.hits.hits;

    return hits.map((item) => item._source);
  }

  async update(post: PostEntity) {
    const newBody: PostSearchBody = {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.author.id,
    };
    // We need to write a script that updates all the necessary fields
    // For example, to update the title and the content, we need:
    // ctx._source.title='New title'; ctx._source.content= 'New content';
    const script = Object.entries(newBody).reduce((result, [key, value]) => {
      return `${result} ctx._source.${key}='${value}';`;
    }, '');

    return this.elasticSearchService.updateByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: post.id,
          },
        },
        script: {
          inline: script,
        },
      },
    });
  }

  async remove(postId: number) {
    await this.elasticSearchService.deleteByQuery({
      index: this.index,
      body: {
        query: {
          match: {
            id: postId,
          },
        },
      },
    });
  }
}
